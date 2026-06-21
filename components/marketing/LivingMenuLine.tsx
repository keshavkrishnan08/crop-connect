"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MapPin, ArrowUpRight } from "@/components/icons";
import { usd } from "@/lib/utils";

/**
 * The signature brand device — a menu row that visibly upgrades:
 *   "Heirloom tomato salad … $16"  →  "Heirloom tomato salad · Teter Farm, 12 mi … $19  +$3"
 * It embodies the whole value prop in one motion: pricing power from a credible local story.
 */
export function LivingMenuLine({
    dish = "Heirloom tomato salad",
    base = 16,
    lift = 3,
    farm = "Teter Farm",
    miles = 12,
    auto = true,
    className,
}: {
    dish?: string; base?: number; lift?: number; farm?: string; miles?: number; auto?: boolean; className?: string;
}) {
    const reduce = useReducedMotion();
    const [up, setUp] = React.useState(reduce ? true : false);

    React.useEffect(() => {
        if (!auto || reduce) return;
        const seq = () => { setUp(false); setTimeout(() => setUp(true), 900); };
        seq();
        const iv = setInterval(seq, 5200);
        return () => clearInterval(iv);
    }, [auto, reduce]);

    return (
        <button
            onClick={() => setUp((v) => !v)}
            className={`group w-full cursor-pointer select-none rounded-2xl border border-line bg-canvas-soft p-5 text-left shadow-card ${className ?? ""}`}
        >
            <div className="flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate font-display text-xl text-ink">{dish}</p>
                    <div className="mt-1 h-5 overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                            {up ? (
                                <motion.p
                                    key="prov"
                                    initial={reduce ? false : { y: 18, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={reduce ? undefined : { y: -18, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex items-center gap-1.5 text-[13px] font-medium text-brand-600"
                                >
                                    <MapPin size={13} /> {farm} · {miles} mi · verified local
                                </motion.p>
                            ) : (
                                <motion.p
                                    key="plain"
                                    initial={reduce ? false : { y: 18, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={reduce ? undefined : { y: -18, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="text-[13px] text-ink-faint"
                                >
                                    house greens
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-baseline gap-2.5 whitespace-nowrap">
                    <motion.span
                        key={up ? "high" : "low"}
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-mono text-2xl text-ink tnum"
                    >
                        {usd(up ? base + lift : base)}
                    </motion.span>
                    <AnimatePresence>
                        {up && (
                            <motion.span
                                initial={reduce ? false : { opacity: 0, scale: 0.8, x: -6 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="inline-flex items-center gap-0.5 rounded-full bg-harvest-400/15 px-2 py-0.5 font-mono text-sm font-medium text-harvest-500 tnum"
                            >
                                <ArrowUpRight size={13} /> {usd(lift)}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </button>
    );
}
