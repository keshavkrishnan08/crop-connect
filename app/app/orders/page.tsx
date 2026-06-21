"use client";

import * as React from "react";
import Link from "next/link";
import { useStore, STAGES, STAGE_LABEL, farmById, orderEscrow, ESCROW_LABEL, type SourcingItem } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, Badge, EmptyState, LinkButton } from "@/components/ui/kit";
import { usd, cn } from "@/lib/utils";
import { Receipt, Plus, MapPin, Check, Shield } from "@/components/icons";

const ESC_TONE: Record<string, string> = { pending: "bg-canvas-sunk text-ink-faint", funded: "bg-brand-50 text-brand-600", held: "bg-harvest-400/15 text-harvest-600", releasing: "bg-brand-50 text-brand-600" };

export default function OrdersPage() {
    const items = useStore((s) => s.items);
    const ordered = [...items].sort((a, b) => STAGES.indexOf(b.stage) - STAGES.indexOf(a.stage));

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Orders" title="Track every order"
                subtitle="Each sourced ingredient, from request to plate, with its delivery progress and escrow status."
                actions={<LinkButton href="/app/sourcing/new"><Plus size={18} /> New order</LinkButton>} />

            {items.length === 0
                ? <EmptyState icon={<Receipt size={24} />} title="No orders yet" description="Source an ingredient and the agent opens an order you can track here." action={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>} />
                : <div className="space-y-4">{ordered.map((item) => <OrderRow key={item.id} item={item} />)}</div>}
        </div>
    );
}

function OrderRow({ item }: { item: SourcingItem }) {
    const farm = farmById(item.farmId);
    const esc = orderEscrow(item);
    const cur = STAGES.indexOf(item.stage);
    const total = item.deliveries.length;
    const confirmed = item.deliveries.filter((d) => d.status === "confirmed").length;

    return (
        <Card className="p-5 sm:p-6" hover>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-mono text-2xs text-ink-faint">#{item.id.replace(/^s_?/, "ORD-").toUpperCase().slice(0, 10)}</p>
                    <p className="mt-0.5 font-display text-xl capitalize text-ink">{item.crop}</p>
                    <p className="text-[13px] text-ink-muted">{item.dishName}{farm && <> · <span className="inline-flex items-center gap-1 text-brand-600"><MapPin size={11} /> {farm.name}</span></>}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand" dot>{STAGE_LABEL[item.stage]}</Badge>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold", ESC_TONE[esc.status])}><Shield size={11} /> {ESCROW_LABEL[esc.status]}</span>
                </div>
            </div>

            {/* stage timeline */}
            <div className="mt-5 flex items-center">
                {STAGES.map((st, i) => (
                    <React.Fragment key={st}>
                        <div className="flex flex-col items-center">
                            <span className={cn("grid h-7 w-7 place-items-center rounded-full text-2xs font-bold", i < cur ? "bg-brand-500 text-white" : i === cur ? "bg-brand-500 text-white ring-4 ring-brand-100" : "bg-canvas-sunk text-ink-faint")}>
                                {i < cur ? <Check size={13} /> : i + 1}
                            </span>
                            <span className={cn("mt-1.5 hidden text-2xs sm:block", i <= cur ? "text-ink-soft" : "text-ink-faint")}>{STAGE_LABEL[st]}</span>
                        </div>
                        {i < STAGES.length - 1 && <div className={cn("mx-1 h-0.5 flex-1 rounded", i < cur ? "bg-brand-400" : "bg-line")} />}
                    </React.Fragment>
                ))}
            </div>

            {/* facts */}
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
                <Fact label="Quantity" value={`${item.qtyPerWeek} ${item.unit}/wk`} />
                <Fact label="Deliveries" value={total ? `${confirmed}/${total} in` : "Scheduling"} />
                <Fact label="Held in escrow" value={usd(esc.held, { compact: esc.held > 9999 })} tone="harvest" />
                <Fact label="Released" value={usd(esc.released, { compact: esc.released > 9999 })} tone="brand" />
            </div>
            <Link href={`/app/sourcing/${item.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">Open order →</Link>
        </Card>
    );
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: "brand" | "harvest" }) {
    return (
        <div>
            <p className="text-2xs text-ink-faint">{label}</p>
            <p className={cn("mt-0.5 font-mono text-sm font-medium tnum", tone === "harvest" ? "text-harvest-600" : tone === "brand" ? "text-brand-600" : "text-ink")}>{value}</p>
        </div>
    );
}
