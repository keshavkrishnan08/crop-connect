import { type Terms, CADENCE_LABEL } from "@/lib/types";

export { formatMoney, formatNumber, formatDate, relativeTime } from "@/lib/utils";

/** Compact human description of the cadence + volume. */
export function cadenceLabelShort(t: Terms): string {
    if (!t.quantity) return CADENCE_LABEL[t.cadence];
    if (t.cadence === "one_time") return `${t.quantity} ${t.unit}, one-time`;
    return `${t.quantity} ${t.unit} · ${CADENCE_LABEL[t.cadence].toLowerCase()}`;
}
