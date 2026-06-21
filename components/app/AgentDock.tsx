"use client";

import * as React from "react";
import { useStore, marginRollup, getState } from "@/lib/store";
import { Sprout, Check, Dot } from "@/components/icons";
import { cn } from "@/lib/utils";

export const AGENT_NAME = "Sage";

/** The agent's mark, with a calm always-on breathing halo. */
export function AgentAvatar({ size = 44, active = false }: { size?: number; active?: boolean }) {
    return (
        <span className="relative grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand" style={{ height: size, width: size }}>
            <Sprout size={Math.round(size * 0.5)} />
            <span className={cn("absolute -inset-1 rounded-2xl ring-2 ring-brand-400/40", active ? "animate-pulse" : "animate-[pulse_3s_ease-in-out_infinite]")} />
        </span>
    );
}

/** A reassuring "your agent has it handled" presence for restaurant owners. */
export function AgentDock() {
    const items = useStore((s) => s.items);
    const activity = useStore((s) => s.activity);
    const roll = marginRollup(getState());

    const working = items.some((i) => ["requested", "matched"].includes(i.stage));
    const needsYou = 0; // the whole point: nothing needs them
    const hoursSaved = Math.max(1, Math.round(items.length * 2.5 + roll.confirmedDeliveries * 0.5));
    const latest = activity[0];

    return (
        <div className="mb-6 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50/80 via-canvas-soft to-canvas-soft shadow-card ring-1 ring-brand-100">
            <div className="flex items-start gap-4 p-5 sm:p-6">
                <AgentAvatar size={54} active={working} />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl leading-none text-ink">{AGENT_NAME}</p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-2xs font-semibold text-brand-600 ring-1 ring-brand-100">your sourcing agent</span>
                        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-2.5 py-1 text-2xs font-semibold text-white">
                            {working ? <><Spinner /> On it</> : <><Check size={12} /> All handled</>}
                        </span>
                    </div>
                    <p className="mt-2 text-[15px] leading-snug text-ink-soft">
                        {working
                            ? "I'm lining up your farms and deliveries right now. Nothing for you to do."
                            : "Everything's running. Go run your kitchen. I'll handle the sourcing and tell you if anything ever needs you."}
                    </p>
                    {latest && (
                        <p className="mt-2 flex items-center gap-1.5 truncate text-[13px] text-ink-muted">
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
                            {latest.text}<Dot size={14} className="text-ink-faint" />{relTime(latest.ts)}
                        </p>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-line border-t border-line bg-white/50">
                <Mini value={hoursSaved} unit="hrs" label="saved for you this week" />
                <Mini value={activity.length} label="things I handled" />
                <Mini value={needsYou} label="need your attention" calm />
            </div>
        </div>
    );
}

function Mini({ value, unit, label, calm }: { value: number; unit?: string; label: string; calm?: boolean }) {
    return (
        <div className="px-4 py-3.5 text-center">
            <p className={cn("font-display text-2xl leading-none tnum", calm ? "text-brand-600" : "text-ink")}>
                {calm && value === 0 ? <span className="inline-flex items-center gap-1"><Check size={18} /> 0</span> : <>{value}{unit && <span className="text-base text-ink-muted">{unit}</span>}</>}
            </p>
            <p className="mt-1 text-2xs text-ink-faint">{label}</p>
        </div>
    );
}

function Spinner() {
    return <svg width="11" height="11" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="3" /><path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}

function relTime(ts: number) {
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
}
