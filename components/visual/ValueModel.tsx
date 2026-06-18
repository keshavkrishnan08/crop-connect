"use client";

import * as React from "react";
import { type Terms, hasBand } from "@/lib/types";
import { contractValueCents, contractValueRange, deliveryCount } from "@/lib/contract";
import { formatMoney } from "@/lib/utils";

/** Visual breakdown of how the committed value is built, with a cumulative ramp. */
export function ValueModel({ terms }: { terms: Terms }) {
    const count = deliveryCount(terms);
    const perDelivery = terms.quantity * terms.unit_price_cents;
    const total = contractValueCents(terms);
    const band = hasBand(terms);
    const range = contractValueRange(terms);
    const points = Array.from({ length: count }, (_, i) => (i + 1) * perDelivery);
    const max = points[points.length - 1] || 1;

    return (
        <div className="glass-card p-5">
            <h3 className="mb-1 font-display text-lg text-ink">Committed value</h3>
            <p className="mb-4 text-[13px] text-ink-muted">How this contract's value accrues over the term.</p>

            <div className="mb-5 flex flex-wrap items-end gap-x-4 gap-y-1">
                {band ? (
                    <p className="font-display text-[2.1rem] leading-none text-forest-600">
                        {formatMoney(range.min, { compact: range.max > 1_000_00 })}<span className="text-ink-faint"> – </span>{formatMoney(range.max, { compact: range.max > 1_000_00 })}
                    </p>
                ) : (
                    <p className="font-display text-[2.5rem] leading-none text-forest-600">{formatMoney(total)}</p>
                )}
                <p className="pb-1.5 text-sm text-ink-muted">
                    {formatMoney(perDelivery)} <span className="text-ink-faint">×</span> {count} {count === 1 ? "delivery" : "deliveries"}
                    {band && <span className="text-ink-faint"> · flexible band</span>}
                </p>
            </div>

            {/* cumulative ramp */}
            <div className="flex h-24 items-end gap-1">
                {points.map((p, i) => (
                    <div key={i} className="group relative flex-1">
                        <div
                            className="w-full rounded-t-md bg-gradient-to-t from-forest-200 to-forest-500 transition-all duration-500 group-hover:from-forest-300 group-hover:to-forest-600"
                            style={{ height: `${Math.max(6, (p / max) * 100)}%`, transitionDelay: `${i * 20}ms` }}
                        />
                        <div className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-2xs font-medium text-white group-hover:block">
                            {formatMoney(p, { compact: true })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-2 flex justify-between text-2xs font-medium uppercase tracking-wide text-ink-faint">
                <span>Delivery 1</span>
                <span>Delivery {count}</span>
            </div>
        </div>
    );
}
