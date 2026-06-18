"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getMyContracts, getUpcomingDeliveries } from "@/lib/queries";
import { type Contract, type Delivery } from "@/lib/types";
import { contractValueCents } from "@/lib/contract";
import { formatMoney, formatDate, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/app/PageHeader";
import { ContractCard } from "@/components/contract/ContractCard";
import { Button, LinkButton, GlassCard, Spinner, EmptyState, Avatar } from "@/components/ui/kit";
import {
    Pulse, Scale, Calendar as CalIcon, Repeat, Compass, Handshake, ArrowRight, Sparkle, Wheat,
} from "@/components/icons";

export default function DashboardPage() {
    const { profile } = useAuth();
    const [contracts, setContracts] = React.useState<Contract[] | null>(null);
    const [deliveries, setDeliveries] = React.useState<(Delivery & { contract: Contract })[]>([]);

    React.useEffect(() => {
        if (!profile) return;
        let active = true;
        Promise.all([getMyContracts(profile.id), getUpcomingDeliveries(5)]).then(([c, d]) => {
            if (!active) return;
            setContracts(c);
            setDeliveries(d);
        });
        return () => { active = false; };
    }, [profile]);

    if (!profile || contracts === null) {
        return <div className="grid h-[60vh] place-items-center"><Spinner size={26} className="text-forest-500" /></div>;
    }

    const activeContracts = contracts.filter((c) => c.status === "active" || c.status === "renewed");
    const negotiating = contracts.filter((c) => ["proposed", "countered", "agreed"].includes(c.status));
    const gmv = activeContracts.reduce((s, c) => s + contractValueCents(c.terms), 0);
    const completed = profile.completed_contracts ?? 0;
    const renewed = profile.renewed_contracts ?? 0;
    const renewSoon = activeContracts.filter((c) => {
        const end = new Date(c.terms.term_end).getTime();
        return end - Date.now() < 21 * 86_400_000;
    });

    const greeting = `Welcome back, ${profile.full_name?.split(" ")[0] || "there"}`;

    return (
        <div className="animate-fade-up">
            <PageHeader
                eyebrow={profile.role === "farm" ? "Farm dashboard" : "Buyer dashboard"}
                title={greeting}
                subtitle="Your committed supply, at a glance."
                actions={<LinkButton href="/app/discover"><Compass size={18} /> Find matches</LinkButton>}
            />

            {/* stats */}
            <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat icon={<Pulse size={20} />} label="Active contracts" value={formatNumber(activeContracts.length)} tone="forest" />
                <Stat icon={<Scale size={20} />} label="Committed value" value={formatMoney(gmv, { compact: gmv > 1_000_00 })} tone="harvest" />
                <Stat icon={<Handshake size={20} />} label="In negotiation" value={formatNumber(negotiating.length)} tone="sky" />
                <Stat icon={<Repeat size={20} />} label="Renewals" value={formatNumber(renewed)} sub={`${completed} completed`} tone="forest" />
            </div>

            {/* renewal prompts */}
            {renewSoon.length > 0 && (
                <GlassCard className="mb-7 overflow-hidden p-0">
                    <div className="flex items-center gap-2 border-b border-line bg-harvest-400/8 px-5 py-3">
                        <Sparkle size={17} className="text-harvest-500" />
                        <h3 className="font-display text-lg text-ink">Coming up for renewal</h3>
                    </div>
                    <div className="divide-y divide-line">
                        {renewSoon.map((c) => (
                            <Link key={c.id} href={`/app/contracts/${c.id}`} className="flex items-center justify-between px-5 py-3.5 transition hover:bg-paper-warm/60">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-50 text-forest-600"><Wheat size={17} /></span>
                                    <div>
                                        <p className="font-semibold text-ink">{c.terms.crop}</p>
                                        <p className="text-[13px] text-ink-muted">Term ends {formatDate(c.terms.term_end, "long")}</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest-600">Review <ArrowRight size={15} /></span>
                            </Link>
                        ))}
                    </div>
                </GlassCard>
            )}

            <div className="grid gap-7 lg:grid-cols-[1fr_330px]">
                {/* active contracts */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-display text-2xl text-ink">Active contracts</h2>
                        <Link href="/app/contracts" className="text-sm font-semibold text-forest-600 hover:underline">View all</Link>
                    </div>
                    {activeContracts.length === 0 ? (
                        <EmptyState
                            icon={<Handshake size={26} />}
                            title="No active contracts yet"
                            description="Find a counterparty and propose committed terms to get your first contract running."
                            action={<LinkButton href="/app/discover"><Compass size={18} /> Find matches</LinkButton>}
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {activeContracts.map((c) => <ContractCard key={c.id} contract={c} viewerId={profile.id} />)}
                        </div>
                    )}

                    {negotiating.length > 0 && (
                        <>
                            <h2 className="mb-4 mt-8 font-display text-2xl text-ink">In negotiation</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {negotiating.map((c) => <ContractCard key={c.id} contract={c} viewerId={profile.id} />)}
                            </div>
                        </>
                    )}
                </section>

                {/* upcoming deliveries */}
                <aside>
                    <GlassCard className="p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <CalIcon size={18} className="text-forest-600" />
                            <h3 className="font-display text-lg text-ink">Upcoming deliveries</h3>
                        </div>
                        {deliveries.length === 0 ? (
                            <p className="py-6 text-center text-sm text-ink-muted">No scheduled deliveries yet.</p>
                        ) : (
                            <div className="space-y-1">
                                {deliveries.map((d) => {
                                    const other = d.contract.farm_id === profile.id ? d.contract.buyer : d.contract.farm;
                                    return (
                                        <Link key={d.id} href={`/app/contracts/${d.contract.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-paper-warm/60">
                                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-50 text-center leading-none text-forest-600">
                                                <span className="text-2xs font-bold uppercase">{new Date(d.scheduled_date).toLocaleDateString("en-US", { month: "short" })}</span>
                                                <span className="text-sm font-bold">{new Date(d.scheduled_date).getDate()}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-ink">{d.contract.terms.crop}</p>
                                                <p className="truncate text-[13px] text-ink-muted">{d.quantity} {d.contract.terms.unit} · {other?.org_name || other?.full_name}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard className="mt-5 bg-gradient-to-br from-forest-600 to-forest-800 p-5 text-white">
                        <Nodes2 />
                        <h3 className="mt-3 font-display text-xl">Supply Hub</h3>
                        <p className="mt-1 text-[13.5px] text-white/80">See every contract's supply chain on one living board.</p>
                        <LinkButton href="/app/hub" variant="ghost" size="sm" className="mt-4 border-white/30 bg-white/10 text-white hover:bg-white/20">
                            Open the hub <ArrowRight size={15} />
                        </LinkButton>
                    </GlassCard>
                </aside>
            </div>
        </div>
    );
}

function Stat({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub?: string; tone: "forest" | "harvest" | "sky" }) {
    const toneCls = tone === "harvest" ? "bg-harvest-400/12 text-harvest-500" : tone === "sky" ? "bg-sky/10 text-sky" : "bg-forest-50 text-forest-600";
    return (
        <GlassCard className="p-5" hover>
            <span className={`mb-3 grid h-10 w-10 place-items-center rounded-2xl ${toneCls}`}>{icon}</span>
            <p className="font-display text-3xl leading-none text-ink">{value}</p>
            <p className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</p>
            {sub && <p className="text-2xs text-ink-faint">{sub}</p>}
        </GlassCard>
    );
}

function Nodes2() {
    return (
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="9" width="5" height="6" rx="1.4" /><rect x="16" y="4" width="5" height="6" rx="1.4" /><rect x="16" y="14" width="5" height="6" rx="1.4" />
                <path d="M8 12h4a2 2 0 0 0 2-2V7M8 12h4a2 2 0 0 1 2 2v3" />
            </svg>
        </span>
    );
}
