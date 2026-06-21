"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Shield, Leaf, MapPin, Calendar, Truck, MarginUp, Receipt, ArrowRight } from "@/components/icons";
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

/* ---------- BUSINESS MODEL: money flow, no figures ---------- */
export function MoneyFlow() {
    return (
        <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1.25fr_auto_1fr]">
            <Block tone="ink" head="You" big="One flat fee" sub="No markup. No cut of your sales." icon={<Receipt size={22} />} />
            <Arrow />
            <Block tone="brand" head="We handle" big="Everything" sub="Sourcing, delivery, the contract." icon={<Truck size={22} />} wide />
            <Arrow />
            <Block tone="harvest" head="You keep" big="The upside" sub="Every extra dollar stays yours." icon={<MarginUp size={22} />} />
        </div>
    );
}
function Block({ tone, head, big, sub, icon, wide }: { tone: "ink" | "brand" | "harvest"; head: string; big: string; sub: string; icon: React.ReactNode; wide?: boolean }) {
    const t = tone === "harvest" ? "text-harvest-500" : tone === "brand" ? "text-brand-600" : "text-ink";
    const bg = tone === "harvest" ? "bg-harvest-400/12 text-harvest-500" : tone === "brand" ? "bg-brand-50 text-brand-600" : "bg-ink/[0.06] text-ink-soft";
    return (
        <div className={cn("rounded-3xl border border-line bg-canvas-soft p-7 shadow-card", wide && "ring-1 ring-brand-100")}>
            <span className={cn("mb-4 grid h-11 w-11 place-items-center rounded-xl", bg)}>{icon}</span>
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">{head}</p>
            <p className={cn("mt-1 font-display text-3xl leading-tight", t)}>{big}</p>
            <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted">{sub}</p>
        </div>
    );
}
function Arrow() { return <div className="hidden items-center justify-center lg:flex"><ArrowRight size={22} className="text-ink-faint" /></div>; }
