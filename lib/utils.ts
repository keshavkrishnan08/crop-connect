import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format cents → human dollars. Monetary values are stored in cents. */
export function formatMoney(cents: number, opts: { compact?: boolean } = {}): string {
    const dollars = (cents ?? 0) / 100;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: dollars % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
        notation: opts.compact ? "compact" : "standard",
    }).format(dollars);
}

export function formatNumber(n: number): string {
    return new Intl.NumberFormat("en-US").format(n ?? 0);
}

export function formatDate(d: string | Date | null | undefined, style: "short" | "long" = "short"): string {
    if (!d) return "—";
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
        month: style === "long" ? "long" : "short",
        day: "numeric",
        year: style === "long" ? "numeric" : undefined,
    }).format(date);
}

export function relativeTime(d: string | Date): string {
    const date = typeof d === "string" ? new Date(d) : d;
    const diff = Date.now() - date.getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.round(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(date);
}

export function initials(name?: string | null): string {
    if (!name) return "··";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join("");
}

/** Deterministic pastel from a string — used for avatars/node accents. */
export function hashHue(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return h;
}

export function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
}

export function slugify(s: string): string {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
