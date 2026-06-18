"use client";

import * as React from "react";
import { Field, Select, Textarea, FieldGroup } from "@/components/ui/kit";
import { type Terms, type Cadence, CADENCE_LABEL } from "@/lib/types";
import { contractValueCents, deliveryCount } from "@/lib/contract";
import { formatMoney } from "@/lib/utils";

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
                <FieldGroup label="Quantity / delivery">
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
