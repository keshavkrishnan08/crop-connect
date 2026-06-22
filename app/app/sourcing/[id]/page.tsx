"use client";

import * as React from "react";
import Link from "next/link";
import { useStore, actions, farmById, loiPrice, QUALITY_OPTIONS, farmDueDiligence, orderEscrow, ESCROW_LABEL, supplyHeadline, SUPPLY_TONE, type SourcingItem, type Farm, type Delivery, type SupplyUpdate } from "@/lib/store";
import { AgentAvatar, AGENT_NAME } from "@/components/app/AgentDock";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, Button, EmptyState } from "@/components/ui/kit";
import { Photo } from "@/components/marketing/Photo";
import { useToast } from "@/components/ui/Toast";
import { usd, cn } from "@/lib/utils";
import { Leaf, MapPin, Check, X, Shield, Calendar, Truck, ArrowRight, Plus, Handshake, Pen, Receipt, Dashboard, Sparkle, Star, Clock, Upload, Bell } from "@/components/icons";

function ago(ts: number) { const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); if (m < 60) return `${m}m ago`; const h = Math.round(m / 60); if (h < 24) return `${h}h ago`; return `${Math.round(h / 24)}d ago`; }

type TabId = "overview" | "farm" | "terms" | "quality" | "logistics" | "supply" | "messages" | "deliveries";
const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: Dashboard },
    { id: "farm", label: "The farm", icon: Leaf },
    { id: "terms", label: "Terms", icon: Receipt },
    { id: "quality", label: "Quality & QC", icon: Shield },
    { id: "logistics", label: "Logistics", icon: Truck },
    { id: "supply", label: "Supply", icon: Bell },
    { id: "messages", label: "Messages", icon: Sparkle },
    { id: "deliveries", label: "Deliveries", icon: Calendar },
];

export default function ItemPage({ params }: { params: { id: string } }) {
    const item = useStore((s) => s.items.find((i) => i.id === params.id));
    const [tab, setTab] = React.useState<TabId>("overview");
    const [signedFx, setSignedFx] = React.useState(false);

    if (!item) return <EmptyState icon={<Leaf size={24} />} title="Not found" description="This order does not exist." action={<Link href="/app/sourcing" className="btn-ghost">Back to sourcing</Link>} />;
    const farm = farmById(item.farmId);
    const loi = item.loi;
    const signed = loi?.status === "signed" || ["agreed", "delivering", "live"].includes(item.stage);

    if (!loi) return (
        <div className="mx-auto max-w-3xl animate-fade-up">
            <PageHeader eyebrow="Sourcing" title={<span className="capitalize">{item.crop}</span>} subtitle="The agent is matching a farm." actions={<Link href="/app/sourcing" className="btn-ghost btn-sm">Back</Link>} />
            <Card className="p-10 text-center"><AgentAvatar size={48} active /><p className="mt-3 text-sm font-medium text-ink">{AGENT_NAME} is matching a farm and drafting your agreement</p><Button className="mt-4" onClick={() => actions.autoSource(item.id)}>Run it now</Button></Card>
        </div>
    );

    const price = loiPrice(loi);

    return (
        <div className="mx-auto max-w-4xl animate-fade-up">
            <PageHeader
                eyebrow={signed ? "Active contract" : "Preliminary agreement (LOI)"}
                title={<span className="capitalize">{item.crop}</span>}
                subtitle={`${farm?.name ?? "Local farm"} · ${item.qtyPerWeek} ${item.unit}/wk · ${usd(price)}/${item.unit}`}
                actions={<Link href="/app/sourcing" className="btn-ghost btn-sm">Back to board</Link>}
            />

            <div className={cn("mb-5 flex items-center gap-3 rounded-2xl border px-5 py-3.5", signed ? "border-brand-200 bg-brand-50/50" : "border-violet-200 bg-violet-50/50")}>
                <span className={cn("grid h-9 w-9 place-items-center rounded-full text-white", signed ? "bg-brand-500" : "bg-violet-500")}>{signed ? <Check size={18} /> : <Handshake size={18} />}</span>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{signed ? "Signed and active" : "Farm accepted, awaiting your signature"}</p>
                    <p className="text-[13px] text-ink-muted">{signed ? "Both sides signed. The farm is delivering on this contract." : "The farm confirmed availability at its posted rate. Review everything, then sign. Nothing is binding until you do."}</p>
                </div>
                {!signed && <Button onClick={() => setTab("terms")}>Review &amp; sign <ArrowRight size={15} /></Button>}
            </div>

            <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line no-scrollbar">
                {TABS.map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={cn("flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-[13.5px] font-medium transition-colors",
                            tab === t.id ? "border-brand-500 text-ink" : "border-transparent text-ink-muted hover:text-ink")}>
                        <t.icon size={15} /> {t.label}
                    </button>
                ))}
            </div>

            <div className="animate-fade-in">
                {tab === "overview" && <Overview item={item} farm={farm} signed={signed} price={price} onGoTerms={() => setTab("terms")} />}
                {tab === "farm" && <FarmTab farm={farm} />}
                {tab === "terms" && <TermsTab item={item} farm={farm} signed={signed} price={price} onSign={() => { actions.signContract(item.id); setSignedFx(true); }} />}
                {tab === "quality" && <QualityTab item={item} signed={signed} />}
                {tab === "logistics" && <LogisticsTab item={item} farm={farm} signed={signed} />}
                {tab === "supply" && <SupplyTab item={item} farm={farm} />}
                {tab === "messages" && <MessagesTab item={item} farm={farm} />}
                {tab === "deliveries" && <DeliveriesTab item={item} signed={signed} onGoTerms={() => setTab("terms")} />}
            </div>

            {signedFx && <SignedOverlay farm={farm?.name} onDone={() => { setSignedFx(false); setTab("deliveries"); }} />}
        </div>
    );
}

function Overview({ item, farm, signed, price, onGoTerms }: { item: SourcingItem; farm?: Farm; signed: boolean; price: number; onGoTerms: () => void }) {
    const esc = orderEscrow(item);
    const dd = farm ? farmDueDiligence(farm) : null;
    return (
        <div className="space-y-5">
            <Card className="flex items-center gap-4 p-5">
                <Party name="Your kitchen" sub="Buyer" mark={<Leaf size={18} />} tone="brand" />
                <div className="flex-1 border-t border-dashed border-line" />
                <span className={cn("grid h-9 w-9 place-items-center rounded-full text-white", signed ? "bg-brand-500" : "bg-violet-500")}>{signed ? <Check size={18} /> : <Handshake size={18} />}</span>
                <div className="flex-1 border-t border-dashed border-line" />
                <Party name={farm?.name ?? "Local farm"} sub={farm ? `${farm.farmer} · ${farm.distanceMi} mi` : "Seller"} mark={(farm?.name ?? "F").slice(0, 2)} tone="ink" right />
            </Card>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Price / unit" value={`${usd(price)}`} />
                <Metric label="Volume" value={`${item.qtyPerWeek} ${item.unit}/wk`} />
                <Metric label="Term" value={`${item.loi?.termWeeks ?? 12} wk`} />
                <Metric label="In escrow" value={usd(esc.held, { compact: esc.held > 9999 })} />
            </div>

            <Card className="p-5">
                <h3 className="mb-3 text-sm font-medium text-ink">How this works</h3>
                <ol className="space-y-2.5">
                    {[
                        ["Farm matched and accepted", `${farm?.name} cleared due diligence and accepted your request at its posted rate.`, item.loi?.farmAccepted ?? false],
                        ["Choose your quality specs", "Each spec is the farm's posted rate, added to the price. No haggling.", signed],
                        ["Both sides sign", "You sign, the farm counter-signs, and the contract is executed. Then delivery begins.", signed],
                        ["Every drop is verified", "Each delivery is photographed and QC-checked before escrow releases.", item.deliveries.some((d) => d.status === "confirmed")],
                    ].map(([t, d, done], i) => (
                        <li key={i} className="flex gap-3">
                            <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-2xs", done ? "bg-brand-500 text-white" : "border border-line text-ink-faint")}>{done ? <Check size={12} /> : i + 1}</span>
                            <div><p className="text-[14px] font-medium text-ink">{t as string}</p><p className="text-[13px] text-ink-muted">{d as string}</p></div>
                        </li>
                    ))}
                </ol>
            </Card>

            {dd && (
                <Card className="flex items-center gap-3 p-4">
                    <Shield size={18} className="shrink-0 text-brand-600" />
                    <p className="flex-1 text-[13px] text-ink-soft">{farm?.name} is {dd.fillRate}% reliable, {dd.foodSafety.toLowerCase()}, with {dd.leadDays}-day lead time. Full profile under The farm.</p>
                </Card>
            )}

            {!signed && <Button onClick={onGoTerms} className="w-full justify-center">Review the terms and sign <ArrowRight size={16} /></Button>}
        </div>
    );
}

function FarmTab({ farm }: { farm?: Farm }) {
    if (!farm) return <Card className="p-6 text-center text-sm text-ink-muted">No farm matched yet.</Card>;
    const dd = farmDueDiligence(farm);
    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
                <Photo q={`${farm.crops[0]} farm field`} seed={101} alt={farm.name} className="aspect-[4/3] sm:col-span-2" caption={farm.name} place={`${farm.distanceMi} mi`} />
                <Photo q={`${farm.crops[0]} harvest`} seed={102} alt="harvest" className="aspect-[4/3]" />
            </div>

            <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-display text-xl text-ink">{farm.name}</h3>
                        <p className="flex items-center gap-1.5 text-[13px] text-ink-muted"><MapPin size={13} className="text-brand-500" /> {farm.location} · {farm.distanceMi} mi · {farm.farmer}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-semibold text-brand-600"><Shield size={11} /> Vetted</span>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{farm.story}</p>
            </Card>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Established" value={dd.established} />
                <Metric label="Acres" value={dd.acres} />
                <Metric label="Weekly capacity" value={`${dd.capacity}/wk`} />
                <Metric label="On-time / fill" value={`${dd.fillRate}%`} />
                <Metric label="Lead time" value={`${dd.leadDays} day${dd.leadDays > 1 ? "s" : ""}`} />
                <Metric label="Price index" value={`${Math.round(farm.priceIndex * 100)}%`} sub="of market" />
                <Metric label="Cold storage" value={dd.coldStorage ? "Yes" : "No"} />
                <Metric label="Liability insured" value={dd.insured ? "Yes" : "No"} />
            </div>

            <Card className="p-5">
                <h3 className="mb-3 text-sm font-medium text-ink">Certifications &amp; practices</h3>
                <div className="flex flex-wrap gap-2">
                    {farm.practices.map((p) => <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas-soft px-3 py-1.5 text-[13px] font-medium text-ink-soft"><Check size={13} className="text-brand-500" /> {p}</span>)}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas-soft px-3 py-1.5 text-[13px] font-medium text-ink-soft"><Check size={13} className="text-brand-500" /> {dd.foodSafety}</span>
                </div>
            </Card>

            <Card className="p-5">
                <div className="mb-3 flex items-center gap-2"><Star size={15} className="text-harvest-500" /><h3 className="text-sm font-medium text-ink">Restaurants already sourcing here</h3></div>
                <div className="space-y-2.5">
                    {[["Bluebeard", "2 years, weekly"], ["Milktooth", "1 year, seasonal"], ["Beholder", "3 years, weekly"]].map(([n, d]) => (
                        <div key={n} className="flex items-center justify-between border-b border-line/60 pb-2 text-[13.5px] last:border-0">
                            <span className="font-medium text-ink">{n}</span><span className="text-ink-muted">{d}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function TermsTab({ item, farm, signed, price, onSign }: { item: SourcingItem; farm?: Farm; signed: boolean; price: number; onSign: () => void }) {
    const loi = item.loi!;
    const esc = orderEscrow(item);
    const rows: [string, React.ReactNode][] = [
        ["Product", <span className="capitalize" key="p">{item.crop}</span>],
        ["Farm", farm?.name ?? "Local farm"],
        ["Price per unit", `${usd(price)} / ${item.unit}`],
        ["Weekly volume", `${item.qtyPerWeek} ${item.unit}`],
        ["Cadence", loi.cadence],
        ["Season", item.harvestWindow],
        ["Contract term", `${loi.termWeeks} weeks`],
        ["Transport", loi.transport === "we" ? "CropConnect delivers" : "You pick up"],
        ["Weekly value", `${usd(item.qtyPerWeek * price)}`],
        ["Payment", "Held in escrow, released per delivery"],
        ["Cancellation", "Any week, after 2-week notice"],
    ];
    return (
        <div className="space-y-5">
            <Card className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                    <h3 className="text-sm font-medium text-ink">{signed ? "Signed terms" : "Proposed terms"}</h3>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold", signed ? "bg-brand-50 text-brand-600" : "bg-violet-50 text-violet-600")}><Shield size={11} /> {signed ? "Official contract" : "Letter of intent"}</span>
                </div>
                <div className="divide-y divide-line">
                    {rows.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between px-5 py-2.5">
                            <span className="text-[13px] text-ink-muted">{k}</span>
                            <span className="font-mono text-[13.5px] font-medium text-ink tnum">{v}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <p className="flex items-center gap-1.5 px-1 text-2xs text-ink-faint"><Shield size={12} className="text-brand-500" /> Price is the farm's posted rate, published in advance and fixed. We do not negotiate price, you only choose specs and term.</p>

            {!signed && (
                <Card className="p-5">
                    <p className="mb-2 text-sm font-medium text-ink">Contract length</p>
                    <div className="flex flex-wrap gap-2">
                        {[8, 12, 26, 52].map((w) => (
                            <button key={w} onClick={() => actions.setTermWeeks(item.id, w)} className={cn("rounded-full border px-4 py-1.5 text-[13px] font-medium", loi.termWeeks === w ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line text-ink-soft hover:border-brand-300")}>{w} weeks</button>
                        ))}
                    </div>
                </Card>
            )}

            {signed
                ? <Card className="border-brand-200 bg-brand-50/40 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white"><Check size={18} /></span><div><p className="text-sm font-semibold text-ink">Executed contract</p><p className="font-mono text-2xs text-ink-faint">{loi.ref ?? "Signed"}</p></div></div>
                        <Link href="/app/banking" className="btn-soft btn-sm">Banking <ArrowRight size={15} /></Link>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-line bg-white/70 p-3"><p className="text-2xs uppercase tracking-wide text-ink-faint">Your signature</p><p className="mt-0.5 font-display text-base text-ink">Signed</p><p className="font-mono text-2xs text-ink-faint">{loi.signedAt}</p></div>
                        <div className="rounded-xl border border-line bg-white/70 p-3"><p className="truncate text-2xs uppercase tracking-wide text-ink-faint">{farm?.name ?? "Farm"}</p><p className="mt-0.5 font-display text-base text-ink">Counter-signed</p><p className="font-mono text-2xs text-ink-faint">{loi.signedFarmAt ?? loi.signedAt}</p></div>
                    </div>
                    <p className="mt-3 font-mono text-2xs text-ink-faint tnum">{usd(esc.held, { compact: true })} held in escrow · {ESCROW_LABEL[esc.status]}</p>
                </Card>
                : <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div><p className="text-2xs uppercase tracking-wide text-ink-faint">Total per week, once signed</p><p className="font-display text-2xl text-ink tnum">{usd(item.qtyPerWeek * price)}<span className="text-base text-ink-muted">/wk</span></p></div>
                    <Button onClick={onSign}><Pen size={16} /> Sign contract</Button>
                </Card>}

            <Card className="flex items-start gap-3 p-4">
                <Shield size={17} className="mt-0.5 shrink-0 text-brand-600" />
                <p className="text-[13px] leading-relaxed text-ink-soft"><b className="text-ink">Your money is protected.</b> Each delivery's payment is held in escrow and released to the farm only after you confirm receipt with a photo and a quality check. You never prepay a no-show, and a failed drop is never charged.</p>
            </Card>

            <Card className="p-5">
                <div className="mb-3 flex items-center gap-2"><Shield size={16} className="text-brand-600" /><h3 className="text-sm font-medium text-ink">Service level &amp; penalties</h3></div>
                <div className="space-y-2 text-[13.5px]">
                    <div className="flex items-center justify-between"><span className="text-ink-soft">Late delivery, past the window</span><span className="font-mono text-ink">10% credit</span></div>
                    <div className="flex items-center justify-between"><span className="text-ink-soft">Short or missed drop</span><span className="font-mono text-ink">25% credit + backup sourced</span></div>
                    <div className="flex items-center justify-between"><span className="text-ink-soft">Failed quality check</span><span className="font-mono text-ink">Not charged</span></div>
                </div>
                <p className="mt-3 text-2xs text-ink-faint">Credits are paid from the farm's escrow automatically and show up in Banking. You never chase a refund.</p>
            </Card>
        </div>
    );
}

function QualityTab({ item, signed }: { item: SourcingItem; signed: boolean }) {
    const loi = item.loi!;
    const added = new Set(loi.qualityTerms.map((t) => t.id));
    const available = QUALITY_OPTIONS.filter((o) => !added.has(o.id));
    return (
        <div className="space-y-5">
            <Card className="p-5">
                <div className="mb-1 flex items-center gap-2"><Shield size={16} className="text-brand-600" /><h3 className="text-sm font-medium text-ink">Quality specifications</h3></div>
                <p className="mb-4 text-[13px] text-ink-muted">Each spec carries the farm's posted rate, set in advance. Choose what your kitchen needs and it is added to the price, no haggling. Every delivery is checked against this list.</p>
                {loi.qualityTerms.length > 0 ? (
                    <div className="space-y-2">
                        {loi.qualityTerms.map((t) => (
                            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-line bg-canvas-soft px-3.5 py-2.5">
                                <Check size={16} className={t.status === "accepted" ? "text-brand-500" : "text-harvest-500"} />
                                <span className="flex-1 text-[14px] font-medium text-ink">{t.label}</span>
                                <span className={cn("font-mono text-[12px] tnum", t.priceDelta ? "text-harvest-600" : "text-ink-faint")}>{t.note}</span>
                                {!signed && <button onClick={() => actions.removeQualityTerm(item.id, t.id)} className="text-ink-faint hover:text-danger"><X size={15} /></button>}
                            </div>
                        ))}
                    </div>
                ) : <p className="rounded-xl border border-dashed border-line py-4 text-center text-[13px] text-ink-faint">No special requirements yet. Standard market grade applies.</p>}
                {!signed && available.length > 0 && (
                    <div className="mt-4">
                        <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-faint">Add a spec</p>
                        <div className="flex flex-wrap gap-2">
                            {available.map((o) => (
                                <button key={o.id} onClick={() => actions.requestQualityTerm(item.id, o.id)} title={o.detail}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-600">
                                    <Plus size={13} /> {o.label}{o.priceDelta ? <span className="text-2xs text-ink-faint">+{usd(o.priceDelta)}</span> : null}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
            <Card className="flex items-start gap-3 p-4">
                <Sparkle size={17} className="mt-0.5 shrink-0 text-brand-600" />
                <p className="text-[13px] leading-relaxed text-ink-soft">At every delivery, the driver photographs the produce and runs this checklist on site. If a drop fails QC, escrow is not released and {AGENT_NAME} sources a replacement from a backup farm.</p>
            </Card>
        </div>
    );
}

function LogisticsTab({ item, farm, signed }: { item: SourcingItem; farm?: Farm; signed: boolean }) {
    const loi = item.loi!;
    const dd = farm ? farmDueDiligence(farm) : null;
    const cold = loi.qualityTerms.some((t) => t.id === "coldchain");
    return (
        <div className="space-y-5">
            <Card className="p-5">
                <h3 className="mb-3 text-sm font-medium text-ink">Who runs transport</h3>
                <div className="grid grid-cols-2 gap-3">
                    {([["we", "CropConnect delivers", "Third-party courier, billed at cost. Cold-chain on request."], ["you", "You pick up", "Collect from the farm on the schedule below."]] as const).map(([id, t, d]) => (
                        <button key={id} disabled={signed} onClick={() => actions.setTransport(item.id, id)}
                            className={cn("rounded-2xl border p-4 text-left transition", loi.transport === id ? "border-brand-500 bg-brand-50/60" : "border-line hover:border-brand-300", signed && "opacity-70")}>
                            <span className={cn("grid h-8 w-8 place-items-center rounded-lg", loi.transport === id ? "bg-brand-500 text-white" : "bg-canvas-sunk text-ink-soft")}><Truck size={16} /></span>
                            <p className="mt-2 text-[14px] font-semibold text-ink">{t}</p>
                            <p className="text-[12.5px] text-ink-muted">{d}</p>
                        </button>
                    ))}
                </div>
            </Card>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Cadence" value={loi.cadence} />
                <Metric label="Lead time" value={dd ? `${dd.leadDays} day${dd.leadDays > 1 ? "s" : ""}` : "-"} />
                <Metric label="Cold chain" value={cold ? "Included" : "Standard"} />
                <Metric label="Distance" value={`${farm?.distanceMi ?? "-"} mi`} />
            </div>
            <Card className="flex items-start gap-3 p-4">
                <Clock size={17} className="mt-0.5 shrink-0 text-brand-600" />
                <p className="text-[13px] leading-relaxed text-ink-soft">Deliveries land every week on your chosen day. {AGENT_NAME} confirms the window with the farm 48 hours ahead and reschedules around weather or shortfalls using a backup farm.</p>
            </Card>
        </div>
    );
}

function SupplyTab({ item, farm }: { item: SourcingItem; farm?: Farm }) {
    const head = supplyHeadline(item);
    const updates = item.updates ?? [];
    const toast = useToast();
    const banner = head.tone === "harvest" ? "border-harvest-300 bg-harvest-400/10" : head.tone === "sky" ? "border-sky-200 bg-sky-50/60" : "border-brand-200 bg-brand-50/50";
    const dot = head.tone === "harvest" ? "bg-harvest-500" : head.tone === "sky" ? "bg-sky-500" : "bg-brand-500";
    return (
        <div className="space-y-5">
            <Card className={cn("flex items-start gap-3.5 border p-5", banner)}>
                <AgentAvatar size={34} active />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", dot)} /><p className="text-sm font-semibold text-ink">{head.text}</p></div>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{head.sub}</p>
                </div>
                <button onClick={() => { actions.requestSupplyUpdate(item.id); toast.success("Status refreshed", "Sage posted the latest."); }} className="btn-soft btn-sm shrink-0">Get an update</button>
            </Card>

            <Card className="p-5">
                <div className="mb-4 flex items-center gap-2"><Bell size={16} className="text-brand-600" /><h3 className="text-sm font-medium text-ink">Supply timeline</h3><span className="ml-auto text-2xs text-ink-faint">{farm?.name}</span></div>
                {updates.length === 0
                    ? <p className="py-3 text-center text-[13px] text-ink-muted">No updates yet. {AGENT_NAME} posts one before every drop.</p>
                    : <div>{updates.map((u, i) => <UpdateRow key={u.id} item={item} u={u} last={i === updates.length - 1} />)}</div>}
            </Card>
        </div>
    );
}

function UpdateRow({ item, u, last }: { item: SourcingItem; u: SupplyUpdate; last: boolean }) {
    const t = SUPPLY_TONE[u.kind];
    const color = t === "harvest" ? "bg-harvest-400/15 text-harvest-600" : t === "sky" ? "bg-sky-50 text-sky-600" : t === "violet" ? "bg-violet-50 text-violet-600" : "bg-brand-50 text-brand-600";
    const Icon = u.kind === "delay" || u.kind === "shortfall" ? Bell : u.kind === "transit" ? Truck : u.kind === "delivered" ? Check : u.kind === "quality" ? Shield : Leaf;
    const openHeadsUp = (u.kind === "delay" || u.kind === "shortfall") && !u.resolved;
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", color)}><Icon size={15} /></span>
                {!last && <span className="my-1 w-px flex-1 bg-line" />}
            </div>
            <div className="min-w-0 flex-1 pb-4">
                <p className="text-[13.5px] leading-snug text-ink">{u.text}</p>
                <div className="mt-1 flex items-center gap-3">
                    <span className="text-2xs text-ink-faint">{ago(u.ts)}</span>
                    {openHeadsUp && <button onClick={() => actions.acknowledgeSupply(item.id, u.id)} className="text-2xs font-semibold text-brand-600 hover:underline">Got it</button>}
                </div>
            </div>
        </div>
    );
}

function MessagesTab({ item, farm }: { item: SourcingItem; farm?: Farm }) {
    const loi = item.loi!;
    const [text, setText] = React.useState("");
    const endRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [loi.log.length]);
    function send() { const t = text.trim(); if (!t) return; actions.sendMessage(item.id, t); setText(""); }
    return (
        <Card className="flex h-[460px] flex-col p-0">
            <div className="flex items-center gap-2 border-b border-line px-5 py-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-2xs text-white">{(farm?.name ?? "F").slice(0, 2)}</span>
                <div><p className="text-[13.5px] font-semibold text-ink">{farm?.name}</p><p className="text-2xs text-ink-faint">{farm?.farmer} · mediated by {AGENT_NAME}</p></div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {loi.log.map((n) => {
                    const mine = n.by === "you";
                    const who = n.by === "you" ? "You" : n.by === "farm" ? (farm?.name ?? "Farm") : AGENT_NAME;
                    return (
                        <div key={n.id} className={mine ? "flex justify-end" : "flex items-start gap-2.5"}>
                            {!mine && (n.by === "agent" ? <AgentAvatar size={26} /> : <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-[9px] text-white">{(farm?.name ?? "F").slice(0, 2)}</span>)}
                            <div className={mine ? "max-w-[78%] rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2 text-[13.5px] text-white" : "max-w-[78%] rounded-2xl rounded-bl-md bg-canvas-soft px-3.5 py-2 text-[13.5px] text-ink-soft"}>
                                {!mine && <p className="text-2xs font-semibold text-ink-faint">{who}</p>}{n.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t border-line p-3">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${farm?.farmer?.split(" ")[0] ?? "the farm"}`} className="field !h-10 flex-1 !py-2 text-sm" />
                <button type="submit" disabled={!text.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-40"><ArrowRight size={17} /></button>
            </form>
        </Card>
    );
}

function DeliveriesTab({ item, signed, onGoTerms }: { item: SourcingItem; signed: boolean; onGoTerms: () => void }) {
    if (!signed || item.deliveries.length === 0) return (
        <Card className="p-8 text-center">
            <Truck size={26} className="mx-auto text-ink-faint" />
            <p className="mt-3 text-sm font-medium text-ink">Deliveries begin once you sign</p>
            <p className="mt-1 text-[13px] text-ink-muted">Sign the contract and the agent schedules the weekly drops.</p>
            {!signed && <Button className="mt-4" onClick={onGoTerms}>Go to terms <ArrowRight size={15} /></Button>}
        </Card>
    );
    return (
        <div className="space-y-3">
            <p className="text-[13px] text-ink-muted">Each delivery must be received with a photo of the produce on site and a quality check. You cannot confirm a drop without proof.</p>
            {item.deliveries.map((d) => <DeliveryRow key={d.id} item={item} d={d} />)}
        </div>
    );
}

function DeliveryRow({ item, d }: { item: SourcingItem; d: Delivery }) {
    const loi = item.loi!;
    const meta = item.deliveryMeta?.[d.id];
    const [open, setOpen] = React.useState(false);
    const [photo, setPhoto] = React.useState<string | null>(null);
    const [checks, setChecks] = React.useState<Record<number, boolean>>({});
    const specs = loi.qualityTerms.length ? loi.qualityTerms.map((t) => t.label) : ["Looks fresh and undamaged", "Correct quantity", "Right product"];
    const allChecked = specs.every((_, i) => checks[i]);
    const toast = useToast();

    function capture() { setPhoto(`https://loremflickr.com/600/450/${encodeURIComponent(item.crop)},produce,fresh?lock=${(d.id.charCodeAt(2) || 7) + d.qty}`); }
    function confirm() {
        if (!photo) return;
        actions.confirmDeliveryProof(item.id, d.id, photo, allChecked);
        toast.success("Delivery confirmed", "Photo and QC saved. Escrow released to the farm.");
        setOpen(false);
    }

    const confirmed = d.status === "confirmed";
    const dateLabel = new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    return (
        <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-3 px-4 py-3">
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", confirmed ? "bg-brand-50 text-brand-600" : d.status === "delivered" ? "bg-harvest-400/15 text-harvest-600" : "bg-canvas-sunk text-ink-faint")}>{confirmed ? <Check size={18} /> : <Truck size={17} />}</span>
                <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-ink">{dateLabel}</p>
                    <p className="font-mono text-[12.5px] text-ink-muted tnum">{d.qty} {item.unit} · <span className="capitalize">{d.status}</span></p>
                </div>
                {meta?.photo && <img src={meta.photo} alt="proof" className="h-10 w-10 rounded-lg object-cover" />}
                {confirmed
                    ? <div className="flex items-center gap-2.5">
                        <button onClick={() => { actions.reportLate(item.id, d.id); toast.success("Late flagged", "A credit was applied from the farm's escrow."); }} className="text-2xs font-semibold text-harvest-600 hover:underline">Report late</button>
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-semibold text-brand-600"><Check size={12} /> {meta?.qc ? "QC passed" : "Received"}</span>
                    </div>
                    : <Button onClick={() => setOpen((v) => !v)} className="btn-sm">Receive <ArrowRight size={14} /></Button>}
            </div>

            {open && !confirmed && (
                <div className="border-t border-line bg-canvas-soft/60 p-4 animate-fade-in">
                    <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-faint">1 · Photograph the produce on arrival</p>
                    {photo
                        ? <div className="relative"><img src={photo} alt="capture" className="h-44 w-full rounded-xl object-cover" /><button onClick={() => setPhoto(null)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-white"><X size={14} /></button></div>
                        : <button onClick={capture} className="grid h-44 w-full place-items-center rounded-xl border-2 border-dashed border-line bg-white text-ink-muted transition hover:border-brand-300 hover:text-brand-600"><span className="text-center"><Upload size={24} className="mx-auto" /><span className="mt-1 block text-[13px] font-medium">Capture produce photo</span></span></button>}

                    <p className="mb-2 mt-4 text-2xs font-semibold uppercase tracking-wide text-ink-faint">2 · Quality check</p>
                    <div className="space-y-1.5">
                        {specs.map((label, i) => (
                            <button key={i} onClick={() => setChecks((c) => ({ ...c, [i]: !c[i] }))} className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left">
                                <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border", checks[i] ? "border-brand-500 bg-brand-500 text-white" : "border-line")}>{checks[i] && <Check size={13} />}</span>
                                <span className="text-[13.5px] text-ink-soft">{label}</span>
                            </button>
                        ))}
                    </div>
                    <Button onClick={confirm} disabled={!photo} className="mt-4 w-full justify-center">{allChecked ? "Confirm delivery, release escrow" : "Confirm with noted issues"}</Button>
                    {!photo && <p className="mt-2 text-center text-2xs text-ink-faint">A photo is required to confirm.</p>}
                </div>
            )}
        </Card>
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

function Metric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
    return (
        <div className="rounded-2xl border border-line bg-canvas-soft p-3.5">
            <p className="text-2xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
            <p className="mt-1 font-mono text-lg text-ink tnum">{value}</p>
            {sub && <p className="text-2xs text-ink-faint">{sub}</p>}
        </div>
    );
}

function SignedOverlay({ farm, onDone }: { farm?: string; onDone: () => void }) {
    React.useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
    return (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={onDone}>
            <div className="mx-4 flex max-w-sm flex-col items-center rounded-3xl bg-canvas-soft px-10 py-9 text-center shadow-lift animate-scale-in">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-500 text-white animate-grow-check" style={{ boxShadow: "0 0 0 12px rgba(35,92,58,0.12)" }}><Check size={40} /></span>
                <p className="mt-5 font-display text-2xl text-ink">Contract signed</p>
                <p className="mt-1.5 text-[14px] text-ink-muted">You and {farm ?? "the farm"} are official. The agent is scheduling your weekly deliveries now.</p>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-600"><Sparkle size={15} /> Welcome to local sourcing</div>
            </div>
        </div>
    );
}
