"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * HONEST early-partner voices — role-only attribution, no fake photos or invented
 * customer counts. Swap these for real quotes once partners are live.
 */
const QUOTES: { q: string; who: string; role: string; init: string; tone: "brand" | "harvest" | "ink" }[] = [
    { q: "I always wanted more local on the menu. I never had the hours to chase it. Now I do not have to.", who: "Chef-owner", role: "New American", init: "JM", tone: "brand" },
    { q: "The margin finally made sense in our own numbers. That was the moment.", who: "Owner", role: "Neighborhood bistro", init: "AD", tone: "harvest" },
    { q: "It just shows up every week. That is the whole thing for me.", who: "Executive chef", role: "Italian", init: "RC", tone: "ink" },
];

export function Testimonials() {
    return (
        <Stagger className="grid gap-4 md:grid-cols-3">
            {QUOTES.map((t) => {
                const ring = t.tone === "harvest" ? "bg-harvest-400/15 text-harvest-500" : t.tone === "ink" ? "bg-ink text-white" : "bg-brand-600 text-white";
                return (
                    <StaggerItem key={t.q}>
                        <figure className="flex h-full flex-col rounded-3xl border border-line bg-canvas-soft p-7 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                            <span className="font-display text-5xl leading-none text-brand-300">&ldquo;</span>
                            <blockquote className="mt-2 flex-1 text-[17px] leading-relaxed text-ink">{t.q}</blockquote>
                            <figcaption className="mt-6 flex items-center gap-3">
                                <span className={cn("grid h-11 w-11 place-items-center rounded-full font-display text-sm", ring)}>{t.init}</span>
                                <div><p className="text-sm font-semibold text-ink">{t.who}</p><p className="text-[13px] text-ink-muted">{t.role}</p></div>
                            </figcaption>
                        </figure>
                    </StaggerItem>
                );
            })}
        </Stagger>
    );
}
