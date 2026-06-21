"use client";

import { STAGES, STAGE_LABEL, type Stage } from "@/lib/store";
import { Search, Farm, Pen, Truck, MarginUp, Check } from "@/components/icons";
import { cn } from "@/lib/utils";

const ICON: Record<Stage, React.ComponentType<{ size?: number }>> = {
    requested: Search, matched: Farm, agreed: Pen, delivering: Truck, live: MarginUp,
};

/** Horizontal pipeline tracker — where this ingredient is in the sourcing flow. */
export function StageRail({ stage, className }: { stage: Stage; className?: string }) {
    const idx = STAGES.indexOf(stage);
    return (
        <div className={cn("flex items-center", className)}>
            {STAGES.map((s, i) => {
                const Icon = ICON[s];
                const done = i < idx;
                const current = i === idx;
                return (
                    <div key={s} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={cn("grid h-9 w-9 place-items-center rounded-xl border transition-all",
                                current && "border-brand-400 bg-brand-500 text-white shadow-brand",
                                done && "border-brand-200 bg-brand-50 text-brand-600",
                                !current && !done && "border-line bg-white text-ink-faint")}>
                                {done ? <Check size={17} /> : <Icon size={17} />}
                            </div>
                            <span className={cn("whitespace-nowrap text-2xs font-semibold uppercase tracking-wide", current ? "text-brand-600" : done ? "text-ink-soft" : "text-ink-faint")}>
                                {STAGE_LABEL[s]}
                            </span>
                        </div>
                        {i < STAGES.length - 1 && (
                            <div className="mx-1.5 mb-5 h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                                <div className={cn("h-full rounded-full bg-brand-400 transition-all duration-500", i < idx ? "w-full" : "w-0")} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
