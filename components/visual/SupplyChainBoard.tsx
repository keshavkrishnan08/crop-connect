"use client";

import * as React from "react";
import { type BoardNode, type BoardEdge, type NodeType, type NodeStatus, NODE_META } from "@/lib/types";
import {
    Wheat, Crate, Snowflake, Truck, Shield, MapPin, Check, Dot, Plus, Route, X, Pen, Nodes as NodesIcon,
} from "@/components/icons";
import { cn, clamp } from "@/lib/utils";

const NODE_W = 158;
const NODE_H = 66;

const TYPE_ICON: Record<NodeType, React.ComponentType<{ size?: number }>> = {
    harvest: Wheat, pack: Crate, cold_storage: Snowflake, pickup: Crate,
    transit: Truck, inspection: Shield, dropoff: MapPin, delivered: Check, custom: Dot,
};

const STATUS_RING: Record<NodeStatus, string> = {
    pending: "rgba(14,21,18,0.12)",
    active: "rgba(30,142,90,0.9)",
    done: "rgba(30,142,90,0.5)",
    blocked: "rgba(168,75,110,0.9)",
};

const STATUS_LABEL: Record<NodeStatus, string> = {
    pending: "Pending", active: "In progress", done: "Done", blocked: "Blocked",
};

const PALETTE: { type: NodeType; label: string }[] = [
    { type: "harvest", label: "Harvest" },
    { type: "pack", label: "Pack & grade" },
    { type: "cold_storage", label: "Cold storage" },
    { type: "pickup", label: "Pickup" },
    { type: "transit", label: "In transit" },
    { type: "inspection", label: "Inspection" },
    { type: "dropoff", label: "Drop-off" },
    { type: "delivered", label: "Delivered" },
    { type: "custom", label: "Custom step" },
];

export interface BoardHandlers {
    onMoveNode?: (id: string, x: number, y: number) => void;
    onAddNode?: (type: NodeType, x: number, y: number) => void;
    onConnect?: (source: string, target: string) => void;
    onDeleteNode?: (id: string) => void;
    onDeleteEdge?: (id: string) => void;
    onRenameNode?: (id: string, label: string) => void;
    onSetStatus?: (id: string, status: NodeStatus) => void;
    onHighlight?: (id: string) => void;
    onSetMeta?: (id: string, meta: Record<string, unknown>) => void;
    onLabelEdge?: (id: string, label: string) => void;
}

export function SupplyChainBoard({
    nodes, edges, editable = false, height = 520, handlers = {}, className,
}: {
    nodes: BoardNode[];
    edges: BoardEdge[];
    editable?: boolean;
    height?: number;
    handlers?: BoardHandlers;
    className?: string;
}) {
    const wrapRef = React.useRef<HTMLDivElement>(null);
    const [view, setView] = React.useState({ x: 40, y: 24, z: 1 });
    const [selected, setSelected] = React.useState<string | null>(null);
    const [drag, setDrag] = React.useState<{ id: string; dx: number; dy: number; live: { x: number; y: number } } | null>(null);
    const [pan, setPan] = React.useState<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
    const [connect, setConnect] = React.useState<{ from: string; x: number; y: number } | null>(null);
    const [editing, setEditing] = React.useState<string | null>(null);

    const toWorld = (clientX: number, clientY: number) => {
        const rect = wrapRef.current!.getBoundingClientRect();
        return { x: (clientX - rect.left - view.x) / view.z, y: (clientY - rect.top - view.y) / view.z };
    };

    // ---- wheel zoom ----
    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const rect = wrapRef.current!.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const nz = clamp(view.z * (e.deltaY > 0 ? 0.9 : 1.1), 0.4, 2.2);
        // zoom toward cursor
        const wx = (mx - view.x) / view.z;
        const wy = (my - view.y) / view.z;
        setView({ z: nz, x: mx - wx * nz, y: my - wy * nz });
    };

    // ---- background pan ----
    const onBgPointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        setSelected(null);
        setPan({ sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y });
        (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (pan) {
            setView((v) => ({ ...v, x: pan.ox + (e.clientX - pan.sx), y: pan.oy + (e.clientY - pan.sy) }));
        } else if (drag) {
            const w = toWorld(e.clientX, e.clientY);
            setDrag({ ...drag, live: { x: Math.round(w.x - drag.dx), y: Math.round(w.y - drag.dy) } });
        } else if (connect) {
            const w = toWorld(e.clientX, e.clientY);
            setConnect({ ...connect, x: w.x, y: w.y });
        }
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (drag) {
            handlers.onMoveNode?.(drag.id, drag.live.x, drag.live.y);
            setDrag(null);
        }
        if (connect) {
            // did we land on a node?
            const w = toWorld(e.clientX, e.clientY);
            const target = nodes.find((n) => n.id !== connect.from && hit(n, w));
            if (target) handlers.onConnect?.(connect.from, target.id);
            setConnect(null);
        }
        setPan(null);
    };

    // ---- node drag ----
    const startNodeDrag = (e: React.PointerEvent, n: BoardNode) => {
        if (!editable) return;
        e.stopPropagation();
        setSelected(n.id);
        const w = toWorld(e.clientX, e.clientY);
        setDrag({ id: n.id, dx: w.x - n.x, dy: w.y - n.y, live: { x: n.x, y: n.y } });
        (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const startConnect = (e: React.PointerEvent, n: BoardNode) => {
        e.stopPropagation();
        const w = toWorld(e.clientX, e.clientY);
        setConnect({ from: n.id, x: w.x, y: w.y });
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    };

    const nodePos = (n: BoardNode) => (drag && drag.id === n.id ? drag.live : { x: n.x, y: n.y });
    const center = (n: BoardNode) => { const p = nodePos(n); return { x: p.x + NODE_W / 2, y: p.y + NODE_H / 2 }; };

    const addNode = (type: NodeType) => {
        const rect = wrapRef.current!.getBoundingClientRect();
        const w = toWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
        handlers.onAddNode?.(type, Math.round(w.x - NODE_W / 2), Math.round(w.y - NODE_H / 2));
    };

    const fit = () => setView({ x: 40, y: 24, z: 1 });

    const sel = nodes.find((n) => n.id === selected) || null;

    return (
        <div className={cn("relative overflow-hidden rounded-3xl border border-line bg-white", className)} style={{ height }}>
            {/* dotted backdrop */}
            <div className="pointer-events-none absolute inset-0 bg-dots opacity-70" style={{ backgroundPosition: `${view.x}px ${view.y}px`, backgroundSize: `${22 * view.z}px ${22 * view.z}px` }} />

            <div
                ref={wrapRef}
                className={cn("absolute inset-0 touch-none", pan ? "cursor-grabbing" : "cursor-grab")}
                onWheel={onWheel}
                onPointerDown={onBgPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
            >
                <svg className="absolute inset-0 h-full w-full overflow-visible">
                    <g transform={`translate(${view.x},${view.y}) scale(${view.z})`}>
                        {/* edges */}
                        {edges.map((ed) => {
                            const s = nodes.find((n) => n.id === ed.source);
                            const t = nodes.find((n) => n.id === ed.target);
                            if (!s || !t) return null;
                            const a = center(s), b = center(t);
                            const live = s.highlighted || t.highlighted;
                            return (
                                <Edge key={ed.id} a={a} b={b} live={live} label={ed.label} editable={editable}
                                    onLabel={(v) => handlers.onLabelEdge?.(ed.id, v)}
                                    onDelete={editable ? () => handlers.onDeleteEdge?.(ed.id) : undefined} />
                            );
                        })}
                        {/* connect preview */}
                        {connect && (() => {
                            const s = nodes.find((n) => n.id === connect.from);
                            if (!s) return null;
                            const a = center(s);
                            return <path d={bezier(a, { x: connect.x, y: connect.y })} fill="none" stroke="#1E8E5A" strokeWidth={2} strokeDasharray="5 5" className="animate-marching" />;
                        })()}

                        {/* nodes */}
                        {nodes.map((n) => {
                            const p = nodePos(n);
                            const Icon = TYPE_ICON[n.type] ?? Dot;
                            const isSel = selected === n.id;
                            return (
                                <g key={n.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: editable ? "grab" : "default" }}>
                                    {n.highlighted && (
                                        <rect x={-6} y={-6} width={NODE_W + 12} height={NODE_H + 12} rx={20}
                                            fill="none" stroke="#1E8E5A" strokeWidth={2} className="animate-pulse-ring" opacity={0.5} />
                                    )}
                                    <foreignObject
                                        x={0} y={0} width={NODE_W} height={NODE_H}
                                        onPointerDown={(e) => startNodeDrag(e as never, n)}
                                        onClick={(e) => { e.stopPropagation(); setSelected(n.id); }}
                                    >
                                        <div
                                            className={cn(
                                                "flex h-full items-center gap-2.5 rounded-2xl border bg-white px-3 shadow-node transition-shadow",
                                                isSel ? "border-forest-400 ring-2 ring-forest-400/30" : "border-line",
                                                n.highlighted && "border-forest-400",
                                            )}
                                        >
                                            <span
                                                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white"
                                                style={{ background: `linear-gradient(140deg, hsl(${NODE_META[n.type]?.hue ?? 150} 55% 40%), hsl(${NODE_META[n.type]?.hue ?? 150} 60% 30%))` }}
                                            >
                                                <Icon size={18} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                {editing === n.id ? (
                                                    <input
                                                        autoFocus defaultValue={n.label}
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        onBlur={(e) => { handlers.onRenameNode?.(n.id, e.target.value || "Step"); setEditing(null); }}
                                                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                                        className="w-full rounded-md border border-forest-300 px-1 text-sm font-semibold outline-none"
                                                    />
                                                ) : (
                                                    <p
                                                        className="truncate text-sm font-semibold leading-tight text-ink"
                                                        onDoubleClick={() => editable && setEditing(n.id)}
                                                    >
                                                        {n.label}
                                                    </p>
                                                )}
                                                <span className="flex items-center gap-1 text-2xs font-medium" style={{ color: STATUS_RING[n.status] }}>
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_RING[n.status] }} />
                                                    {n.highlighted ? "Product here" : STATUS_LABEL[n.status]}
                                                </span>
                                            </div>
                                        </div>
                                    </foreignObject>
                                    {/* connect handle */}
                                    {editable && (
                                        <circle
                                            cx={NODE_W} cy={NODE_H / 2} r={7}
                                            className="fill-white stroke-forest-500 transition-transform hover:scale-125"
                                            strokeWidth={2} style={{ cursor: "crosshair" }}
                                            onPointerDown={(e) => startConnect(e as never, n)}
                                        />
                                    )}
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* ---- top toolbar ---- */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
                <div className="glass-panel flex items-center gap-1 p-1">
                    <button onClick={() => setView((v) => ({ ...v, z: clamp(v.z * 1.15, 0.4, 2.2) }))} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-sunk">＋</button>
                    <button onClick={() => setView((v) => ({ ...v, z: clamp(v.z * 0.87, 0.4, 2.2) }))} className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-sunk">－</button>
                    <button onClick={fit} className="grid h-8 px-2.5 place-items-center rounded-lg text-xs font-semibold text-ink-soft hover:bg-paper-sunk">Reset</button>
                </div>
                {!editable && (
                    <span className="badge bg-ink/5 text-ink-faint">Read-only</span>
                )}
            </div>

            {/* ---- palette (edit mode) ---- */}
            {editable && <Palette onAdd={addNode} />}

            {/* ---- selection inspector ---- */}
            {editable && sel && (
                <Inspector
                    node={sel}
                    onClose={() => setSelected(null)}
                    onRename={() => setEditing(sel.id)}
                    onStatus={(s) => handlers.onSetStatus?.(sel.id, s)}
                    onHighlight={() => handlers.onHighlight?.(sel.id)}
                    onSetMeta={(meta) => handlers.onSetMeta?.(sel.id, meta)}
                    onDelete={() => { handlers.onDeleteNode?.(sel.id); setSelected(null); }}
                />
            )}

            {/* empty state */}
            {nodes.length === 0 && (
                <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-forest-50 text-forest-500"><NodesIcon size={26} /></div>
                        <p className="font-display text-lg text-ink">No supply steps yet</p>
                        <p className="text-sm text-ink-muted">{editable ? "Add steps from the palette to map the journey." : "The board appears once the contract is active."}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function hit(n: BoardNode, w: { x: number; y: number }) {
    return w.x >= n.x && w.x <= n.x + NODE_W && w.y >= n.y && w.y <= n.y + NODE_H;
}

function bezier(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

function Edge({
    a, b, live, label, editable, onLabel, onDelete,
}: {
    a: { x: number; y: number }; b: { x: number; y: number }; live: boolean;
    label?: string | null; editable?: boolean; onLabel?: (v: string) => void; onDelete?: () => void;
}) {
    const [hover, setHover] = React.useState(false);
    const [editing, setEditing] = React.useState(false);
    const d = bezier(a, b);
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const showLabel = !!label || editing;
    return (
        <g onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
            <path d={d} fill="none" stroke="transparent" strokeWidth={16} style={{ cursor: onDelete ? "pointer" : "default" }} />
            <path d={d} fill="none" stroke={live ? "#1E8E5A" : "rgba(14,21,18,0.18)"} strokeWidth={2}
                strokeDasharray={live ? "6 6" : undefined} className={live ? "animate-marching" : undefined} markerEnd="url(#arrow)" />
            <circle cx={b.x} cy={b.y} r={3} fill={live ? "#1E8E5A" : "rgba(14,21,18,0.3)"} />

            {/* edge label */}
            {showLabel && (
                <foreignObject x={mid.x - 60} y={mid.y - 26} width={120} height={24}>
                    {editing ? (
                        <input
                            autoFocus defaultValue={label ?? ""}
                            onPointerDown={(e) => e.stopPropagation()}
                            onBlur={(e) => { onLabel?.(e.target.value); setEditing(false); }}
                            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                            placeholder="label"
                            className="w-full rounded-md border border-forest-300 bg-white px-1.5 py-0.5 text-center text-2xs font-semibold outline-none"
                        />
                    ) : (
                        <div
                            onDoubleClick={() => editable && setEditing(true)}
                            className="mx-auto w-fit rounded-md bg-white px-2 py-0.5 text-center text-2xs font-semibold text-ink-soft shadow-glass"
                        >
                            {label}
                        </div>
                    )}
                </foreignObject>
            )}

            {/* hover controls */}
            {editable && hover && !editing && (
                <foreignObject x={mid.x - 24} y={mid.y - 2} width={52} height={24}>
                    <div className="flex items-center justify-center gap-1">
                        {!label && (
                            <button onClick={() => setEditing(true)} className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white text-forest-600 shadow-glass hover:bg-forest-500 hover:text-white">
                                <Pen size={12} />
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={onDelete} className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white text-berry shadow-glass hover:bg-berry hover:text-white">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </foreignObject>
            )}
            <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6" fill="none" stroke={live ? "#1E8E5A" : "rgba(14,21,18,0.3)"} strokeWidth={1.4} />
                </marker>
            </defs>
        </g>
    );
}

function Palette({ onAdd }: { onAdd: (t: NodeType) => void }) {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="absolute bottom-4 left-4">
            {open && (
                <div className="glass-card mb-2 grid w-56 gap-0.5 p-1.5 animate-scale-in">
                    {PALETTE.map((p) => {
                        const Icon = TYPE_ICON[p.type] ?? Dot;
                        return (
                            <button key={p.type} onClick={() => { onAdd(p.type); setOpen(false); }}
                                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft hover:bg-paper-sunk">
                                <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest-50 text-forest-600"><Icon size={15} /></span>
                                {p.label}
                            </button>
                        );
                    })}
                </div>
            )}
            <button onClick={() => setOpen((o) => !o)} className="btn-primary btn-sm shadow-forest-glow">
                <Plus size={16} /> Add step
            </button>
        </div>
    );
}

function Inspector({
    node, onClose, onRename, onStatus, onHighlight, onSetMeta, onDelete,
}: {
    node: BoardNode; onClose: () => void; onRename: () => void;
    onStatus: (s: NodeStatus) => void; onHighlight: () => void;
    onSetMeta: (meta: Record<string, unknown>) => void; onDelete: () => void;
}) {
    const meta = (node.meta ?? {}) as { date?: string; qty?: string; note?: string };
    const patch = (k: string, v: string) => onSetMeta({ ...meta, [k]: v });
    return (
        <div className="absolute right-4 top-4 max-h-[calc(100%-2rem)] w-64 overflow-y-auto glass-card p-4 animate-scale-in">
            <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-lg text-ink">{node.label}</p>
                <button onClick={onClose} className="text-ink-faint hover:text-ink"><X size={16} /></button>
            </div>
            <button onClick={onHighlight} className={cn("mb-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition", node.highlighted ? "bg-forest-500 text-white" : "bg-forest-50 text-forest-600 hover:bg-forest-100")}>
                <Route size={16} /> {node.highlighted ? "Product is here" : "Mark product here"}
            </button>
            <p className="label">Status</p>
            <div className="mb-4 grid grid-cols-2 gap-1.5">
                {(["pending", "active", "done", "blocked"] as NodeStatus[]).map((s) => (
                    <button key={s} onClick={() => onStatus(s)}
                        className={cn("rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize transition", node.status === s ? "border-forest-400 bg-forest-50 text-forest-600" : "border-line text-ink-muted hover:border-line-strong")}>
                        {STATUS_LABEL[s]}
                    </button>
                ))}
            </div>

            <p className="label">Details</p>
            <div className="mb-4 space-y-2">
                <input type="date" defaultValue={meta.date ?? ""} onChange={(e) => patch("date", e.target.value)} className="field h-9 text-[13px]" />
                <input defaultValue={meta.qty ?? ""} onBlur={(e) => patch("qty", e.target.value)} placeholder="Quantity / load" className="field h-9 text-[13px]" />
                <textarea defaultValue={meta.note ?? ""} onBlur={(e) => patch("note", e.target.value)} placeholder="Note…" rows={2} className="field h-auto py-2 text-[13px]" />
            </div>

            <div className="flex gap-2">
                <button onClick={onRename} className="btn-ghost btn-sm flex-1"><Pen size={14} /> Rename</button>
                <button onClick={onDelete} className="btn btn-sm flex-1 bg-berry/8 text-berry hover:bg-berry/15"><X size={14} /> Delete</button>
            </div>
        </div>
    );
}
