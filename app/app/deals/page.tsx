"use client";

import { useStore, getState, computeDeals, farmById } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, Badge, LinkButton } from "@/components/ui/kit";
import { usd } from "@/lib/utils";
import { Handshake, MapPin, Check, ArrowRight, Calendar, Sparkle } from "@/components/icons";

export default function DealsPage() {
    useStore((s) => s.items); // subscribe so "already sourcing" stays current
    const deals = computeDeals(getState());

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Deals" title="Deals"
                subtitle="Surplus crops near you. Tap to source." />

            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-[13px] font-medium text-brand-700">
                <Sparkle size={16} /> {deals.filter((d) => !d.sourced).length} fresh deals near you this week, refreshed by your agent.
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {deals.map((d) => {
                    const farm = farmById(d.farmId);
                    return (
                        <Card key={d.id} className="flex h-full flex-col p-5" hover>
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-display text-lg capitalize text-ink">{d.crop}</p>
                                <span className="shrink-0 rounded-full bg-harvest-400/15 px-2.5 py-1 font-mono text-2xs font-semibold text-harvest-600 tnum">{usd(d.price)}/{d.unit}</span>
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-[13px] font-medium text-brand-600"><MapPin size={12} /> {farm?.name}</p>
                            <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-muted">{d.blurb}</p>
                            <div className="mt-3 flex items-center gap-3 text-2xs text-ink-faint">
                                <span className="inline-flex items-center gap-1"><Handshake size={12} /> up to {d.qtyAvail} {d.unit}/wk</span>
                                <span className="inline-flex items-center gap-1"><Calendar size={12} /> {d.window}</span>
                            </div>
                            <div className="mt-4">
                                {d.sourced
                                    ? <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-[13px] font-semibold text-brand-600"><Check size={15} /> Already sourcing</span>
                                    : <LinkButton href={`/app/sourcing/new?crop=${encodeURIComponent(d.crop)}&unit=${d.unit}&price=${d.price}`} size="sm" variant="soft" className="w-full">Source this deal <ArrowRight size={15} /></LinkButton>}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
