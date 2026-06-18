"use client";

import { type ListingVisibility } from "@/lib/types";
import { Compass, Shield, Check } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Listing visibility — gives the farmer agency over who sees their prices.
 *   • public   — shown in the open marketplace / discovery
 *   • unlisted — reachable only by people you share it with; never searchable
 * Plain-language labels, public default, private one tap away.
 */
export function VisibilityToggle({ value, onChange }: { value: ListingVisibility; onChange: (v: ListingVisibility) => void }) {
    return (
        <div>
            <label className="label">Who can see this</label>
            <div className="grid gap-2.5 sm:grid-cols-2">
                <Card
                    active={value === "public"}
                    onClick={() => onChange("public")}
                    icon={<Compass size={18} />}
                    title="Open marketplace"
                    sub="Listed publicly so new buyers can find you."
                />
                <Card
                    active={value === "unlisted"}
                    onClick={() => onChange("unlisted")}
                    icon={<Shield size={18} />}
                    title="Private"
                    sub="Only people you share it with. Never searchable — competitors can't see your prices."
                />
            </div>
        </div>
    );
}

function Card({ active, onClick, icon, title, sub }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition",
                active ? "border-forest-400 bg-forest-50/50 ring-2 ring-forest-400/20" : "border-line bg-white/60 hover:border-line-strong",
            )}
        >
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", active ? "bg-forest-500 text-white" : "bg-paper-sunk text-ink-soft")}>
                {icon}
            </span>
            <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    {title}
                    {active && <Check size={14} className="text-forest-500" />}
                </span>
                <span className="text-[12.5px] text-ink-muted">{sub}</span>
            </span>
        </button>
    );
}
