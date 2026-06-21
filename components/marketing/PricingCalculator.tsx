"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Leaf, Minus, Plus, Check } from "@/components/icons";

const BASE = 299;
const TIERS = [
    { label: "Small kitchen", per: 99, hint: "Lower weekly volume" },
    { label: "Mid-size", per: 199, hint: "Typical full-service" },
    { label: "High volume", per: 349, hint: "Busy or multi-location" },
];
const TERMS = [
    { label: "Monthly", disc: 0, note: "No commitment" },
    { label: "6 months", disc: 0.1, note: "Save 10%" },
    { label: "12 months", disc: 0.2, note: "Save 20%" },
];

export function PricingCalculator() {
    const [items, setItems] = React.useState(3);
    const [tier, setTier] = React.useState(1);
    const [term, setTerm] = React.useState(0);
    const perItem = TIERS[tier].per;
    const t = TERMS[term];
    const gross = BASE + items * perItem;
    const net = Math.round(gross * (1 - t.disc));
    const saved = gross - net;

    return (
        <div className="grid gap-4 overflow-hidden rounded-3xl border border-line bg-canvas-soft p-5 shadow-card sm:p-7 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-5">
                <Stepper icon={<Leaf size={17} />} label="Items on the program" hint="Each ingredient we keep live for you. We handle the farms, free." value={items} min={1} max={15} onChange={setItems} />
                <div>
                    <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-faint">Your weekly volume</p>
                    <div className="grid grid-cols-3 gap-2">
                        {TIERS.map((x, i) => (
                            <button key={x.label} onClick={() => setTier(i)}
                                className={`rounded-xl border px-2 py-2.5 text-center transition ${i === tier ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-white text-ink-soft hover:border-line-strong"}`}>
                                <span className="block text-[13px] font-semibold leading-tight">{x.label}</span>
                                <span className={`mt-0.5 block text-2xs ${i === tier ? "text-brand-600" : "text-ink-faint"}`}>{x.hint}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-faint">Commitment</p>
                    <div className="grid grid-cols-3 gap-2">
                        {TERMS.map((x, i) => (
                            <button key={x.label} onClick={() => setTerm(i)}
                                className={`rounded-xl border px-2 py-2.5 text-center transition ${i === term ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-white text-ink-soft hover:border-line-strong"}`}>
                                <span className="block text-[13px] font-semibold">{x.label}</span>
                                <span className={`block text-2xs ${i === term ? "text-brand-600" : "text-ink-faint"}`}>{x.note}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-brand-200 bg-white p-6 shadow-sm ring-1 ring-brand-100">
                <p className="text-2xs font-semibold uppercase tracking-wide text-brand-600">Your service fee</p>
                <div className="mt-1 flex items-end gap-1">
                    <motion.span key={net} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-display text-6xl leading-none text-ink tnum">${net.toLocaleString()}</motion.span>
                    <span className="mb-1.5 text-lg text-ink-muted">/mo</span>
                </div>
                {saved > 0 && <p className="mt-1.5 text-[13px] font-medium text-harvest-500">You save ${saved}/mo on a {t.label.toLowerCase()} term</p>}

                <div className="mt-5 space-y-1.5 border-t border-line pt-4 font-mono text-[13px] text-ink-muted tnum">
                    <Row label="Base service" value={`$${BASE}`} />
                    <Row label={`${items} ${items === 1 ? "item" : "items"} × $${perItem}`} value={`$${(items * perItem).toLocaleString()}`} />
                    {t.disc > 0 && <Row label={`${t.label} discount`} value={`-$${saved.toLocaleString()}`} accent />}
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50/60 px-3 py-2.5 text-[12.5px] text-brand-700">
                    <Check size={15} className="mt-0.5 shrink-0 text-brand-500" /> You fund the food separately, at cost. No markup, no cut of your sales, no per-farm charge.
                </div>
            </div>
        </div>
    );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return <div className="flex items-center justify-between"><span className="capitalize">{label}</span><span className={accent ? "text-harvest-500" : "text-ink"}>{value}</span></div>;
}

function Stepper({ icon, label, hint, value, min, max, onChange }: { icon: React.ReactNode; label: string; hint: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
    return (
        <div>
            <div className="mb-2 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
                <div><p className="text-sm font-semibold text-ink">{label}</p><p className="text-2xs text-ink-faint">{hint}</p></div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink-soft transition hover:border-line-strong disabled:opacity-40"><Minus size={15} /></button>
                <span className="w-8 text-center font-display text-2xl text-ink tnum">{value}</span>
                <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink-soft transition hover:border-line-strong disabled:opacity-40"><Plus size={15} /></button>
            </div>
        </div>
    );
}
