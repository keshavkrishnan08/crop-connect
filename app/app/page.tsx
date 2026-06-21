"use client";

import * as React from "react";
import Link from "next/link";
import { useStore, marginRollup, farmById, getState, type SourcingItem } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { ItemCard } from "@/components/sourcing/ItemCard";
import { Card, LinkButton, EmptyState, Badge } from "@/components/ui/kit";
import { CountUp } from "@/components/ui/CountUp";
import { usd, pct, formatDate, cn } from "@/lib/utils";
import { MarginUp, Truck, Route, Plus, ArrowRight, Calendar, Leaf, StoryTag, Search, Pen, Sparkle } from "@/components/icons";

export default function Dashboard() {
    const items = useStore((s) => s.items);
    const restaurant = useStore((s) => s.restaurant);
    const levers = useStore((s) => s.levers);
    const roll = marginRollup(getState());

    const inc = Math.max(0, levers.priceLift - levers.produceCostDelta);
    const weeklyRealized = roll.realizedMonthly / 4.345;
    // 8-week realized ramp (concrete: scales with how long items have been live)
    const liveCount = roll.liveCount;
    const series = React.useMemo(() => Array.from({ length: 8 }, (_, i) => {
        const ramp = liveCount === 0 ? 0 : Math.min(1, (i + 1) / 6);
        return weeklyRealized * ramp;
    }), [weeklyRealized, liveCount]);
    const maxV = Math.max(...series, weeklyRealized, 1);

    const upcoming = items.flatMap((i) => i.deliveries.filter((d) => d.status === "scheduled").map((d) => ({ item: i, d }))).sort((a, b) => +new Date(a.d.date) - +new Date(b.d.date)).slice(0, 5);
    const active = items.filter((i) => i.stage !== "live");
    const liveItems = items.filter((i) => i.stage === "live").sort((a, b) => b.lift - a.lift);
    const alerts = buildAlerts(items);

    return (
        <div className="animate-fade-up">
            <PageHeader
                eyebrow={`${restaurant.name} · ${restaurant.cuisine}`}
                title="Your kitchen, by the numbers"
                subtitle="The margin you're capturing from local — and what's still in the pipeline."
                actions={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>}
            />

            {/* stat row */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat icon={<MarginUp size={20} />} label="Realized uplift / mo" value={<CountUp to={roll.realizedMonthly} format={(n) => usd(n, { compact: n > 9999 })} className="value-pos" />} tone="harvest" sub={`${usd(roll.realizedAnnual, { compact: true })}/yr run-rate`} />
                <Stat icon={<Sparkle size={20} />} label="Modeled (pipeline)" value={<span className="font-mono tnum">{usd(roll.modeledMonthly, { compact: roll.modeledMonthly > 9999 })}</span>} tone="brand" sub={`${roll.modeledCount} dishes in flight`} />
                <Stat icon={<Leaf size={20} />} label="Live local dishes" value={<span className="font-mono tnum">{roll.liveCount}</span>} tone="brand" />
                <Stat icon={<Truck size={20} />} label="Deliveries received" value={<span className="font-mono tnum">{roll.confirmedDeliveries}</span>} tone="ink" />
            </div>

            {/* margin tracker */}
            <Card className="mb-6 p-5 sm:p-6">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="font-display text-xl text-ink">Margin uplift tracker</h2>
                        <p className="text-[13px] text-ink-muted">Realized weekly margin from local dishes, last 8 weeks. <span className="text-ink-faint">Modeled target {usd(weeklyRealized)}/wk.</span></p>
                    </div>
                    <div className="flex items-center gap-4 text-2xs font-medium">
                        <span className="inline-flex items-center gap-1.5 text-harvest-500"><span className="h-2.5 w-2.5 rounded bg-harvest-400" /> Realized</span>
                        <span className="inline-flex items-center gap-1.5 text-ink-faint"><span className="h-px w-4 bg-ink-faint" /> Modeled</span>
                    </div>
                </div>
                <div className="relative flex h-32 items-end gap-2">
                    <div className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-ink-faint/40" style={{ bottom: `${(weeklyRealized / maxV) * 100}%` }} />
                    {series.map((v, i) => (
                        <div key={i} className="group relative flex-1">
                            <div className="w-full rounded-t-md bg-gradient-to-t from-harvest-300 to-harvest-400 transition-all duration-500" style={{ height: `${Math.max(3, (v / maxV) * 100)}%` }} />
                            <div className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 font-mono text-2xs text-white tnum group-hover:block">{usd(v, { compact: true })}</div>
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex justify-between font-mono text-2xs text-ink-faint tnum"><span>8 wk ago</span><span>this week</span></div>
            </Card>

            {/* alerts */}
            {alerts.length > 0 && (
                <Card className="mb-6 overflow-hidden p-0">
                    <div className="flex items-center gap-2 border-b border-line bg-harvest-400/8 px-5 py-3"><Sparkle size={16} className="text-harvest-500" /><h3 className="font-display text-lg text-ink">Needs your attention</h3></div>
                    <div className="divide-y divide-line">
                        {alerts.map((a) => (
                            <Link key={a.href + a.title} href={a.href} className="flex items-center justify-between px-5 py-3 transition hover:bg-canvas">
                                <div className="flex items-center gap-3">
                                    <span className={cn("grid h-9 w-9 place-items-center rounded-lg", a.tone === "harvest" ? "bg-harvest-400/12 text-harvest-500" : "bg-brand-50 text-brand-600")}>{a.icon}</span>
                                    <div><p className="text-sm font-semibold text-ink">{a.title}</p><p className="text-[12.5px] text-ink-muted">{a.sub}</p></div>
                                </div>
                                <ArrowRight size={15} className="text-ink-faint" />
                            </Link>
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
                <section>
                    <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-2xl text-ink">In the pipeline</h2><Link href="/app/sourcing" className="text-sm font-semibold text-brand-600 hover:underline">View flow</Link></div>
                    {active.length === 0 ? (
                        <EmptyState icon={<Route size={24} />} title="All sourced and live" description="Nothing in the pipeline. Add an ingredient to bring more of your menu local." action={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>} />
                    ) : <div className="grid gap-4 sm:grid-cols-2">{active.map((i) => <ItemCard key={i.id} item={i} />)}</div>}
                </section>

                <aside className="space-y-6">
                    <Card className="p-5">
                        <div className="mb-4 flex items-center gap-2"><Calendar size={18} className="text-brand-600" /><h3 className="font-display text-lg text-ink">Upcoming deliveries</h3></div>
                        {upcoming.length === 0 ? <p className="py-5 text-center text-sm text-ink-muted">None scheduled.</p> : (
                            <div className="space-y-1">
                                {upcoming.map(({ item, d }) => {
                                    const farm = farmById(item.farmId);
                                    return (
                                        <Link key={d.id} href={`/app/sourcing/${item.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-canvas">
                                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-center leading-none text-brand-600">
                                                <span className="text-2xs font-bold uppercase">{new Date(d.date).toLocaleDateString("en-US", { month: "short" })}</span>
                                                <span className="font-mono text-sm font-bold tnum">{new Date(d.date).getDate()}</span>
                                            </div>
                                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold capitalize text-ink">{item.crop}</p><p className="truncate font-mono text-[12.5px] text-ink-muted tnum">{d.qty} {item.unit} · {farm?.name}</p></div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    <Card className="p-5">
                        <div className="mb-4 flex items-center gap-2"><StoryTag size={18} className="text-brand-600" /><h3 className="font-display text-lg text-ink">Story performance</h3></div>
                        {liveItems.length === 0 ? <p className="py-5 text-center text-sm text-ink-muted">No live dishes yet.</p> : (
                            <div className="space-y-2.5">
                                {liveItems.map((i) => (
                                    <Link key={i.id} href={`/app/sourcing/${i.id}`} className="flex items-center justify-between gap-3">
                                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{i.dishName}</p><p className="truncate text-[12.5px] text-ink-muted">{farmById(i.farmId)?.name}</p></div>
                                        <span className="value-pos shrink-0 text-sm">+{usd(inc * restaurant.coversPerWeek * levers.attachRate * 4.345, { compact: true })}/mo</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                        <Link href="/app/story" className="btn-soft btn-sm mt-4 w-full">Open Story Studio <ArrowRight size={15} /></Link>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

function Stat({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; tone: "brand" | "harvest" | "ink" }) {
    const t = tone === "harvest" ? "bg-harvest-400/12 text-harvest-500" : tone === "ink" ? "bg-ink/[0.06] text-ink-soft" : "bg-brand-50 text-brand-600";
    return (
        <Card className="p-5" hover>
            <span className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", t)}>{icon}</span>
            <p className="font-display text-3xl leading-none text-ink">{value}</p>
            <p className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</p>
            {sub && <p className="mt-0.5 font-mono text-2xs text-ink-faint tnum">{sub}</p>}
        </Card>
    );
}

function buildAlerts(items: SourcingItem[]) {
    const out: { icon: React.ReactNode; title: string; sub: string; href: string; tone: "brand" | "harvest" }[] = [];
    for (const i of items) {
        if (i.stage === "requested") out.push({ icon: <Search size={17} />, title: `Choose a farm for ${i.crop}`, sub: "Local matches are ready to review", href: `/app/sourcing/${i.id}`, tone: "harvest" });
        else if (i.stage === "matched") out.push({ icon: <Pen size={17} />, title: `Confirm the agreement for ${i.crop}`, sub: "One click locks the terms and schedules deliveries", href: `/app/sourcing/${i.id}`, tone: "harvest" });
    }
    const dueSoon = items.flatMap((i) => i.deliveries.filter((d) => d.status === "scheduled" && +new Date(d.date) - Date.now() < 7 * 86400000).map((d) => ({ i, d })));
    if (dueSoon.length) out.push({ icon: <Truck size={17} />, title: `${dueSoon.length} ${dueSoon.length === 1 ? "delivery" : "deliveries"} this week`, sub: "Mark them received to release the margin tracker", href: "/app/sourcing", tone: "brand" });
    return out.slice(0, 4);
}
