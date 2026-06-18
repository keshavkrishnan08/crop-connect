import {
    type Terms,
    type Cadence,
    type Contract,
    type Profile,
    type NodeType,
    type ListingType,
    CADENCE_DAYS,
    CADENCE_LABEL,
    hasBand,
} from "@/lib/types";

/** Number of deliveries implied by a set of terms. */
export function deliveryCount(terms: Terms): number {
    if (terms.cadence === "one_time") return 1;
    const start = new Date(terms.term_start).getTime();
    const end = new Date(terms.term_end).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return 1;
    const days = (end - start) / 86_400_000;
    return Math.max(1, Math.floor(days / CADENCE_DAYS[terms.cadence]) + 1);
}

/** Total committed value of the contract, in cents. */
export function contractValueCents(terms: Terms): number {
    return Math.round(terms.quantity * terms.unit_price_cents * deliveryCount(terms));
}

/** Generate the delivery schedule from terms. */
export function buildSchedule(terms: Terms): { seq: number; date: string; quantity: number }[] {
    const count = deliveryCount(terms);
    const start = new Date(terms.term_start);
    const stepDays = CADENCE_DAYS[terms.cadence] || 0;
    const out: { seq: number; date: string; quantity: number }[] = [];
    for (let i = 0; i < count; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i * stepDays);
        out.push({ seq: i + 1, date: d.toISOString().slice(0, 10), quantity: terms.quantity });
    }
    return out;
}

export function cadenceSummary(terms: Terms): string {
    if (terms.cadence === "one_time") return "one-time delivery";
    return `${terms.quantity} ${terms.unit} ${CADENCE_LABEL[terms.cadence].toLowerCase()}`;
}

/** Default supply-chain board for a brand-new contract. */
export function defaultBoard(): { type: NodeType; label: string; x: number; y: number }[] {
    return [
        { type: "harvest", label: "Harvest", x: 80, y: 200 },
        { type: "pack", label: "Pack & grade", x: 320, y: 200 },
        { type: "cold_storage", label: "Cold storage", x: 560, y: 120 },
        { type: "transit", label: "In transit", x: 560, y: 300 },
        { type: "dropoff", label: "Drop-off", x: 800, y: 200 },
        { type: "delivered", label: "Delivered", x: 1040, y: 200 },
    ];
}

export const DEFAULT_EDGES: [number, number][] = [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
    [4, 5],
];

/**
 * Deterministic, plain-language agreement text.
 * Used as the AI fallback and as the seed the AI route refines.
 */
export function fallbackAgreement(
    terms: Terms,
    farm: Pick<Profile, "full_name" | "org_name" | "location_label">,
    buyer: Pick<Profile, "full_name" | "org_name" | "location_label">,
): string {
    const farmName = farm.org_name || farm.full_name || "the Farm";
    const buyerName = buyer.org_name || buyer.full_name || "the Buyer";
    const price = (terms.unit_price_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
    const total = (contractValueCents(terms) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
    const n = deliveryCount(terms);
    const qty = hasBand(terms)
        ? `${terms.quantity_min}–${terms.quantity_max} ${terms.unit} per delivery (target ${terms.quantity} ${terms.unit})`
        : `${terms.quantity} ${terms.unit} per delivery`;

    const flexLines: string[] = [];
    if (terms.sample_first) flexLines.push("• Sample first: before the committed term begins, the Farm provides one sample delivery for the Buyer's approval. The full commitment takes effect only once the sample is accepted.");
    if (hasBand(terms)) flexLines.push(`• Quantity is a good-faith band of ${terms.quantity_min}–${terms.quantity_max} ${terms.unit}. The Farm supplies within this range each cycle; the Buyer accepts within it.`);
    if (terms.crop_failure_clause) flexLines.push("• Crop-failure clause: shortfalls caused by weather, pests, disease or other events outside the Farm's reasonable control are forgiven, with prompt notice, and do not count against the Farm.");
    if (terms.min_commit_cycles) flexLines.push(`• The first ${terms.min_commit_cycles} ${terms.min_commit_cycles === 1 ? "delivery is" : "deliveries are"} firmly committed by both parties.`);
    if (terms.opt_out_notice_days) flexLines.push(`• After the committed period, either party may adjust or end this agreement with ${terms.opt_out_notice_days} days' written notice.`);
    const flexSection = flexLines.length
        ? `7. FLEXIBILITY & RISK-SHARING\n${flexLines.join("\n")}\n\n`
        : "";
    const renewalNo = flexLines.length ? 8 : 7;
    const notesNo = renewalNo + 1;

    return `LOCAL SUPPLY AGREEMENT

This agreement is made between ${farmName}${farm.location_label ? ` of ${farm.location_label}` : ""} ("the Farm") and ${buyerName}${buyer.location_label ? ` of ${buyer.location_label}` : ""} ("the Buyer").

1. PRODUCT
The Farm agrees to supply ${terms.crop}${terms.grade ? ` (${terms.grade})` : ""} to the Buyer over the term of this agreement.

2. QUANTITY & CADENCE
${qty}, ${CADENCE_LABEL[terms.cadence].toLowerCase()}${terms.cadence === "one_time" ? "" : ` (${n} deliveries in total)`}.

3. TERM
From ${fmt(terms.term_start)} to ${fmt(terms.term_end)}.

4. PRICE
${price} per ${terms.unit}, for an estimated total committed value of ${total}.

5. DELIVERY
${terms.delivery_terms || "Delivery logistics to be arranged directly between the parties for each scheduled delivery."}

6. QUALITY & ACCEPTANCE
${terms.quality_terms || "Produce must arrive in fresh, saleable condition. The Buyer may reject any delivery that does not meet the agreed specification, with prompt notice to the Farm."}

${flexSection}${renewalNo}. RENEWAL
At the end of the term both parties will be prompted to renew, revise, or close this agreement.

${terms.notes ? `${notesNo}. NOTES\n${terms.notes}\n\n` : ""}This is a good-faith commitment between the parties. CropConnect facilitates the agreement and tracks fulfillment but is not a party to it. Have any binding contract reviewed by a qualified attorney.`;
}

interface SideInput { terms: Terms; type: ListingType; ceiling?: number | null }

/**
 * Compute a fair starting contract where a supply offer and a buyer need meet.
 * Pure, deterministic logic — the AI route only adds a human rationale on top.
 *   • quantity  → the smaller commitment (nobody is over-extended)
 *   • cadence   → demand-driven (the buyer's need)
 *   • price     → supply price if within the buyer's ceiling, else split the gap
 *   • term      → the overlapping window
 */
export function suggestFairTerms(a: SideInput, b: SideInput): Terms {
    const supply = a.type === "supply" ? a : b;
    const need = a.type === "need" ? a : b;
    const s = supply.terms;
    const n = need.terms;

    const qtys = [s.quantity, n.quantity].filter((q) => q > 0);
    const quantity = qtys.length ? Math.min(...qtys) : s.quantity || n.quantity;

    const ceiling = need.ceiling ?? (n.unit_price_cents || null);
    let price = s.unit_price_cents || n.unit_price_cents;
    if (ceiling && price > ceiling) price = Math.round((price + ceiling) / 2);

    const start = laterDate(s.term_start, n.term_start);
    const end = earlierDate(s.term_end, n.term_end);

    return {
        crop: s.crop || n.crop,
        grade: s.grade || n.grade,
        quantity,
        // a fair ±20% band so neither side is held to an exact number
        quantity_min: Math.max(1, Math.round(quantity * 0.8)),
        quantity_max: Math.round(quantity * 1.2),
        unit: s.unit || n.unit,
        cadence: n.cadence || s.cadence,
        term_start: start,
        term_end: end > start ? end : start,
        unit_price_cents: price,
        delivery_terms: s.delivery_terms || n.delivery_terms,
        quality_terms: s.quality_terms || n.quality_terms,
        crop_failure_clause: true,
        opt_out_notice_days: 14,
        min_commit_cycles: 2,
        sample_first: true,
        notes: null,
    };
}

function laterDate(a: string, b: string): string {
    return new Date(a) > new Date(b) ? a : b;
}
function earlierDate(a: string, b: string): string {
    return new Date(a) < new Date(b) ? a : b;
}

function fmt(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Has the contract reached terms both parties confirmed? */
export function isLocked(c: Pick<Contract, "farm_confirmed" | "buyer_confirmed">): boolean {
    return c.farm_confirmed && c.buyer_confirmed;
}

/** Diff two term sets → list of changed fields with labels. */
export function diffTerms(a: Terms, b: Terms): { field: string; label: string; from: string; to: string }[] {
    const rows: { field: string; label: string; from: string; to: string }[] = [];
    const cmp = (field: string, label: string, fa: string, fb: string) => {
        if (fa !== fb) rows.push({ field, label, from: fa, to: fb });
    };
    cmp("crop", "Crop", a.crop, b.crop);
    cmp("grade", "Grade", a.grade || "—", b.grade || "—");
    cmp("quantity", "Quantity", `${a.quantity} ${a.unit}`, `${b.quantity} ${b.unit}`);
    cmp("cadence", "Cadence", CADENCE_LABEL[a.cadence], CADENCE_LABEL[b.cadence]);
    cmp("unit_price_cents", "Unit price", money(a.unit_price_cents), money(b.unit_price_cents));
    cmp("term_start", "Start", fmt(a.term_start), fmt(b.term_start));
    cmp("term_end", "End", fmt(a.term_end), fmt(b.term_end));
    cmp("delivery_terms", "Delivery", a.delivery_terms || "—", b.delivery_terms || "—");
    cmp("quality_terms", "Quality", a.quality_terms || "—", b.quality_terms || "—");
    return rows;
}

function money(cents: number): string {
    return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function emptyTerms(overrides: Partial<Terms> = {}): Terms {
    const today = new Date();
    const end = new Date(today);
    end.setMonth(end.getMonth() + 3);
    return {
        crop: "",
        grade: null,
        quantity: 0,
        quantity_min: null,
        quantity_max: null,
        unit: "lb",
        cadence: "weekly" as Cadence,
        term_start: today.toISOString().slice(0, 10),
        term_end: end.toISOString().slice(0, 10),
        unit_price_cents: 0,
        delivery_terms: null,
        quality_terms: null,
        // De-risked by default — this is the whole point.
        crop_failure_clause: true,
        opt_out_notice_days: 14,
        min_commit_cycles: 2,
        sample_first: true,
        notes: null,
        ...overrides,
    };
}

/** Quantity for the sample shipment — the band's low end, or the typical amount. */
export function sampleQuantity(terms: Terms): number {
    return terms.quantity_min ?? terms.quantity ?? 0;
}

/** Committed value as a range when a flexible band is set, else a single number. */
export function contractValueRange(terms: Terms): { min: number; max: number } {
    const n = deliveryCount(terms);
    const lo = terms.quantity_min ?? terms.quantity;
    const hi = terms.quantity_max ?? terms.quantity;
    return {
        min: Math.round(lo * terms.unit_price_cents * n),
        max: Math.round(hi * terms.unit_price_cents * n),
    };
}
