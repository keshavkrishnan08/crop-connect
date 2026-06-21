"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type SourcingItem, STAGES, farmById } from "@/lib/store";
import { Search, Farm, Pen, Truck, MarginUp, Check, Leaf } from "@/components/icons";
import { cn } from "@/lib/utils";

const NODE_W = 156;
const NODE_H = 74;
const GAP_X = 78;
const LANE_H = 128;
const PAD = 24;

type NodeStatus = "done" | "active" | "pending";

const NODE_ICON = [Search, Farm, Pen, Truck, MarginUp];

function nodesFor(item: SourcingItem) {
    const farm = farmById(item.farmId);
    const confirmed = item.deliveries.filter((d) => d.status === "confirmed").length;
    return [
        { label: "Request", sub: `${item.qtyPerWeek} ${item.unit}/wk` },
        { label: "Farm match", sub: farm ? farm.name : "Scanning…" },
        { label: "Agreement", sub: ["agreed", "delivering", "live"].includes(item.stage) ? "Signed" : "Pending" },
        { label: "Deliveries", sub: item.deliveries.length ? `${confirmed}/${item.deliveries.length} in` : "Scheduling…" },
        { label: "On the menu", sub: item.stage === "live" ? "Earning margin" : "Queued" },
    ];
}

/** An n8n / Miro-style automation graph that draws the sourcing pipeline. */
export function AutomationBoard({ items }: { items: SourcingItem[] }) {
    const lanes = items.length;
    const width = PAD * 2 + NODE_W * 5 + GAP_X * 4;
    const height = Math.max(LANE_H, lanes * LANE_H) + 16;

    if (lanes === 0) return null;

    return (
        <div className="overflow-x-auto rounded-3xl border border-line bg-white">
            <div className="relative bg-dots" style={{ width, height, backgroundPosition: `${PAD}px ${PAD}px` }}>
                {/* edges */}
                <svg className="absolute inset-0 h-full w-full overflow-visible" style={{ width, height }}>
                    {items.map((item, lane) => {
                        const cur = STAGES.indexOf(item.stage);
                        return [0, 1, 2, 3].map((i) => {
                            const flow = i + 1 <= cur; // edges up to the active node "flow"
                            const x1 = PAD + i * (NODE_W + GAP_X) + NODE_W;
                            const x2 = PAD + (i + 1) * (NODE_W + GAP_X);
                            const y = PAD + lane * LANE_H + NODE_H / 2;
                            const d = `M ${x1} ${y} C ${x1 + GAP_X * 0.5} ${y}, ${x2 - GAP_X * 0.5} ${y}, ${x2} ${y}`;
                            return (
                                <g key={`${lane}-${i}`}>
                                    <path d={d} fill="none" stroke={flow ? "#235C3A" : "rgba(22,36,28,0.14)"} strokeWidth={2} strokeDasharray={flow ? "5 6" : undefined}>
                                        {flow && <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="0.7s" repeatCount="indefinite" />}
                                    </path>
                                    <circle cx={x2} cy={y} r={3} fill={flow ? "#235C3A" : "rgba(22,36,28,0.22)"} />
                                </g>
                            );
                        });
                    })}
                </svg>

                {/* nodes */}
                {items.map((item, lane) => {
                    const cur = STAGES.indexOf(item.stage);
                    return nodesFor(item).map((n, i) => {
                        const status: NodeStatus = i < cur ? "done" : i === cur ? "active" : "pending";
                        const Icon = NODE_ICON[i];
                        const left = PAD + i * (NODE_W + GAP_X);
                        const top = PAD + lane * LANE_H;
                        return (
                            <motion.div key={`${lane}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (lane * 0.05) + i * 0.06 }}
                                className="absolute" style={{ left, top, width: NODE_W, height: NODE_H }}>
                                {status === "active" && <span className="absolute -inset-1 rounded-2xl ring-2 ring-brand-400/50 animate-pulse" />}
                                <div className={cn("relative flex h-full flex-col justify-center gap-1 rounded-xl border bg-white px-3 shadow-card",
                                    status === "active" ? "border-brand-400" : status === "done" ? "border-brand-100" : "border-line")}>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                                            status === "active" ? "bg-brand-500 text-white" : status === "done" ? "bg-brand-50 text-brand-600" : "bg-canvas-sunk text-ink-faint")}>
                                            {status === "done" ? <Check size={16} /> : <Icon size={16} />}
                                        </span>
                                        <div className="min-w-0">
                                            <p className={cn("truncate text-[13px] font-semibold leading-tight", status === "pending" ? "text-ink-faint" : "text-ink")}>{n.label}</p>
                                            <p className="truncate text-[11px] text-ink-muted">{n.sub}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 pl-0.5">
                                        {status === "active" ? (
                                            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                                                <Spinner /> Working
                                            </span>
                                        ) : (
                                            <span className={cn("flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide", status === "done" ? "text-brand-600" : "text-ink-faint")}>
                                                <span className={cn("h-1.5 w-1.5 rounded-full", status === "done" ? "bg-brand-500" : "bg-ink-faint/40")} />
                                                {status === "done" ? "Done" : "Queued"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    });
                })}

                {/* lane labels */}
                {items.map((item, lane) => (
                    <div key={item.id} className="absolute -left-0 flex items-center gap-1.5" style={{ left: PAD, top: PAD + lane * LANE_H + NODE_H + 6 }}>
                        <Leaf size={12} className="text-brand-500" />
                        <span className="text-[11px] font-medium capitalize text-ink-muted">{item.crop}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Spinner() {
    return <svg width="11" height="11" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" /><path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}
