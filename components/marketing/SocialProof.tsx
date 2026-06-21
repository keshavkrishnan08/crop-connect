"use client";

import * as React from "react";

/** Honest, non-money proof points. Counts up on view. No invented user counts. */
const STATS: { to: number; suffix?: string; prefix?: string; label: string }[] = [
    { to: 97, suffix: "%", label: "of a restaurant's revenue is cost" },
    { to: 2, label: "steps you actually do" },
    { to: 0, label: "to set up" },
    { to: 1, label: "ingredient to start" },
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
        <div ref={ref} className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {STATS.map((s) => (
                <div key={s.label} className="bg-canvas-soft px-5 py-6 text-center">
                    <p className="font-display text-4xl text-ink tnum">{s.prefix}{show ? <Counter to={s.to} /> : 0}{s.suffix}</p>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-ink-muted">{s.label}</p>
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
