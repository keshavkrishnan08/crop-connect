"use client";

import * as React from "react";
import { Field, Select, Textarea, FieldGroup } from "@/components/ui/kit";
import { type Terms, type Cadence, CADENCE_LABEL } from "@/lib/types";
import { contractValueCents, deliveryCount } from "@/lib/contract";
import { formatMoney, cn } from "@/lib/utils";
import { Shield, Leaf, Check, Crate } from "@/components/icons";

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

    return (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label="Crop">
                    <Field
                        list="crop-list"
                        placeholder="e.g. Heirloom tomatoes"
                        value={value.crop}
                        onChange={(e) => set("crop", e.target.value)}
                    />
                    <datalist id="crop-list">
                        {CROPS.map((c) => <option key={c} value={c} />)}
                    </datalist>
                </FieldGroup>
                <FieldGroup label="Grade / quality (optional)">
                    <Field placeholder="e.g. Grade A, organic" value={value.grade ?? ""} onChange={(e) => set("grade", e.target.value || null)} />
                </FieldGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <FieldGroup label="Typical quantity / delivery">
                    <Field type="number" min={0} value={value.quantity || ""} onChange={(e) => set("quantity", Number(e.target.value))} />
                </FieldGroup>
                <FieldGroup label="Unit">
                    <Select value={value.unit} onChange={(e) => set("unit", e.target.value)}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </Select>
                </FieldGroup>
                <FieldGroup label="Cadence">
                    <Select value={value.cadence} onChange={(e) => set("cadence", e.target.value as Cadence)}>
                        {(Object.keys(CADENCE_LABEL) as Cadence[]).map((c) => (
                            <option key={c} value={c}>{CADENCE_LABEL[c]}</option>
                        ))}
                    </Select>
                </FieldGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label="Term starts">
                    <Field type="date" value={value.term_start} onChange={(e) => set("term_start", e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Term ends">
                    <Field type="date" value={value.term_end} onChange={(e) => set("term_end", e.target.value)} />
                </FieldGroup>
            </div>

            {/* ---- Flexibility & risk-sharing: the painkiller ---- */}
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

                <button
                    type="button"
                    onClick={() => set("crop_failure_clause", !value.crop_failure_clause)}
                    className={cn(
                        "mt-3.5 flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                        value.crop_failure_clause ? "border-forest-300 bg-white" : "border-line bg-white/50",
                    )}
                >
                    <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition", value.crop_failure_clause ? "border-forest-500 bg-forest-500 text-white" : "border-line-strong bg-white")}>
                        {value.crop_failure_clause && <Check size={13} />}
                    </span>
                    <span>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><Leaf size={15} className="text-forest-500" /> Crop-failure clause</span>
                        <span className="text-[12.5px] text-ink-muted">Shortfalls from weather, pests or disease are forgiven with notice — no penalty, no reliability hit.</span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => set("sample_first", !value.sample_first)}
                    className={cn(
                        "mt-2.5 flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                        value.sample_first ? "border-forest-300 bg-white" : "border-line bg-white/50",
                    )}
                >
                    <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition", value.sample_first ? "border-forest-500 bg-forest-500 text-white" : "border-line-strong bg-white")}>
                        {value.sample_first && <Check size={13} />}
                    </span>
                    <span>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><Crate size={15} className="text-forest-500" /> Sample shipment first</span>
                        <span className="text-[12.5px] text-ink-muted">One sample delivery to approve before the full commitment kicks in. Try a shipment, then lock in the season.</span>
                    </span>
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label={`Price per ${value.unit}`}>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">$</span>
                        <Field
                            type="number" min={0} step="0.01" className="pl-8"
                            value={value.unit_price_cents ? value.unit_price_cents / 100 : ""}
                            onChange={(e) => set("unit_price_cents", Math.round(Number(e.target.value) * 100))}
                        />
                    </div>
                </FieldGroup>
                {showCeiling ? (
                    <FieldGroup label="Price ceiling (optional)" hint="Most you'll pay per unit">
                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">$</span>
                            <Field
                                type="number" min={0} step="0.01" className="pl-8"
                                value={ceilingCents ? ceilingCents / 100 : ""}
                                onChange={(e) => onCeilingChange?.(e.target.value ? Math.round(Number(e.target.value) * 100) : null)}
                            />
                        </div>
                    </FieldGroup>
                ) : (
                    <div className="flex items-end">
                        <ValueReadout total={total} count={count} />
                    </div>
                )}
            </div>

            {showCeiling && <ValueReadout total={total} count={count} />}

            <FieldGroup label="Delivery terms (optional)" hint="Who delivers or picks up, location, window">
                <Textarea rows={2} placeholder="e.g. Farm delivers to the restaurant kitchen door, Tuesdays 7–9am." value={value.delivery_terms ?? ""} onChange={(e) => set("delivery_terms", e.target.value || null)} />
            </FieldGroup>

            <FieldGroup label="Quality & acceptance (optional)" hint="Basic spec; what counts as acceptable">
                <Textarea rows={2} placeholder="e.g. Fresh, firm, no blemishes. Buyer may reject sub-spec deliveries with same-day notice." value={value.quality_terms ?? ""} onChange={(e) => set("quality_terms", e.target.value || null)} />
            </FieldGroup>
        </div>
    );
}

function ValueReadout({ total, count }: { total: number; count: number }) {
    return (
        <div className="flex w-full items-center justify-between rounded-2xl glass-tint px-4 py-3">
            <div>
                <p className="text-2xs font-semibold uppercase tracking-wide text-forest-600">Est. committed value</p>
                <p className="font-display text-2xl text-ink">{formatMoney(total)}</p>
            </div>
            <p className="text-right text-[13px] text-ink-muted">
                {count} {count === 1 ? "delivery" : "deliveries"}
            </p>
        </div>
    );
}
