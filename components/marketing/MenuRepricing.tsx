"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowUpRight } from "@/components/icons";

const ROWS: { name: string; farm: string; old: number; now: number }[] = [
    { name: "Heirloom tomato salad", farm: "Teter Farm", old: 16, now: 19 },
    { name: "Roasted beets and citrus", farm: "Marsh Hollow", old: 14, now: 16 },
    { name: "Grilled summer squash", farm: "Sunfield Acres", old: 15, now: 18 },
    { name: "Market greens", farm: "Blue Oak", old: 12, now: 14 },
];

/** A real menu: old prices struck out, new local prices in. Shows the whole value prop. */
export function MenuRepricing() {
    return (
        <div className="w-full rounded-3xl border border-line bg-white p-7 shadow-card sm:p-8">
            <div className="mb-5 flex items-center justify-between">
                <p className="font-display text-xl text-ink">Dinner</p>
                <span className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Tonight</span>
            </div>
            <div className="space-y-1">
                {ROWS.map((r, i) => (
                    <motion.div key={r.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: i * 0.12 }}
                        className="flex items-center gap-3 border-b border-line/60 py-3.5 last:border-0 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-[17px] leading-tight text-ink">{r.name}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-brand-600"><MapPin size={11} /> {r.farm}</p>
                        </div>
                        <span className="relative font-mono text-[15px] text-ink-faint tnum">
                            ${r.old}
                            <motion.span className="absolute left-0 top-1/2 h-px w-full origin-left bg-ink-faint/70" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.3, duration: 0.3 }} />
                        </span>
                        <span className="font-mono text-xl text-ink tnum">${r.now}</span>
                        <motion.span initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.45, type: "spring", stiffness: 320 }}
                            className="inline-flex w-12 items-center justify-center gap-0.5 rounded-full bg-harvest-400/15 py-0.5 font-mono text-[12px] font-medium text-harvest-500 tnum">
                            <ArrowUpRight size={11} /> {r.now - r.old}
                        </motion.span>
                    </motion.div>
                ))}
            </div>
            <p className="mt-5 text-center text-[13px] text-ink-muted">Same plates. The story is what people pay for.</p>
        </div>
    );
}
