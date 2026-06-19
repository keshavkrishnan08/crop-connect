"use client";

import * as React from "react";
import { SupplyChainBoard } from "@/components/visual/SupplyChainBoard";
import { defaultBoard, DEFAULT_EDGES } from "@/lib/contract";
import { type BoardNode, type BoardEdge, type NodeType, type NodeStatus } from "@/lib/types";

const LABELS: Record<NodeType, string> = {
    harvest: "Harvest", pack: "Pack & grade", cold_storage: "Cold storage", pickup: "Pickup",
    transit: "In transit", inspection: "Inspection", dropoff: "Drop-off", delivered: "Delivered", custom: "New step",
};

function seed(): { nodes: BoardNode[]; edges: BoardEdge[] } {
    const base = defaultBoard();
    const nodes: BoardNode[] = base.map((n, i) => ({
        id: `n${i}`, contract_id: "demo", type: n.type, label: n.label, x: n.x, y: n.y,
        status: (i < 2 ? "done" : i === 2 ? "active" : "pending") as NodeStatus,
        meta: null, highlighted: i === 2,
    }));
    const edges: BoardEdge[] = DEFAULT_EDGES
        .filter(([a, b]) => nodes[a] && nodes[b])
        .map(([a, b], i) => ({ id: `e${i}`, contract_id: "demo", source: nodes[a].id, target: nodes[b].id, label: null }));
    return { nodes, edges };
}

/** A fully-interactive supply-chain board on the landing — no signup, local state only. */
export function DemoBoard() {
    const init = React.useMemo(seed, []);
    const [nodes, setNodes] = React.useState<BoardNode[]>(init.nodes);
    const [edges, setEdges] = React.useState<BoardEdge[]>(init.edges);
    const idRef = React.useRef(100);

    const handlers = {
        onMoveNode: (id: string, x: number, y: number) => setNodes((n) => n.map((m) => (m.id === id ? { ...m, x, y } : m))),
        onAddNode: (type: NodeType, x: number, y: number) => {
            const id = `n${idRef.current++}`;
            setNodes((n) => [...n, { id, contract_id: "demo", type, label: LABELS[type], x, y, status: "pending", meta: null, highlighted: false }]);
        },
        onConnect: (s: string, t: string) => setEdges((e) => (e.some((x) => x.source === s && x.target === t) ? e : [...e, { id: `e${idRef.current++}`, contract_id: "demo", source: s, target: t, label: null }])),
        onDeleteNode: (id: string) => { setNodes((n) => n.filter((m) => m.id !== id)); setEdges((e) => e.filter((x) => x.source !== id && x.target !== id)); },
        onDeleteEdge: (id: string) => setEdges((e) => e.filter((x) => x.id !== id)),
        onRenameNode: (id: string, label: string) => setNodes((n) => n.map((m) => (m.id === id ? { ...m, label } : m))),
        onSetStatus: (id: string, status: NodeStatus) => setNodes((n) => n.map((m) => (m.id === id ? { ...m, status } : m))),
        onHighlight: (id: string) => setNodes((n) => n.map((m) => ({ ...m, highlighted: m.id === id, status: m.id === id ? "active" : m.status }))),
        onSetMeta: (id: string, meta: Record<string, unknown>) => setNodes((n) => n.map((m) => (m.id === id ? { ...m, meta } : m))),
        onLabelEdge: (id: string, label: string) => setEdges((e) => e.map((x) => (x.id === id ? { ...x, label } : x))),
    };

    return <SupplyChainBoard nodes={nodes} edges={edges} editable handlers={handlers} height={460} className="shadow-glass-lg" />;
}
