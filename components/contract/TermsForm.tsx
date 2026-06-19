"use client";

import * as React from "react";
import { Field, Select, Textarea, FieldGroup } from "@/components/ui/kit";
import { type Terms, type Cadence, CADENCE_LABEL } from "@/lib/types";
import { contractValueCents, deliveryCount } from "@/lib/contract";
import { estimateCourier, platformMarkupPct } from "@/lib/shipping";
import { formatMoney, cn } from "@/lib/utils";
import { Shield, Leaf, Check, Crate, Barn, Truck, ChevronRight } from "@/components/icons";

const UNITS = ["lb", "kg", "case", "bushel", "crate", "flat", "dozen", "bunch", "unit"];
const CROPS = [
    "Heirloom tomatoes", "Mixed greens", "Strawberries", "Sweet corn", "Carrots", "Kale",
    "Bell peppers", "Eggplant", "Zucchini", "Blueberries", "Apples", "Microgreens", "Herbs", "Squash",
];

export function TermsForm({
    value, onChange, showCeiling, ceilingCents, onCeilingChange,
}: {
    value: Terms;
    onChange: (t: Terms) => void;
    showCeiling?: boolean;
    ceilingCents?: number | null;
    onCeilingChange?: (cents: number | null) => void;
}) {
    const set = <K extends keyof Terms>(k: K, v: Terms[K]) => onChange({ ...value, [k]: v });
    const total = contractValueCents(value);
    const count = deliveryCount(value);
    const [adv, setAdv] = React.useState(false);

    // plain-language summary of the protections already applied by default
    const defaults: string[] = [];
    if (value.crop_failure_clause) defaults.push("weather shortfalls forgiven");
    if (value.sample_first) defaults.push("a sample ships first");
    if (value.opt_out_notice_days) defaults.push(`${value.opt_out_notice_days}-day opt-out`);

    return (
        <div className="space-y-5">
            {/* ---- The 3 things that matter ---- */}
            <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label="Crop">
                    <Field list="crop-list" placeholder="e.g. Heirloom tomatoes" value={value.crop} onChange={(e) => set("crop", e.target.value)} />
                    <datalist id="crop-list">{CROPS.map((c) => <option key={c} value={c} />)}</datalist>
                </FieldGroup>
                <FieldGroup label="Grade / quality (optional)">
                    <Field placeholder="e.g. Grade A, organic" value={value.grade ?? ""} onChange={(e) => set("grade", e.target.value || null)} />
                </FieldGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <FieldGroup label="How much, each time">
                    <Field type="number" min={0} value={value.quantity || ""} onChange={(e) => set("quantity", Number(e.target.value))} />
                </FieldGroup>
                <FieldGroup label="Unit">
                    <Select value={value.unit} onChange={(e) => set("unit", e.target.value)}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </Select>
                </FieldGroup>
                <FieldGroup label="How often">
                    <Select value={value.cadence} onChange={(e) => set("cadence", e.target.value as Cadence)}>
                        {(Object.keys(CADENCE_LABEL) as Cadence[]).map((c) => (
                            <option key={c} value={c}>{CADENCE_LABEL[c]}</option>
                        ))}
                    </Select>
                </FieldGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label="Starts"><Field type="date" value={value.term_start} onChange={(e) => set("term_start", e.target.value)} /></FieldGroup>
                <FieldGroup label="Ends"><Field type="date" value={value.term_end} onChange={(e) => set("term_end", e.target.value)} /></FieldGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label={`Price per ${value.unit}`}>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">$</span>
                        <Field type="number" min={0} step="0.01" className="pl-8"
                            value={value.unit_price_cents ? value.unit_price_cents / 100 : ""}
                            onChange={(e) => set("unit_price_cents", Math.round(Number(e.target.value) * 100))} />
                    </div>
                </FieldGroup>
                {showCeiling ? (
                    <FieldGroup label="Price ceiling (optional)" hint="Most you'll pay per unit">
                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">$</span>
                            <Field type="number" min={0} step="0.01" className="pl-8"
                                value={ceilingCents ? ceilingCents / 100 : ""}
                                onChange={(e) => onCeilingChange?.(e.target.value ? Math.round(Number(e.target.value) * 100) : null)} />
                        </div>
                    </FieldGroup>
                ) : (
                    <div className="flex items-end"><ValueReadout total={total} count={count} /></div>
                )}
            </div>
            {showCeiling && <ValueReadout total={total} count={count} />}

            {/* ---- Reassurance: protections already on, no jargon needed ---- */}
            {defaults.length > 0 && (
                <div className="flex items-start gap-2.5 rounded-xl bg-forest-50/50 px-3.5 py-2.5">
                    <Shield size={16} className="mt-0.5 shrink-0 text-forest-600" />
                    <p className="text-[12.5px] text-forest-700">
                        Sensible protections are already on — {defaults.join(" · ")}. You don't have to touch anything else.
                    </p>
                </div>
            )}

            {/* ---- Advanced, collapsed by default ---- */}
            <button
                type="button"
                onClick={() => setAdv((a) => !a)}
                className="flex w-full items-center justify-between rounded-xl border border-line bg-white/60 px-4 py-3 text-left transition hover:border-line-strong"
            >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Shield size={16} className="text-forest-600" /> Flexibility & delivery options
                </span>
                <ChevronRight size={18} className={cn("text-ink-faint transition-transform", adv && "rotate-90")} />
            </button>

            {adv && (
                <div className="space-y-5 animate-fade-in">
                    {/* Flexibility & risk-sharing */}
                    <div className="rounded-2xl border border-forest-100 bg-forest-50/40 p-4 sm:p-5">
                        <div className="mb-3.5 flex items-center gap-2">
                            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-forest-600 shadow-glass"><Shield size={17} /></span>
                            <div>
                                <p className="text-sm font-semibold text-ink">Flexibility & risk-sharing</p>
                                <p className="text-[12.5px] text-ink-muted">Commit to a relationship, not a brittle number.</p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FieldGroup label="Flexible quantity band (optional)" hint="A good-faith range. Leave blank for an exact amount.">
                                <div className="flex items-center gap-2">
                                    <Field type="number" min={0} placeholder="min" value={value.quantity_min ?? ""} onChange={(e) => set("quantity_min", e.target.value ? Number(e.target.value) : null)} />
                                    <span className="text-ink-faint">–</span>
                                    <Field type="number" min={0} placeholder="max" value={value.quantity_max ?? ""} onChange={(e) => set("quantity_max", e.target.value ? Number(e.target.value) : null)} />
                                    <span className="shrink-0 text-[13px] text-ink-muted">{value.unit}</span>
                                </div>
                            </FieldGroup>
                            <div className="grid grid-cols-2 gap-4">
                                <FieldGroup label="Firm cycles" hint="Committed deliveries">
                                    <Field type="number" min={0} placeholder="2" value={value.min_commit_cycles ?? ""} onChange={(e) => set("min_commit_cycles", e.target.value ? Number(e.target.value) : null)} />
                                </FieldGroup>
                                <FieldGroup label="Opt-out notice" hint="Days' notice">
                                    <Field type="number" min={0} placeholder="14" value={value.opt_out_notice_days ?? ""} onChange={(e) => set("opt_out_notice_days", e.target.value ? Number(e.target.value) : null)} />
                                </FieldGroup>
                            </div>
                        </div>

                        <ToggleRow active={value.crop_failure_clause} onClick={() => set("crop_failure_clause", !value.crop_failure_clause)} icon={<Leaf size={15} className="text-forest-500" />} title="Crop-failure clause" sub="Shortfalls from weather, pests or disease are forgiven with notice — no penalty, no reliability hit." className="mt-3.5" />
                        <ToggleRow active={value.sample_first} onClick={() => set("sample_first", !value.sample_first)} icon={<Crate size={15} className="text-forest-500" />} title="Sample shipment first" sub="One sample delivery to approve before the full commitment. Try a shipment, then lock in the season." className="mt-2.5" />
                    </div>

                    {/* Delivery method */}
                    <div>
                        <label className="label">Delivery</label>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                            <MethodCard active={value.delivery_method === "farm"} onClick={() => set("delivery_method", "farm")} icon={<Barn size={18} />} title="Farm delivers" sub="The farm drops off or the buyer collects. No added fee." />
                            <MethodCard active={value.delivery_method === "courier"} onClick={() => set("delivery_method", "courier")} icon={<Truck size={18} />} title="CropConnect courier" sub={`We arrange a local courier — about ${formatMoney(estimateCourier(null).totalCents)}/run, billed to the buyer.`} />
                        </div>
                        {value.delivery_method === "courier" && (
                            <p className="mt-2 rounded-xl bg-forest-50/60 px-3 py-2 text-[12.5px] text-forest-700">
                                CropConnect dispatches a same-day local courier (powered by Uber Direct). The fee includes a {platformMarkupPct()}% platform service charge, quoted per delivery once both locations are set.
                            </p>
                        )}
                        <Textarea rows={2} className="mt-2.5" placeholder="Pickup/drop-off notes (optional) — e.g. kitchen door, Tuesdays 7–9am." value={value.delivery_terms ?? ""} onChange={(e) => set("delivery_terms", e.target.value || null)} />
                    </div>

                    <FieldGroup label="Quality & acceptance (optional)" hint="Basic spec; what counts as acceptable">
                        <Textarea rows={2} placeholder="e.g. Fresh, firm, no blemishes. Buyer may reject sub-spec deliveries with same-day notice." value={value.quality_terms ?? ""} onChange={(e) => set("quality_terms", e.target.value || null)} />
                    </FieldGroup>
                </div>
            )}
        </div>
    );
}

function ToggleRow({ active, onClick, icon, title, sub, className }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string; className?: string;
}) {
    return (
        <button type="button" onClick={onClick} className={cn("flex w-full items-start gap-3 rounded-xl border p-3 text-left transition", active ? "border-forest-300 bg-white" : "border-line bg-white/50", className)}>
            <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition", active ? "border-forest-500 bg-forest-500 text-white" : "border-line-strong bg-white")}>
                {active && <Check size={13} />}
            </span>
            <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">{icon} {title}</span>
                <span className="text-[12.5px] text-ink-muted">{sub}</span>
            </span>
        </button>
    );
}

function MethodCard({ active, onClick, icon, title, sub }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string;
}) {
    return (
        <button type="button" onClick={onClick} className={cn("flex items-start gap-3 rounded-2xl border p-3.5 text-left transition", active ? "border-forest-400 bg-forest-50/50 ring-2 ring-forest-400/20" : "border-line bg-white/60 hover:border-line-strong")}>
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", active ? "bg-forest-500 text-white" : "bg-paper-sunk text-ink-soft")}>{icon}</span>
            <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">{title}{active && <Check size={14} className="text-forest-500" />}</span>
                <span className="text-[12.5px] text-ink-muted">{sub}</span>
            </span>
        </button>
    );
}

function ValueReadout({ total, count }: { total: number; count: number }) {
    return (
        <div className="flex w-full items-center justify-between rounded-2xl glass-tint px-4 py-3">
            <div>
                <p className="text-2xs font-semibold uppercase tracking-wide text-forest-600">Est. committed value</p>
                <p className="font-display text-2xl text-ink">{formatMoney(total)}</p>
            </div>
            <p className="text-right text-[13px] text-ink-muted">{count} {count === 1 ? "delivery" : "deliveries"}</p>
        </div>
    );
}
