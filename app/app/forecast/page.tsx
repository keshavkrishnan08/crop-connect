"use client";

import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/kit";
import { usd, cn } from "@/lib/utils";
import { Calendar, TrendUp, Check, Sprout } from "@/components/icons";

const ITEMS: { name: string; unit: string; ordered: number; used: number; suggested: number; cost: number; trend: string }[] = [
    { name: "Heirloom tomatoes", unit: "lb", ordered: 50, used: 41, suggested: 44, cost: 4.5, trend: "steady" },
    { name: "Salad greens", unit: "lb", ordered: 40, used: 30, suggested: 33, cost: 6.0, trend: "up next week" },
    { name: "Summer squash", unit: "lb", ordered: 35, used: 22, suggested: 26, cost: 3.0, trend: "down" },
    { name: "Specialty mushrooms", unit: "lb", ordered: 18, used: 17, suggested: 18, cost: 9.0, trend: "steady" },
    { name: "Beets", unit: "lb", ordered: 30, used: 19, suggested: 22, cost: 3.0, trend: "down" },
    { name: "Peaches", unit: "case", ordered: 12, used: 8, suggested: 9, cost: 28, trend: "weekend spike" },
];

export default function ForecastPage() {
    const rows = ITEMS.map((it) => {
        const waste = Math.max(0, it.ordered - it.used);
        const overPar = it.ordered - it.suggested;
        return { it, waste, wasteCost: waste * it.cost, overPar };
    });
    const weeklyWaste = rows.reduce((s, r) => s + r.wasteCost, 0);
    const overParCount = rows.filter((r) => r.overPar > 1).length;
    const fillRate = Math.round((rows.reduce((s, r) => s + r.it.used, 0) / rows.reduce((s, r) => s + r.it.ordered, 0)) * 100);

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Par & Waste" title="Forecast" subtitle="Order the right amount every week." />

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Sum value={usd(weeklyWaste * 4.345, { compact: true })} label="Waste / mo at this pace" tone="harvest" />
                <Sum value={String(overParCount)} label="Items over par" tone="violet" />
                <Sum value={`${fillRate}%`} label="Used vs ordered" tone="brand" />
            </div>

            <Card className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                    <h3 className="font-mono text-sm font-semibold tracking-tight text-ink">Next week's pars</h3>
                    <span className="text-2xs text-ink-faint">ordered · used · suggested</span>
                </div>
                <div className="divide-y divide-line">
                    {rows.map((r, i) => {
                        const usedPct = Math.round((r.it.used / r.it.ordered) * 100);
                        return (
                            <div key={i} className="flex items-center gap-4 px-5 py-3">
                                <div className="min-w-0 flex-[1.4]"><p className="truncate text-[14px] font-medium text-ink">{r.it.name}</p><p className="flex items-center gap-1 text-2xs text-ink-faint"><TrendUp size={11} /> {r.it.trend}</p></div>
                                <div className="hidden flex-1 sm:block">
                                    <div className="h-2 overflow-hidden rounded-full bg-canvas-sunk"><div className={cn("h-full rounded-full", usedPct >= 85 ? "bg-brand-400" : "bg-harvest-400")} style={{ width: `${usedPct}%` }} /></div>
                                    <p className="mt-1 font-mono text-2xs text-ink-faint tnum">{r.it.ordered} ordered · {r.it.used} used</p>
                                </div>
                                <div className="w-24 text-right">
                                    <p className="font-mono text-sm font-medium text-ink tnum">{r.it.suggested} {r.it.unit}</p>
                                    {r.overPar > 1 ? <p className="font-mono text-2xs text-harvest-600 tnum">cut {r.overPar} {r.it.unit}</p> : <p className="font-mono text-2xs text-brand-600">on target</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card className="mt-6 flex items-start gap-3 border-brand-200 bg-brand-50/40 p-5">
                <Sprout size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <p className="text-[14px] leading-relaxed text-ink-soft">We learn your real usage from each delivery and set next week's par for you. Following these cuts roughly <span className="font-semibold text-brand-700">{usd(weeklyWaste * 4.345 * 0.6, { compact: true })}/mo</span> of waste without ever running short. Because we source weekly, you can trim with confidence.</p>
            </Card>
        </div>
    );
}

function Sum({ value, label, tone }: { value: string; label: string; tone: "brand" | "harvest" | "violet" }) {
    const t = tone === "harvest" ? "text-harvest-600" : tone === "violet" ? "text-violet-600" : "text-brand-600";
    return <Card className="p-5"><p className={cn("font-display text-3xl leading-none tnum", t)}>{value}</p><p className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</p></Card>;
}
