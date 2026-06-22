"use client";

import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, EmptyState } from "@/components/ui/kit";
import { usd, pct, cn } from "@/lib/utils";
import { MenuCard, MarginUp, Leaf, Check } from "@/components/icons";

export default function MenuPage() {
    const dishes = useStore((s) => s.dishes);

    const rows = dishes.map((d) => {
        const cost = d.price * (d.foodCostPct || 0.3);
        const margin = d.price - cost;
        return { d, cost, margin, marginPct: d.price ? (margin / d.price) * 100 : 0 };
    }).sort((a, b) => b.margin - a.margin);

    if (rows.length === 0) return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Menu" title="Menu" subtitle="Which dishes make money." />
            <EmptyState icon={<MenuCard size={24} />} title="No menu yet" description="Add your menu in setup and we will break down the margin on every dish." />
        </div>
    );

    const avg = rows.reduce((s, r) => s + r.marginPct, 0) / rows.length;
    const local = rows.filter((r) => r.d.produceDriven);
    const localAvg = local.length ? local.reduce((s, r) => s + r.marginPct, 0) / local.length : 0;
    const max = Math.max(...rows.map((r) => r.margin), 1);
    const worst = rows.slice(-2);

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Menu" title="Menu" subtitle="Which dishes make money." />

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Sum label="Average margin" value={pct(avg)} tone="brand" />
                <Sum label="Local dishes margin" value={pct(localAvg)} sub={localAvg > avg ? `${pct(localAvg - avg)} above your menu` : "—"} tone="harvest" />
                <Sum label="Top earner / plate" value={usd(rows[0].margin)} sub={rows[0].d.name} tone="violet" />
            </div>

            <Card className="overflow-hidden p-0">
                <div className="border-b border-line px-5 py-3.5"><h3 className="font-mono text-sm font-semibold tracking-tight text-ink">Margin by dish</h3></div>
                <div className="divide-y divide-line">
                    {rows.map((r) => (
                        <div key={r.d.id} className="flex items-center gap-4 px-5 py-3">
                            <div className="min-w-0 flex-[1.4]">
                                <p className="flex items-center gap-1.5 truncate text-[14px] font-medium text-ink">{r.d.produceDriven && <Leaf size={13} className="shrink-0 text-brand-500" />} {r.d.name}</p>
                                <p className="font-mono text-2xs text-ink-faint tnum">{usd(r.d.price)} price · {usd(r.cost)} cost</p>
                            </div>
                            <div className="hidden flex-1 sm:block"><div className="h-2 overflow-hidden rounded-full bg-canvas-sunk"><div className="h-full rounded-full bg-brand-400" style={{ width: `${(r.margin / max) * 100}%` }} /></div></div>
                            <div className="w-20 text-right"><p className="font-mono text-sm font-medium text-ink tnum">{usd(r.margin)}</p><p className={cn("font-mono text-2xs tnum", r.marginPct >= avg ? "text-brand-600" : "text-harvest-600")}>{pct(r.marginPct)}</p></div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="mt-6 border-brand-200 bg-brand-50/40 p-5">
                <div className="mb-2 flex items-center gap-2"><MarginUp size={17} className="text-brand-600" /><h3 className="font-mono text-sm font-semibold tracking-tight text-ink">What to do</h3></div>
                <ul className="space-y-2 text-[14px] text-ink-soft">
                    <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> Push <b>{rows[0].d.name}</b>. It earns the most per plate. Feature it.</li>
                    {localAvg > avg && <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> Your local dishes carry {pct(localAvg - avg)} more margin than the menu average. Bring more local.</li>}
                    {worst.map((r) => <li key={r.d.id} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-harvest-500" /> <span>Reprice or rework <b>{r.d.name}</b>. At {pct(r.marginPct)} it drags the menu down.</span></li>)}
                </ul>
            </Card>
        </div>
    );
}

function Sum({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "brand" | "harvest" | "violet" }) {
    const t = tone === "harvest" ? "text-harvest-600" : tone === "violet" ? "text-violet-600" : "text-brand-600";
    return (
        <Card className="p-5">
            <p className={cn("font-display text-3xl leading-none tnum", t)}>{value}</p>
            <p className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</p>
            {sub && <p className="mt-0.5 truncate text-2xs text-ink-faint">{sub}</p>}
        </Card>
    );
}
