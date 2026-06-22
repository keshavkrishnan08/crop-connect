"use client";

import Link from "next/link";
import { useStore, getState, agentRoadmap } from "@/lib/store";
import { Card } from "@/components/ui/kit";
import { Check } from "@/components/icons";
import { cn } from "@/lib/utils";

/** A minimalist, adaptive checklist the agent keeps for this account. Step count varies by progress. */
export function Roadmap() {
    useStore((s) => s.items);
    useStore((s) => s.dishes);
    const steps = agentRoadmap(getState());
    const done = steps.filter((s) => s.done).length;
    const nextId = steps.find((s) => !s.done)?.id;

    return (
        <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[13px] font-medium text-ink-soft">Roadmap</h3>
                <span className="font-mono text-2xs text-ink-faint tnum">{done}/{steps.length}</span>
            </div>
            <div>
                {steps.map((s) => {
                    const isNext = s.id === nextId;
                    return (
                        <div key={s.id} className="flex items-center gap-3 py-2">
                            <span className="grid h-4 w-4 shrink-0 place-items-center">
                                {s.done
                                    ? <Check size={14} className="text-brand-500" />
                                    : <span className={cn("h-1.5 w-1.5 rounded-full", isNext ? "bg-brand-500" : "bg-ink-faint/35")} />}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className={cn("text-[13.5px] leading-tight", s.done ? "text-ink-faint line-through" : isNext ? "font-medium text-ink" : "text-ink-soft")}>{s.title}</p>
                                {isNext && <p className="mt-0.5 text-[12px] text-ink-muted">{s.detail}</p>}
                            </div>
                            {isNext && <Link href={s.href} className="shrink-0 text-2xs font-semibold text-brand-600 hover:underline">{s.cta}</Link>}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
