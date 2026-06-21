"use client";

import Link from "next/link";
import { type SourcingItem, type Stage, STAGE_LABEL, farmById } from "@/lib/store";
import { Leaf, MapPin, ArrowRight, Truck, Calendar } from "@/components/icons";
import { formatDate, cn } from "@/lib/utils";

const TONE: Record<Stage, string> = {
    requested: "badge-ink", matched: "badge-harvest", agreed: "badge-brand", delivering: "badge-harvest", live: "badge-brand",
};

export function ItemCard({ item, compact }: { item: SourcingItem; compact?: boolean }) {
    const farm = farmById(item.farmId);
    const next = item.deliveries.find((d) => d.status === "scheduled");
    return (
        <Link href={`/app/sourcing/${item.id}`} className="group block card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><Leaf size={18} /></span>
                    <div className="min-w-0">
                        <p className="truncate font-display text-[17px] leading-tight text-ink capitalize">{item.crop}</p>
                        <p className="truncate text-[12.5px] text-ink-muted">{item.dishName}</p>
                    </div>
                </div>
                <span className={cn("badge shrink-0", TONE[item.stage])}>{STAGE_LABEL[item.stage]}</span>
            </div>

            {!compact && <div className="my-3 divider" />}

            <div className={cn("flex items-center justify-between text-[12.5px] text-ink-muted", compact && "mt-3")}>
                <span className="inline-flex items-center gap-1.5 min-w-0">
                    {farm ? <><MapPin size={13} className="shrink-0" /> <span className="truncate">{farm.name} · {farm.distanceMi} mi</span></>
                        : <span className="font-mono tnum">{item.qtyPerWeek} {item.unit}/wk · ≤{`$${item.priceCeiling}`}</span>}
                </span>
                {next ? <span className="inline-flex items-center gap-1 shrink-0"><Calendar size={13} /> {formatDate(next.date)}</span>
                    : <ArrowRight size={15} className="shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />}
            </div>
        </Link>
    );
}
