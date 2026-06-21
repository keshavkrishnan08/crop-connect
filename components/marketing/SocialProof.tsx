"use client";

import * as React from "react";

/** Honest, non-money proof points. Counts up on view. */
const STATS: { to: number; suffix?: string; label: string }[] = [
    { to: 97, suffix: "%", label: "of revenue is cost" },
    { to: 10, suffix: "min", label: "to set up" },
    { to: 2, label: "steps for you" },
    { to: 1, label: "dish to start" },
];

export function SocialProof() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.5 });
        o.observe(el); return () => o.disconnect();
    }, []);
    return (
        <div ref={ref} className="flex flex-wrap items-stretch justify-center">
            {STATS.map((s, i) => (
                <div key={s.label} className="min-w-[112px] flex-1 border-l border-line/70 px-6 first:border-l-0">
                    <p className="font-display text-[2.6rem] leading-none text-ink tnum">{show ? <Counter to={s.to} /> : 0}<span className="ml-0.5 align-baseline text-[0.5em] font-medium text-harvest-500">{s.suffix}</span></p>
                    <p className="mt-2 text-[13px] text-ink-muted">{s.label}</p>
                </div>
            ))}
        </div>
    );
}

function Counter({ to }: { to: number }) {
    const [v, setV] = React.useState(0);
    React.useEffect(() => {
        if (to === 0) { setV(0); return; }
        let raf = 0; let t0 = 0;
        const tick = (ts: number) => { if (!t0) t0 = ts; const p = Math.min(1, (ts - t0) / 900); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
    }, [to]);
    return <>{v}</>;
}
