"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { LinkButton, Spinner, EmptyState } from "@/components/ui/kit";
import { ContractCard } from "@/components/contract/ContractCard";
import { BringRelationshipButton } from "@/components/contract/BringRelationship";
import { useAuth } from "@/lib/auth";
import { getMyContracts } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Compass, Handshake } from "@/components/icons";
import type { Contract, ContractStatus } from "@/lib/types";

type TabKey = "negotiating" | "active" | "closed" | "all";

const TABS: { key: TabKey; label: string; statuses: ContractStatus[] | null; empty: string }[] = [
    { key: "negotiating", label: "Negotiating", statuses: ["proposed", "countered", "agreed"], empty: "No deals on the table" },
    { key: "active", label: "Active", statuses: ["active", "renewed"], empty: "No active contracts" },
    { key: "closed", label: "Closed", statuses: ["completed", "closed"], empty: "Nothing closed yet" },
    { key: "all", label: "All", statuses: null, empty: "No contracts yet" },
];

function inTab(c: Contract, statuses: ContractStatus[] | null): boolean {
    return statuses === null || statuses.includes(c.status);
}

export default function ContractsPage() {
    const { profile } = useAuth();
    const [contracts, setContracts] = useState<Contract[] | null>(null);
    const [tab, setTab] = useState<TabKey>("negotiating");

    useEffect(() => {
        if (!profile) return;
        let active = true;
        getMyContracts(profile.id).then((rows) => {
            if (active) setContracts(rows);
        });
        return () => { active = false; };
    }, [profile]);

    const counts = useMemo(() => {
        const list = contracts ?? [];
        return TABS.reduce<Record<TabKey, number>>((acc, t) => {
            acc[t.key] = list.filter((c) => inTab(c, t.statuses)).length;
            return acc;
        }, { negotiating: 0, active: 0, closed: 0, all: 0 });
    }, [contracts]);

    const current = TABS.find((t) => t.key === tab)!;
    const filtered = useMemo(
        () => (contracts ?? []).filter((c) => inTab(c, current.statuses)),
        [contracts, current],
    );

    const findMatches = (
        <>
            <BringRelationshipButton variant="ghost" />
            <LinkButton href="/app/discover" variant="primary">
                <Compass size={16} /> Find matches
            </LinkButton>
        </>
    );

    return (
        <div>
            <PageHeader
                eyebrow="Deal flow"
                title="Contracts"
                subtitle="Every offer, negotiation, and standing agreement in one place."
                actions={findMatches}
            />

            {/* Segmented tabs */}
            <div className="mb-7 inline-flex flex-wrap gap-1.5 rounded-2xl border border-line bg-paper-warm/70 p-1.5">
                {TABS.map((t) => {
                    const isActive = t.key === tab;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-all duration-200",
                                isActive
                                    ? "bg-white text-ink shadow-glass"
                                    : "text-ink-muted hover:text-ink",
                            )}
                        >
                            {t.label}
                            <span className={cn(
                                "rounded-full px-1.5 text-2xs font-bold tabular-nums",
                                isActive ? "bg-forest-50 text-forest-600" : "bg-ink/5 text-ink-faint",
                            )}>
                                {counts[t.key]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {contracts === null ? (
                <div className="grid place-items-center py-28 text-forest-500">
                    <Spinner size={26} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="animate-fade-up">
                    <EmptyState
                        icon={<Handshake size={24} />}
                        title={current.empty}
                        description="Browse the marketplace to start a contract that fits your terms."
                        action={findMatches}
                    />
                </div>
            ) : (
                <div key={tab} className="grid grid-cols-1 gap-4 animate-fade-up sm:grid-cols-2 xl:grid-cols-3">
                    {profile && filtered.map((c) => (
                        <ContractCard key={c.id} contract={c} viewerId={profile.id} />
                    ))}
                </div>
            )}
        </div>
    );
}
