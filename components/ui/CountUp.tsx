"use client";

import * as React from "react";

/** Animated number — counts up on mount or whenever `to` changes. Respects reduced motion. */
export function CountUp({ to, duration = 900, format = (n) => Math.round(n).toString(), className }: { to: number; duration?: number; format?: (n: number) => string; className?: string }) {
    const [val, setVal] = React.useState(to);
    const from = React.useRef(to);
    React.useEffect(() => {
        const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const start = from.current;
        if (reduce || start === to) { setVal(to); from.current = to; return; }
        let raf = 0; let t0 = 0;
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const tick = (ts: number) => {
            if (!t0) t0 = ts;
            const p = Math.min(1, (ts - t0) / duration);
            setVal(start + (to - start) * ease(p));
            if (p < 1) raf = requestAnimationFrame(tick); else from.current = to;
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [to, duration]);
    return <span className={className}>{format(val)}</span>;
}
