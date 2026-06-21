"use client";

import * as React from "react";
import Link from "next/link";
import { useStore, actions, rankFarms, farmById, type Farm } from "@/lib/store";
import { StageRail } from "@/components/sourcing/StageRail";
import { Card, Button, Badge, Avatar, EmptyState } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { usd, pct, formatDate, cn } from "@/lib/utils";
import {
    Leaf, MapPin, ArrowRight, Check, Truck, Calendar, Shield, Pen, MarginUp, StoryTag, X, Clock, Star,
} from "@/components/icons";

export default function ItemPage({ params }: { params: { id: string } }) {
    const item = useStore((s) => s.items.find((i) => i.id === params.id));
    const farms = useStore((s) => s.farms);
    const restaurant = useStore((s) => s.restaurant);
    const levers = useStore((s) => s.levers);
    const toast = useToast();
    const ranked = React.useMemo(() => rankFarms(farms, item?.crop ?? "", item?.priceCeiling ?? 0), [farms, item?.crop, item?.priceCeiling]);

    if (!item) {
        return <EmptyState icon={<Leaf size={24} />} title="Not found" description="This sourcing item doesn't exist." action={<Link href="/app/sourcing" className="btn-ghost">Back to sourcing</Link>} />;
    }

    const farm = farmById(item.farmId);
    const incPerOrder = Math.max(0, levers.priceLift - levers.produceCostDelta);
    const ordersMonth = restaurant.coversPerWeek * levers.attachRate * 4.345;
    const monthly = incPerOrder * ordersMonth;
    const confirmed = item.deliveries.filter((d) => d.status === "confirmed").length;

    return (
        <div className="animate-fade-up">
            <Link href="/app/sourcing" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
                <ArrowRight size={15} className="rotate-180" /> Sourcing
            </Link>

            <Card className="mb-5 p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-4">
                    <span className="grid h-13 w-13 place-items-center rounded-2xl bg-brand-50 text-brand-600" style={{ width: 52, height: 52 }}><Leaf size={26} /></span>
                    <div>
                        <h1 className="font-display text-3xl capitalize leading-none text-ink">{item.crop}</h1>
                        <p className="mt-1 text-sm text-ink-muted">{item.dishName} · <span className="font-mono tnum">{item.qtyPerWeek} {item.unit}/wk</span></p>
                    </div>
                </div>
                <StageRail stage={item.stage} />
            </Card>

            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-5">
                    {/* ---- stage: requested → choose a farm ---- */}
                    {item.stage === "requested" && (
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <Badge tone="brand">{ranked.filter((r) => r.score >= 50).length} local matches</Badge>
                                <p className="text-sm text-ink-muted">Ranked by crop fit, distance, reliability and price.</p>
                            </div>
                            <div className="space-y-3">
                                {ranked.map((r) => (
                                    <FarmMatch key={r.farm.id} farm={r.farm} score={r.score} reasons={r.reasons}
                                        onChoose={() => { actions.chooseFarm(item.id, r.farm.id); toast.success(`${r.farm.name} chosen`, "Review the agreement to lock it in."); }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ---- stage: matched → confirm agreement ---- */}
                    {item.stage === "matched" && farm && (
                        <Card className="p-6">
                            <div className="mb-4 flex items-center gap-2"><Pen size={18} className="text-brand-600" /><h2 className="font-display text-xl text-ink">Supply agreement</h2></div>
                            <p className="mb-4 text-sm leading-relaxed text-ink-muted">A clear, standing agreement with <span className="font-semibold text-ink">{farm.name}</span> — no lawyer, no haggling. Confirm to lock the terms and generate the delivery schedule.</p>
                            <dl className="mb-5 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-canvas px-4 py-4 text-sm">
                                <Row k="Crop" v={item.crop} />
                                <Row k="Quantity" v={`${item.qtyPerWeek} ${item.unit} / week`} />
                                <Row k="Price ceiling" v={`${usd(item.priceCeiling)} / ${item.unit}`} />
                                <Row k="Season" v={item.harvestWindow} />
                                <Row k="Delivery" v="CropConnect-orchestrated, weekly" />
                                <Row k="Term" v="Renews each season" />
                            </dl>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <button onClick={() => { actions.chooseFarm(item.id, ""); toast.info("Re-opened matches"); }} className="text-[13px] font-semibold text-ink-muted hover:text-ink">← Choose a different farm</button>
                                <Button onClick={() => { actions.confirmAgreement(item.id); toast.success("Contract live", "Weekly deliveries scheduled."); }}><Check size={17} /> Confirm agreement</Button>
                            </div>
                        </Card>
                    )}

                    {/* ---- stage: agreed/delivering/live → deliveries ---- */}
                    {["agreed", "delivering", "live"].includes(item.stage) && (
                        <Card className="p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2"><Truck size={18} className="text-brand-600" /><h2 className="font-display text-xl text-ink">Deliveries</h2></div>
                                <span className="font-mono text-sm text-ink-muted tnum">{confirmed}/{item.deliveries.length} received</span>
                            </div>
                            <div className="relative space-y-1">
                                <div className="absolute bottom-3 left-[15px] top-3 w-px bg-line" />
                                {item.deliveries.map((d) => {
                                    const meta = d.status === "confirmed" ? { c: "text-brand-600 bg-brand-50", i: <Check size={15} />, l: "Received" }
                                        : d.status === "delivered" ? { c: "text-harvest-500 bg-harvest-400/12", i: <Truck size={15} />, l: "Delivered" }
                                            : { c: "text-ink-muted bg-ink/5", i: <Clock size={15} />, l: "Scheduled" };
                                    const cta = d.status === "scheduled" ? "Mark delivered" : d.status === "delivered" ? "Confirm received" : null;
                                    return (
                                        <div key={d.id} className="relative flex items-center gap-3 py-1.5">
                                            <div className={cn("relative z-10 grid h-8 w-8 place-items-center rounded-full ring-4 ring-canvas-soft", meta.c)}>{meta.i}</div>
                                            <div className="flex-1"><p className="text-sm font-semibold text-ink">{formatDate(d.date, "long")}</p><p className="font-mono text-[12.5px] text-ink-muted tnum">{d.qty} {item.unit}</p></div>
                                            {cta ? <Button variant="soft" size="sm" onClick={() => actions.advanceDelivery(item.id, d.id)}>{cta}</Button>
                                                : <Badge tone="brand">{meta.l}</Badge>}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}

                    {item.stage === "live" && (
                        <Card className="flex items-center justify-between gap-4 p-5">
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><StoryTag size={22} /></span>
                                <div><p className="font-display text-lg text-ink">It's on the menu</p><p className="text-[13px] text-ink-muted">Grab the provenance story and the price-lift to charge for it.</p></div>
                            </div>
                            <Link href="/app/story" className="btn-soft btn-sm">Open Story Studio <ArrowRight size={15} /></Link>
                        </Card>
                    )}
                </div>

                {/* sidebar */}
                <aside className="space-y-5">
                    {farm && (
                        <Card className="p-5">
                            <div className="mb-3 flex items-center gap-3">
                                <Avatar name={farm.name} size={42} />
                                <div><p className="font-display text-lg leading-tight text-ink">{farm.name}</p><p className="flex items-center gap-1 text-[12.5px] text-ink-muted"><MapPin size={12} /> {farm.location} · {farm.distanceMi} mi</p></div>
                            </div>
                            <p className="text-[13px] leading-relaxed text-ink-muted">{farm.story}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5">{farm.practices.map((p) => <span key={p} className="chip !py-1 !text-[12px]">{p}</span>)}</div>
                            <div className="mt-3 flex items-center gap-1.5 text-[13px] text-brand-600"><Shield size={15} /> <span className="font-semibold">{farm.reliability}% reliable</span> · {farm.farmer}</div>
                        </Card>
                    )}

                    {["agreed", "delivering", "live"].includes(item.stage) && (
                        <Card className="p-5">
                            <div className="mb-2 flex items-center gap-2"><MarginUp size={17} className="text-harvest-500" /><h3 className="font-display text-lg text-ink">Margin from this dish</h3></div>
                            <p className="value-pos text-3xl">{usd(monthly, { compact: monthly > 9999 })}<span className="text-sm text-ink-muted">/mo</span></p>
                            <p className="mt-1.5 text-[12.5px] text-ink-muted">
                                +{usd(levers.priceLift)} menu price, ~{usd(incPerOrder)} pure margin, on ≈<span className="font-mono tnum">{Math.round(ordersMonth)}</span> orders/mo. Editable in Settings.
                            </p>
                        </Card>
                    )}

                    <Card className="p-5">
                        <h3 className="mb-3 font-display text-lg text-ink">Request</h3>
                        <dl className="space-y-2.5 text-sm">
                            <Row k="Quantity" v={`${item.qtyPerWeek} ${item.unit}/wk`} />
                            <Row k="Ceiling" v={`${usd(item.priceCeiling)}/${item.unit}`} />
                            <Row k="Season" v={item.harvestWindow} />
                            <Row k="Opened" v={formatDate(item.createdAt)} />
                        </dl>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

function Row({ k, v }: { k: string; v: string }) {
    return <div className="flex items-start justify-between gap-4"><dt className="shrink-0 text-ink-faint">{k}</dt><dd className="text-right font-medium capitalize text-ink">{v}</dd></div>;
}

function FarmMatch({ farm, score, reasons, onChoose }: { farm: Farm; score: number; reasons: string[]; onChoose: () => void }) {
    const tone = score >= 75 ? "text-brand-600" : score >= 50 ? "text-harvest-500" : "text-ink-faint";
    return (
        <Card hover className="flex items-center gap-4 p-4">
            <Avatar name={farm.name} size={44} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate font-display text-lg leading-tight text-ink">{farm.name}</p>
                    <span className={cn("font-mono text-sm font-medium tnum", tone)}>{score}</span>
                </div>
                <p className="flex items-center gap-1 text-[12.5px] text-ink-muted"><MapPin size={12} /> {farm.location} · {farm.distanceMi} mi</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">{reasons.map((r) => <span key={r} className="badge-brand">{r}</span>)}</div>
            </div>
            <Button size="sm" onClick={onChoose} className="shrink-0">Choose <ArrowRight size={15} /></Button>
        </Card>
    );
}
