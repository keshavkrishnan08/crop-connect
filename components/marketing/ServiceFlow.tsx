"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Leaf, Check, Truck, MapPin, MarginUp, ArrowRight, Search } from "@/components/icons";
import { cn } from "@/lib/utils";

const ACTS = [
    { key: "ask", label: "You tell us", caption: "Say what you want on the menu." },
    { key: "source", label: "We source", caption: "We find and vet the farm." },
    { key: "deliver", label: "We deliver", caption: "It arrives at your door weekly." },
    { key: "earn", label: "You profit", caption: "It goes live and makes money." },
];

/** The "video": a self-running scene that morphs through the whole service. */
export function ServiceFlow() {
    const reduce = useReducedMotion();
    const [act, setAct] = React.useState(0);

    React.useEffect(() => {
        const iv = setInterval(() => setAct((a) => (a + 1) % ACTS.length), 2600);
        return () => clearInterval(iv);
    }, []);

    return (
        <div className="glass overflow-hidden rounded-3xl p-2">
            {/* stage */}
            <div className="relative h-[360px] overflow-hidden rounded-2xl border border-line bg-canvas-soft sm:h-[400px]">
                <div className="pointer-events-none absolute inset-0 bg-dots opacity-50" />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={act}
                        initial={reduce ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, y: -14 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 grid place-items-center p-6"
                    >
                        {act === 0 && <AskScene />}
                        {act === 1 && <SourceScene />}
                        {act === 2 && <DeliverScene />}
                        {act === 3 && <EarnScene />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* step rail */}
            <div className="grid grid-cols-4 gap-1.5 p-2">
                {ACTS.map((a, i) => (
                    <button key={a.key} onClick={() => setAct(i)} className="group text-left">
                        <div className="h-1 overflow-hidden rounded-full bg-line">
                            <motion.div className="h-full rounded-full bg-brand-500" initial={false} animate={{ width: i < act ? "100%" : i === act ? "100%" : "0%" }} transition={{ duration: i === act && !reduce ? 2.6 : 0.3, ease: "linear" }} />
                        </div>
                        <p className={cn("mt-2 text-[13px] font-semibold transition", i === act ? "text-ink" : "text-ink-faint")}>{a.label}</p>
                        <p className="hidden text-[12px] text-ink-muted sm:block">{a.caption}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
    return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cn("rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm", className)}>{children}</motion.div>;
}

function AskScene() {
    return (
        <div className="w-full max-w-sm space-y-2.5">
            <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-brand-600">Your request</p>
            <Pill><span className="text-ink-faint">Ingredient</span> <span className="float-right font-medium text-ink">Heirloom tomatoes</span></Pill>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}><Pill><span className="text-ink-faint">Amount</span> <span className="float-right font-mono font-medium text-ink tnum">40 lb / week</span></Pill></motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}><Pill><span className="text-ink-faint">For the dish</span> <span className="float-right font-medium text-ink">Tomato salad</span></Pill></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.95 }} className="btn-primary mt-1 w-full">Send to CropConnect <ArrowRight size={15} /></motion.div>
        </div>
    );
}

function SourceScene() {
    const farms = [{ n: "Teter Farm", d: "12 mi", s: 96 }, { n: "Blue Oak Gardens", d: "18 mi", s: 88 }, { n: "Sunfield Acres", d: "9 mi", s: 84 }];
    return (
        <div className="w-full max-w-sm space-y-2.5">
            <p className="mb-1 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-brand-600"><Search size={12} /> Matching local farms</p>
            {farms.map((f, i) => (
                <motion.div key={f.n} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.18 }}
                    className={cn("flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 shadow-sm", i === 0 ? "border-brand-400 ring-2 ring-brand-400/20" : "border-line")}>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><Leaf size={16} /></span>
                    <div className="flex-1"><p className="text-sm font-semibold text-ink">{f.n}</p><p className="flex items-center gap-1 text-[12px] text-ink-muted"><MapPin size={11} /> {f.d}</p></div>
                    <span className="font-mono text-sm font-medium text-brand-600 tnum">{f.s}</span>
                    {i === 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }} className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-white"><Check size={14} /></motion.span>}
                </motion.div>
            ))}
        </div>
    );
}

function DeliverScene() {
    const reduce = useReducedMotion();
    return (
        <div className="w-full max-w-md">
            <p className="mb-4 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-brand-600"><Truck size={12} /> On its way to your door</p>
            <div className="relative mx-2 flex items-center justify-between">
                <div className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 rounded bg-line" />
                <motion.div className="absolute left-6 top-1/2 h-0.5 -translate-y-1/2 rounded bg-brand-400" initial={{ width: 0 }} animate={{ width: reduce ? "84%" : "84%" }} transition={{ duration: 1.6, ease: "easeInOut" }} style={{ maxWidth: "calc(100% - 3rem)" }} />
                <Node icon={<Leaf size={16} />} label="Farm" />
                {!reduce && <motion.span className="absolute top-1/2 -mt-3.5 grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-white shadow-brand" initial={{ left: "1.5rem" }} animate={{ left: "calc(100% - 3rem)" }} transition={{ duration: 1.6, ease: "easeInOut" }}><Truck size={14} /></motion.span>}
                <Node icon={<MapPin size={16} />} label="Your kitchen" active />
            </div>
            <div className="mt-6 flex justify-center gap-2">
                {["Harvested", "Picked up", "Delivered"].map((s, i) => (
                    <motion.span key={s} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.5 }} className="badge-brand">{s}</motion.span>
                ))}
            </div>
        </div>
    );
}
function Node({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
    return <div className="relative z-10 flex flex-col items-center gap-1.5"><span className={cn("grid h-11 w-11 place-items-center rounded-xl border bg-white", active ? "border-brand-400 text-brand-600" : "border-line text-ink-soft")}>{icon}</span><span className="text-2xs font-semibold text-ink-soft">{label}</span></div>;
}

function EarnScene() {
    return (
        <div className="w-full max-w-sm">
            <p className="mb-3 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-brand-600"><MarginUp size={12} /> Live on your menu</p>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <p className="font-display text-2xl text-ink">Tomato salad</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium text-brand-600"><MapPin size={13} /> Teter Farm</p>
                <div className="my-4 divider" />
                <div className="flex items-end justify-between">
                    <p className="text-sm font-medium text-ink-soft">More margin per plate</p>
                    <div className="flex items-end gap-1.5">{[40, 58, 72, 88, 100].map((h, i) => <motion.span key={i} className="w-2.5 rounded-t bg-harvest-400" initial={{ height: 0 }} animate={{ height: h * 0.42 }} transition={{ delay: 0.2 + i * 0.1 }} />)}</div>
                </div>
            </div>
        </div>
    );
}
