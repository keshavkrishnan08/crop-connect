"use client";

import { useStore } from "@/lib/store";
import { AutomationBoard } from "@/components/app/AutomationBoard";
import { LinkButton, EmptyState } from "@/components/ui/kit";
import { Plus, Route } from "@/components/icons";

export default function SourcingPage() {
    const items = useStore((s) => s.items);

    if (items.length === 0) {
        return (
            <div className="grid h-full place-items-center p-6">
                <EmptyState icon={<Route size={24} />} title="Nothing sourcing yet" description="Tell us one ingredient. The agent matches the farms and runs the rest." action={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>} />
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <AutomationBoard items={items} fill />
            <div className="absolute right-4 top-4 z-20">
                <LinkButton href="/app/sourcing/new" size="sm" className="shadow-lift"><Plus size={16} /> Source an ingredient</LinkButton>
            </div>
        </div>
    );
}
