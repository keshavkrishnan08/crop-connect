"use client";

import * as React from "react";
import { motion, useReducedMotion, useInView, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Pen,
    Search,
    Handshake,
    Truck,
    StoryTag,
    Plate,
    Check,
    MapPin,
    Calendar,
    Shield,
    Repeat,
    MarginUp,
    Sparkle,
} from "@/components/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================ count-up util */

function useCountUp(to: number, opts?: { decimals?: number; prefix?: string; suffix?: string }) {
    const ref = React.useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const reduce = useReducedMotion();
    const { decimals = 0, prefix = "", suffix = "" } = opts ?? {};
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (reduce) {
            el.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`;
            return;
        }
        if (!inView) return;
        const controls = animate(0, to, {
            duration: 1.1,
            ease: EASE,
            onUpdate: (v) => {
                el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
            },
        });
        return () => controls.stop();
    }, [inView, to, decimals, prefix, suffix, reduce]);
    return ref;
}

export function CountUp({ to, decimals, prefix, suffix, className }: { to: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
    const ref = useCountUp(to, { decimals, prefix, suffix });
    return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}

/* ============================================================ Sage pipeline */
/* A horizontal rail of five stages with a pulse that travels along it once
   on view, then keeps a soft loop. Two stages are "you", three are Sage. */

const STAGES = [
    { who: "you", icon: <Pen size={17} />, label: "You ask" },
    { who: "sage", icon: <Search size={17} />, label: "Match + vet" },
    { who: "sage", icon: <Handshake size={17} />, label: "Draft deal" },
    { who: "sage", icon: <Truck size={17} />, label: "Schedule" },
    { who: "sage", icon: <StoryTag size={17} />, label: "Provenance" },
    { who: "you", icon: <Plate size={17} />, label: "You serve" },
] as const;

export function SageFlow() {
    const reduce = useReducedMotion();
    return (
        <div className="relative overflow-hidden rounded-3xl border border-line bg-canvas-soft p-6 shadow-card sm:p-8">
            <div className="bg-aura pointer-events-none absolute inset-0" />
            <div className="relative">
                <div className="mb-6 flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-brand">
                        <Sparkle size={17} />
                    </span>
                    <div>
                        <p className="font-display text-lg leading-none text-ink">Sage runs the loop</p>
                        <p className="mt-1 text-[12.5px] text-ink-muted">You touch two ends. Sage owns the middle.</p>
                    </div>
                </div>

                {/* rail */}
                <div className="relative">
                    {/* base line (desktop) */}
                    <div className="absolute left-0 right-0 top-[26px] hidden h-0.5 rounded bg-line sm:block" />
                    {/* traveling pulse (desktop) */}
                    {!reduce && (
                        <motion.div
                            className="absolute top-[22px] z-10 hidden h-2.5 w-2.5 rounded-full bg-brand-500 shadow-brand sm:block"
                            initial={{ left: "0%", opacity: 0 }}
                            animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
                        />
                    )}
                    <div className="relative grid grid-cols-2 gap-y-7 sm:grid-cols-6 sm:gap-y-0">
                        {STAGES.map((s, i) => {
                            const sage = s.who === "sage";
                            return (
                                <motion.div
                                    key={s.label}
                                    className="flex flex-col items-center text-center"
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, ease: EASE }}
                                >
                                    <span
                                        className={cn(
                                            "relative grid h-[52px] w-[52px] place-items-center rounded-2xl ring-1",
                                            sage
                                                ? "bg-brand-500 text-white ring-brand-600 shadow-brand"
                                                : "bg-white text-harvest-500 ring-harvest-300"
                                        )}
                                    >
                                        {s.icon}
                                    </span>
                                    <span className="mt-2.5 text-[12px] font-semibold text-ink-soft">{s.label}</span>
                                    <span
                                        className={cn(
                                            "mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                                            sage ? "bg-brand-50 text-brand-600" : "bg-harvest-400/15 text-harvest-500"
                                        )}
                                    >
                                        {sage ? "Sage" : "You"}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================ typing request */
/* Step 1 visual — the single form line, typed in character by character. */

export function TypingRequest() {
    const reduce = useReducedMotion();
    const ref = React.useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const full = "Heirloom tomatoes";
    const [typed, setTyped] = React.useState(reduce ? full : "");
    const [done, setDone] = React.useState(reduce ? true : false);

    React.useEffect(() => {
        if (reduce || !inView) return;
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setTyped(full.slice(0, i));
            if (i >= full.length) {
                clearInterval(id);
                setTimeout(() => setDone(true), 350);
            }
        }, 70);
        return () => clearInterval(id);
    }, [inView, reduce]);

    return (
        <div ref={ref} className="w-full rounded-3xl border border-line bg-canvas-soft p-6 shadow-card sm:p-7">
            <p className="mb-4 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">The whole request</p>
            <div className="rounded-2xl border border-line bg-white px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Ingredient</p>
                <p className="mt-1 flex min-h-[26px] items-center gap-2 font-display text-xl text-ink">
                    {typed}
                    {!done && <span className="inline-block h-5 w-0.5 animate-pulse bg-brand-500" />}
                </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
                <motion.div
                    className="rounded-2xl border border-line bg-white px-5 py-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={done ? { opacity: 1, y: 0 } : {}}
                    transition={{ ease: EASE }}
                >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Amount</p>
                    <p className="mt-1 font-mono text-[15px] text-ink tnum">40 lb / week</p>
                </motion.div>
                <motion.div
                    className="rounded-2xl border border-line bg-white px-5 py-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={done ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1, ease: EASE }}
                >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">For the dish</p>
                    <p className="mt-1 text-[15px] text-ink">Summer salad</p>
                </motion.div>
            </div>
            <motion.p
                className="mt-4 flex items-center justify-center gap-1.5 text-center text-[13px] text-brand-700"
                initial={{ opacity: 0 }}
                animate={done ? { opacity: 1 } : {}}
                transition={{ delay: 0.2 }}
            >
                <Check size={14} className="text-brand-500" /> Sent to Sage. About a minute of your time.
            </motion.p>
        </div>
    );
}

/* ============================================================ farm match scan */
/* Step 2 visual — Sage scans a bench of farms and a top match locks in. */

export function FarmMatchScan() {
    const reduce = useReducedMotion();
    const farms = [
        { name: "Teter Farm", miles: 12, score: 98, top: true },
        { name: "Pinetree Gardens", miles: 18, score: 94 },
        { name: "Hollow Creek", miles: 24, score: 91 },
    ];
    return (
        <div className="relative w-full overflow-hidden rounded-3xl border border-line bg-canvas-soft p-6 shadow-card sm:p-7">
            <motion.div
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent"
                initial={{ y: 0, opacity: 0 }}
                whileInView={reduce ? {} : { y: [10, 230, 10], opacity: [0, 1, 0] }}
                viewport={{ once: true }}
                transition={{ duration: 1.7, ease: "easeInOut" }}
            />
            <p className="mb-4 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Sage ranks the bench</p>
            <div className="space-y-2.5">
                {farms.map((f, i) => (
                    <motion.div
                        key={f.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.12, ease: EASE }}
                        className={cn(
                            "flex items-center justify-between rounded-2xl border px-4 py-3",
                            f.top ? "border-brand-300 bg-brand-50/60" : "border-line bg-white"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className={cn("grid h-9 w-9 place-items-center rounded-xl", f.top ? "bg-brand-500 text-white" : "bg-canvas-sunk text-ink-muted")}>
                                <MapPin size={16} />
                            </span>
                            <div>
                                <p className="text-[14px] font-medium text-ink">{f.name}</p>
                                <p className="font-mono text-xs text-ink-faint tnum">{f.miles} miles away</p>
                            </div>
                        </div>
                        {f.top ? (
                            <motion.span
                                className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-white"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.3, type: "spring", stiffness: 280 }}
                            >
                                <Check size={11} /> Top match
                            </motion.span>
                        ) : (
                            <span className="font-mono text-sm text-ink-muted tnum">{f.score}</span>
                        )}
                    </motion.div>
                ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-2.5 text-[13px] text-brand-700">
                <Shield size={15} /> Vetted on distance, record, practices, and price.
            </div>
        </div>
    );
}

/* ============================================================ agreement draft */
/* Step 3 visual — the standing agreement writes itself, line by line. */

export function AgreementDraft() {
    const rows = [
        ["Item", "Heirloom tomatoes"],
        ["Volume", "40 lb each week"],
        ["Price", "$2.40 / lb, fixed"],
        ["Term", "Through October"],
        ["Renewal", "Auto, each season"],
    ];
    return (
        <div className="w-full rounded-3xl border border-line bg-canvas-soft p-6 shadow-card sm:p-7">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Sage drafts the agreement</p>
                <Handshake size={18} className="text-brand-500" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
                {rows.map(([k, v], i) => (
                    <motion.div
                        key={k}
                        className={cn("flex items-center justify-between px-4 py-3", i > 0 && "border-t border-line")}
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.13, ease: EASE }}
                    >
                        <span className="text-[13px] text-ink-muted">{k}</span>
                        <span className="font-mono text-[14px] text-ink tnum">{v}</span>
                    </motion.div>
                ))}
            </div>
            <motion.div
                className="mt-4 flex items-center gap-2.5 rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.75, ease: EASE }}
            >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
                    <Check size={16} />
                </span>
                <p className="text-[13px] text-brand-700">Drafted and held by Sage. You just say yes.</p>
            </motion.div>
        </div>
    );
}

/* ============================================================ week rhythm */
/* Step 4 visual — four weeks of a fixed delivery day filling in. */

export function WeekRhythm() {
    const dropDay = 2; // Wednesday-ish column
    const weeks = ["Jun 24", "Jul 1", "Jul 8", "Jul 15"];
    return (
        <div className="w-full rounded-3xl border border-line bg-canvas-soft p-6 shadow-card sm:p-7">
            <div className="mb-5 flex items-center gap-2.5">
                <Calendar size={18} className="text-brand-600" />
                <p className="font-display text-lg text-ink">Same day, every week</p>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="pb-1 text-center text-[10px] font-semibold uppercase text-ink-faint">{d}</div>
                ))}
                {weeks.map((_, w) =>
                    Array.from({ length: 7 }).map((_, d) => {
                        const isDrop = d === dropDay;
                        const idx = w * 7 + d;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: w * 0.12 + d * 0.02, ease: EASE }}
                                className={cn(
                                    "grid aspect-square place-items-center rounded-xl border text-[11px]",
                                    isDrop ? "border-brand-400 bg-brand-50 text-brand-600" : "border-line bg-white text-ink-faint"
                                )}
                            >
                                {isDrop ? <Truck size={15} /> : <span className="h-1 w-1 rounded-full bg-ink-faint/30" />}
                            </motion.div>
                        );
                    })
                )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                    <span className="grid h-5 w-5 place-items-center rounded bg-brand-50 text-brand-600"><Truck size={11} /></span>
                    Delivery day
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-canvas-sunk px-3 py-1 text-[12px] text-ink-muted">
                    <Repeat size={13} className="text-brand-500" /> Backup farm on standby
                </span>
            </div>
        </div>
    );
}

/* ============================================================ provenance + margin */
/* Step 5 visual — provenance tag flips up, then margin counts up. */

export function ProvenanceMargin() {
    return (
        <div className="w-full space-y-3">
            <motion.div
                className="relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-card"
                initial={{ opacity: 0, rotateX: -12, y: 10 }}
                whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE }}
                style={{ transformPerspective: 800 }}
            >
                <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <StoryTag size={20} />
                    </span>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">On the menu</p>
                        <p className="font-display text-lg text-ink">Teter Farm heirloom tomatoes</p>
                        <p className="text-[13px] text-ink-muted">Picked 12 miles away. Cut this week.</p>
                    </div>
                </div>
            </motion.div>

            <div className="rounded-3xl border border-line bg-canvas-soft p-6 shadow-card">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-line bg-white px-4 py-3 text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Before</p>
                        <p className="mt-1 font-mono text-xl text-ink tnum">$16</p>
                    </div>
                    <div className="rounded-2xl border border-brand-300 bg-brand-50/60 px-4 py-3 text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">After</p>
                        <p className="mt-1 font-mono text-xl text-brand-700 tnum">$19</p>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4">
                    <div className="flex items-center gap-2 text-[14px] text-ink-muted">
                        <MarginUp size={18} className="text-harvest-500" /> Added per plate
                    </div>
                    <CountUp to={3} prefix="+$" className="font-mono text-2xl text-harvest-500 tnum" />
                </div>
                <p className="mt-3 text-center text-[13px] text-ink-muted">
                    Across <span className="font-mono text-ink tnum">25</span> covers a night that is{" "}
                    <CountUp to={75} prefix="+$" className="font-mono font-semibold text-harvest-500 tnum" />.
                </p>
            </div>
        </div>
    );
}
