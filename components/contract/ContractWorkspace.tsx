"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
    getContract, getMessages, sendMessage, getBoard, addNode, updateNode, deleteNode,
    addEdge, deleteEdge, highlightNode, setDeliveryStatus, confirmContract, counterContract,
    declineContract, renewContract, completeContract,
} from "@/lib/queries";
import {
    type Contract, type NegotiationMessage, type BoardNode, type BoardEdge, type Terms,
    type Delivery, type NodeType, type NodeStatus, type DeliveryStatus,
    CONTRACT_STATUS_META,
} from "@/lib/types";
import { contractValueCents, fallbackAgreement, isLocked } from "@/lib/contract";
import { formatMoney, formatDate, relativeTime, cn } from "@/lib/utils";
import { Avatar, Button, Spinner, GlassCard } from "@/components/ui/kit";
import { StatusBadge } from "@/components/contract/StatusBadge";
import { TermsForm } from "@/components/contract/TermsForm";
import { LifecycleTracker } from "@/components/visual/LifecycleTracker";
import { DeliveryCalendar } from "@/components/visual/DeliveryCalendar";
import { ValueModel } from "@/components/visual/ValueModel";
import { TermDiff } from "@/components/visual/TermDiff";
import { SupplyChainBoard } from "@/components/visual/SupplyChainBoard";
import { useToast } from "@/components/ui/Toast";
import {
    Handshake, Pen, Nodes, Calendar as CalIcon, Scale, Sparkle, Check, X, ArrowRight,
    Repeat, Pulse, MapPin,
} from "@/components/icons";

type Tab = "negotiate" | "agreement" | "board" | "deliveries";

export function ContractWorkspace({ id }: { id: string }) {
    const { profile } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const [contract, setContract] = React.useState<Contract | null>(null);
    const [messages, setMessages] = React.useState<NegotiationMessage[]>([]);
    const [nodes, setNodes] = React.useState<BoardNode[]>([]);
    const [edges, setEdges] = React.useState<BoardEdge[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [tab, setTab] = React.useState<Tab>("negotiate");
    const [busy, setBusy] = React.useState(false);
    const [counterOpen, setCounterOpen] = React.useState(false);

    const load = React.useCallback(async () => {
        const c = await getContract(id);
        setContract(c);
        if (c) {
            const [msgs, board] = await Promise.all([getMessages(id), getBoard(id)]);
            setMessages(msgs);
            setNodes(board.nodes);
            setEdges(board.edges);
        }
        setLoading(false);
    }, [id]);

    React.useEffect(() => { load(); }, [load]);

    // realtime: board + messages
    React.useEffect(() => {
        const ch = supabase
            .channel(`contract-${id}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "negotiation_messages", filter: `contract_id=eq.${id}` }, () => getMessages(id).then(setMessages))
            .on("postgres_changes", { event: "*", schema: "public", table: "board_nodes", filter: `contract_id=eq.${id}` }, () => getBoard(id).then((b) => { setNodes(b.nodes); setEdges(b.edges); }))
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [id]);

    if (loading) return <div className="grid h-[60vh] place-items-center"><Spinner size={26} className="text-forest-500" /></div>;
    if (!contract || !profile) return <NotFound />;

    const meId = profile.id;
    const isFarm = contract.farm_id === meId;
    const me = isFarm ? contract.farm : contract.buyer;
    const other = isFarm ? contract.buyer : contract.farm;
    const myConfirmed = isFarm ? contract.farm_confirmed : contract.buyer_confirmed;
    const otherConfirmed = isFarm ? contract.buyer_confirmed : contract.farm_confirmed;
    const t = contract.terms;
    const negotiating = ["proposed", "countered", "agreed"].includes(contract.status);
    const boardEditable = ["active", "renewed"].includes(contract.status);
    const terminal = ["completed", "closed"].includes(contract.status);
    const latestVersion = contract.versions?.[contract.versions.length - 1];
    const prevVersion = contract.versions && contract.versions.length > 1 ? contract.versions[contract.versions.length - 2] : null;

    // ---------- actions ----------
    const doConfirm = async () => {
        setBusy(true);
        try {
            await confirmContract(contract, meId);
            toast.success(otherConfirmed ? "Contract activated" : "Confirmed", otherConfirmed ? "Supply chain & deliveries are live." : "Waiting on the other party.");
            await load();
        } finally { setBusy(false); }
    };
    const doDecline = async () => {
        setBusy(true);
        try { await declineContract(contract, meId); toast.info("Contract closed"); await load(); }
        finally { setBusy(false); }
    };
    const doRenew = async () => {
        setBusy(true);
        try { await renewContract(contract, meId, contract.terms); toast.success("Renewed", "A fresh term has begun."); await load(); }
        finally { setBusy(false); }
    };
    const doComplete = async () => {
        setBusy(true);
        try { await completeContract(contract, meId, "completed"); toast.success("Marked complete"); await load(); }
        finally { setBusy(false); }
    };

    // ---------- board handlers (optimistic) ----------
    const boardHandlers = {
        onMoveNode: (nid: string, x: number, y: number) => { setNodes((n) => n.map((m) => m.id === nid ? { ...m, x, y } : m)); updateNode(nid, { x, y }); },
        onAddNode: async (type: NodeType, x: number, y: number) => {
            const node = await addNode(id, { type, label: labelFor(type), x, y });
            if (node) setNodes((n) => [...n, node]);
        },
        onConnect: async (source: string, target: string) => {
            if (edges.some((e) => e.source === source && e.target === target)) return;
            const e = await addEdge(id, source, target);
            if (e) setEdges((prev) => [...prev, e]);
        },
        onDeleteNode: (nid: string) => { setNodes((n) => n.filter((m) => m.id !== nid)); setEdges((e) => e.filter((x) => x.source !== nid && x.target !== nid)); deleteNode(nid); },
        onDeleteEdge: (eid: string) => { setEdges((e) => e.filter((x) => x.id !== eid)); deleteEdge(eid); },
        onRenameNode: (nid: string, label: string) => { setNodes((n) => n.map((m) => m.id === nid ? { ...m, label } : m)); updateNode(nid, { label }); },
        onSetStatus: (nid: string, status: NodeStatus) => { setNodes((n) => n.map((m) => m.id === nid ? { ...m, status } : m)); updateNode(nid, { status }); },
        onHighlight: (nid: string) => { setNodes((n) => n.map((m) => ({ ...m, highlighted: m.id === nid, status: m.id === nid ? "active" : m.status }))); highlightNode(id, nid); },
    };

    const advanceDelivery = async (did: string, next: DeliveryStatus) => {
        setContract((c) => c ? { ...c, deliveries: c.deliveries?.map((d) => d.id === did ? { ...d, status: next } : d) } : c);
        await setDeliveryStatus(did, next);
    };

    const TABS: { key: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
        { key: "negotiate", label: "Negotiate", icon: Handshake },
        { key: "agreement", label: "Agreement", icon: Pen },
        { key: "board", label: "Supply chain", icon: Nodes },
        { key: "deliveries", label: "Deliveries", icon: CalIcon },
    ];

    return (
        <div className="animate-fade-up">
            {/* breadcrumb */}
            <Link href="/app/contracts" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
                <ArrowRight size={15} className="rotate-180" /> All contracts
            </Link>

            {/* header */}
            <GlassCard className="mb-5 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <span className="grid h-14 w-14 place-items-center rounded-3xl bg-forest-50 text-forest-600">
                            <Pulse size={26} />
                        </span>
                        <div>
                            <div className="mb-1 flex items-center gap-2.5">
                                <h1 className="font-display text-3xl leading-none text-ink">{t.crop}</h1>
                                <StatusBadge status={contract.status} />
                            </div>
                            <p className="text-sm text-ink-muted">
                                {contract.farm?.org_name || contract.farm?.full_name} <span className="text-ink-faint">→</span> {contract.buyer?.org_name || contract.buyer?.full_name}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-display text-3xl text-forest-600">{formatMoney(contractValueCents(t))}</p>
                        <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">committed value</p>
                    </div>
                </div>
            </GlassCard>

            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div className="min-w-0">
                    {/* tabs */}
                    <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white/60 p-1 backdrop-blur-md no-scrollbar">
                        {TABS.map((tb) => (
                            <button
                                key={tb.key}
                                onClick={() => setTab(tb.key)}
                                className={cn(
                                    "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                                    tab === tb.key ? "bg-forest-500 text-white shadow-[0_8px_18px_-10px_rgba(30,142,90,0.7)]" : "text-ink-soft hover:bg-paper-sunk",
                                )}
                            >
                                <tb.icon size={17} /> {tb.label}
                            </button>
                        ))}
                    </div>

                    {tab === "negotiate" && (
                        <NegotiatePanel
                            contract={contract} meId={meId} messages={messages}
                            latestTerms={latestVersion?.terms ?? t} prevTerms={prevVersion?.terms ?? null}
                            onSend={async (body) => { const m = await sendMessage(id, meId, body); setMessages((p) => [...p, m]); }}
                        />
                    )}

                    {tab === "agreement" && (
                        <AgreementPanel contract={contract} onSaved={load} />
                    )}

                    {tab === "board" && (
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm text-ink-muted">
                                    {boardEditable ? "Drag steps, connect them, and mark where the product is right now." : "The live supply-chain map for this contract."}
                                </p>
                            </div>
                            <SupplyChainBoard nodes={nodes} edges={edges} editable={boardEditable} handlers={boardHandlers} height={540} />
                        </div>
                    )}

                    {tab === "deliveries" && (
                        <DeliveryCalendar deliveries={contract.deliveries ?? []} unit={t.unit} editable={boardEditable} onAdvance={advanceDelivery} />
                    )}
                </div>

                {/* sidebar */}
                <aside className="space-y-5">
                    <LifecycleTracker status={contract.status} />

                    {/* action card */}
                    {negotiating && !terminal && (
                        <GlassCard className="p-5">
                            <h3 className="mb-1 font-display text-lg text-ink">Your move</h3>
                            <p className="mb-4 text-[13px] text-ink-muted">
                                {myConfirmed ? "You've confirmed these terms. Waiting on the other party." : "Confirm to agree, or counter with revised terms."}
                            </p>
                            <div className="mb-4 space-y-2">
                                <ConfirmRow label={isFarm ? "You (farm)" : "You (buyer)"} done={myConfirmed} />
                                <ConfirmRow label={other?.org_name || other?.full_name || "Counterparty"} done={otherConfirmed} />
                            </div>
                            {!myConfirmed && (
                                <Button className="mb-2 w-full" onClick={doConfirm} loading={busy}>
                                    <Check size={18} /> Confirm terms
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setCounterOpen(true)}>
                                    <Pen size={15} /> Counter
                                </Button>
                                <Button variant="ghost" size="sm" className="flex-1 text-berry" onClick={doDecline}>
                                    <X size={15} /> Decline
                                </Button>
                            </div>
                        </GlassCard>
                    )}

                    {(contract.status === "active" || contract.status === "renewed") && (
                        <GlassCard className="p-5">
                            <h3 className="mb-1 font-display text-lg text-ink">Manage</h3>
                            <p className="mb-4 text-[13px] text-ink-muted">Renew for another term or close out when complete.</p>
                            <Button variant="soft" className="mb-2 w-full" onClick={doRenew} loading={busy}><Repeat size={16} /> Renew term</Button>
                            <Button variant="ghost" size="sm" className="w-full" onClick={doComplete}><Check size={15} /> Mark complete</Button>
                        </GlassCard>
                    )}

                    <ValueModel terms={t} />

                    {/* terms summary */}
                    <GlassCard className="p-5">
                        <h3 className="mb-3 font-display text-lg text-ink">Terms at a glance</h3>
                        <dl className="space-y-2.5 text-sm">
                            <Row k="Crop" v={`${t.crop}${t.grade ? ` · ${t.grade}` : ""}`} />
                            <Row k="Per delivery" v={`${t.quantity} ${t.unit}`} />
                            <Row k="Price" v={`${formatMoney(t.unit_price_cents)} / ${t.unit}`} />
                            <Row k="Term" v={`${formatDate(t.term_start)} – ${formatDate(t.term_end)}`} />
                            {t.delivery_terms && <Row k="Delivery" v={t.delivery_terms} />}
                            {t.quality_terms && <Row k="Quality" v={t.quality_terms} />}
                        </dl>
                    </GlassCard>
                </aside>
            </div>

            {counterOpen && (
                <CounterModal
                    initial={t}
                    onClose={() => setCounterOpen(false)}
                    onSubmit={async (terms, note) => {
                        setBusy(true);
                        try { await counterContract(contract, meId, terms, note); toast.success("Counter sent"); setCounterOpen(false); await load(); }
                        finally { setBusy(false); }
                    }}
                />
            )}
        </div>
    );
}

function labelFor(type: NodeType): string {
    const map: Record<NodeType, string> = {
        harvest: "Harvest", pack: "Pack & grade", cold_storage: "Cold storage", pickup: "Pickup",
        transit: "In transit", inspection: "Inspection", dropoff: "Drop-off", delivered: "Delivered", custom: "New step",
    };
    return map[type];
}

function Row({ k, v }: { k: string; v: string }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-ink-faint">{k}</dt>
            <dd className="text-right font-medium text-ink">{v}</dd>
        </div>
    );
}

function ConfirmRow({ label, done }: { label: string; done: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className={cn("grid h-6 w-6 place-items-center rounded-full", done ? "bg-forest-500 text-white" : "border border-line bg-white text-ink-faint")}>
                {done ? <Check size={14} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <span className={cn("text-sm", done ? "font-semibold text-ink" : "text-ink-muted")}>{label}</span>
            <span className="ml-auto text-2xs font-medium uppercase tracking-wide text-ink-faint">{done ? "Confirmed" : "Pending"}</span>
        </div>
    );
}

// ---------------- Negotiate ----------------
function NegotiatePanel({
    contract, meId, messages, latestTerms, prevTerms, onSend,
}: {
    contract: Contract; meId: string; messages: NegotiationMessage[];
    latestTerms: Terms; prevTerms: Terms | null; onSend: (b: string) => Promise<void>;
}) {
    const [draft, setDraft] = React.useState("");
    const endRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

    return (
        <div className="space-y-5">
            {prevTerms && (
                <GlassCard className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <Sparkle size={17} className="text-harvest-500" />
                        <h3 className="font-display text-lg text-ink">Latest changes — v{contract.current_version}</h3>
                    </div>
                    <TermDiff from={prevTerms} to={latestTerms} />
                </GlassCard>
            )}

            <GlassCard className="flex h-[460px] flex-col p-0">
                <div className="border-b border-line px-5 py-3.5">
                    <h3 className="font-display text-lg text-ink">Negotiation thread</h3>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                    {messages.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">No messages yet. Start the conversation.</p>}
                    {messages.map((m) => <MessageBubble key={m.id} m={m} mine={m.sender_id === meId} />)}
                    <div ref={endRef} />
                </div>
                <form
                    className="flex items-center gap-2 border-t border-line p-3"
                    onSubmit={async (e) => { e.preventDefault(); if (!draft.trim()) return; const b = draft; setDraft(""); await onSend(b); }}
                >
                    <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message…" className="field h-11 flex-1" />
                    <Button type="submit" size="sm" disabled={!draft.trim()}><ArrowRight size={16} /></Button>
                </form>
            </GlassCard>
        </div>
    );
}

function MessageBubble({ m, mine }: { m: NegotiationMessage; mine: boolean }) {
    if (m.kind === "system" || m.kind === "accept" || m.kind === "decline" || m.kind === "counter") {
        return (
            <div className="flex justify-center">
                <span className="rounded-full bg-paper-sunk px-3 py-1 text-2xs font-medium text-ink-muted">
                    {m.body} · {relativeTime(m.created_at)}
                </span>
            </div>
        );
    }
    return (
        <div className={cn("flex gap-2.5", mine && "flex-row-reverse")}>
            <Avatar name={m.sender?.full_name} src={m.sender?.avatar_url} size={30} />
            <div className={cn("max-w-[78%]")}>
                <div className={cn("rounded-2xl px-3.5 py-2.5 text-sm", mine ? "bg-forest-500 text-white" : "bg-paper-sunk text-ink")}>
                    {m.body}
                </div>
                <p className={cn("mt-1 text-2xs text-ink-faint", mine && "text-right")}>{relativeTime(m.created_at)}</p>
            </div>
        </div>
    );
}

// ---------------- Agreement ----------------
function AgreementPanel({ contract, onSaved }: { contract: Contract; onSaved: () => Promise<void> }) {
    const [text, setText] = React.useState(contract.agreement_text ?? "");
    const [loading, setLoading] = React.useState(false);
    const [source, setSource] = React.useState<string | null>(contract.agreement_text ? "saved" : null);
    const toast = useToast();

    const generate = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai/draft-agreement", {
                method: "POST", headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    terms: contract.terms,
                    farm: pick(contract.farm), buyer: pick(contract.buyer),
                }),
            });
            const data = await res.json();
            const txt = data.text || fallbackAgreement(contract.terms, pick(contract.farm), pick(contract.buyer));
            setText(txt); setSource(data.source);
            await supabase.from("contracts").update({ agreement_text: txt }).eq("id", contract.id);
            toast.ai(data.source === "ai" ? "Agreement drafted by Claude" : "Agreement generated", "Review the terms below.");
            await onSaved();
        } finally { setLoading(false); }
    };

    return (
        <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Pen size={18} className="text-forest-600" />
                    <h3 className="font-display text-xl text-ink">Supply agreement</h3>
                </div>
                <Button variant={text ? "ghost" : "primary"} size="sm" onClick={generate} loading={loading}>
                    <Sparkle size={15} /> {text ? "Regenerate" : "Generate"}
                </Button>
            </div>
            {!text ? (
                <div className="rounded-2xl border border-dashed border-line-strong bg-paper-warm/60 px-6 py-12 text-center">
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-forest-500 shadow-glass"><Sparkle size={22} /></div>
                    <p className="font-display text-lg text-ink">Turn these terms into a clean agreement</p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">One click drafts a plain-language supply agreement from your agreed terms — no lawyer needed to start.</p>
                </div>
            ) : (
                <>
                    {source === "ai" && <p className="mb-3 inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-harvest-500"><Sparkle size={13} /> Drafted with Claude</p>}
                    <pre className="max-h-[520px] overflow-y-auto whitespace-pre-wrap rounded-2xl bg-paper-warm/70 p-5 font-sans text-[13.5px] leading-relaxed text-ink-soft">{text}</pre>
                </>
            )}
        </GlassCard>
    );
}

function pick(p?: Contract["farm"]) {
    return { full_name: p?.full_name ?? "", org_name: p?.org_name ?? null, location_label: p?.location_label ?? null };
}

// ---------------- Counter modal ----------------
function CounterModal({ initial, onClose, onSubmit }: { initial: Terms; onClose: () => void; onSubmit: (t: Terms, note?: string) => Promise<void> }) {
    const [terms, setTerms] = React.useState<Terms>({ ...initial });
    const [note, setNote] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    return (
        <div className="fixed inset-0 z-[120] grid place-items-center p-4">
            <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-6 animate-scale-in">
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-display text-2xl text-ink">Counter-offer</h3>
                    <button onClick={onClose} className="text-ink-faint hover:text-ink"><X size={20} /></button>
                </div>
                <TermsForm value={terms} onChange={setTerms} />
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Add a note (optional)…" className="field mt-4 h-auto py-3" />
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button loading={busy} onClick={async () => { setBusy(true); try { await onSubmit(terms, note); } finally { setBusy(false); } }}>
                        <ArrowRight size={16} /> Send counter
                    </Button>
                </div>
            </div>
        </div>
    );
}

function NotFound() {
    return (
        <div className="grid h-[60vh] place-items-center text-center">
            <div>
                <p className="font-display text-2xl text-ink">Contract not found</p>
                <Link href="/app/contracts" className="mt-3 inline-block text-forest-600 hover:underline">Back to contracts</Link>
            </div>
        </div>
    );
}
