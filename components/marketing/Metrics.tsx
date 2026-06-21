"use client";

import * as React from "react";

/** Afresh-style comprehensive impact band. Clear restaurant metrics with context. */
const METRICS: { to: number; prefix?: string; suffix?: string; name: string; context: string; tone?: "harvest" }[] = [
    { to: 30, prefix: "+", suffix: "%", name: "Pricing power", context: "The premium a farm-to-table dish can carry on the menu.", tone: "harvest" },
    { to: 12, prefix: "+", suffix: "%", name: "Profit margin", context: "Added margin on local dishes, close to pure profit." },
    { to: 95, suffix: "%", name: "Supply reliability", context: "Weeks the food arrives on time, backup farms included." },
    { to: 80, suffix: "%", name: "Guest preference", context: "Diners who favor a restaurant that sources locally.", tone: "harvest" },
    { to: 30, prefix: "+", suffix: "%", name: "Retention", context: "Longer a happy guest keeps coming back to you." },
    { to: 0, prefix: "~", suffix: "hrs", name: "Your effort", context: "Time you spend sourcing it. We run the whole thing." },
];

export function Metrics() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.25 });
        o.observe(el); return () => o.disconnect();
    }, []);
    return (
        <div ref={ref}>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                {METRICS.map((m, i) => (
                    <div key={m.name} className="bg-canvas-soft p-7">
                        <p className="font-display text-[3.2rem] leading-none text-ink tnum">
                            {m.prefix}{show ? <Counter to={m.to} delay={i * 90} /> : 0}<span className={m.tone === "harvest" ? "text-harvest-500" : "text-brand-500"}>{m.suffix}</span>
                        </p>
                        <p className="mt-4 font-display text-lg text-ink">{m.name}</p>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">{m.context}</p>
                    </div>
                ))}
            </div>
            <p className="mt-5 text-center text-2xs text-ink-faint">Figures from restaurant industry surveys and local-sourcing operators. Illustrative ranges.</p>
        </div>
    );
}

function Counter({ to, delay = 0 }: { to: number; delay?: number }) {
    const [v, setV] = React.useState(0);
    React.useEffect(() => {
        if (to === 0) { setV(0); return; }
        let raf = 0; let t0 = 0;
        const tick = (ts: number) => { if (!t0) t0 = ts; const e = ts - t0; if (e < delay) { raf = requestAnimationFrame(tick); return; } const p = Math.min(1, (e - delay) / 1000); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
    }, [to, delay]);
    return <>{v}</>;
}
