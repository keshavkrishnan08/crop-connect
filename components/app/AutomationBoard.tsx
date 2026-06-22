"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type SourcingItem, STAGES, farmById } from "@/lib/store";
import { AgentAvatar, AGENT_NAME } from "@/components/app/AgentDock";
import { Search, Farm, Pen, Truck, MarginUp, Check, Leaf, Shield } from "@/components/icons";
import { cn } from "@/lib/utils";

const NODE_W = 156, NODE_H = 74, GAP_X = 78, LANE_H = 128, PAD = 26;
const FARM_H = 56, FARM_GAP = 12;
const COL_ICON = [Search, Farm, Pen, Truck, MarginUp];
const COL_LABEL = ["Request", "Farm match", "Agreement", "Deliveries", "On the menu"];

function colSub(item: SourcingItem, col: number) {
    const confirmed = item.deliveries.filter((d) => d.status === "confirmed").length;
    if (col === 0) return `${item.qtyPerWeek} ${item.unit}/wk`;
    if (col === 1) return farmById(item.farmId)?.name ?? "Scanning…";
    if (col === 2) return ["agreed", "delivering", "live"].includes(item.stage) ? "Signed" : "Pending";
    if (col === 3) return item.deliveries.length ? `${confirmed}/${item.deliveries.length} in` : "Scheduling…";
    return item.stage === "live" ? "Earning margin" : "Queued";
}

type Mode = { type: "node"; key: string; sx: number; sy: number; bx: number; by: number } | { type: "pan"; sx: number; sy: number; bx: number; by: number } | null;

/** A live model of what the agent is doing. Branches at the farm-match stage when an order is split across farms. */
export function AutomationBoard({ items, fill = false }: { items: SourcingItem[]; fill?: boolean }) {
    const layout = React.useMemo(() => {
        const lanes = items.map((item) => {
            const allocs = item.allocations && item.allocations.length > 1 ? item.allocations : null;
            const k = allocs ? allocs.length : 1;
            const stackH = k > 1 ? k * FARM_H + (k - 1) * FARM_GAP : NODE_H;
            return { item, allocs, k, h: Math.max(LANE_H, stackH + 46) };
        });
        let acc = PAD;
        const top = lanes.map((l) => { const t = acc; acc += l.h; return t; });
        return { lanes, top, totalH: acc + 12 };
    }, [items]);

    const baseW = PAD * 2 + NODE_W * 5 + GAP_X * 4;
    const baseH = Math.max(LANE_H + PAD * 2, layout.totalH);
    const viewH = Math.min(baseH + 24, 560);

    const [drag, setDrag] = React.useState<Record<string, { dx: number; dy: number }>>({});
    const [pan, setPan] = React.useState({ x: 0, y: 0 });
    const mode = React.useRef<Mode>(null);

    const colX = (col: number) => PAD + col * (NODE_W + GAP_X);
    const mid = (lane: number) => layout.top[lane] + layout.lanes[lane].h / 2;
    const dragOf = (key: string) => drag[key] || { dx: 0, dy: 0 };
    const nodePos = (lane: number, col: number) => { const d = dragOf(`${lane}-${col}`); return { x: colX(col) + d.dx, y: mid(lane) - NODE_H / 2 + d.dy }; };
    const farmPositions = (lane: number) => {
        const k = layout.lanes[lane].k;
        const stackH = k * FARM_H + (k - 1) * FARM_GAP;
        const startY = mid(lane) - stackH / 2;
        return Array.from({ length: k }, (_, j) => ({ x: colX(1), y: startY + j * (FARM_H + FARM_GAP) }));
    };

    function onNodeDown(e: React.PointerEvent, key: string) {
        e.stopPropagation();
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        const d = dragOf(key);
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

    if (items.length === 0) return null;

    const curve = (ax: number, ay: number, bx: number, by: number, flow: boolean, key: string) => (
        <g key={key}>
            <path d={`M ${ax} ${ay} C ${ax + 44} ${ay}, ${bx - 44} ${by}, ${bx} ${by}`} fill="none" stroke={flow ? "#235C3A" : "rgba(22,36,28,0.14)"} strokeWidth={2} strokeDasharray={flow ? "5 6" : undefined}>
                {flow && <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="0.7s" repeatCount="indefinite" />}
            </path>
            <circle cx={bx} cy={by} r={3} fill={flow ? "#235C3A" : "rgba(22,36,28,0.22)"} />
        </g>
    );

    return (
        <div className={fill ? "relative h-full" : "relative"}>
            {!fill && (
                <div className="mb-2.5 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-ink-faint">
                        <Shield size={12} className="text-brand-500" /> Built and run by {AGENT_NAME} · view only · drag to arrange
                    </span>
                    {touched && <button onClick={reset} className="text-2xs font-semibold text-brand-600 hover:underline">Reset layout</button>}
                </div>
            )}

            <div
                className={cn("relative touch-none select-none overflow-hidden bg-white bg-dots cursor-grab active:cursor-grabbing", fill ? "h-full w-full" : "rounded-3xl border border-line")}
                style={{ height: fill ? "100%" : viewH }}
                onPointerDown={onBgDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
            >
                {fill && (
                    <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2">
                        <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-white/90 px-3 py-1.5 text-2xs font-medium text-ink-faint shadow-sm backdrop-blur">
                            <Shield size={12} className="text-brand-500" /> Built and run by {AGENT_NAME} · drag to arrange
                        </span>
                        {touched && <button onClick={reset} className="pointer-events-auto rounded-full border border-line bg-white/90 px-3 py-1.5 text-2xs font-semibold text-brand-600 shadow-sm backdrop-blur hover:bg-white">Reset layout</button>}
                    </div>
                )}
                <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
                    {/* edges */}
                    <svg className="absolute left-0 top-0 overflow-visible" style={{ width: baseW, height: baseH }}>
                        {items.map((item, lane) => {
                            const l = layout.lanes[lane];
                            const cur = STAGES.indexOf(item.stage);
                            if (!l.allocs) {
                                return [0, 1, 2, 3].map((i) => {
                                    const s = nodePos(lane, i), t = nodePos(lane, i + 1);
                                    return curve(s.x + NODE_W, s.y + NODE_H / 2, t.x, t.y + NODE_H / 2, i + 1 <= cur, `${lane}-${i}`);
                                });
                            }
                            const req = nodePos(lane, 0), agr = nodePos(lane, 2), fps = farmPositions(lane);
                            const out: React.ReactNode[] = [];
                            fps.forEach((fp, j) => {
                                out.push(curve(req.x + NODE_W, req.y + NODE_H / 2, fp.x, fp.y + FARM_H / 2, 1 <= cur, `${lane}-fa-${j}`));
                                out.push(curve(fp.x + NODE_W, fp.y + FARM_H / 2, agr.x, agr.y + NODE_H / 2, 2 <= cur, `${lane}-fb-${j}`));
                            });
                            out.push(curve(agr.x + NODE_W, agr.y + NODE_H / 2, nodePos(lane, 3).x, nodePos(lane, 3).y + NODE_H / 2, 3 <= cur, `${lane}-2`));
                            out.push(curve(nodePos(lane, 3).x + NODE_W, nodePos(lane, 3).y + NODE_H / 2, nodePos(lane, 4).x, nodePos(lane, 4).y + NODE_H / 2, 4 <= cur, `${lane}-3`));
                            return out;
                        })}
                    </svg>

                    {/* nodes */}
                    {items.map((item, lane) => {
                        const l = layout.lanes[lane];
                        const cur = STAGES.indexOf(item.stage);
                        const cols = [0, 1, 2, 3, 4].filter((c) => !(l.allocs && c === 1));
                        const single = cols.map((col) => {
                            const status = col < cur ? "done" : col === cur ? "active" : "pending";
                            const p = nodePos(lane, col);
                            return (
                                <motion.div key={`${lane}-${col}`} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: lane * 0.05 + col * 0.06 }}
                                    onPointerDown={(e) => onNodeDown(e, `${lane}-${col}`)}
                                    className="absolute cursor-grab active:cursor-grabbing" style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}>
                                    {status === "active" && <span className="absolute -inset-1 rounded-2xl ring-2 ring-brand-400/50 animate-pulse" />}
                                    <NodeCard icon={COL_ICON[col]} label={COL_LABEL[col]} sub={colSub(item, col)} status={status} />
                                </motion.div>
                            );
                        });
                        const farms = l.allocs ? farmPositions(lane).map((fp, j) => {
                            const alloc = l.allocs![j];
                            const farm = farmById(alloc.farmId);
                            const status = 1 < cur ? "done" : 1 === cur ? "active" : "pending";
                            return (
                                <motion.div key={`${lane}-farm-${j}`} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: lane * 0.05 + 0.06 + j * 0.05 }}
                                    className="absolute" style={{ left: fp.x, top: fp.y, width: NODE_W, height: FARM_H }}>
                                    {status === "active" && <span className="absolute -inset-1 rounded-2xl ring-2 ring-brand-400/40 animate-pulse" />}
                                    <div className={cn("relative flex h-full items-center gap-2 rounded-xl border bg-white px-2.5 shadow-card", status === "done" ? "border-brand-100" : status === "active" ? "border-brand-400" : "border-line")}>
                                        <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg", status === "pending" ? "bg-canvas-sunk text-ink-faint" : "bg-brand-50 text-brand-600")}><Farm size={14} /></span>
                                        <div className="min-w-0">
                                            <p className="truncate text-[12px] font-semibold leading-tight text-ink">{farm?.name ?? "Farm"}</p>
                                            <p className="truncate text-[10.5px] text-ink-muted tnum">{alloc.qty} {item.unit}/wk · {farm?.distanceMi}mi</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }) : null;
                        return <React.Fragment key={item.id}>{single}{farms}</React.Fragment>;
                    })}

                    {/* lane labels */}
                    {items.map((item, lane) => {
                        const l = layout.lanes[lane];
                        const p = nodePos(lane, 0);
                        return (
                            <div key={`lbl-${item.id}`} className="absolute flex items-center gap-1.5" style={{ left: p.x, top: p.y + NODE_H + 6 }}>
                                <Leaf size={12} className="text-brand-500" />
                                <span className="text-[11px] font-medium capitalize text-ink-muted">{item.crop}{l.allocs ? ` · split across ${l.k} farms` : ""}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-line bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
                    <AgentAvatar size={22} />
                    <span className="text-2xs font-semibold text-ink-soft">{AGENT_NAME} is orchestrating</span>
                </div>
            </div>
        </div>
    );
}

function NodeCard({ icon: Icon, label, sub, status }: { icon: React.ComponentType<{ size?: number }>; label: string; sub: string; status: "done" | "active" | "pending" }) {
    return (
        <div className={cn("relative flex h-full flex-col justify-center gap-1 rounded-xl border bg-white px-3 shadow-card", status === "active" ? "border-brand-400" : status === "done" ? "border-brand-100" : "border-line")}>
            <div className="flex items-center gap-2">
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", status === "active" ? "bg-brand-500 text-white" : status === "done" ? "bg-brand-50 text-brand-600" : "bg-canvas-sunk text-ink-faint")}>
                    {status === "done" ? <Check size={16} /> : <Icon size={16} />}
                </span>
                <div className="min-w-0">
                    <p className={cn("truncate text-[13px] font-semibold leading-tight", status === "pending" ? "text-ink-faint" : "text-ink")}>{label}</p>
                    <p className="truncate text-[11px] text-ink-muted">{sub}</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 pl-0.5">
                {status === "active"
                    ? <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600"><Spinner /> {AGENT_NAME} working</span>
                    : <span className={cn("flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide", status === "done" ? "text-brand-600" : "text-ink-faint")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", status === "done" ? "bg-brand-500" : "bg-ink-faint/40")} />
                        {status === "done" ? "Done" : "Queued"}
                    </span>}
            </div>
        </div>
    );
}

function Spinner() {
    return <svg width="11" height="11" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" /><path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}
