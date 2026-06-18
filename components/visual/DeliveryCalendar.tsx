"use client";

import * as React from "react";
import { type Delivery, type DeliveryStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Check, Truck, Clock, X } from "@/components/icons";
import { cn } from "@/lib/utils";

const STATUS: Record<DeliveryStatus, { label: string; cls: string; icon: React.ComponentType<{ size?: number }> }> = {
    scheduled: { label: "Scheduled", cls: "text-ink-muted bg-ink/5", icon: Clock },
    delivered: { label: "Delivered", cls: "text-sky bg-sky/10", icon: Truck },
    confirmed: { label: "Confirmed", cls: "text-forest-600 bg-forest-50", icon: Check },
    missed: { label: "Missed", cls: "text-berry bg-berry/8", icon: X },
};

const NEXT: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
    scheduled: "delivered",
    delivered: "confirmed",
};

/** Vertical delivery schedule with one-tap status advance. */
export function DeliveryCalendar({
    deliveries, unit, editable, onAdvance,
}: {
    deliveries: Delivery[];
    unit: string;
    editable?: boolean;
    onAdvance?: (id: string, next: DeliveryStatus) => void;
}) {
    const done = deliveries.filter((d) => d.status === "confirmed").length;
    const pct = deliveries.length ? Math.round((done / deliveries.length) * 100) : 0;

    return (
        <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg text-ink">Delivery schedule</h3>
                <span className="text-sm font-semibold text-forest-600">{done}/{deliveries.length} confirmed</span>
            </div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-paper-sunk">
                <div className="h-full rounded-full bg-gradient-to-r from-forest-400 to-forest-600 transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>

            {deliveries.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-muted">Schedule generates when the contract activates.</p>
            ) : (
                <div className="relative space-y-1.5">
                    <div className="absolute bottom-3 left-[15px] top-3 w-px bg-line" />
                    {deliveries.map((d) => {
                        const meta = STATUS[d.status];
                        const Icon = meta.icon;
                        const next = NEXT[d.status];
                        return (
                            <div key={d.id} className="relative flex items-center gap-3 rounded-xl px-1 py-1.5">
                                <div className={cn("relative z-10 grid h-8 w-8 place-items-center rounded-full ring-4 ring-white", meta.cls)}>
                                    <Icon size={15} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-ink">Delivery {d.seq}</p>
                                    <p className="text-[13px] text-ink-muted">{formatDate(d.scheduled_date, "long")} · {d.quantity} {unit}</p>
                                </div>
                                {editable && next ? (
                                    <button onClick={() => onAdvance?.(d.id, next)} className="btn-soft btn-sm">
                                        Mark {STATUS[next].label.toLowerCase()}
                                    </button>
                                ) : (
                                    <span className={cn("badge", meta.cls)}>{meta.label}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
