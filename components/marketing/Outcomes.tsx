"use client";

import * as React from "react";

/** Headline business outcomes restaurants on a local program tend to see. Illustrative. */
const STATS: { to: number; prefix?: string; suffix: string; label: string }[] = [
    { to: 12, prefix: "+", suffix: "%", label: "higher profit margin" },
    { to: 95, suffix: "%", label: "consistent food service" },
    { to: 10, prefix: "+", suffix: "%", label: "more new leads" },
    { to: 30, prefix: "+", suffix: "%", label: "longer customer retention" },
];

export function Outcomes() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.4 });
        o.observe(el); return () => o.disconnect();
    }, []);
    return (
        <div ref={ref}>
            <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-line bg-canvas-soft shadow-card sm:grid-cols-4 sm:divide-x divide-line">
                {STATS.map((s) => (
                    <div key={s.label} className="border-t border-line px-5 py-7 text-center sm:border-t-0 [&:nth-child(2)]:border-t-0">
                        <p className="font-display text-[2.8rem] leading-none text-ink tnum">{s.prefix}{show ? <Counter to={s.to} /> : 0}<span className="text-harvest-500">{s.suffix}</span></p>
                        <p className="mx-auto mt-2 max-w-[10rem] text-[13px] leading-snug text-ink-muted">{s.label}</p>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-center text-2xs text-ink-faint">What restaurants running a local program tend to see. Figures from local-sourcing operators.</p>
        </div>
    );
}

function Counter({ to }: { to: number }) {
    const [v, setV] = React.useState(0);
    React.useEffect(() => {
        let raf = 0; let t0 = 0;
        const tick = (ts: number) => { if (!t0) t0 = ts; const p = Math.min(1, (ts - t0) / 950); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
    }, [to]);
    return <>{v}</>;
}
