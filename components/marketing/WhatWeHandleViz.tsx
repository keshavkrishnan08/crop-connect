"use client";

import * as React from "react";
import { motion, useReducedMotion, useInView, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Check,
    Search,
    Handshake,
    Truck,
    StoryTag,
    Pen,
    Plate,
    Sparkle,
    Shield,
    Clock,
} from "@/components/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================ count-up stat */

export function StatCountUp({ to, decimals = 0, prefix = "", suffix = "", className }: { to: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
    const ref = React.useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const reduce = useReducedMotion();
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (reduce) {
            el.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`;
            return;
        }
        if (!inView) return;
        const c = animate(0, to, {
            duration: 1.2,
            ease: EASE,
            onUpdate: (v) => { el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`; },
        });
        return () => c.stop();
    }, [inView, to, decimals, prefix, suffix, reduce]);
    return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}

/* ============================================================ the split scale */
/* A weighted comparison. Sage's column stacks up tall, yours stays a tidy two.
   Bars grow on scroll so the imbalance reads at a glance. */

const WE = [
    "Find the farms",
    "Vet quality and safety",
    "Negotiate the price",
    "Draft and hold the contract",
    "Schedule weekly delivery",
    "Run the cold chain",
    "Cover crop shortfalls",
    "Prepare provenance",
    "Write the menu line",
    "Track margin per dish",
    "Handle invoices",
    "Renew each season",
];

const YOU = ["Say what you want", "Put it on the menu"];

export function SplitScale() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-line bg-canvas-soft p-6 shadow-card sm:p-9">
            <div className="bg-aura pointer-events-none absolute inset-0" />
            <div className="relative grid gap-6 sm:grid-cols-[1.55fr_1fr]">
                {/* Sage side */}
                <div className="rounded-2xl border border-brand-200 bg-white p-6 ring-1 ring-brand-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-brand">
                                <Sparkle size={17} />
                            </span>
                            <p className="font-display text-lg text-ink">Sage handles</p>
                        </div>
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 font-mono text-2xs font-bold text-brand-600 tnum">
                            <StatCountUp to={WE.length} /> jobs
                        </span>
                    </div>
                    <div className="mt-5 space-y-2">
                        {WE.map((w, i) => (
                            <motion.div
                                key={w}
                                className="flex items-center gap-2.5"
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05, ease: EASE }}
                            >
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                                    <Check size={12} strokeWidth={2.4} />
                                </span>
                                <span className="text-[14px] text-ink-soft">{w}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* You side */}
                <div className="flex flex-col rounded-2xl border border-harvest-300 bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-harvest-400 text-white">
                                <Plate size={17} />
                            </span>
                            <p className="font-display text-lg text-ink">You handle</p>
                        </div>
                        <span className="rounded-full bg-harvest-400/15 px-2.5 py-1 font-mono text-2xs font-bold text-harvest-500 tnum">
                            <StatCountUp to={YOU.length} /> things
                        </span>
                    </div>
                    <div className="mt-5 space-y-3">
                        {YOU.map((y, i) => (
                            <motion.div
                                key={y}
                                className="flex items-center gap-2.5 rounded-xl border border-harvest-300 bg-harvest-400/5 px-4 py-3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + i * 0.12, ease: EASE }}
                            >
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-harvest-400 text-white">
                                    {i === 0 ? <Pen size={13} /> : <Check size={13} strokeWidth={2.4} />}
                                </span>
                                <span className="text-[15px] font-medium text-ink">{y}</span>
                            </motion.div>
                        ))}
                    </div>
                    <p className="mt-auto pt-6 text-[12.5px] leading-relaxed text-ink-faint">
                        That is the whole ask. You stay in the kitchen. Sage runs the supply.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ============================================================ Sage's week */
/* A horizontal timeline of what Sage does across a single week, with a marker
   that sweeps left to right and nodes that pop as it passes. */

const WEEK = [
    { day: "Mon", icon: <Search size={15} />, t: "Confirms the week's volume with each farm" },
    { day: "Tue", icon: <Handshake size={15} />, t: "Locks pricing and any new terms" },
    { day: "Wed", icon: <Truck size={15} />, t: "Books the route and packs the cold chain" },
    { day: "Thu", icon: <Truck size={15} />, t: "Delivery lands at your door" },
    { day: "Fri", icon: <Shield size={15} />, t: "Checks quality and fills any gap" },
    { day: "Sat", icon: <StoryTag size={15} />, t: "Refreshes provenance and margin" },
];

export function SageWeek() {
    const reduce = useReducedMotion();
    return (
        <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
            <div className="mb-6 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-brand">
                    <Clock size={17} />
                </span>
                <div>
                    <p className="font-display text-lg leading-none text-ink">A week in Sage&apos;s hands</p>
                    <p className="mt-1 text-[12.5px] text-ink-muted">You see none of this. It just runs.</p>
                </div>
            </div>
            <div className="relative">
                <div className="absolute left-[18px] top-1 h-[calc(100%-1rem)] w-0.5 rounded bg-line sm:left-1/2 sm:top-[18px] sm:h-0.5 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2" />
                {!reduce && (
                    <motion.div
                        className="absolute left-[14px] z-10 hidden h-2.5 w-2.5 rounded-full bg-brand-500 shadow-brand sm:left-4 sm:top-[14px] sm:block"
                        initial={{ left: "1rem", opacity: 0 }}
                        whileInView={{ left: ["1rem", "calc(100% - 1rem)"], opacity: [0, 1, 1, 0] }}
                        viewport={{ once: true }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                    />
                )}
                <div className="relative grid gap-5 sm:grid-cols-6 sm:gap-3">
                    {WEEK.map((w, i) => (
                        <motion.div
                            key={w.day}
                            className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.14, ease: EASE }}
                        >
                            <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-white">
                                {w.icon}
                            </span>
                            <div className="sm:mt-2">
                                <p className="text-[12px] font-bold uppercase tracking-wide text-brand-600">{w.day}</p>
                                <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{w.t}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
