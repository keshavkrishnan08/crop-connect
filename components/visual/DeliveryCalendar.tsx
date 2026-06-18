"use client";

import * as React from "react";
import { type Delivery, type DeliveryStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Check, Truck, Clock, X, Pen, Calendar as CalIcon } from "@/components/icons";
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

export interface DeliveryHandlers {
    onAdvance?: (id: string, next: DeliveryStatus) => void;
    onReschedule?: (id: string, date: string) => void;
    onNote?: (id: string, note: string) => void;
    onMissed?: (id: string) => void;
}

/** Delivery schedule with status advance, reschedule, notes and mark-missed. */
export function DeliveryCalendar({
    deliveries, unit, editable, handlers = {},
}: {
    deliveries: Delivery[];
    unit: string;
    editable?: boolean;
    handlers?: DeliveryHandlers;
}) {
    const [openId, setOpenId] = React.useState<string | null>(null);
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
                <div className="relative space-y-1">
                    <div className="absolute bottom-3 left-[15px] top-3 w-px bg-line" />
                    {deliveries.map((d) => {
                        const meta = STATUS[d.status];
                        const Icon = meta.icon;
                        const next = NEXT[d.status];
                        const open = openId === d.id;
                        return (
                            <div key={d.id} className="relative rounded-xl">
                                <div className="flex items-center gap-3 px-1 py-1.5">
                                    <div className={cn("relative z-10 grid h-8 w-8 place-items-center rounded-full ring-4 ring-white", meta.cls)}>
                                        <Icon size={15} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-ink">Delivery {d.seq}</p>
                                        <p className="text-[13px] text-ink-muted">{formatDate(d.scheduled_date, "long")} · {d.quantity} {unit}{d.note ? ` · ${d.note}` : ""}</p>
                                    </div>
                                    {editable && next ? (
                                        <button onClick={() => handlers.onAdvance?.(d.id, next)} className="btn-soft btn-sm">
                                            Mark {STATUS[next].label.toLowerCase()}
                                        </button>
                                    ) : (
                                        <span className={cn("badge", meta.cls)}>{meta.label}</span>
                                    )}
                                    {editable && (
                                        <button onClick={() => setOpenId(open ? null : d.id)} className={cn("grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-paper-sunk hover:text-ink", open && "bg-paper-sunk text-ink")} aria-label="Edit delivery">
                                            <Pen size={14} />
                                        </button>
                                    )}
                                </div>
                                {editable && open && (
                                    <div className="ml-11 mb-2 grid gap-2 rounded-xl bg-paper-warm/70 p-3 animate-scale-in sm:grid-cols-[auto_1fr_auto]">
                                        <label className="flex items-center gap-2 text-[13px] text-ink-soft">
                                            <CalIcon size={15} />
                                            <input type="date" defaultValue={d.scheduled_date} onChange={(e) => e.target.value && handlers.onReschedule?.(d.id, e.target.value)} className="field h-9 px-2.5 text-[13px]" />
                                        </label>
                                        <input
                                            defaultValue={d.note ?? ""} placeholder="Add a note…"
                                            onBlur={(e) => handlers.onNote?.(d.id, e.target.value)}
                                            className="field h-9 text-[13px]"
                                        />
                                        {d.status !== "missed" && (
                                            <button onClick={() => { handlers.onMissed?.(d.id); setOpenId(null); }} className="btn btn-sm bg-berry/8 text-berry hover:bg-berry/15">
                                                <X size={14} /> Missed
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
