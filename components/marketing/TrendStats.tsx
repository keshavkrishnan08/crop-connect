"use client";

import * as React from "react";
import { TrendUp } from "@/components/icons";

/** Consumer-behavior trends: demand for farm-to-table is rising. Illustrative. */
const TRENDS: { to: number; prefix?: string; suffix: string; label: string }[] = [
    { to: 50, prefix: "+", suffix: "%", label: "more interest in farm-to-table than five years ago" },
    { to: 73, suffix: "%", label: "of diners want to know where their food comes from" },
    { to: 65, suffix: "%", label: "of younger diners pick local-sourcing spots first" },
];

export function TrendStats() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.3 });
        o.observe(el); return () => o.disconnect();
    }, []);
    return (
        <div ref={ref} className="grid gap-4 sm:grid-cols-3">
            {TRENDS.map((t, i) => (
                <div key={t.label} className="rounded-2xl border border-line bg-white p-6 shadow-card">
                    <div className="mb-3 flex items-center gap-1.5 text-brand-600">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50"><TrendUp size={15} /></span>
                        <span className="text-2xs font-semibold uppercase tracking-wide">Trending up</span>
                    </div>
                    <p className="font-display text-[2.8rem] leading-none text-ink tnum">{t.prefix}{show ? <Counter to={t.to} delay={i * 100} /> : 0}<span className="text-harvest-500">{t.suffix}</span></p>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted">{t.label}</p>
                </div>
            ))}
        </div>
    );
}

function Counter({ to, delay = 0 }: { to: number; delay?: number }) {
    const [v, setV] = React.useState(0);
    React.useEffect(() => {
        let raf = 0; let t0 = 0;
        const tick = (ts: number) => { if (!t0) t0 = ts; const e = ts - t0; if (e < delay) { raf = requestAnimationFrame(tick); return; } const p = Math.min(1, (e - delay) / 1000); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
    }, [to, delay]);
    return <>{v}</>;
}
