"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus } from "@/components/icons";
import { cn } from "@/lib/utils";

const ITEMS: { q: string; a: string }[] = [
    { q: "Will my guests actually pay more?", a: "Yes, when the value is on the plate and on the menu. A named local farm and a fresher product give people a reason to pick the dish and feel good about the price. You set the prices. We give you the proof to stand behind them." },
    { q: "How fast can I start?", a: "About ten minutes. You share your menu, pick one ingredient to begin with, and we take it from there. No installs, no integrations, no training your staff." },
    { q: "Do you mark up the food?", a: "No. We are not a distributor. You pay a flat fee for the service. The price you agree with the farm is the price you pay." },
    { q: "Do you take a cut of our sales?", a: "No. Every extra dollar your menu earns is yours to keep." },
    { q: "What if a crop comes up short?", a: "A backup farm covers you. There is no penalty and no scramble. You are never left without it." },
    { q: "Who actually delivers?", a: "We do. We schedule the farm, arrange the courier, and confirm every drop. You stay in the kitchen." },
    { q: "Do we have to commit to a volume?", a: "You set it. Start with one ingredient for one week. Scale when you want." },
    { q: "Can we cancel?", a: "Yes. It is month to month. No lock-in." },
];

export function Faq() {
    const [open, setOpen] = React.useState<number | null>(0);
    const reduce = useReducedMotion();
    return (
        <div className="mx-auto max-w-2xl divide-y divide-line overflow-hidden rounded-3xl border border-line bg-canvas-soft">
            {ITEMS.map((it, i) => {
                const isOpen = open === i;
                return (
                    <div key={it.q}>
                        <button
                            onClick={() => setOpen(isOpen ? null : i)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/40"
                        >
                            <span className="font-display text-lg text-ink">{it.q}</span>
                            <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300", isOpen ? "rotate-45 border-brand-500 bg-brand-500 text-white" : "border-line text-ink-soft")}>
                                <Plus size={15} />
                            </span>
                        </button>
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={reduce ? false : { height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-6 pb-6 text-[15px] leading-relaxed text-ink-muted">{it.a}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
