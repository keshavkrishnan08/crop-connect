"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Shield, Leaf, MapPin, Calendar, Truck, MarginUp, Receipt, ArrowRight } from "@/components/icons";
import { CountUp } from "@/components/ui/CountUp";
import { usd, cn } from "@/lib/utils";

/* ---------- PROBLEM: the thin profit sliver ---------- */
export function MarginSliver() {
    return (
        <div className="card p-6">
            <p className="mb-4 text-2xs font-semibold uppercase tracking-wide text-ink-faint">Out of every dollar a restaurant takes in</p>
            <div className="flex h-12 overflow-hidden rounded-xl">
                <div className="flex flex-1 items-center pl-4 text-sm font-medium text-ink-soft" style={{ background: "repeating-linear-gradient(135deg, #EDEFE7, #EDEFE7 10px, #E7E9E0 10px, #E7E9E0 20px)" }}>Food, labor, rent, everything</div>
                <motion.div className="grid w-[6%] place-items-center bg-harvest-400" animate={{ opacity: [1, 0.55, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
            <div className="mt-3 flex justify-between font-mono text-2xs text-ink-faint tnum"><span>≈ 95 cents of cost</span><span className="text-harvest-500">≈ 4 cents kept</span></div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">Independent restaurants keep three to five cents on the dollar. There is almost no room to cut costs. The only real lever is charging more for what is already on the plate.</p>
        </div>
    );
}

/* ---------- BEST RESULT: a margin meter ---------- */
export function ResultMeter() {
    const ref = React.useRef<HTMLDivElement>(null);
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const o = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { threshold: 0.4 });
        o.observe(el); return () => o.disconnect();
    }, []);
    const bars = [22, 34, 41, 55, 63, 78, 88, 100];
    return (
        <div ref={ref} className="card relative overflow-hidden p-7">
            <div className="pointer-events-none absolute inset-0 bg-aura" />
            <div className="relative">
                <p className="text-2xs font-semibold uppercase tracking-wide text-harvest-500">New margin, per month</p>
                <p className="mt-2 font-display text-6xl leading-none text-ink"><span className="value-pos">{show ? <CountUp to={3200} format={(n) => usd(n)} /> : usd(0)}</span></p>
                <p className="mt-2 text-[15px] text-ink-muted">From four dishes priced for what they are. Same kitchen. Same covers.</p>
                <div className="mt-6 flex h-28 items-end gap-2">
                    {bars.map((h, i) => (
                        <motion.div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-harvest-300 to-harvest-400" initial={{ height: 0 }} animate={show ? { height: `${h}%` } : { height: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
                    ))}
                </div>
                <p className="mt-2 font-mono text-2xs text-ink-faint tnum">first dish goes live → all four live</p>
            </div>
        </div>
    );
}

/* ---------- SOURCING: a vetting card ---------- */
export function FarmVetCard() {
    const checks = [
        { i: <MapPin size={15} />, t: "12 miles from your kitchen" },
        { i: <Shield size={15} />, t: "96 percent on-time over 2 years" },
        { i: <Leaf size={15} />, t: "Certified organic, no-till" },
        { i: <Receipt size={15} />, t: "Price confirmed inside your ceiling" },
    ];
    return (
        <div className="card p-6">
            <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600 font-display text-lg text-white">TF</span>
                <div><p className="font-display text-xl text-ink">Teter Farm</p><p className="text-[13px] text-ink-muted">Maria Teter · Sebastopol</p></div>
                <span className="ml-auto badge-brand"><Check size={12} /> Vetted</span>
            </div>
            <div className="mt-5 space-y-2.5">
                {checks.map((c, i) => (
                    <motion.div key={c.t} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="flex items-center gap-3 rounded-lg bg-canvas px-3 py-2.5">
                        <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-50 text-brand-600">{c.i}</span>
                        <span className="text-sm text-ink-soft">{c.t}</span>
                        <Check size={16} className="ml-auto text-brand-500" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

/* ---------- DELIVERY: a recurring weekly schedule ---------- */
export function DeliverySchedule() {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const drop = 1; // Tuesday
    return (
        <div className="card p-6">
            <div className="mb-4 flex items-center gap-2"><Calendar size={18} className="text-brand-600" /><p className="font-display text-lg text-ink">Every Tuesday, automatically</p></div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, i) => {
                    const isDrop = i % 7 === drop;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 7) * 0.03 + Math.floor(i / 7) * 0.08 }}
                            className={cn("grid aspect-square place-items-center rounded-lg border text-2xs", isDrop ? "border-brand-400 bg-brand-50 text-brand-600" : "border-line bg-white text-ink-faint")}>
                            {isDrop ? <Truck size={14} /> : i % 7 < 5 ? <span className="h-1 w-1 rounded-full bg-ink-faint/40" /> : null}
                        </motion.div>
                    );
                })}
            </div>
            <div className="mt-4 flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-1.5 text-ink-muted"><span className="h-3 w-3 rounded bg-brand-50 ring-1 ring-brand-400" /> Delivery arrives</span>
                <span className="font-mono text-ink-faint tnum">4 weeks shown</span>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">You set the day. We schedule the farm, arrange the courier, and confirm every drop. If a crop comes up short, a backup farm covers it. You never chase anyone.</p>
        </div>
    );
}

/* ---------- BUSINESS MODEL: money flow ---------- */
export function MoneyFlow() {
    return (
        <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1.3fr_auto_1fr]">
            <Block tone="ink" head="You pay" big="$499" unit="/ month" sub="One flat fee. Not a markup on food. Not a cut of your sales." icon={<Receipt size={20} />} />
            <Arrow />
            <Block tone="brand" head="We handle" big="Everything" sub="Sourcing, vetting, the contract, weekly delivery, the provenance, the margin tracking." icon={<Truck size={20} />} wide />
            <Arrow />
            <Block tone="harvest" head="You keep" big="100%" unit="of new margin" sub="Every extra dollar your menu earns stays yours." icon={<MarginUp size={20} />} />
        </div>
    );
}
function Block({ tone, head, big, unit, sub, icon, wide }: { tone: "ink" | "brand" | "harvest"; head: string; big: string; unit?: string; sub: string; icon: React.ReactNode; wide?: boolean }) {
    const t = tone === "harvest" ? "text-harvest-500" : tone === "brand" ? "text-brand-600" : "text-ink";
    const bg = tone === "harvest" ? "bg-harvest-400/12 text-harvest-500" : tone === "brand" ? "bg-brand-50 text-brand-600" : "bg-ink/[0.06] text-ink-soft";
    return (
        <div className={cn("card flex flex-col p-6", wide && "ring-1 ring-brand-100")}>
            <span className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", bg)}>{icon}</span>
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">{head}</p>
            <p className={cn("mt-1 font-display text-4xl leading-none", t)}>{big}{unit && <span className="text-base font-normal text-ink-muted"> {unit}</span>}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{sub}</p>
        </div>
    );
}
function Arrow() { return <div className="hidden items-center justify-center lg:flex"><ArrowRight size={22} className="text-ink-faint" /></div>; }
