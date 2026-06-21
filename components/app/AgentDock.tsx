"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { Sprout, Dot } from "@/components/icons";
import { cn } from "@/lib/utils";

export const AGENT_NAME = "Sage";

/** The agent's mark. */
export function AgentAvatar({ size = 44, active = false }: { size?: number; active?: boolean }) {
    return (
        <span className="relative grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand" style={{ height: size, width: size }}>
            <Sprout size={Math.round(size * 0.5)} />
            {active && <span className="absolute -inset-1 rounded-2xl ring-2 ring-brand-400/50 animate-pulse" />}
        </span>
    );
}

/** A persistent "your agent is running this" presence for the dashboard. */
export function AgentDock() {
    const items = useStore((s) => s.items);
    const activity = useStore((s) => s.activity);
    const working = items.some((i) => ["requested", "matched"].includes(i.stage));
    const managed = items.filter((i) => i.stage !== "live").length;
    const latest = activity[0];

    return (
        <div className="mb-6 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50/80 via-canvas-soft to-canvas-soft shadow-card ring-1 ring-brand-100">
            <div className="flex items-center gap-4 p-5">
                <AgentAvatar size={52} active={working} />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl leading-none text-ink">{AGENT_NAME}</p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-2xs font-semibold text-brand-600 ring-1 ring-brand-100">your sourcing agent</span>
                        <span className={cn("ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold", working ? "bg-brand-500 text-white" : "bg-white text-ink-soft ring-1 ring-line")}>
                            {working ? <><Spinner /> Working</> : <><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Monitoring</>}
                        </span>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 truncate text-[13.5px] text-ink-muted">
                        {latest ? <><span className="font-medium text-ink-soft">Last:</span> {latest.text}<Dot size={14} className="text-ink-faint" />{relTime(latest.ts)}</> : "Standing by for your next request."}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-line border-t border-line bg-white/50">
                <Mini label="Flows it runs" value={items.length} />
                <Mini label="Open right now" value={managed} />
                <Mini label="Your steps" value={0} accent />
            </div>
        </div>
    );
}

function Mini({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
    return (
        <div className="px-5 py-3 text-center">
            <p className={cn("font-display text-2xl leading-none tnum", accent ? "text-brand-600" : "text-ink")}>{value}</p>
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
