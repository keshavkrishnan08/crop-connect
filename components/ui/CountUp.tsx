"use client";

import * as React from "react";

/** Animated number that counts up to `to` once it mounts. Respects reduced motion. */
export function CountUp({
    to, duration = 1100, format = (n) => Math.round(n).toString(), className,
}: {
    to: number; duration?: number; format?: (n: number) => string; className?: string;
}) {
    const [val, setVal] = React.useState(0);
    const ref = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduce || to === 0) { setVal(to); return; }
        let raf = 0;
        let start = 0;
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const tick = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min(1, (ts - start) / duration);
            setVal(to * ease(p));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [to, duration]);

    return <span ref={ref} className={className}>{format(val)}</span>;
}
