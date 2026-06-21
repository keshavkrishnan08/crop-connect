"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Shield, Leaf, MapPin, Calendar, Truck, MarginUp, Receipt, Farm, Search, StoryTag, X } from "@/components/icons";
import { cn } from "@/lib/utils";

/* ---------- PROBLEM: the thin sliver of profit ---------- */
export function MarginSliver() {
    return (
        <div className="w-full">
            <div className="flex h-20 w-full overflow-hidden rounded-2xl shadow-card">
                <div className="flex flex-1 items-center pl-6 text-base font-medium text-ink-soft" style={{ background: "repeating-linear-gradient(135deg, #EDEFE7, #EDEFE7 12px, #E7E9E0 12px, #E7E9E0 24px)" }}>Costs</div>
                <motion.div className="grid w-[7%] place-items-center bg-harvest-400 text-white" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2.2, repeat: Infinity }}><Leaf size={16} /></motion.div>
            </div>
            <p className="mt-4 text-center text-[15px] text-ink-muted">That sliver is everything you keep.</p>
        </div>
    );
}

/* ---------- RESULT: margin trending up ---------- */
export function ResultMeter() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.4 });
        o.observe(el); return () => o.disconnect();
    }, []);
    const bars = [26, 34, 30, 45, 52, 61, 74, 88, 100];
    return (
        <div ref={ref} className="relative w-full overflow-hidden rounded-3xl border border-line bg-canvas-soft p-8">
            <div className="pointer-events-none absolute inset-0 bg-aura" />
            <div className="relative flex h-56 items-end gap-2.5">
                {bars.map((h, i) => (
                    <motion.div key={i} className={cn("flex-1 rounded-t-lg", i >= bars.length - 3 ? "bg-gradient-to-t from-harvest-300 to-harvest-400" : "bg-gradient-to-t from-brand-100 to-brand-300")}
                        initial={{ height: 0 }} animate={show ? { height: `${h}%` } : { height: 0 }} transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }} />
                ))}
                <motion.span className="absolute right-6 top-4 text-harvest-500" initial={{ opacity: 0, scale: 0.6 }} animate={show ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.9 }}><MarginUp size={40} /></motion.span>
            </div>
            <p className="relative mt-5 text-center text-[15px] text-ink-muted">Same plates. More margin on each one.</p>
        </div>
    );
}

/* ---------- SOURCING: an intricate vetting dossier ---------- */
export function FarmVetCard() {
    const reduce = useReducedMotion();
    const checks = [
        { i: <MapPin size={15} />, t: "Close to you" },
        { i: <Shield size={15} />, t: "Proven record" },
        { i: <Leaf size={15} />, t: "Practices verified" },
        { i: <Receipt size={15} />, t: "Price in range" },
    ];
    return (
        <div className="relative w-full overflow-hidden rounded-3xl border border-line bg-canvas-soft shadow-card">
            {/* a scan line that sweeps once on view */}
            <motion.div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent"
                initial={{ y: 0, opacity: 0 }} whileInView={reduce ? {} : { y: [0, 360, 0], opacity: [0, 1, 0] }} viewport={{ once: true }} transition={{ duration: 1.6, ease: "easeInOut" }} />
            {/* header band */}
            <div className="relative flex items-start gap-4 border-b border-line bg-gradient-to-br from-brand-50/60 to-transparent p-6">
                <div className="relative">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 font-display text-xl text-white shadow-brand">TF</span>
                    <motion.span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7, type: "spring", stiffness: 300 }}>
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white"><Check size={12} /></span>
                    </motion.span>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                    <p className="font-display text-2xl leading-tight text-ink">Teter Farm</p>
                    <p className="flex items-center gap-1.5 text-[13px] text-ink-muted"><span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Maria Teter, grower</p>
                </div>
                <VetRing reduce={reduce} />
            </div>

            {/* radar + record */}
            <div className="grid grid-cols-[auto_1fr] items-center gap-5 px-6 py-5">
                <Radar reduce={reduce} />
                <div>
                    <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-faint">Track record</p>
                    <div className="flex gap-1.5">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <motion.span key={i} className="h-7 flex-1 rounded-md bg-brand-400" style={{ transformOrigin: "bottom" }}
                                initial={{ scaleY: 0.15, opacity: 0.35 }} whileInView={{ scaleY: i === 5 ? 0.6 : 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.07, ease: [0.22, 1, 0.36, 1] }} />
                        ))}
                    </div>
                    <p className="mt-2 text-[13px] text-ink-muted">Reliable, week after week.</p>
                </div>
            </div>

            {/* checklist */}
            <div className="grid grid-cols-2 gap-2.5 px-6 pb-5">
                {checks.map((c, i) => (
                    <motion.div key={c.t} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 + i * 0.1 }} className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">{c.i}</span>
                        <span className="flex-1 text-[13px] font-medium text-ink-soft">{c.t}</span>
                        <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.55 + i * 0.1, type: "spring", stiffness: 320 }}><Check size={15} className="text-brand-500" /></motion.span>
                    </motion.div>
                ))}
            </div>

            {/* practices */}
            <div className="flex flex-wrap gap-1.5 border-t border-line px-6 py-4">
                {["Certified Organic", "No-till", "Dry-farmed"].map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-semibold text-brand-600"><Leaf size={11} /> {p}</span>
                ))}
            </div>
        </div>
    );
}

function VetRing({ reduce }: { reduce: boolean | null }) {
    const C = 2 * Math.PI * 20;
    return (
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
            <svg viewBox="0 0 48 48" className="h-16 w-16 -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" className="stroke-brand-100" />
                <motion.circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-brand-500"
                    strokeDasharray={C} initial={{ strokeDashoffset: C }} whileInView={{ strokeDashoffset: 0 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }} />
            </svg>
            <div className="absolute text-center leading-none">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-600">Vetted</p>
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.1, type: "spring", stiffness: 300 }}><Check size={16} className="mx-auto text-brand-600" /></motion.div>
            </div>
        </div>
    );
}

function Radar({ reduce }: { reduce: boolean | null }) {
    return (
        <div className="relative grid h-24 w-24 place-items-center rounded-full border border-line bg-white">
            <div className="absolute h-16 w-16 rounded-full border border-line" />
            <div className="absolute h-9 w-9 rounded-full border border-line" />
            {!reduce && <motion.div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(35,92,58,0.18), transparent 75%)" }} animate={{ rotate: 360 }} transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }} />}
            <span className="absolute z-10 h-2 w-2 rounded-full bg-ink" />
            {/* the farm blip */}
            <motion.span className="absolute z-10 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-500/20" style={{ left: "62%", top: "34%" }}
                animate={reduce ? {} : { scale: [1, 1.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
        </div>
    );
}

/* ---------- DELIVERY: a recurring rhythm ---------- */
export function DeliverySchedule() {
    const drop = 1;
    return (
        <div className="w-full rounded-3xl border border-line bg-canvas-soft p-7 shadow-card">
            <div className="mb-5 flex items-center gap-2.5"><Calendar size={20} className="text-brand-600" /><p className="font-display text-xl text-ink">Every week, on its own</p></div>
            <div className="grid grid-cols-7 gap-2.5">
                {Array.from({ length: 28 }).map((_, i) => {
                    const isDrop = i % 7 === drop;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 7) * 0.03 + Math.floor(i / 7) * 0.07 }}
                            className={cn("grid aspect-square place-items-center rounded-xl border", isDrop ? "border-brand-400 bg-brand-50 text-brand-600" : "border-line bg-white text-ink-faint")}>
                            {isDrop ? <Truck size={16} /> : i % 7 < 5 ? <span className="h-1 w-1 rounded-full bg-ink-faint/40" /> : null}
                        </motion.div>
                    );
                })}
            </div>
            <p className="mt-5 text-center text-[15px] text-ink-muted">It just shows up. You never chase anyone.</p>
        </div>
    );
}

/* ---------- BUSINESS MODEL: an intricate flow infographic ---------- */
export function MoneyFlow() {
    return (
        <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-canvas-soft p-6 shadow-card sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-aura" />
            <div className="relative grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1.15fr_auto_1fr]">
                <FeeTicket />
                <Flow />
                <ServiceHub />
                <Flow />
                <Upside />
            </div>
            <div className="relative mt-9 flex flex-col items-center gap-3 border-t border-line pt-7 sm:flex-row sm:justify-center sm:gap-4">
                <span className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">We never touch</span>
                <div className="flex gap-2.5">
                    <NeverChip label="Your food cost" />
                    <NeverChip label="Your sales" />
                </div>
            </div>
        </div>
    );
}

function FeeTicket() {
    return (
        <div className="relative flex flex-col justify-between rounded-2xl border border-line bg-white p-6 shadow-sm">
            <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-line bg-canvas-soft" />
            <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-line bg-canvas-soft" />
            <div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink/[0.06] text-ink-soft"><Receipt size={20} /></span>
                <p className="mt-3 text-2xs font-semibold uppercase tracking-wide text-ink-faint">You pay</p>
            </div>
            <div className="mt-5 border-t border-dashed border-line pt-4">
                <p className="font-display text-3xl leading-none text-ink">One flat fee</p>
                <p className="mt-1.5 text-sm text-ink-muted">per month, that is it</p>
            </div>
        </div>
    );
}

function ServiceHub() {
    const tiles = [{ i: <Farm size={17} />, t: "Source" }, { i: <Search size={17} />, t: "Vet" }, { i: <Truck size={17} />, t: "Deliver" }, { i: <StoryTag size={17} />, t: "Prove" }];
    return (
        <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm ring-1 ring-brand-100">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-brand"><Leaf size={20} /></span>
            <p className="mt-3 text-2xs font-semibold uppercase tracking-wide text-brand-600">We run it all</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
                {tiles.map((x, i) => (
                    <motion.div key={x.t} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2 rounded-xl bg-brand-50/70 px-3 py-2.5">
                        <span className="text-brand-600">{x.i}</span><span className="text-[13px] font-semibold text-ink-soft">{x.t}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function Upside() {
    const bars = [38, 52, 68, 84, 100];
    return (
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-harvest-400/12 text-harvest-500"><MarginUp size={20} /></span>
                <p className="mt-3 text-2xs font-semibold uppercase tracking-wide text-harvest-500">You keep</p>
                <p className="mt-1.5 font-display text-3xl leading-none text-ink">The upside</p>
                <p className="mt-2 text-[13px] text-ink-muted">Every extra dollar stays yours.</p>
            </div>
            <div className="mt-4 flex h-14 items-end gap-1.5">
                {bars.map((h, i) => <motion.span key={i} className="flex-1 rounded-t bg-gradient-to-t from-harvest-300 to-harvest-400" initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />)}
            </div>
        </div>
    );
}

function Flow() {
    return (
        <div className="relative hidden w-16 items-center lg:flex">
            <div className="h-0.5 w-full rounded bg-gradient-to-r from-brand-200 to-brand-300" />
            <motion.span className="absolute h-2.5 w-2.5 rounded-full bg-brand-500 shadow-brand" style={{ top: "50%", marginTop: -5 }}
                animate={{ left: ["-4%", "100%"], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }} />
        </div>
    );
}

function NeverChip({ label }: { label: string }) {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink-muted"><X size={13} className="text-ink-faint" /> {label}</span>;
}
