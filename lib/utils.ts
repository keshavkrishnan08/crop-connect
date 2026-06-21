import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format dollars (number) → "$1,240" or "$12.50". */
export function usd(n: number, opts: { cents?: boolean; compact?: boolean } = {}): string {
    const v = n ?? 0;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: opts.cents ? 2 : v % 1 === 0 ? 0 : 2,
        maximumFractionDigits: opts.cents ? 2 : 2,
        notation: opts.compact ? "compact" : "standard",
    }).format(v);
}

export function pct(n: number, digits = 0): string {
    return `${(n ?? 0).toFixed(digits)}%`;
}

export function num(n: number): string {
    return new Intl.NumberFormat("en-US").format(n ?? 0);
}

export function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
}

export function round(n: number, step = 1): number {
    return Math.round(n / step) * step;
}

export function initials(name?: string | null): string {
    if (!name) return "··";
    return name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
}

export function slugify(s: string): string {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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

export function uid(prefix = "id"): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
