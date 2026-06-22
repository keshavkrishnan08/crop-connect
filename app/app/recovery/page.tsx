"use client";

import { useStore } from "@/lib/store";
import { recoverySummary } from "@/lib/recovery";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/kit";
import { usd, cn } from "@/lib/utils";
import { Shield, Search, TrendUp, MenuCard, Check, Sparkle } from "@/components/icons";

const PLAN = 299; // base plan / mo, for the payback comparison

export default function RecoveryPage() {
    const dishes = useStore((s) => s.dishes);
    const covers = useStore((s) => s.restaurant.coversPerWeek);
    const lv = useStore((s) => s.levers);
    const r = recoverySummary(dishes, covers, lv);
    const payback = Math.max(1, Math.round(r.total / PLAN));

    const items = [
        { tone: "harvest", icon: <Search size={18} />, title: "Invoice overcharges caught", value: r.invoice, sub: "We benchmark every distributor line against local prices and flag what you are overpaying." },
        { tone: "violet", icon: <TrendUp size={18} />, title: "Waste eliminated", value: r.waste, sub: "We set next week's pars from your real usage, so you stop over-ordering without running short." },
        { tone: "sky", icon: <MenuCard size={18} />, title: "Menu mispricing fixed", value: r.menu, sub: "We find the dishes you are underpricing and tell you exactly how to reprice them." },
    ] as const;

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Profit Recovery" title="Recovery" subtitle="Money the agent finds for you, guaranteed." />

            {/* the grand-slam number */}
            <Card className="overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50/80 via-canvas-soft to-canvas-soft p-7 text-center sm:p-9">
                <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600"><Sparkle size={13} /> Found for you this month</p>
                <p className="mt-3 font-display text-5xl text-ink tnum sm:text-6xl"><span className="text-gradient">{usd(r.total, { compact: r.total > 9999 })}</span></p>
                <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-muted">That is about <b className="text-ink">{usd(r.total * 12, { compact: true })}/year</b> the agent recovers across your invoices, waste, and menu, on top of the local sourcing.</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-[13px] font-semibold text-brand-700"><Shield size={15} /> Pays for your plan {payback}× over, or your month is free.</div>
            </Card>

            {/* stacked deliverables */}
            <div className="mt-6 space-y-3">
                {items.map((it) => (
                    <Card key={it.title} className="flex items-center gap-4 p-5">
                        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                            it.tone === "harvest" ? "bg-harvest-400/15 text-harvest-600" : it.tone === "violet" ? "bg-violet-50 text-violet-600" : "bg-sky-50 text-sky-600")}>{it.icon}</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-ink">{it.title}</p>
                            <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">{it.sub}</p>
                        </div>
                        <p className="shrink-0 font-display text-2xl text-ink tnum">{usd(it.value, { compact: it.value > 9999 })}<span className="text-sm text-ink-muted">/mo</span></p>
                    </Card>
                ))}
            </div>

            {/* guarantee */}
            <Card className="mt-6 flex items-start gap-3 border-brand-200 bg-brand-50/40 p-5">
                <Shield size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <div className="text-[14px] leading-relaxed text-ink-soft">
                    <p className="font-semibold text-ink">Our guarantee</p>
                    <p className="mt-1">If the agent does not find more than your plan costs in any month, that month is on us. You only pay when we have already put the money back in your pocket. <span className="inline-flex items-center gap-1 font-medium text-brand-700">No risk <Check size={14} /></span></p>
                </div>
            </Card>
        </div>
    );
}
