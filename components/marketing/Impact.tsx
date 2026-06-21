"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MarginUp } from "@/components/icons";

// Grounded figures. Demand stats are from US restaurant industry surveys; the price
// premium and the monthly number are conservative models with the math shown.
const METRICS: { prefix?: string; to: number; suffix: string; label: string }[] = [
    { to: 38, suffix: "%", label: "more likely to choose a restaurant with locally sourced food" },
    { to: 55, suffix: "%", label: "want to know the story behind their food" },
    { to: 76, suffix: "%", label: "say ingredient transparency matters to them" },
];
const PER_MONTH = 3200;

/** One impact gallery: real demand metrics + the modeled $ we add per restaurant per month. */
export function Impact() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.25 });
        o.observe(el); return () => o.disconnect();
    }, []);
    return (
        <div ref={ref}>
            <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-line bg-line gap-px sm:grid-cols-3">
                {METRICS.map((m, i) => (
                    <div key={m.label} className="bg-canvas-soft px-6 py-8 text-center">
                        <p className="font-display text-[3.2rem] leading-none text-ink tnum sm:text-[3.6rem]">{m.prefix}{show ? <Counter to={m.to} delay={i * 90} /> : 0}<span className="text-harvest-500">{m.suffix}</span></p>
                        <p className="mx-auto mt-2.5 max-w-[13rem] text-[14px] leading-snug text-ink-muted">{m.label}</p>
                    </div>
                ))}
            </div>

            {/* the headline number: what we add per restaurant, per month — with the math */}
            <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="relative mt-4 overflow-hidden rounded-3xl border border-brand-800 bg-gradient-to-br from-brand-700 to-brand-900 p-9 text-center text-white sm:p-12">
                <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]" />
                <div className="relative">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-2xs font-semibold uppercase tracking-[0.16em] text-white/80"><MarginUp size={13} /> On average</span>
                    <p className="mt-5 font-display text-[3.6rem] leading-none tnum sm:text-[5rem]">+${show ? <Counter to={PER_MONTH} delay={350} /> : 0}<span className="text-3xl text-harvest-300 sm:text-4xl">/mo</span></p>
                    <p className="mx-auto mt-3 max-w-md text-lg text-white/80">in extra margin we add to a restaurant every month</p>
                    <p className="mx-auto mt-4 max-w-md text-[12.5px] text-white/55">The math: about 150 covers a week on local dishes at roughly $5 more margin each. 150 x $5 x 4.3 weeks.</p>
                </div>
            </motion.div>

            <p className="mt-4 text-center text-2xs text-ink-faint">Demand figures from National Restaurant Association and FMI consumer surveys. The monthly figure is a conservative model, shown above.</p>
        </div>
    );
}

function Counter({ to, delay = 0 }: { to: number; delay?: number }) {
    const [v, setV] = React.useState(0);
    React.useEffect(() => {
        let raf = 0; let t0 = 0;
        const tick = (ts: number) => { if (!t0) t0 = ts; const e = ts - t0; if (e < delay) { raf = requestAnimationFrame(tick); return; } const p = Math.min(1, (e - delay) / 1100); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
    }, [to, delay]);
    return <>{v.toLocaleString()}</>;
}
