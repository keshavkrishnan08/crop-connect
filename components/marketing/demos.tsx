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

/* ---------- SOURCING: a vetting card ---------- */
export function FarmVetCard() {
    const checks = [
        { i: <MapPin size={16} />, t: "Close to you" },
        { i: <Shield size={16} />, t: "Proven record" },
        { i: <Leaf size={16} />, t: "Practices verified" },
        { i: <Receipt size={16} />, t: "Price checked" },
    ];
    return (
        <div className="w-full rounded-3xl border border-line bg-canvas-soft p-7 shadow-card">
            <div className="flex items-center gap-3.5">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 font-display text-xl text-white">TF</span>
                <div><p className="font-display text-2xl text-ink">Teter Farm</p><p className="text-sm text-ink-muted">Maria Teter</p></div>
                <motion.span className="ml-auto badge-brand" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}><Check size={12} /> Vetted</motion.span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
                {checks.map((c, i) => (
                    <motion.div key={c.t} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-3 shadow-sm">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">{c.i}</span>
                        <span className="text-[14px] font-medium text-ink-soft">{c.t}</span>
                        <Check size={16} className="ml-auto text-brand-500" />
                    </motion.div>
                ))}
            </div>
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
