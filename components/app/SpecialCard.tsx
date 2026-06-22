"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore, farmById, WEEK_SPECIALS } from "@/lib/store";
import { AgentAvatar, AGENT_NAME } from "@/components/app/AgentDock";
import { usd } from "@/lib/utils";
import { Sparkle, ArrowRight, MapPin, MarginUp } from "@/components/icons";

const WEEKS = 4.345;

export function SpecialCard() {
    const router = useRouter();
    const lv = useStore((s) => s.levers);
    const covers = useStore((s) => s.restaurant.coversPerWeek);
    const [i, setI] = React.useState(0);
    const [spin, setSpin] = React.useState(false);

    const sp = WEEK_SPECIALS[i % WEEK_SPECIALS.length];
    const farm = farmById(sp.farmId);
    const monthly = Math.round(Math.max(0, lv.priceLift - lv.produceCostDelta) * covers * lv.attachRate * WEEKS);

    function another() { setSpin(true); setI((v) => v + 1); setTimeout(() => setSpin(false), 350); }
    function put() { router.push(`/app/sourcing/new?crop=${encodeURIComponent(sp.crop)}&unit=${sp.unit}&price=${sp.price}`); }

    return (
        <div className="mb-6 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50/80 via-canvas-soft to-canvas-soft shadow-card transition-shadow duration-200 hover:shadow-lift">
            <div className="flex items-center gap-2.5 border-b border-brand-100/70 px-5 py-3">
                <AgentAvatar size={26} />
                <p className="font-mono text-sm font-semibold tracking-tight text-ink">{AGENT_NAME} drafted this week's special</p>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-2xs font-semibold text-brand-600"><Sparkle size={11} /> Peak season</span>
            </div>

            <div className={`grid gap-5 p-5 sm:grid-cols-[1.5fr_1fr] sm:p-6 ${spin ? "animate-fade-up" : ""}`}>
                <div>
                    <h3 className="font-display text-2xl leading-tight text-ink">{sp.dishName}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{sp.description}</p>
                    <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-brand-700"><MapPin size={13} /> {farm?.name} · {farm?.distanceMi} mi · {farm?.location}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-2.5">
                        <button onClick={put} className="btn-primary btn-sm">Put it on the menu <ArrowRight size={15} /></button>
                        <button onClick={another} className="btn-ghost btn-sm">Show another</button>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-3 rounded-2xl border border-line bg-white/70 p-4">
                    <div><p className="text-2xs uppercase tracking-wide text-ink-faint">Menu price</p><p className="font-display text-3xl text-ink tnum">{usd(sp.price)}</p></div>
                    <div className="border-t border-line pt-3"><p className="flex items-center gap-1 text-2xs uppercase tracking-wide text-ink-faint"><MarginUp size={11} /> Adds about</p><p className="font-display text-2xl text-brand-600 tnum">{usd(monthly, { compact: monthly > 9999 })}<span className="text-sm text-ink-muted">/mo</span></p></div>
                </div>
            </div>
        </div>
    );
}
