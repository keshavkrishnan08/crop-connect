"use client";

import * as React from "react";
import Link from "next/link";
import { useStore, marginRollup, farmById, getState, type Activity, type ActivityKind } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { AutomationBoard } from "@/components/app/AutomationBoard";
import { AgentDock, AGENT_NAME } from "@/components/app/AgentDock";
import { Roadmap } from "@/components/app/Roadmap";
import { Card, LinkButton, EmptyState } from "@/components/ui/kit";
import { CountUp } from "@/components/ui/CountUp";
import { usd, cn } from "@/lib/utils";
import { MarginUp, Truck, Route, Plus, ArrowRight, Calendar, Leaf, Farm, Pen, StoryTag, Search, Sparkle, Check } from "@/components/icons";

export default function Dashboard() {
    const items = useStore((s) => s.items);
    const restaurant = useStore((s) => s.restaurant);
    const activity = useStore((s) => s.activity);
    const roll = marginRollup(getState());

    const sourced = items.filter((i) => ["agreed", "delivering", "live"].includes(i.stage)).length;
    const boardItems = items.slice(0, 5);
    const upcoming = items.flatMap((i) => i.deliveries.filter((d) => d.status === "scheduled").map((d) => ({ item: i, d }))).sort((a, b) => +new Date(a.d.date) - +new Date(b.d.date)).slice(0, 5);

    return (
        <div className="animate-fade-up">
            <PageHeader
                eyebrow={`${restaurant.name} · ${restaurant.cuisine}`}
                title="Your sourcing runs itself"
                subtitle="You named a few ingredients. Here is everything we have handled since — and what is moving right now."
                actions={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>}
            />

            {/* the agent running it all */}
            <AgentDock />
            <Roadmap />

            {/* done-for-you strip */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat icon={<Leaf size={20} />} label="Ingredients sourced" value={<span className="font-mono tnum">{sourced}</span>} tone="brand" sub="matched and under contract" />
                <Stat icon={<Truck size={20} />} label="Deliveries handled" value={<span className="font-mono tnum">{roll.confirmedDeliveries}</span>} tone="ink" sub="scheduled and confirmed for you" />
                <Stat icon={<MarginUp size={20} />} label="Realized uplift / mo" value={<CountUp to={roll.realizedMonthly} format={(n) => usd(n, { compact: n > 9999 })} className="value-pos" />} tone="harvest" sub={`${usd(roll.realizedAnnual, { compact: true })}/yr run-rate`} />
                <Stat icon={<Check size={20} />} label="Your steps this week" value={<span className="font-mono tnum">0</span>} tone="brand" sub="we did the rest" />
            </div>

            {/* the automation board */}
            <Card className="mb-6 p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="font-display text-xl text-ink">Your sourcing pipeline</h2>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-semibold text-brand-600"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" /></span> Live</span>
                        </div>
                        <p className="text-[13px] text-ink-muted">A live model of what {AGENT_NAME} is doing. Every ingredient, from request to plate. Drag to look around — your agent owns the flow.</p>
                    </div>
                    <Link href="/app/sourcing" className="text-sm font-semibold text-brand-600 hover:underline">Open full board</Link>
                </div>
                {boardItems.length === 0
                    ? <EmptyState icon={<Route size={24} />} title="Nothing sourcing yet" description="Name one ingredient and watch us match the farm, draft the agreement, and schedule deliveries — automatically." action={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>} />
                    : <AutomationBoard items={boardItems} />}
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
                {/* activity feed */}
                <Card className="overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-line bg-gradient-to-br from-brand-50/50 to-transparent px-5 py-4">
                        <div className="flex items-center gap-2"><Sparkle size={17} className="text-brand-600" /><h3 className="font-display text-lg text-ink">Handled for you</h3></div>
                        <span className="text-2xs font-medium uppercase tracking-wide text-ink-faint">{activity.length} actions</span>
                    </div>
                    {activity.length === 0 ? <p className="px-5 py-8 text-center text-sm text-ink-muted">Nothing yet. Source an ingredient to start the engine.</p> : (
                        <div className="divide-y divide-line">
                            {activity.slice(0, 9).map((a) => (
                                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                                    <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg", KIND_TONE[a.kind])}>{KIND_ICON[a.kind]}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[14px] leading-snug text-ink">{a.text}</p>
                                        <p className="mt-0.5 text-[12px] text-ink-faint">{relTime(a.ts)}</p>
                                    </div>
                                    {a.itemId && <Link href={`/app/sourcing/${a.itemId}`} className="mt-0.5 shrink-0 text-ink-faint transition hover:text-brand-600"><ArrowRight size={15} /></Link>}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* upcoming deliveries */}
                <aside>
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
                        <Link href="/app/margins" className="btn-soft btn-sm mt-4 w-full">See margin detail <ArrowRight size={15} /></Link>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

const KIND_ICON: Record<ActivityKind, React.ReactNode> = {
    match: <Farm size={16} />, contract: <Pen size={16} />, delivery: <Truck size={16} />, story: <StoryTag size={16} />, system: <Search size={16} />,
};
const KIND_TONE: Record<ActivityKind, string> = {
    match: "bg-brand-50 text-brand-600", contract: "bg-ink/[0.06] text-ink-soft", delivery: "bg-harvest-400/12 text-harvest-500", story: "bg-brand-50 text-brand-600", system: "bg-canvas-sunk text-ink-faint",
};

function relTime(ts: number) {
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
}

function Stat({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; tone: "brand" | "harvest" | "ink" }) {
    const t = tone === "harvest" ? "bg-harvest-400/12 text-harvest-500" : tone === "ink" ? "bg-ink/[0.06] text-ink-soft" : "bg-brand-50 text-brand-600";
    return (
        <Card className="p-5" hover>
            <span className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", t)}>{icon}</span>
            <p className="font-display text-3xl leading-none text-ink">{value}</p>
            <p className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</p>
            {sub && <p className="mt-0.5 text-2xs text-ink-faint">{sub}</p>}
        </Card>
    );
}
