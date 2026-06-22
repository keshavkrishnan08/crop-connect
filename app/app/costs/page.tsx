"use client";

import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/kit";
import { usd, cn } from "@/lib/utils";
import { Shield, Receipt, X, Check } from "@/components/icons";

const LINES: { item: string; vendor: string; qty: number; unit: string; billed: number; benchmark: number }[] = [
    { item: "Roma tomatoes", vendor: "Sysco", qty: 60, unit: "lb", billed: 1.84, benchmark: 1.52 },
    { item: "Yellow onions", vendor: "Sysco", qty: 50, unit: "lb", billed: 0.71, benchmark: 0.68 },
    { item: "Chicken breast", vendor: "US Foods", qty: 80, unit: "lb", billed: 3.49, benchmark: 2.95 },
    { item: "Olive oil", vendor: "Sysco", qty: 6, unit: "gal", billed: 38.0, benchmark: 37.5 },
    { item: "Mixed greens", vendor: "US Foods", qty: 24, unit: "case", billed: 26.4, benchmark: 22.0 },
    { item: "Heavy cream", vendor: "Sysco", qty: 12, unit: "qt", billed: 4.1, benchmark: 4.05 },
    { item: "Russet potatoes", vendor: "Sysco", qty: 100, unit: "lb", billed: 0.82, benchmark: 0.79 },
    { item: "Lemons", vendor: "US Foods", qty: 18, unit: "case", billed: 41.0, benchmark: 34.0 },
];

export default function CostsPage() {
    const rows = LINES.map((l) => {
        const over = l.billed - l.benchmark;
        const flagged = over > l.benchmark * 0.05;
        return { l, over, flagged, lineOver: flagged ? over * l.qty : 0 };
    });
    const flaggedRows = rows.filter((r) => r.flagged);
    const weekly = flaggedRows.reduce((s, r) => s + r.lineOver, 0);

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Cost Guard" title="Costs" subtitle="We audit every invoice for overcharges." />

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Sum value={usd(weekly * 4.345, { compact: weekly * 4.345 > 9999 })} label="Overcharges caught / mo" tone="harvest" />
                <Sum value={String(flaggedRows.length)} label="Lines flagged this week" tone="violet" />
                <Sum value={String(LINES.length)} label="Lines audited" tone="brand" />
            </div>

            <Card className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                    <h3 className="font-mono text-sm font-semibold tracking-tight text-ink">This week's invoices</h3>
                    <span className="text-2xs text-ink-faint">billed vs local benchmark</span>
                </div>
                <div className="divide-y divide-line">
                    {rows.map((r, i) => (
                        <div key={i} className={cn("flex items-center gap-4 px-5 py-3", r.flagged && "bg-harvest-400/[0.06]")}>
                            <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg", r.flagged ? "bg-harvest-400/15 text-harvest-600" : "bg-brand-50 text-brand-600")}>{r.flagged ? <X size={15} /> : <Check size={15} />}</span>
                            <div className="min-w-0 flex-[1.4]"><p className="truncate text-[14px] font-medium text-ink">{r.l.item}</p><p className="text-2xs text-ink-faint">{r.l.vendor} · {r.l.qty} {r.l.unit}</p></div>
                            <div className="w-20 text-right font-mono text-[13px] tnum"><p className={r.flagged ? "text-harvest-600" : "text-ink"}>{usd(r.l.billed)}</p><p className="text-2xs text-ink-faint">vs {usd(r.l.benchmark)}</p></div>
                            <div className="w-20 text-right font-mono text-[13px] tnum">{r.flagged ? <span className="text-harvest-600">+{usd(r.lineOver)}/wk</span> : <span className="text-brand-600">fair</span>}</div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="mt-6 flex items-start gap-3 border-brand-200 bg-brand-50/40 p-5">
                <Shield size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <p className="text-[14px] leading-relaxed text-ink-soft">We benchmark every line against what local growers charge. Flagged items are running above market. Move the worst ones local and lock the price in a contract. <span className="font-semibold text-brand-700">Lemons and mixed greens alone are leaking {usd((flaggedRows.find((r) => r.l.item === "Lemons")?.lineOver ?? 0) * 4.345 + (flaggedRows.find((r) => r.l.item === "Mixed greens")?.lineOver ?? 0) * 4.345, { compact: true })}/mo.</span></p>
            </Card>
        </div>
    );
}

function Sum({ value, label, tone }: { value: string; label: string; tone: "brand" | "harvest" | "violet" }) {
    const t = tone === "harvest" ? "text-harvest-600" : tone === "violet" ? "text-violet-600" : "text-brand-600";
    return <Card className="p-5"><p className={cn("font-display text-3xl leading-none tnum", t)}>{value}</p><p className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</p></Card>;
}
