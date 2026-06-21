"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type SourcingItem, STAGES, farmById } from "@/lib/store";
import { AgentAvatar, AGENT_NAME } from "@/components/app/AgentDock";
import { Search, Farm, Pen, Truck, MarginUp, Check, Leaf, Shield } from "@/components/icons";
import { cn } from "@/lib/utils";

const NODE_W = 156, NODE_H = 74, GAP_X = 78, LANE_H = 128, PAD = 26;
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

type Mode = { type: "node"; key: string; sx: number; sy: number; bx: number; by: number } | { type: "pan"; sx: number; sy: number; bx: number; by: number } | null;

/**
 * A live model of what the agent is doing. The agent owns the graph — the user
 * cannot create or edit nodes, only drag them around / pan to inspect the flow.
 */
export function AutomationBoard({ items }: { items: SourcingItem[] }) {
    const lanes = items.length;
    const baseW = PAD * 2 + NODE_W * 5 + GAP_X * 4;
    const baseH = Math.max(LANE_H, lanes * LANE_H) + 12;
    const viewH = Math.min(baseH + 24, 560);

    const [drag, setDrag] = React.useState<Record<string, { dx: number; dy: number }>>({});
    const [pan, setPan] = React.useState({ x: 0, y: 0 });
    const mode = React.useRef<Mode>(null);

    const base = (lane: number, i: number) => ({ x: PAD + i * (NODE_W + GAP_X), y: PAD + lane * LANE_H });
    const posOf = (lane: number, i: number) => { const b = base(lane, i); const d = drag[`${lane}-${i}`] || { dx: 0, dy: 0 }; return { x: b.x + d.dx, y: b.y + d.dy }; };

    function onNodeDown(e: React.PointerEvent, key: string) {
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        const d = drag[key] || { dx: 0, dy: 0 };
        mode.current = { type: "node", key, sx: e.clientX, sy: e.clientY, bx: d.dx, by: d.dy };
    }
    function onBgDown(e: React.PointerEvent) {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        mode.current = { type: "pan", sx: e.clientX, sy: e.clientY, bx: pan.x, by: pan.y };
    }
    function onMove(e: React.PointerEvent) {
        const m = mode.current; if (!m) return;
        const ddx = e.clientX - m.sx, ddy = e.clientY - m.sy;
        if (m.type === "node") setDrag((p) => ({ ...p, [m.key]: { dx: m.bx + ddx, dy: m.by + ddy } }));
        else setPan({ x: m.bx + ddx, y: m.by + ddy });
    }
    function onUp() { mode.current = null; }
    const reset = () => { setDrag({}); setPan({ x: 0, y: 0 }); };
    const touched = Object.keys(drag).length > 0 || pan.x !== 0 || pan.y !== 0;

    if (lanes === 0) return null;

    return (
        <div className="relative">
            <div className="mb-2.5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-ink-faint">
                    <Shield size={12} className="text-brand-500" /> Built and run by {AGENT_NAME} · view only · drag to arrange
                </span>
                {touched && <button onClick={reset} className="text-2xs font-semibold text-brand-600 hover:underline">Reset layout</button>}
            </div>

            <div
                className="relative touch-none select-none overflow-hidden rounded-3xl border border-line bg-white bg-dots cursor-grab active:cursor-grabbing"
                style={{ height: viewH }}
                onPointerDown={onBgDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
            >
                <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
                    {/* edges */}
                    <svg className="absolute left-0 top-0 overflow-visible" style={{ width: baseW, height: baseH }}>
                        {items.map((item, lane) => {
                            const cur = STAGES.indexOf(item.stage);
                            return [0, 1, 2, 3].map((i) => {
                                const flow = i + 1 <= cur;
                                const s = posOf(lane, i), t = posOf(lane, i + 1);
                                const x1 = s.x + NODE_W, y1 = s.y + NODE_H / 2, x2 = t.x, y2 = t.y + NODE_H / 2;
                                const d = `M ${x1} ${y1} C ${x1 + 44} ${y1}, ${x2 - 44} ${y2}, ${x2} ${y2}`;
                                return (
                                    <g key={`${lane}-${i}`}>
                                        <path d={d} fill="none" stroke={flow ? "#235C3A" : "rgba(22,36,28,0.14)"} strokeWidth={2} strokeDasharray={flow ? "5 6" : undefined}>
                                            {flow && <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="0.7s" repeatCount="indefinite" />}
                                        </path>
                                        <circle cx={x2} cy={y2} r={3} fill={flow ? "#235C3A" : "rgba(22,36,28,0.22)"} />
                                    </g>
                                );
                            });
                        })}
                    </svg>

                    {/* nodes */}
                    {items.map((item, lane) => {
                        const cur = STAGES.indexOf(item.stage);
                        return nodesFor(item).map((n, i) => {
                            const status = i < cur ? "done" : i === cur ? "active" : "pending";
                            const Icon = NODE_ICON[i];
                            const p = posOf(lane, i);
                            return (
                                <motion.div key={`${lane}-${i}`} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: lane * 0.05 + i * 0.06 }}
                                    onPointerDown={(e) => onNodeDown(e, `${lane}-${i}`)}
                                    className="absolute cursor-grab active:cursor-grabbing" style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}>
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
                                                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600"><Spinner /> {AGENT_NAME} working</span>
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

                    {/* lane labels follow node 0 */}
                    {items.map((item, lane) => {
                        const p = posOf(lane, 0);
                        return (
                            <div key={item.id} className="absolute flex items-center gap-1.5" style={{ left: p.x, top: p.y + NODE_H + 6 }}>
                                <Leaf size={12} className="text-brand-500" />
                                <span className="text-[11px] font-medium capitalize text-ink-muted">{item.crop}</span>
                            </div>
                        );
                    })}
                </div>

                {/* agent badge, fixed in corner */}
                <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-line bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
                    <AgentAvatar size={22} />
                    <span className="text-2xs font-semibold text-ink-soft">{AGENT_NAME} is orchestrating</span>
                </div>
            </div>
        </div>
    );
}

function Spinner() {
    return <svg width="11" height="11" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" /><path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}
