"use client";

import * as React from "react";
import { useStore, actions, marginRollup, getState } from "@/lib/store";
import { computeUplift, dishCurrent, dishModeled, type Dish } from "@/lib/margin";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, Badge } from "@/components/ui/kit";
import { CountUp } from "@/components/ui/CountUp";
import { usd, pct, clamp, cn } from "@/lib/utils";
import { MarginUp, TrendUp, Check, Sparkle } from "@/components/icons";

export default function MarginsPage() {
    const dishes = useStore((s) => s.dishes);
    const restaurant = useStore((s) => s.restaurant);
    const levers = useStore((s) => s.levers);
    const roll = marginRollup(getState());

    const up = computeUplift(dishes, restaurant, levers);
    const featuredCount = dishes.filter((d) => d.featured).length;

    const toggleFeature = (id: string) => actions.setDishes(dishes.map((d) => d.id === id ? { ...d, featured: !d.featured } : d));

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Margin Studio" title="What local is worth to you" subtitle="A live model of the margin you capture by featuring local dishes. Every number is an editable estimate — a range, never a promise." />

            {/* headline + realized */}
            <div className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <Card className="relative overflow-hidden p-6">
                    <div className="pointer-events-none absolute inset-0 bg-aura" />
                    <div className="relative">
                        <Badge tone="harvest"><Sparkle size={12} /> Modeled · {featuredCount} dishes featured</Badge>
                        <p className="mt-4 font-display text-5xl leading-none text-ink">
                            <CountUp to={up.monthlyExpected} format={(n) => usd(n, { compact: n > 9999 })} className="value-pos" /><span className="text-2xl text-ink-muted">/mo</span>
                        </p>
                        <p className="mt-2 font-mono text-sm text-ink-muted tnum">
                            Conservative {usd(up.monthlyConservative, { compact: true })} – Expected {usd(up.monthlyExpected, { compact: true })} · ≈ {usd(up.annualExpected, { compact: true })}/yr
                        </p>
                        <div className="mt-5 flex items-center gap-5">
                            <Delta label="Blended margin now" v={pct(up.blendedMarginNow)} />
                            <TrendUp size={20} className="text-harvest-500" />
                            <Delta label="With local features" v={pct(up.blendedMarginModeled)} pos />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="mb-3 flex items-center gap-2"><MarginUp size={18} className="text-brand-600" /><h3 className="font-display text-lg text-ink">Realized so far</h3></div>
                    <p className="font-display text-4xl leading-none text-ink"><span className="value-pos">{usd(roll.realizedMonthly, { compact: roll.realizedMonthly > 9999 })}</span><span className="text-lg text-ink-muted">/mo</span></p>
                    <p className="mt-2 text-[13px] text-ink-muted">From <span className="font-semibold text-ink">{roll.liveCount}</span> dishes already live. As more of the pipeline goes live, realized climbs toward modeled.</p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-canvas-sunk">
                        <div className="h-full rounded-full bg-gradient-to-r from-harvest-300 to-harvest-400" style={{ width: `${clamp(up.monthlyExpected ? (roll.realizedMonthly / up.monthlyExpected) * 100 : 0, 3, 100)}%` }} />
                    </div>
                </Card>
            </div>

            {/* levers */}
            <Card className="mb-6 p-5 sm:p-6">
                <h3 className="mb-1 font-display text-xl text-ink">Assumptions</h3>
                <p className="mb-5 text-[13px] text-ink-muted">Drag these to your reality. Conservative defaults — everything recomputes live.</p>
                <div className="grid gap-6 sm:grid-cols-3">
                    <Lever label="Story price lift" hint="$ added to a featured dish" value={levers.priceLift} min={0} max={8} step={0.5} fmt={(v) => usd(v)} onChange={(v) => actions.setLevers({ priceLift: v })} />
                    <Lever label="Added produce cost" hint="$ extra per dish" value={levers.produceCostDelta} min={0} max={4} step={0.25} fmt={(v) => usd(v)} onChange={(v) => actions.setLevers({ produceCostDelta: v })} />
                    <Lever label="Attach rate" hint="share of covers ordering it" value={levers.attachRate * 100} min={3} max={30} step={1} fmt={(v) => pct(v)} onChange={(v) => actions.setLevers({ attachRate: v / 100 })} />
                </div>
                <p className="mt-5 font-mono text-[12.5px] text-ink-muted tnum">
                    ≈ {usd(Math.max(0, levers.priceLift - levers.produceCostDelta))} pure margin / order · {restaurant.coversPerWeek} covers/wk · {pct(levers.attachRate * 100)} attach (covers in Settings)
                </p>
            </Card>

            {/* per-dish */}
            <Card className="overflow-hidden p-0">
                <div className="border-b border-line px-5 py-3.5"><h3 className="font-display text-lg text-ink">Per-dish breakdown <span className="text-sm font-normal text-ink-faint">— click to feature</span></h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-line text-left text-2xs uppercase tracking-wide text-ink-faint">
                                <th className="px-5 py-2.5 font-semibold">Dish</th>
                                <th className="px-3 py-2.5 text-right font-semibold">Price</th>
                                <th className="px-3 py-2.5 text-right font-semibold">Margin now</th>
                                <th className="px-3 py-2.5 text-right font-semibold">Modeled</th>
                                <th className="px-5 py-2.5 text-right font-semibold">+/order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dishes.map((d) => <DishRow key={d.id} dish={d} levers={levers} onToggle={() => toggleFeature(d.id)} />)}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function Delta({ label, v, pos }: { label: string; v: string; pos?: boolean }) {
    return <div><p className="text-2xs font-medium uppercase tracking-wide text-ink-faint">{label}</p><p className={cn("font-mono text-2xl tnum", pos ? "text-harvest-500" : "text-ink")}>{v}</p></div>;
}

function Lever({ label, hint, value, min, max, step, fmt, onChange }: { label: string; hint: string; value: number; min: number; max: number; step: number; fmt: (v: number) => string; onChange: (v: number) => void }) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between"><label className="text-[13px] font-semibold text-ink-soft">{label}</label><span className="font-mono text-sm font-medium text-brand-600 tnum">{fmt(value)}</span></div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand-500" />
            <p className="mt-1 text-[12px] text-ink-faint">{hint}</p>
        </div>
    );
}

function DishRow({ dish, levers, onToggle }: { dish: Dish; levers: import("@/lib/margin").Levers; onToggle: () => void }) {
    const cur = dishCurrent(dish);
    const mod = dishModeled(dish, levers);
    return (
        <tr onClick={onToggle} className={cn("cursor-pointer border-b border-line/70 transition last:border-0 hover:bg-canvas", dish.featured && "bg-brand-50/40")}>
            <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                    <span className={cn("grid h-5 w-5 place-items-center rounded-md border", dish.featured ? "border-brand-500 bg-brand-500 text-white" : "border-line-strong")}>{dish.featured && <Check size={12} />}</span>
                    <span className="font-medium text-ink">{dish.name}</span>
                    {dish.produceDriven && <Badge tone="brand" className="!py-0.5">local-ready</Badge>}
                </div>
            </td>
            <td className="px-3 py-3 text-right font-mono text-ink-soft tnum">{usd(dish.price)}</td>
            <td className="px-3 py-3 text-right font-mono text-ink-muted tnum">{pct(cur.marginPct)}</td>
            <td className="px-3 py-3 text-right font-mono tnum">{dish.featured ? <span className="text-harvest-500">{pct(mod.newMarginPct)}</span> : <span className="text-ink-faint">—</span>}</td>
            <td className="px-5 py-3 text-right font-mono tnum">{dish.featured ? <span className="value-pos">+{usd(mod.incrementalGp)}</span> : <span className="text-ink-faint">—</span>}</td>
        </tr>
    );
}
