"use client";

import * as React from "react";
import { motion, useReducedMotion, useInView, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Farm,
    Plate,
    Check,
    Receipt,
    Calendar,
    Truck,
    Sparkle,
    Repeat,
} from "@/components/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================ count-up */

export function FarmStat({ to, decimals = 0, prefix = "", suffix = "", className }: { to: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
    const ref = React.useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const reduce = useReducedMotion();
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (reduce) { el.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`; return; }
        if (!inView) return;
        const c = animate(0, to, { duration: 1.2, ease: EASE, onUpdate: (v) => { el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`; } });
        return () => c.stop();
    }, [inView, to, decimals, prefix, suffix, reduce]);
    return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}

/* ============================================================ matching map */
/* One farm in the center. Restaurants on the right light up and draw a line
   back to the farm, one by one. Sage sits on the link. */

const KITCHENS = [
    { name: "Rye & Co.", y: 14 },
    { name: "The Garden Table", y: 38 },
    { name: "Field Notes", y: 62 },
    { name: "Maple Hill Bistro", y: 86 },
];

export function MatchingMap() {
    const reduce = useReducedMotion();
    return (
        <div className="relative overflow-hidden rounded-3xl border border-line bg-canvas-soft p-6 shadow-card sm:p-8">
            <div className="bg-aura pointer-events-none absolute inset-0" />
            <p className="relative mb-5 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Sage matches your crops to kitchens</p>
            <div className="relative h-[260px]">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                    {KITCHENS.map((k, i) => (
                        <motion.path
                            key={k.name}
                            d={`M 14 50 C 45 50, 55 ${k.y}, 84 ${k.y}`}
                            fill="none"
                            stroke="rgba(35,92,58,0.35)"
                            strokeWidth="0.5"
                            strokeDasharray="1.5 1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.18, duration: 0.7, ease: EASE }}
                        />
                    ))}
                </svg>

                {/* traveling pulses along the links */}
                {!reduce && KITCHENS.map((k, i) => (
                    <motion.span
                        key={k.name}
                        className="absolute h-2 w-2 rounded-full bg-brand-500 shadow-brand"
                        style={{ top: `${k.y}%`, left: 0 }}
                        initial={{ left: "14%", opacity: 0 }}
                        whileInView={{ left: ["14%", "84%"], top: ["50%", `${k.y}%`], opacity: [0, 1, 1, 0] }}
                        viewport={{ once: true }}
                        transition={{ delay: 1 + i * 0.25, duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
                    />
                ))}

                {/* farm node */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <motion.div
                        className="flex flex-col items-center"
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 240 }}
                    >
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-brand">
                            <Farm size={24} />
                        </span>
                        <span className="mt-1.5 text-[11px] font-semibold text-ink">Your farm</span>
                    </motion.div>
                </div>

                {/* kitchen nodes */}
                {KITCHENS.map((k, i) => (
                    <motion.div
                        key={k.name}
                        className="absolute right-0 flex -translate-y-1/2 items-center gap-2"
                        style={{ top: `${k.y}%` }}
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.18, ease: EASE }}
                    >
                        <span className="hidden text-[11px] font-medium text-ink-soft sm:inline">{k.name}</span>
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-brand-600">
                            <Plate size={16} />
                        </span>
                    </motion.div>
                ))}
            </div>
            <div className="relative mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] text-brand-700">
                <Sparkle size={14} className="text-brand-500" /> Sage sets the terms and keeps every kitchen supplied.
            </div>
        </div>
    );
}

/* ============================================================ demand stability */
/* Two rows of bars. Spot market jumps around. CropConnect demand is flat and
   committed. Both grow on scroll so the contrast is obvious. */

export function DemandStability() {
    const spot = [40, 18, 70, 30, 55, 12, 62, 25];
    const steady = [60, 60, 60, 60, 60, 60, 60, 60];
    return (
        <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
            <div className="grid gap-7 sm:grid-cols-2">
                <div>
                    <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">Selling on the spot market</p>
                    <div className="mt-4 flex h-32 items-end gap-1.5">
                        {spot.map((h, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 rounded-t bg-line-strong"
                                initial={{ height: 0 }}
                                whileInView={{ height: `${h}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
                            />
                        ))}
                    </div>
                    <p className="mt-3 text-[13px] text-ink-muted">Guessing what sells. Some weeks you dump crops.</p>
                </div>
                <div>
                    <p className="text-2xs font-semibold uppercase tracking-wide text-brand-600">With CropConnect</p>
                    <div className="mt-4 flex h-32 items-end gap-1.5">
                        {steady.map((h, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 rounded-t bg-gradient-to-t from-brand-300 to-brand-500"
                                initial={{ height: 0 }}
                                whileInView={{ height: `${h}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
                            />
                        ))}
                    </div>
                    <p className="mt-3 text-[13px] text-ink-muted">Committed orders, week after week. You plant to real demand.</p>
                </div>
            </div>
        </div>
    );
}

/* ============================================================ payday timeline */
/* A clean vertical timeline of reliable, scheduled pay. Each payday ticks in. */

const PAYDAYS = [
    { date: "Week 1", note: "Delivery confirmed", paid: true },
    { date: "Week 2", note: "Paid on schedule", paid: true },
    { date: "Week 3", note: "Paid on schedule", paid: true },
    { date: "Week 4", note: "Paid on schedule", paid: true },
];

export function PaydayTimeline() {
    return (
        <div className="rounded-3xl border border-line bg-canvas-soft p-6 shadow-card sm:p-8">
            <div className="mb-5 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-brand">
                    <Receipt size={17} />
                </span>
                <p className="font-display text-lg text-ink">Pay you can set a clock by</p>
            </div>
            <div className="relative pl-6">
                <div className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-0.5 rounded bg-brand-100" />
                <div className="space-y-4">
                    {PAYDAYS.map((p, i) => (
                        <motion.div
                            key={p.date}
                            className="relative flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3"
                            initial={{ opacity: 0, x: 14 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, ease: EASE }}
                        >
                            <motion.span
                                className="absolute -left-[26px] grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-white ring-4 ring-canvas-soft"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.15 + i * 0.15, type: "spring", stiffness: 300 }}
                            >
                                <Check size={10} strokeWidth={3} />
                            </motion.span>
                            <div className="flex items-center gap-2.5">
                                <Calendar size={15} className="text-brand-500" />
                                <div>
                                    <p className="text-[14px] font-medium text-ink">{p.date}</p>
                                    <p className="text-[12px] text-ink-muted">{p.note}</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-brand-600">Paid</span>
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] text-ink-muted">
                <Repeat size={15} className="text-brand-500" /> Terms set in advance. No chasing checks.
            </div>
        </div>
    );
}

/* ============================================================ three steps rail */
/* Animated numbered rail with a connecting line that draws in. */

const FARM_STEPS = [
    { n: "01", icon: <Farm size={18} />, title: "Tell Sage what you grow", body: "Your crops, your acreage, your season. Sage learns what you can supply and when." },
    { n: "02", icon: <Sparkle size={18} />, title: "Sage matches you to kitchens", body: "Sage finds restaurants that want your crops and sets fair terms with you up front." },
    { n: "03", icon: <Truck size={18} />, title: "You harvest. Sage handles the rest.", body: "You fill the orders. Sage runs the trucks, the schedule, and the chef relationship." },
];

export function FarmStepsRail() {
    return (
        <div className="relative grid gap-5 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-7 hidden h-0.5 md:block">
                <motion.div
                    className="h-full origin-left rounded bg-gradient-to-r from-brand-200 to-brand-400"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: EASE }}
                />
            </div>
            {FARM_STEPS.map((s, i) => (
                <motion.div
                    key={s.n}
                    className={cn("relative rounded-3xl border border-line bg-white p-6 shadow-card")}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, ease: EASE }}
                >
                    <div className="flex items-center justify-between">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-brand">
                            {s.icon}
                        </span>
                        <span className="font-mono text-2xl text-line-strong tnum">{s.n}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-ink">{s.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{s.body}</p>
                </motion.div>
            ))}
        </div>
    );
}
