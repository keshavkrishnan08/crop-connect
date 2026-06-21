"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { actions } from "@/lib/store";
import { AgentAvatar, AGENT_NAME } from "@/components/app/AgentDock";
import { Search, Shield, Pen, Truck, StoryTag, Check, ArrowRight, Sparkle } from "@/components/icons";
import { cn } from "@/lib/utils";

const STEPS = [
    { icon: Search, label: "Scanning farms near you", done: "Found local matches" },
    { icon: Shield, label: "Vetting the best one", done: "Vetted and ranked" },
    { icon: Pen, label: "Locking in your agreement", done: "Agreement drafted" },
    { icon: Truck, label: "Scheduling weekly deliveries", done: "8 deliveries scheduled" },
    { icon: StoryTag, label: "Preparing your provenance", done: "Menu proof ready" },
];

/** The autonomous loop, made visible. Plays the work the engine does for you. */
export function AutonomousRun({ itemId, crop, onDone }: { itemId: string; crop: string; onDone: () => void }) {
    const [step, setStep] = React.useState(0);
    const done = step >= STEPS.length;

    React.useEffect(() => {
        if (done) return;
        const t = setTimeout(() => {
            if (step === 2) actions.autoSource(itemId); // do the real work at the agreement step
            setStep((s) => s + 1);
        }, step === 0 ? 650 : 950);
        return () => clearTimeout(t);
    }, [step, done, itemId]);

    return (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-ink/30 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-canvas-soft shadow-lift">
                <div className="relative border-b border-line bg-gradient-to-br from-brand-50/70 to-transparent p-6">
                    <div className="flex items-center gap-3">
                        <AgentAvatar size={44} active={!done} />
                        <div>
                            <p className="font-display text-xl leading-tight text-ink">{done ? `${AGENT_NAME} handled it` : `${AGENT_NAME} is sourcing your ${crop}`}</p>
                            <p className="text-[13px] text-ink-muted">{done ? "Everything below is done. You did not lift a finger." : "Your agent is on it. Sit back."}</p>
                        </div>
                    </div>
                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-canvas-sunk">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" animate={{ width: `${(Math.min(step, STEPS.length) / STEPS.length) * 100}%` }} transition={{ ease: "easeOut" }} />
                    </div>
                </div>

                <div className="space-y-1 p-4">
                    {STEPS.map((s, i) => {
                        const st = i < step ? "done" : i === step ? "running" : "pending";
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors",
                                    st === "done" ? "bg-brand-50 text-brand-600" : st === "running" ? "bg-brand-500 text-white" : "bg-canvas-sunk text-ink-faint")}>
                                    <AnimatePresence mode="wait">
                                        {st === "done" ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={17} /></motion.span>
                                            : st === "running" ? <motion.span key="r"><Spinner /></motion.span>
                                                : <motion.span key="p"><Icon size={17} /></motion.span>}
                                    </AnimatePresence>
                                </span>
                                <span className={cn("flex-1 text-sm font-medium", st === "pending" ? "text-ink-faint" : "text-ink")}>
                                    {st === "done" ? s.done : s.label}
                                </span>
                                {st === "running" && <span className="text-2xs font-semibold uppercase tracking-wide text-brand-600">Working</span>}
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {done && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-t border-line p-4">
                            <div className="mb-3 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600"><Sparkle size={15} /> Done. You did not lift a finger.</div>
                            <button onClick={onDone} className="btn-primary w-full">See it running <ArrowRight size={16} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function Spinner() {
    return <svg width="17" height="17" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" /><path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}
