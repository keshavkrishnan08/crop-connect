"use client";

import { useStore, STAGES, STAGE_LABEL, type Stage, type SourcingItem } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { ItemCard } from "@/components/sourcing/ItemCard";
import { LinkButton, EmptyState } from "@/components/ui/kit";
import { Plus, Route } from "@/components/icons";

export default function SourcingPage() {
    const items = useStore((s) => s.items);

    return (
        <div className="animate-fade-up">
            <PageHeader
                eyebrow="Sourcing"
                title="Your local supply, end to end"
                subtitle="Every ingredient moves through the same flow — request, match a farm, lock the contract, track deliveries, go live on the menu."
                actions={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>}
            />

            {items.length === 0 ? (
                <EmptyState icon={<Route size={24} />} title="Nothing sourcing yet" description="Tell us one ingredient you'd like to bring local. We'll match a farm and run the rest." action={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>} />
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
                    {STAGES.map((stage) => (
                        <Column key={stage} stage={stage} items={items.filter((i) => i.stage === stage)} />
                    ))}
                </div>
            )}
        </div>
    );
}

function Column({ stage, items }: { stage: Stage; items: SourcingItem[] }) {
    return (
        <div className="w-[270px] shrink-0">
            <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-2xs font-semibold uppercase tracking-wide text-ink-soft">{STAGE_LABEL[stage]}</span>
                <span className="font-mono text-2xs text-ink-faint tnum">{items.length}</span>
            </div>
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line py-8 text-center text-2xs text-ink-faint">—</div>
                ) : items.map((i) => <ItemCard key={i.id} item={i} compact />)}
            </div>
        </div>
    );
}
