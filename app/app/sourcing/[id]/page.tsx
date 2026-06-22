"use client";

import * as React from "react";
import Link from "next/link";
import { useStore, actions, farmById, loiPrice, QUALITY_OPTIONS, orderEscrow, ESCROW_LABEL, type SourcingItem, type Farm } from "@/lib/store";
import { AgentAvatar, AGENT_NAME } from "@/components/app/AgentDock";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, Button, EmptyState } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { usd, cn } from "@/lib/utils";
import { Leaf, Check, X, Shield, Calendar, Truck, ArrowRight, Plus, Handshake, Pen } from "@/components/icons";

export default function ItemPage({ params }: { params: { id: string } }) {
    const item = useStore((s) => s.items.find((i) => i.id === params.id));
    if (!item) return <EmptyState icon={<Leaf size={24} />} title="Not found" description="This order does not exist." action={<Link href="/app/sourcing" className="btn-ghost">Back to sourcing</Link>} />;
    const farm = farmById(item.farmId);
    const signed = item.loi?.status === "signed" || ["agreed", "delivering", "live"].includes(item.stage);

    return (
        <div className="mx-auto max-w-3xl animate-fade-up">
            <PageHeader eyebrow={signed ? "Contract" : "Agreement"} title={<span className="capitalize">{item.crop}</span>}
                subtitle={item.dishName || `${item.qtyPerWeek} ${item.unit}/wk`} actions={<Link href="/app/sourcing" className="btn-ghost btn-sm">Back to board</Link>} />

            {!item.loi
                ? <Card className="p-8 text-center"><AgentAvatar size={48} active /><p className="mt-3 font-mono text-sm font-semibold text-ink">{AGENT_NAME} is matching a farm</p><Button className="mt-4" onClick={() => actions.autoSource(item.id)}>Run it now</Button></Card>
                : <ContractRoom item={item} farm={farm} signed={signed} />}
        </div>
    );
}

function ContractRoom({ item, farm, signed }: { item: SourcingItem; farm?: Farm; signed: boolean }) {
    const toast = useToast();
    const loi = item.loi!;
    const price = loiPrice(loi);
    const esc = orderEscrow(item);
    const added = new Set(loi.qualityTerms.map((t) => t.id));
    const available = QUALITY_OPTIONS.filter((o) => !added.has(o.id));

    return (
        <div className="space-y-5">
            {/* parties */}
            <Card className="flex items-center gap-4 p-5">
                <Party name="Your kitchen" sub="Buyer" mark={<Leaf size={18} />} tone="brand" />
                <div className="flex-1 border-t border-dashed border-line" />
                <span className={cn("grid h-9 w-9 place-items-center rounded-full text-white", signed ? "bg-brand-500" : "bg-violet-500")}>{signed ? <Check size={18} /> : <Handshake size={18} />}</span>
                <div className="flex-1 border-t border-dashed border-line" />
                <Party name={farm?.name ?? "Local farm"} sub={farm ? `${farm.distanceMi} mi away` : "Seller"} mark={(farm?.name ?? "F").slice(0, 2)} tone="ink" right />
            </Card>

            {/* terms */}
            <Card className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                    <h3 className="font-mono text-sm font-semibold tracking-tight text-ink">{signed ? "Signed terms" : "Preliminary terms"}</h3>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold", signed ? "bg-brand-50 text-brand-600" : "bg-violet-50 text-violet-600")}><Shield size={11} /> {signed ? "Official contract" : "Letter of intent"}</span>
                </div>
                <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
                    <Term label="Price / unit" value={`${usd(price)}/${item.unit}`} accent />
                    <Term label="Volume" value={`${item.qtyPerWeek} ${item.unit}/wk`} />
                    <Term label="Cadence" value={loi.cadence} />
                    <Term label="Season" value={item.harvestWindow} />
                </div>
            </Card>

            {/* supply split across farms */}
            {item.allocations && item.allocations.length > 1 && (
                <Card className="p-5">
                    <div className="mb-1 flex items-center gap-2"><Handshake size={16} className="text-brand-600" /><h3 className="font-mono text-sm font-semibold tracking-tight text-ink">Supply split</h3></div>
                    <p className="mb-4 text-[13px] text-ink-muted">No single farm could cover {item.qtyPerWeek} {item.unit}/wk, so {AGENT_NAME} fractioned it across {item.allocations.length} farms.</p>
                    <div className="space-y-2.5">
                        {item.allocations.map((a) => {
                            const f = farmById(a.farmId);
                            const pct = Math.round((a.qty / item.qtyPerWeek) * 100);
                            return (
                                <div key={a.farmId} className="flex items-center gap-3">
                                    <span className="w-32 shrink-0 truncate text-[13px] font-medium text-ink">{f?.name ?? "Farm"}</span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas-sunk"><div className="h-full rounded-full bg-brand-400" style={{ width: `${pct}%` }} /></div>
                                    <span className="w-20 shrink-0 text-right font-mono text-[12px] text-ink-muted tnum">{a.qty} {item.unit}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* quality guidelines */}
            <Card className="p-5">
                <div className="mb-1 flex items-center gap-2"><Pen size={16} className="text-brand-600" /><h3 className="font-mono text-sm font-semibold tracking-tight text-ink">Quality guidelines</h3></div>
                <p className="mb-4 text-[13px] text-ink-muted">Request what matters to your kitchen. {AGENT_NAME} negotiates each one with the farm.</p>

                {loi.qualityTerms.length > 0 && (
                    <div className="mb-4 space-y-2">
                        {loi.qualityTerms.map((t) => (
                            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-line bg-canvas-soft px-3.5 py-2.5">
                                <Check size={16} className={t.status === "accepted" ? "text-brand-500" : "text-harvest-500"} />
                                <span className="flex-1 text-[14px] font-medium text-ink">{t.label}</span>
                                <span className={cn("font-mono text-[12px] tnum", t.priceDelta ? "text-harvest-600" : "text-ink-faint")}>{t.note}</span>
                                {!signed && <button onClick={() => actions.removeQualityTerm(item.id, t.id)} className="text-ink-faint hover:text-danger"><X size={15} /></button>}
                            </div>
                        ))}
                    </div>
                )}

                {!signed && available.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {available.map((o) => (
                            <button key={o.id} onClick={() => actions.requestQualityTerm(item.id, o.id)} title={o.detail}
                                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-600">
                                <Plus size={13} /> {o.label}{o.priceDelta ? <span className="text-2xs text-ink-faint">+{usd(o.priceDelta)}</span> : null}
                            </button>
                        ))}
                    </div>
                )}
            </Card>

            {/* negotiation log */}
            <Card className="p-5">
                <h3 className="mb-3 font-mono text-sm font-semibold tracking-tight text-ink">Negotiation</h3>
                <div className="space-y-3">
                    {loi.log.map((n) => {
                        const who = n.by === "you" ? "You" : n.by === "farm" ? (farm?.name ?? "Farm") : AGENT_NAME;
                        const mine = n.by === "you";
                        return (
                            <div key={n.id} className={mine ? "flex justify-end" : "flex items-start gap-2.5"}>
                                {!mine && (n.by === "agent" ? <AgentAvatar size={28} /> : <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-2xs text-white">{(farm?.name ?? "F").slice(0, 2)}</span>)}
                                <div className={mine ? "max-w-[80%] rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2 text-[13.5px] text-white" : "max-w-[80%] rounded-2xl rounded-bl-md bg-canvas-soft px-3.5 py-2 text-[13.5px] text-ink-soft"}>
                                    {!mine && <p className="text-2xs font-semibold text-ink-faint">{who}</p>}
                                    {n.text}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* close / signed */}
            {signed
                ? <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50/40 p-5">
                    <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white"><Check size={18} /></span><div><p className="text-sm font-semibold text-ink">Contract signed{loi.signedAt ? ` on ${loi.signedAt}` : ""}</p><p className="text-[13px] text-ink-muted">{usd(esc.held, { compact: true })} held in escrow · {ESCROW_LABEL[esc.status]}</p></div></div>
                    <Link href="/app/banking" className="btn-soft btn-sm">View in Banking <ArrowRight size={15} /></Link>
                </Card>
                : <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div><p className="text-2xs text-ink-faint">Total once signed</p><p className="font-display text-2xl text-ink tnum">{usd(price)}<span className="text-base text-ink-muted">/{item.unit}</span></p></div>
                    <Button onClick={() => { actions.signContract(item.id); toast.success("Contract signed", "Deliveries are scheduling now."); }}><Pen size={16} /> Sign contract</Button>
                </Card>}

            {signed && item.deliveries.length > 0 && (
                <Card className="p-5">
                    <div className="mb-3 flex items-center gap-2"><Truck size={16} className="text-brand-600" /><h3 className="font-mono text-sm font-semibold tracking-tight text-ink">Deliveries</h3></div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {item.deliveries.map((d) => (
                            <button key={d.id} onClick={() => actions.advanceDelivery(item.id, d.id)}
                                className={cn("rounded-xl border px-3 py-2.5 text-left transition hover:border-brand-300", d.status === "confirmed" ? "border-brand-200 bg-brand-50" : d.status === "delivered" ? "border-harvest-300 bg-harvest-400/10" : "border-line bg-white")}>
                                <p className="flex items-center gap-1 text-2xs font-semibold uppercase tracking-wide text-ink-faint"><Calendar size={11} /> {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                <p className="mt-1 text-[13px] font-medium capitalize text-ink">{d.status}</p>
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-2xs text-ink-faint">Tap a delivery to mark it received. Escrow releases to the farm on confirmation.</p>
                </Card>
            )}
        </div>
    );
}

function Party({ name, sub, mark, tone, right }: { name: string; sub: string; mark: React.ReactNode; tone: "brand" | "ink"; right?: boolean }) {
    return (
        <div className={cn("flex items-center gap-2.5", right && "flex-row-reverse text-right")}>
            <span className={cn("grid h-10 w-10 place-items-center rounded-xl font-display text-sm text-white", tone === "brand" ? "bg-brand-600" : "bg-ink")}>{mark}</span>
            <div><p className="text-sm font-semibold text-ink">{name}</p><p className="text-2xs text-ink-faint">{sub}</p></div>
        </div>
    );
}

function Term({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="bg-canvas-soft px-4 py-3.5">
            <p className="text-2xs text-ink-faint">{label}</p>
            <p className={cn("mt-0.5 font-mono text-sm font-medium tnum", accent ? "text-brand-600" : "text-ink")}>{value}</p>
        </div>
    );
}
