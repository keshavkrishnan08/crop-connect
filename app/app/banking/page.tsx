"use client";

import * as React from "react";
import { useStore, farmById, orderEscrow, ESCROW_LABEL, type SourcingItem } from "@/lib/store";
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

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Banking" title="Escrow, payouts, and contracts"
                subtitle="We hold the food payment in escrow and release it to the farm only after a delivery is confirmed. You never prepay a no-show." />

            {/* summary */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Sum icon={<Shield size={20} />} label="Held in escrow" value={usd(totals.held, { compact: totals.held > 9999 })} tone="harvest" sub="for upcoming deliveries" />
                <Sum icon={<Check size={20} />} label="Released to farms" value={usd(totals.released, { compact: totals.released > 9999 })} tone="brand" sub="on confirmed delivery" />
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

function Sum({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "brand" | "harvest" | "ink" }) {
    const t = tone === "harvest" ? "bg-harvest-400/12 text-harvest-500" : tone === "ink" ? "bg-ink/[0.06] text-ink-soft" : "bg-brand-50 text-brand-600";
    return (
        <Card className="p-5">
            <span className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", t)}>{icon}</span>
            <p className="font-display text-3xl leading-none text-ink tnum">{value}</p>
            <p className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</p>
            <p className="mt-0.5 text-2xs text-ink-faint">{sub}</p>
        </Card>
    );
}
