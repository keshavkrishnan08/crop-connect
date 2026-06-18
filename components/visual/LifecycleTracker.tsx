"use client";

import * as React from "react";
import { type ContractStatus, CONTRACT_FLOW, CONTRACT_STATUS_META } from "@/lib/types";
import { Pen, Sparkle, Handshake, Check, Pulse, Repeat, Crate } from "@/components/icons";
import { cn } from "@/lib/utils";

const ICONS: Partial<Record<ContractStatus, React.ComponentType<{ size?: number }>>> = {
    draft: Pen, proposed: Sparkle, countered: Sparkle, agreed: Handshake, sampling: Crate, active: Pulse, completed: Check,
};

/** Horizontal lifecycle rail with the current stage glowing. */
export function LifecycleTracker({ status }: { status: ContractStatus }) {
    const renewed = status === "renewed";
    const closed = status === "closed";
    const flow = CONTRACT_FLOW;
    const activeIndex = renewed ? flow.indexOf("active") : closed ? -1 : flow.indexOf(status);

    return (
        <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg text-ink">Contract lifecycle</h3>
                {renewed && <span className="badge bg-forest-50 text-forest-600"><Repeat size={12} /> Renewed</span>}
                {closed && <span className="badge bg-ink/5 text-ink-faint">Closed</span>}
            </div>
            <div className="flex items-center">
                {flow.map((s, i) => {
                    const Icon = ICONS[s] ?? Check;
                    const done = i < activeIndex;
                    const current = i === activeIndex;
                    const meta = CONTRACT_STATUS_META[s];
                    return (
                        <React.Fragment key={s}>
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className={cn(
                                        "grid h-10 w-10 place-items-center rounded-2xl border transition-all duration-300",
                                        current && "border-forest-400 bg-forest-500 text-white shadow-forest-glow scale-110",
                                        done && "border-forest-200 bg-forest-50 text-forest-600",
                                        !current && !done && "border-line bg-white text-ink-faint",
                                    )}
                                >
                                    {done ? <Check size={18} /> : <Icon size={18} />}
                                </div>
                                <span className={cn("text-2xs font-semibold uppercase tracking-wide", current ? "text-forest-600" : done ? "text-ink-soft" : "text-ink-faint")}>
                                    {meta.label}
                                </span>
                            </div>
                            {i < flow.length - 1 && (
                                <div className="mx-1 mb-5 h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                                    <div className={cn("h-full rounded-full bg-forest-400 transition-all duration-500", i < activeIndex ? "w-full" : "w-0")} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
