"use client";

import * as React from "react";
import { useStore, farmById, orderEscrow, ESCROW_LABEL, PENALTY_LABEL, type SourcingItem } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, Badge, EmptyState } from "@/components/ui/kit";
import { usd, cn } from "@/lib/utils";
import { Shield, Receipt, Calendar, Check, MapPin } from "@/components/icons";

export default function BankingPage() {
    const items = useStore((s) => s.items);
    const active = items.filter((i) => ["agreed", "delivering", "live"].includes(i.stage));

    const totals = active.reduce((acc, i) => { const e = orderEscrow(i); acc.held += e.held; acc.released += e.released; return acc; }, { held: 0, released: 0 });

    const payouts = items
        .flatMap((i) => i.deliveries.filter((d) => d.status === "scheduled").map((d) => ({ item: i, d })))
        .sort((a, b) => +new Date(a.d.date) - +new Date(b.d.date))
        .slice(0, 8);

    const receipts = items
        .flatMap((i) => i.deliveries.filter((d) => d.status === "confirmed").map((d) => ({ item: i, d, amt: (d.qty || 0) * (i.priceCeiling || 0) })))
        .sort((a, b) => +new Date(b.d.date) - +new Date(a.d.date))
        .slice(0, 12);
    const paidTotal = receipts.reduce((s, r) => s + r.amt, 0);

    const penalties = items.flatMap((i) => (i.penalties ?? []).map((p) => ({ item: i, p }))).sort((a, b) => b.p.ts - a.p.ts);
    const credits = penalties.reduce((s, x) => s + x.p.amount, 0);

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Banking" title="Banking"
                subtitle="Escrow, payouts, and contracts." />

            {/* summary */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Sum icon={<Shield size={20} />} label="Held in escrow" value={usd(totals.held, { compact: totals.held > 9999 })} tone="harvest" sub="for upcoming deliveries" />
                <Sum icon={<Check size={20} />} label="Released to farms" value={usd(totals.released, { compact: totals.released > 9999 })} tone="brand" sub="on confirmed delivery" />
                <Sum icon={<Shield size={20} />} label="Credited to you" value={usd(credits, { compact: credits > 9999 })} tone="violet" sub="SLA penalties from misses" />
                <Sum icon={<Receipt size={20} />} label="Active contracts" value={String(active.length)} tone="ink" sub="standing farm agreements" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* contracts */}
                <section>
                    <h2 className="mb-4 font-display text-xl text-ink">Contracts</h2>
                    {active.length === 0
                        ? <EmptyState icon={<Receipt size={24} />} title="No contracts yet" description="When the agent locks an agreement with a farm, the contract and its escrow show up here." />
                        : <div className="space-y-3">{active.map((i) => <Contract key={i.id} item={i} />)}</div>}
                </section>

                {/* payout schedule */}
                <aside>
                    <Card className="p-5">
                        <div className="mb-4 flex items-center gap-2"><Calendar size={18} className="text-brand-600" /><h3 className="font-display text-lg text-ink">Upcoming payouts</h3></div>
                        {payouts.length === 0 ? <p className="py-5 text-center text-sm text-ink-muted">No payouts scheduled.</p> : (
                            <div className="space-y-1">
                                {payouts.map(({ item, d }) => {
                                    const farm = farmById(item.farmId);
                                    const amt = (d.qty || 0) * (item.priceCeiling || 0);
                                    return (
                                        <div key={d.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
                                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-canvas-sunk text-center leading-none text-ink-soft">
                                                <span className="text-2xs font-bold uppercase">{new Date(d.date).toLocaleDateString("en-US", { month: "short" })}</span>
                                                <span className="font-mono text-sm font-bold tnum">{new Date(d.date).getDate()}</span>
                                            </div>
                                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{farm?.name}</p><p className="truncate text-[12px] text-ink-muted capitalize">{item.crop}</p></div>
                                            <span className="font-mono text-sm font-medium text-ink tnum">{usd(amt)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <p className="mt-3 border-t border-line pt-3 text-2xs text-ink-faint">Released from escrow automatically once each delivery is confirmed received.</p>
                    </Card>
                </aside>
            </div>

            {/* invoices & receipts */}
            <section className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-xl text-ink">Invoices &amp; receipts</h2>
                    <span className="text-2xs text-ink-faint">{receipts.length} paid · {usd(paidTotal, { compact: paidTotal > 9999 })} this period</span>
                </div>
                <Card className="overflow-hidden p-0">
                    {receipts.length === 0
                        ? <p className="px-5 py-8 text-center text-sm text-ink-muted">Receipts appear here once deliveries are confirmed and escrow releases.</p>
                        : <div className="divide-y divide-line">
                            <div className="hidden grid-cols-[1fr_1.6fr_1fr_1fr_auto] gap-3 bg-canvas-sunk px-5 py-2 text-2xs font-semibold uppercase tracking-wide text-ink-faint sm:grid">
                                <span>Date</span><span>Item</span><span>Farm</span><span>Contract</span><span className="text-right">Amount</span>
                            </div>
                            {receipts.map((r) => {
                                const farm = farmById(r.item.farmId);
                                return (
                                    <div key={r.d.id} className="grid grid-cols-2 items-center gap-3 px-5 py-3 text-[13.5px] sm:grid-cols-[1fr_1.6fr_1fr_1fr_auto]">
                                        <span className="font-mono text-ink-muted tnum">{new Date(r.d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                        <span className="truncate font-medium text-ink"><span className="tnum">{r.d.qty}</span> {r.item.unit} <span className="capitalize">{r.item.crop}</span></span>
                                        <span className="hidden truncate text-ink-muted sm:block">{farm?.name}</span>
                                        <span className="hidden truncate font-mono text-2xs text-ink-faint sm:block">{r.item.loi?.ref ?? "—"}</span>
                                        <span className="text-right font-mono font-medium text-ink tnum">{usd(r.amt)}</span>
                                    </div>
                                );
                            })}
                        </div>}
                </Card>
                <p className="mt-2 px-1 text-2xs text-ink-faint">Every confirmed delivery generates a receipt and releases escrow to the farm. A monthly statement is available to download or hand to your bookkeeper.</p>
            </section>

            {/* credits & penalties */}
            <section className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-xl text-ink">Credits &amp; penalties</h2>
                    <span className="text-2xs text-ink-faint">Late 10% · short/missed 25% · failed QC 100%</span>
                </div>
                <Card className="overflow-hidden p-0">
                    {penalties.length === 0
                        ? <p className="px-5 py-8 text-center text-sm text-ink-muted">No penalties. Every drop has landed on time and passed QC.</p>
                        : <div className="divide-y divide-line">
                            {penalties.map(({ item, p }) => (
                                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-harvest-400/15 text-harvest-600"><Shield size={16} /></span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[14px] font-medium text-ink">{PENALTY_LABEL[p.kind]} · <span className="capitalize">{item.crop}</span></p>
                                        <p className="truncate text-[12.5px] text-ink-muted">{p.reason}</p>
                                    </div>
                                    <span className="shrink-0 font-mono text-sm font-semibold text-brand-600 tnum">+{usd(p.amount)}</span>
                                </div>
                            ))}
                        </div>}
                </Card>
                <p className="mt-2 px-1 text-2xs text-ink-faint">Penalties are credited to you automatically from the farm's escrow when a delivery is late, short, or fails QC. You never chase a refund.</p>
            </section>
        </div>
    );
}

function Contract({ item }: { item: SourcingItem }) {
    const farm = farmById(item.farmId);
    const esc = orderEscrow(item);
    const tone = esc.status === "held" ? "bg-harvest-400/15 text-harvest-600" : "bg-brand-50 text-brand-600";
    return (
        <Card className="p-5" hover>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="font-mono text-2xs text-ink-faint">{item.id.replace(/^s_?/, "AGR-").toUpperCase().slice(0, 10)}</p>
                    <p className="mt-0.5 font-display text-lg capitalize text-ink">{item.crop}</p>
                    <p className="flex items-center gap-1 text-[13px] text-ink-muted">{farm && <><MapPin size={11} className="text-brand-500" /> {farm.name}</>}</p>
                </div>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold", tone)}><Shield size={11} /> {ESCROW_LABEL[esc.status]}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3 font-mono text-sm tnum">
                <div><p className="font-sans text-2xs text-ink-faint">Price</p><p className="text-ink">{usd(item.priceCeiling)}/{item.unit}</p></div>
                <div><p className="font-sans text-2xs text-ink-faint">Volume</p><p className="text-ink">{item.qtyPerWeek} {item.unit}/wk</p></div>
                <div><p className="font-sans text-2xs text-ink-faint">Season</p><p className="text-ink">{item.harvestWindow}</p></div>
            </div>
        </Card>
    );
}

function Sum({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "brand" | "harvest" | "ink" | "violet" }) {
    const t = tone === "harvest" ? "bg-harvest-400/12 text-harvest-500" : tone === "violet" ? "bg-violet-50 text-violet-600" : tone === "ink" ? "bg-ink/[0.06] text-ink-soft" : "bg-brand-50 text-brand-600";
    return (
        <Card className="p-5">
            <span className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", t)}>{icon}</span>
            <p className="font-display text-3xl leading-none text-ink tnum">{value}</p>
            <p className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</p>
            <p className="mt-0.5 text-2xs text-ink-faint">{sub}</p>
        </Card>
    );
}
