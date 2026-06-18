import type { Listing, MatchResult, Terms } from "@/lib/types";

/** Haversine distance in km between two coords. */
export function distanceKm(
    a: { lat: number | null; lng: number | null },
    b: { lat: number | null; lng: number | null },
): number | null {
    if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

function cropTokens(s: string): string[] {
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function cropAffinity(a: string, b: string): number {
    if (!a || !b) return 0;
    const A = new Set(cropTokens(a));
    const B = new Set(cropTokens(b));
    if (a.toLowerCase().trim() === b.toLowerCase().trim()) return 1;
    let shared = 0;
    A.forEach((t) => B.has(t) && shared++);
    const union = new Set([...A, ...B]).size;
    return union ? shared / union : 0;
}

function overlapDays(a: Terms, b: Terms): number {
    const s = Math.max(+new Date(a.term_start), +new Date(b.term_start));
    const e = Math.min(+new Date(a.term_end), +new Date(b.term_end));
    return Math.max(0, (e - s) / 86_400_000);
}

/**
 * Score one candidate listing against a reference listing on the other side.
 * `ref` is the viewer's own posting (a need looking at supplies, or vice versa).
 * Returns 0–100 with human-readable reasons.
 */
export function scoreMatch(ref: Listing, candidate: Listing): MatchResult {
    const rt = ref.terms;
    const ct = candidate.terms;
    const reasons: string[] = [];

    // crop (35)
    const crop = cropAffinity(rt.crop, ct.crop);
    const cropPts = crop * 35;
    if (crop >= 0.99) reasons.push(`Exact crop match: ${ct.crop}`);
    else if (crop > 0.2) reasons.push(`Related crop: ${ct.crop}`);

    // season / term overlap (22)
    const ov = overlapDays(rt, ct);
    const refSpan = Math.max(1, (+new Date(rt.term_end) - +new Date(rt.term_start)) / 86_400_000);
    const seasonRatio = Math.min(1, ov / refSpan);
    const seasonPts = seasonRatio * 22;
    if (seasonRatio > 0.7) reasons.push("Seasons line up across the full term");
    else if (seasonRatio > 0.2) reasons.push("Partial seasonal overlap");

    // volume fit (16)
    const volRatio = ct.quantity && rt.quantity ? Math.min(ct.quantity, rt.quantity) / Math.max(ct.quantity, rt.quantity) : 0;
    const volPts = volRatio * 16;
    if (volRatio > 0.8) reasons.push("Volumes are well matched");

    // cadence (10)
    const cadencePts = rt.cadence === ct.cadence ? 10 : 4;
    if (rt.cadence === ct.cadence) reasons.push(`Same cadence (${rt.cadence.replace("_", " ")})`);

    // price fit (12) — buyer ceiling vs supply price
    let pricePts = 6;
    const need = ref.type === "need" ? ref : candidate.type === "need" ? candidate : null;
    const supply = ref.type === "supply" ? ref : candidate.type === "supply" ? candidate : null;
    if (need && supply) {
        const ceiling = need.price_ceiling_cents ?? need.terms.unit_price_cents;
        if (ceiling && supply.terms.unit_price_cents) {
            if (supply.terms.unit_price_cents <= ceiling) {
                pricePts = 12;
                reasons.push("Price is within budget");
            } else {
                const over = (supply.terms.unit_price_cents - ceiling) / ceiling;
                pricePts = Math.max(0, 12 * (1 - over * 2));
                reasons.push("Price is slightly above target");
            }
        }
    }

    // distance (5)
    const dist = distanceKm(ref, candidate);
    let distPts = 2.5;
    if (dist != null) {
        distPts = dist <= 25 ? 5 : dist <= 60 ? 3.5 : dist <= 120 ? 2 : 1;
        if (dist <= 40) reasons.push(`Only ${dist} km away`);
    }

    const score = Math.round(cropPts + seasonPts + volPts + cadencePts + pricePts + distPts);
    return { listing: candidate, score: Math.min(100, score), reasons: reasons.slice(0, 4), distanceKm: dist };
}

/** Rank a pool of candidate listings against a reference. */
export function rankMatches(ref: Listing, pool: Listing[]): MatchResult[] {
    return pool
        .filter((l) => l.id !== ref.id && l.type !== ref.type && l.owner_id !== ref.owner_id)
        .map((l) => scoreMatch(ref, l))
        .sort((a, b) => b.score - a.score);
}

/** Free-text + facet filter used by the discover search bar. */
export interface DiscoverFilters {
    q?: string;
    crop?: string;
    cadence?: string;
    maxPriceCents?: number | null;
    minQuantity?: number | null;
}

export function applyFilters(listings: Listing[], f: DiscoverFilters): Listing[] {
    const q = f.q?.toLowerCase().trim();
    return listings.filter((l) => {
        if (q) {
            const hay = `${l.title} ${l.terms.crop} ${l.terms.grade ?? ""} ${l.location_label ?? ""} ${l.owner?.org_name ?? ""}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        if (f.crop && cropAffinity(l.terms.crop, f.crop) < 0.2) return false;
        if (f.cadence && l.terms.cadence !== f.cadence) return false;
        if (f.maxPriceCents != null && l.terms.unit_price_cents > f.maxPriceCents) return false;
        if (f.minQuantity != null && l.terms.quantity < f.minQuantity) return false;
        return true;
    });
}
