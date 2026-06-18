"use client";

import * as React from "react";
import { type Delivery, type DeliveryStatus } from "@/lib/types";
import { formatDate, clamp } from "@/lib/utils";
import { Check, Truck, Clock, X, Pen, Calendar as CalIcon, Leaf } from "@/components/icons";
import { cn } from "@/lib/utils";

const STATUS: Record<DeliveryStatus, { label: string; cls: string; icon: React.ComponentType<{ size?: number }> }> = {
    scheduled: { label: "Scheduled", cls: "text-ink-muted bg-ink/5", icon: Clock },
    delivered: { label: "Delivered", cls: "text-sky bg-sky/10", icon: Truck },
    confirmed: { label: "Confirmed", cls: "text-forest-600 bg-forest-50", icon: Check },
    missed: { label: "Missed", cls: "text-berry bg-berry/8", icon: X },
};

const NEXT: Partial<Record<DeliveryStatus, DeliveryStatus>> = { scheduled: "delivered", delivered: "confirmed" };

export interface DeliveryHandlers {
    onAdvance?: (id: string, next: DeliveryStatus) => void;
    onReschedule?: (id: string, date: string) => void;
    onNote?: (id: string, note: string) => void;
    onMissed?: (id: string) => void;
    onDeclare?: (id: string, qty: number, forgiven: boolean) => void;
}

export function DeliveryCalendar({
    deliveries, unit, editable, isFarm, band, cropFailure, handlers = {},
}: {
    deliveries: Delivery[];
    unit: string;
    editable?: boolean;
    isFarm?: boolean;
    band?: { min: number; max: number } | null;
    cropFailure?: boolean;
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
                        const declared = d.declared_quantity != null;
                        const canDeclare = editable && isFarm && (d.status === "scheduled" || d.status === "delivered");

                        return (
                            <div key={d.id} className="relative rounded-xl">
                                <div className="flex items-center gap-3 px-1 py-1.5">
                                    <div className={cn("relative z-10 grid h-8 w-8 place-items-center rounded-full ring-4 ring-white", meta.cls)}>
                                        <Icon size={15} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-ink">Delivery {d.seq}</p>
                                        <p className="text-[13px] text-ink-muted">
                                            {formatDate(d.scheduled_date, "long")} ·{" "}
                                            {declared ? (
                                                <span className="font-medium text-ink">
                                                    Bringing {d.declared_quantity} {unit}
                                                    {d.shortfall_forgiven && <span className="text-harvest-500"> · weather short, forgiven</span>}
                                                </span>
                                            ) : band ? (
                                                <span>planned {band.min}–{band.max} {unit}</span>
                                            ) : (
                                                <span>{d.quantity} {unit}</span>
                                            )}
                                        </p>
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

                                {/* Declare-this-cycle prompt (farm) — the heart: never promise a fixed number */}
                                {canDeclare && (
                                    <DeclareRow
                                        delivery={d} unit={unit} band={band} cropFailure={cropFailure}
                                        onDeclare={(qty, forgiven) => handlers.onDeclare?.(d.id, qty, forgiven)}
                                    />
                                )}

                                {editable && open && (
                                    <div className="ml-11 mb-2 grid gap-2 rounded-xl bg-paper-warm/70 p-3 animate-scale-in sm:grid-cols-[auto_1fr_auto]">
                                        <label className="flex items-center gap-2 text-[13px] text-ink-soft">
                                            <CalIcon size={15} />
                                            <input type="date" defaultValue={d.scheduled_date} onChange={(e) => e.target.value && handlers.onReschedule?.(d.id, e.target.value)} className="field h-9 px-2.5 text-[13px]" />
                                        </label>
                                        <input defaultValue={d.note ?? ""} placeholder="Add a note…" onBlur={(e) => handlers.onNote?.(d.id, e.target.value)} className="field h-9 text-[13px]" />
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

/** The farm declares the actual amount for this cycle — bounded by the band, with a forgiven weather short. */
function DeclareRow({
    delivery, unit, band, cropFailure, onDeclare,
}: {
    delivery: Delivery; unit: string; band?: { min: number; max: number } | null; cropFailure?: boolean;
    onDeclare: (qty: number, forgiven: boolean) => void;
}) {
    const target = delivery.declared_quantity ?? (band ? Math.round((band.min + band.max) / 2) : delivery.quantity);
    const [qty, setQty] = React.useState<number>(target);
    const [forgiven, setForgiven] = React.useState<boolean>(delivery.shortfall_forgiven);
    const below = band ? qty < band.min : false;

    const save = () => {
        const bounded = band && !forgiven ? clamp(qty, band.min, band.max) : Math.max(0, qty);
        onDeclare(bounded, forgiven && below);
    };

    return (
        <div className="ml-11 mb-2 rounded-xl bg-forest-50/50 p-3 animate-fade-in">
            <p className="mb-2 text-[13px] font-semibold text-ink">What are you bringing this delivery?</p>
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                    <input
                        type="number" min={0} value={qty || ""}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="field h-9 w-24 px-3 text-[13px]"
                    />
                    <span className="text-[13px] text-ink-muted">{unit}</span>
                </div>
                {band && <span className="text-[12.5px] text-ink-faint">agreed range {band.min}–{band.max} {unit}</span>}
                <button onClick={save} className="btn-soft btn-sm ml-auto">
                    <Check size={14} /> {delivery.declared_quantity != null ? "Update" : "Declare"}
                </button>
            </div>
            {cropFailure && below && (
                <button
                    onClick={() => setForgiven((f) => !f)}
                    className={cn("mt-2 flex w-full items-center gap-2 rounded-lg border p-2 text-left text-[12.5px] transition", forgiven ? "border-harvest-400/40 bg-harvest-400/10 text-harvest-500" : "border-line text-ink-muted hover:border-line-strong")}
                >
                    <span className={cn("grid h-4 w-4 place-items-center rounded border", forgiven ? "border-harvest-400 bg-harvest-400 text-white" : "border-line-strong")}>
                        {forgiven && <Check size={11} />}
                    </span>
                    <Leaf size={14} /> Below the range — weather/crop short. Forgiven under the crop-failure clause (no penalty).
                </button>
            )}
        </div>
    );
}
