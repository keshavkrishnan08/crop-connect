"use client";

import Link from "next/link";
import { useStore, getState, agentRoadmap } from "@/lib/store";
import { AGENT_NAME } from "@/components/app/AgentDock";
import { Card } from "@/components/ui/kit";
import { Check, ArrowRight, Sparkle } from "@/components/icons";
import { cn } from "@/lib/utils";

/** A custom checklist the agent sets for this account. Recomputes from state on every render. */
export function Roadmap() {
    useStore((s) => s.items);
    useStore((s) => s.dishes);
    const steps = agentRoadmap(getState());
    const done = steps.filter((s) => s.done).length;
    const pct = Math.round((done / steps.length) * 100);
    const nextId = steps.find((s) => !s.done)?.id;

    return (
        <Card className="overflow-hidden p-0 transition-shadow duration-200 hover:shadow-lift">
            <div className="flex items-center justify-between border-b border-line bg-gradient-to-br from-brand-50/50 to-transparent px-5 py-4">
                <div className="flex items-center gap-2">
                    <Sparkle size={17} className="text-brand-600" />
                    <h3 className="font-display text-lg text-ink">Your roadmap</h3>
                    <span className="text-2xs text-ink-faint">set by {AGENT_NAME}</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-canvas-sunk"><div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} /></div>
                    <span className="font-mono text-2xs text-ink-muted tnum">{done}/{steps.length}</span>
                </div>
            </div>
            <div className="divide-y divide-line">
                {steps.map((s) => {
                    const isNext = s.id === nextId;
                    return (
                        <div key={s.id} className={cn("flex items-center gap-3.5 px-5 py-3.5", isNext && "bg-brand-50/40")}>
                            <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border", s.done ? "border-brand-500 bg-brand-500 text-white" : isNext ? "border-brand-400 text-brand-600" : "border-line text-ink-faint")}>
                                {s.done ? <Check size={15} /> : <span className="h-2 w-2 rounded-full bg-current" />}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className={cn("text-[15px] font-semibold", s.done ? "text-ink-faint line-through" : "text-ink")}>{s.title}</p>
                                {!s.done && <p className="text-[12.5px] text-ink-muted">{s.detail}</p>}
                            </div>
                            {isNext && <Link href={s.href} className="btn-primary btn-sm shrink-0">{s.cta} <ArrowRight size={14} /></Link>}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
