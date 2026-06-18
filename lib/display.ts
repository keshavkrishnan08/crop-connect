import { type Terms, CADENCE_LABEL, hasBand } from "@/lib/types";

export { formatMoney, formatNumber, formatDate, relativeTime } from "@/lib/utils";

/** Quantity as a band ("30–50 lb") or an exact amount ("40 lb"). */
export function qtyLabel(t: Terms): string {
    if (hasBand(t)) return `${t.quantity_min}–${t.quantity_max} ${t.unit}`;
    return `${t.quantity} ${t.unit}`;
}

/** Compact human description of the cadence + volume. */
export function cadenceLabelShort(t: Terms): string {
    if (!t.quantity && !hasBand(t)) return CADENCE_LABEL[t.cadence];
    if (t.cadence === "one_time") return `${qtyLabel(t)}, one-time`;
    return `${qtyLabel(t)} · ${CADENCE_LABEL[t.cadence].toLowerCase()}`;
}
