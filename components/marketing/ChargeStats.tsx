"use client";

import * as React from "react";

/** How much more a farm-to-table menu can charge. Illustrative industry menu data. */
const STATS: { to: number; prefix?: string; suffix?: string; label: string }[] = [
    { to: 30, suffix: "%", label: "higher menu price a farm-to-table dish can carry" },
    { to: 25, suffix: "%", label: "more guests will pay when the farm is named" },
    { to: 18, suffix: "%", label: "average check lift on a local-forward menu" },
];

export function ChargeStats() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.4 });
        o.observe(el); return () => o.disconnect();
    }, []);
    return (
        <div ref={ref}>
            <p className="mb-8 text-center text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Just how much more</p>
            <div className="grid gap-8 text-center sm:grid-cols-3">
                {STATS.map((s, i) => (
                    <div key={s.label} className="px-2">
                        <p className="font-display text-[3.4rem] leading-none text-ink tnum">{s.prefix}{show ? <Counter to={s.to} delay={i * 120} /> : 0}<span className="text-harvest-500">{s.suffix}</span></p>
                        <p className="mx-auto mt-3 max-w-[14rem] text-[14px] leading-snug text-ink-muted">{s.label}</p>
                    </div>
                ))}
            </div>
            <p className="mt-8 text-center text-2xs text-ink-faint">Farm-to-table pricing, from restaurant menu data.</p>
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
