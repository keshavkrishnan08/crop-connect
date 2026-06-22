"use client";

import * as React from "react";
import Link from "next/link";
import { useStore, farmById, orderEscrow, supplyHeadline, farmNotifications, getState, type Activity, type ActivityKind } from "@/lib/store";
import { Photo } from "@/components/marketing/Photo";
import { PageHeader } from "@/components/app/PageHeader";
import { AutomationBoard } from "@/components/app/AutomationBoard";
import { AGENT_NAME } from "@/components/app/AgentDock";
import { Roadmap } from "@/components/app/Roadmap";
import { Card, LinkButton, EmptyState } from "@/components/ui/kit";
import { usd, cn } from "@/lib/utils";
import { Truck, Route, Plus, ArrowRight, Calendar, Farm, Pen, StoryTag, Search, Bell } from "@/components/icons";

export default function Dashboard() {
    const items = useStore((s) => s.items);
    const restaurant = useStore((s) => s.restaurant);
    const activity = useStore((s) => s.activity);
    const active = items.filter((i) => ["agreed", "delivering", "live"].includes(i.stage));
    const liveCount = items.filter((i) => i.stage === "live").length;
    const farmsUsed = Array.from(new Set(active.map((i) => i.farmId).filter(Boolean)));
    const allDel = items.flatMap((i) => i.deliveries);
    const scheduledDel = allDel.filter((d) => d.status === "scheduled").length;
    const confirmedDel = allDel.filter((d) => d.status === "confirmed").length;
    const deliveredDel = allDel.filter((d) => d.status === "delivered").length;
    const onTime = confirmedDel + deliveredDel > 0 ? Math.round((confirmedDel / (confirmedDel + deliveredDel)) * 100) : 100;
    const weeklyVolume = active.reduce((s, i) => s + (i.qtyPerWeek || 0), 0);
    const weeklySpend = active.reduce((s, i) => s + (i.qtyPerWeek || 0) * (i.priceCeiling || 0), 0);
    const escrowHeld = items.reduce((s, i) => s + orderEscrow(i).held, 0);
    const boardItems = items.slice(0, 5);
    const upcoming = items.flatMap((i) => i.deliveries.filter((d) => d.status === "scheduled").map((d) => ({ item: i, d }))).sort((a, b) => +new Date(a.d.date) - +new Date(b.d.date)).slice(0, 5);

    return (
        <div className="animate-fade-up">
            <PageHeader
                eyebrow={`${restaurant.name} · ${restaurant.cuisine}`}
                title="Dashboard"
                subtitle={`${AGENT_NAME} is running your sourcing.`}
                actions={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>}
            />

            {/* news: latest from your farms */}
            <NewsBanner />

            {/* recent events */}
            <RecentEvents activity={activity} />

            {/* business KPIs */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
                <Kpi label="Active contracts" value={active.length} tone="brand" />
                <Kpi label="Live on menu" value={liveCount} tone="brand" />
                <Kpi label="Farms supplying" value={farmsUsed.length} tone="sky" />
                <Kpi label="Deliveries due" value={scheduledDel} tone="sky" />
                <Kpi label="On-time rate" value={`${onTime}%`} tone="brand" />
                <Kpi label="Weekly volume" value={weeklyVolume} sub="lb / wk" tone="violet" />
                <Kpi label="Weekly spend" value={usd(weeklySpend, { compact: weeklySpend > 9999 })} tone="harvest" />
                <Kpi label="In escrow" value={usd(escrowHeld, { compact: escrowHeld > 9999 })} tone="violet" />
            </div>

            {/* supply status — the live link to your farms */}
            {active.length > 0 && (
                <Card className="mb-6 p-5">
                    <div className="mb-3 flex items-center gap-2"><Bell size={16} className="text-brand-600" /><h3 className="text-[13px] font-medium text-ink-soft">Supply status</h3><span className="ml-auto text-2xs text-ink-faint">{AGENT_NAME} is watching every drop</span></div>
                    <div className="space-y-1">
                        {active.map((it) => {
                            const h = supplyHeadline(it);
                            const farm = farmById(it.farmId);
                            const dot = h.tone === "harvest" ? "bg-harvest-500" : h.tone === "sky" ? "bg-sky-500" : "bg-brand-500";
                            return (
                                <Link key={it.id} href={`/app/sourcing/${it.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-canvas">
                                    <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} />
                                    <span className="w-28 shrink-0 truncate text-[13.5px] font-medium capitalize text-ink">{it.crop}</span>
                                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-muted">{h.sub}</span>
                                    <span className="hidden shrink-0 text-2xs text-ink-faint sm:block">{farm?.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* your farms, with real imagery */}
            {farmsUsed.length > 0 && (
                <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-[13px] font-medium text-ink-soft">Your farms</h3>
                        <span className="text-2xs text-ink-faint">{farmsUsed.length} supplying you</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {active.slice(0, 4).map((it, idx) => {
                            const farm = farmById(it.farmId);
                            return <Photo key={it.id} q={`${it.crop} farm field`} seed={100 + idx} alt={farm?.name ?? "farm"} caption={farm?.name} place={`${farm?.distanceMi} mi`} className="aspect-[4/3]" />;
                        })}
                    </div>
                </div>
            )}

            {/* the work, side by side with your to-dos */}
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="space-y-6">
                    {/* live board */}
                    <Card className="p-5 sm:p-6 transition-shadow duration-200 hover:shadow-lift">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-base font-medium text-ink">Pipeline</h2>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-semibold text-brand-600"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" /></span> Live</span>
                            </div>
                            <Link href="/app/sourcing" className="text-sm font-semibold text-brand-600 hover:underline">Open full board</Link>
                        </div>
                        {boardItems.length === 0
                            ? <EmptyState icon={<Route size={24} />} title="Nothing sourcing yet" description="Name one ingredient. The agent matches the farm, drafts the agreement, and schedules deliveries." action={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>} />
                            : <AutomationBoard items={boardItems} />}
                    </Card>
                </div>

                {/* right rail: what to do, what is coming */}
                <aside className="space-y-6">
                    <Roadmap />
                    <Card className="p-5 transition-shadow duration-200 hover:shadow-lift">
                        <div className="mb-4 flex items-center gap-2"><Calendar size={18} className="text-brand-600" /><h3 className="text-sm font-medium text-ink">Upcoming deliveries</h3></div>
                        {upcoming.length === 0 ? <p className="py-5 text-center text-sm text-ink-muted">None scheduled.</p> : (
                            <div className="space-y-1">
                                {upcoming.map(({ item, d }) => {
                                    const farm = farmById(item.farmId);
                                    return (
                                        <Link key={d.id} href={`/app/sourcing/${item.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-canvas">
                                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sky-50 text-center leading-none text-sky-600">
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

function NewsBanner() {
    useStore((s) => s.items);
    const news = farmNotifications(getState()).slice(0, 3);
    if (news.length === 0) return null;
    return (
        <Card className="mb-6 overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-line bg-gradient-to-br from-brand-50/50 to-transparent px-5 py-2.5"><Bell size={15} className="text-brand-600" /><h3 className="text-[13px] font-medium text-ink">Latest from your farms</h3></div>
            <div className="divide-y divide-line">
                {news.map((n) => (
                    <Link key={n.id} href={`/app/sourcing/${n.itemId}`} className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-canvas/60">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{n.text}</span>
                        <span className="hidden shrink-0 text-2xs text-ink-faint sm:block">{n.farm}</span>
                    </Link>
                ))}
            </div>
        </Card>
    );
}

function RecentEvents({ activity }: { activity: Activity[] }) {
    const latest = activity.slice(0, 4);
    return (
        <div className="mb-6 overflow-hidden rounded-3xl border border-line bg-canvas-soft shadow-card transition-shadow duration-200 hover:shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <h3 className="text-sm font-medium text-ink">Recent</h3>
                <span className="text-2xs text-ink-faint">{activity.length} events</span>
            </div>
            {latest.length === 0
                ? <p className="px-5 py-6 text-center text-sm text-ink-muted">Nothing yet. Source an ingredient to get things moving.</p>
                : (
                    <div className="divide-y divide-line">
                        {latest.map((a) => (
                            <div key={a.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-canvas/60">
                                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg", KIND_TONE[a.kind])}>{KIND_ICON[a.kind]}</span>
                                {a.itemId
                                    ? <Link href={`/app/sourcing/${a.itemId}`} className="min-w-0 flex-1 truncate text-[14px] text-ink hover:text-brand-600">{a.text}</Link>
                                    : <p className="min-w-0 flex-1 truncate text-[14px] text-ink">{a.text}</p>}
                                <span className="shrink-0 font-mono text-[12px] text-ink-faint tnum">{relTime(a.ts)}</span>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}

const KIND_ICON: Record<ActivityKind, React.ReactNode> = {
    match: <Farm size={16} />, contract: <Pen size={16} />, delivery: <Truck size={16} />, story: <StoryTag size={16} />, system: <Search size={16} />,
};
const KIND_TONE: Record<ActivityKind, string> = {
    match: "bg-brand-50 text-brand-600", contract: "bg-violet-50 text-violet-600", delivery: "bg-harvest-400/12 text-harvest-500", story: "bg-sky-50 text-sky-600", system: "bg-canvas-sunk text-ink-faint",
};

function relTime(ts: number) {
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
}

function Kpi({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: string; tone: "brand" | "harvest" | "sky" | "violet" }) {
    const t = tone === "harvest" ? "text-harvest-600" : tone === "sky" ? "text-sky-600" : tone === "violet" ? "text-violet-600" : "text-brand-600";
    return (
        <div className="rounded-2xl border border-line bg-canvas-soft p-3.5 transition-shadow duration-200 hover:shadow-card">
            <p className="text-2xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
            <p className={cn("mt-1.5 font-mono text-[1.55rem] leading-none tnum", t)}>{value}</p>
            {sub && <p className="mt-1 text-2xs text-ink-faint">{sub}</p>}
        </div>
    );
}
