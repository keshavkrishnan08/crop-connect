"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getHubData } from "@/lib/queries";
import { type Contract, type BoardNode, type BoardEdge } from "@/lib/types";
import { PageHeader } from "@/components/app/PageHeader";
import { SupplyChainBoard } from "@/components/visual/SupplyChainBoard";
import { GlassCard, Spinner, EmptyState, LinkButton } from "@/components/ui/kit";
import { Nodes, Compass, Wheat, ArrowRight } from "@/components/icons";

const LANE_H = 230;

export default function HubPage() {
    const { profile } = useAuth();
    const [data, setData] = React.useState<{ contract: Contract; nodes: BoardNode[]; edges: BoardEdge[] }[] | null>(null);

    React.useEffect(() => {
        if (!profile) return;
        getHubData(profile.id).then(setData);
    }, [profile]);

    if (!profile || data === null) {
        return <div className="grid h-[60vh] place-items-center"><Spinner size={26} className="text-forest-500" /></div>;
    }

    // stack each contract into its own horizontal lane
    const nodes: BoardNode[] = [];
    const edges: BoardEdge[] = [];
    data.forEach((b, lane) => {
        const minX = Math.min(...b.nodes.map((n) => n.x), 0);
        b.nodes.forEach((n) => nodes.push({ ...n, x: n.x - minX + 60, y: n.y % LANE_H + lane * LANE_H + 40 }));
        edges.push(...b.edges);
    });

    return (
        <div className="animate-fade-up">
            <PageHeader
                eyebrow="Combined view"
                title="Supply Hub"
                subtitle="Every active contract's supply chain on one living board. Each row is a contract; highlights show where each product sits right now."
            />

            {data.length === 0 ? (
                <EmptyState
                    icon={<Nodes size={26} />}
                    title="No active supply chains yet"
                    description="When a contract activates, its supply-chain map appears here — and they all stack into this combined view."
                    action={<LinkButton href="/app/discover"><Compass size={18} /> Find matches</LinkButton>}
                />
            ) : (
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                    <SupplyChainBoard nodes={nodes} edges={edges} editable={false} height={Math.max(480, data.length * LANE_H + 80)} />

                    <aside>
                        <GlassCard className="p-5">
                            <h3 className="mb-3 font-display text-lg text-ink">Contracts on the board</h3>
                            <div className="space-y-1">
                                {data.map((b) => {
                                    const other = b.contract.farm_id === profile.id ? b.contract.buyer : b.contract.farm;
                                    const here = b.nodes.find((n) => n.highlighted);
                                    return (
                                        <Link key={b.contract.id} href={`/app/contracts/${b.contract.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-paper-warm/60">
                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-600"><Wheat size={16} /></span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-ink">{b.contract.terms.crop}</p>
                                                <p className="truncate text-[13px] text-ink-muted">
                                                    {other?.org_name || other?.full_name}{here ? ` · ${here.label}` : ""}
                                                </p>
                                            </div>
                                            <ArrowRight size={15} className="text-ink-faint" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </aside>
                </div>
            )}
        </div>
    );
}
