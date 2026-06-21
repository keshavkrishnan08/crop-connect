"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MarginUp } from "@/components/icons";

/** Headline business outcomes restaurants on a local program tend to see. Illustrative. */
const STATS: { to: number; prefix?: string; suffix: string; label: string }[] = [
    { to: 12, prefix: "+", suffix: "%", label: "higher profit margin" },
    { to: 18, prefix: "+", suffix: "%", label: "bigger average check" },
    { to: 95, suffix: "%", label: "consistent food service" },
    { to: 10, prefix: "+", suffix: "%", label: "more new leads" },
    { to: 30, prefix: "+", suffix: "%", label: "longer customer retention" },
    { to: 20, prefix: "+", suffix: "%", label: "more repeat visits" },
];
const COMBINED = 34;

export function Outcomes() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.2 });
        o.observe(el); return () => o.disconnect();
    }, []);
    return (
        <div ref={ref}>
            <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3 gap-px">
                {STATS.map((s, i) => (
                    <div key={s.label} className="bg-canvas-soft px-5 py-8 text-center">
                        <p className="font-display text-[3.4rem] leading-none text-ink tnum sm:text-[4rem]">{s.prefix}{show ? <Counter to={s.to} delay={i * 80} /> : 0}<span className="text-harvest-500">{s.suffix}</span></p>
                        <p className="mx-auto mt-2.5 max-w-[11rem] text-[14px] leading-snug text-ink-muted">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* the bottom line, everything combined */}
            <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="relative mt-4 overflow-hidden rounded-3xl border border-brand-800 bg-gradient-to-br from-brand-700 to-brand-900 p-9 text-center text-white sm:p-12">
                <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]" />
                <div className="relative">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-2xs font-semibold uppercase tracking-[0.16em] text-white/80"><MarginUp size={13} /> Everything combined</span>
                    <p className="mt-5 font-display text-[4.5rem] leading-none tnum sm:text-[6rem]">+{show ? <Counter to={COMBINED} delay={400} /> : 0}<span className="text-harvest-300">%</span></p>
                    <p className="mx-auto mt-3 max-w-md text-lg text-white/80">estimated higher annual profit when every gain above compounds</p>
                </div>
            </motion.div>

            <p className="mt-4 text-center text-2xs text-ink-faint">What restaurants running a local program tend to see. Figures from local-sourcing operators. Illustrative.</p>
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
    return <>{v}</>;
}
