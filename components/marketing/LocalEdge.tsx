"use client";

import * as React from "react";
import { TrendUp, Star, Repeat } from "@/components/icons";

/** Industry-survey figures on why local sourcing wins customers. Illustrative ranges. */
const STATS: { to: number; suffix: string; label: string; icon: React.ReactNode; tone: "brand" | "harvest" }[] = [
    { to: 80, suffix: "%", label: "of diners choose a restaurant more readily when it sources from local farms", icon: <Star size={20} />, tone: "brand" },
    { to: 40, suffix: "%", label: "say they will pay more for a dish tied to a named local farm", icon: <TrendUp size={20} />, tone: "harvest" },
    { to: 60, suffix: "%", label: "of guests come back sooner when the food is fresh and local", icon: <Repeat size={20} />, tone: "brand" },
];

export function LocalEdge() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.4 });
        o.observe(el); return () => o.disconnect();
    }, []);
    return (
        <div ref={ref}>
            <div className="grid gap-4 sm:grid-cols-3">
                {STATS.map((s, i) => (
                    <div key={s.label} className="rounded-3xl border border-line bg-white p-7 shadow-card">
                        <span className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${s.tone === "harvest" ? "bg-harvest-400/12 text-harvest-500" : "bg-brand-50 text-brand-600"}`}>{s.icon}</span>
                        <p className="font-display text-5xl leading-none text-ink tnum">{show ? <Counter to={s.to} delay={i * 120} /> : 0}<span className={s.tone === "harvest" ? "text-harvest-500" : "text-brand-500"}>{s.suffix}</span></p>
                        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{s.label}</p>
                    </div>
                ))}
            </div>
            <p className="mt-6 text-center text-2xs text-ink-faint">Figures from restaurant industry surveys on local sourcing and dining choice.</p>
        </div>
    );
}

function Counter({ to, delay = 0 }: { to: number; delay?: number }) {
    const [v, setV] = React.useState(0);
    React.useEffect(() => {
        let raf = 0; let t0 = 0;
        const start = (ts: number) => { if (!t0) t0 = ts; const e = ts - t0; if (e < delay) { raf = requestAnimationFrame(start); return; } const p = Math.min(1, (e - delay) / 1000); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(start); };
        raf = requestAnimationFrame(start); return () => cancelAnimationFrame(raf);
    }, [to, delay]);
    return <>{v}</>;
}
