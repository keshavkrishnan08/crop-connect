"use client";

import * as React from "react";
import Link from "next/link";
import { useStore, getState, marginRollup, computeDeals, agentRoadmap, farmById, orderEscrow, type AppState } from "@/lib/store";
import { AgentAvatar, AGENT_NAME } from "@/components/app/AgentDock";
import { usd } from "@/lib/utils";
import { X, ArrowRight, ArrowUpRight } from "@/components/icons";

type Msg = { role: "agent" | "user"; text: string; href?: string; cta?: string };

const CHIPS = ["What should I source next?", "How are my margins?", "What is next on my roadmap?", "Show my deliveries", "What is held in escrow?"];

/** A context-aware assistant. Answers from the live account state (no external API). */
export function ChatAgent() {
    useStore((s) => s.items); // keep context fresh
    const [open, setOpen] = React.useState(false);
    const [msgs, setMsgs] = React.useState<Msg[]>([{ role: "agent", text: `Hi, I'm ${AGENT_NAME}. I run your sourcing and I can see everything in your account. Ask me anything, or tap a suggestion.` }]);
    const [input, setInput] = React.useState("");
    const [typing, setTyping] = React.useState(false);
    const endRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing, open]);

    function send(q: string) {
        const query = q.trim(); if (!query) return;
        setMsgs((m) => [...m, { role: "user", text: query }]);
        setInput("");
        setTyping(true);
        setTimeout(() => {
            const r = respond(query, getState());
            setTyping(false);
            setMsgs((m) => [...m, r]);
        }, 550);
    }

    return (
        <>
            {/* launcher. a quiet round avatar, hidden while open */}
            {!open && (
                <button onClick={() => setOpen(true)} aria-label={`Ask ${AGENT_NAME}`} title={`Ask ${AGENT_NAME}`}
                    className="group fixed bottom-5 right-5 z-[80] grid h-12 w-12 place-items-center rounded-full border border-line bg-canvas-soft/80 shadow-card backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-canvas-soft hover:shadow-lift">
                    <AgentAvatar size={40} />
                </button>
            )}

            {open && (
                <div className="fixed bottom-5 right-5 z-[80] flex h-[480px] w-[min(370px,calc(100vw-2.5rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-line bg-canvas-soft shadow-lift animate-scale-in">
                    <div className="flex items-center gap-3 border-b border-line bg-gradient-to-br from-brand-50/70 to-transparent p-4">
                        <AgentAvatar size={38} active />
                        <div className="flex-1"><p className="font-display text-lg leading-none text-ink">{AGENT_NAME}</p><p className="text-2xs text-ink-muted">Your sourcing agent · sees your whole account</p></div>
                        <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-white hover:text-ink"><X size={16} /></button>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {msgs.map((m, i) => (
                            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                                <div className={m.role === "user" ? "max-w-[80%] rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2.5 text-[14px] text-white" : "max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-ink-soft shadow-sm"}>
                                    {m.text}
                                    {m.href && m.cta && <Link href={m.href} onClick={() => setOpen(false)} className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:underline">{m.cta} <ArrowUpRight size={13} /></Link>}
                                </div>
                            </div>
                        ))}
                        {typing && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm"><Dots /></div></div>}
                        <div ref={endRef} />
                    </div>

                    <div className="border-t border-line p-3">
                        <div className="mb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                            {CHIPS.map((c) => <button key={c} onClick={() => send(c)} className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-2xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-600">{c}</button>)}
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
                            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Ask ${AGENT_NAME} anything…`} className="field !h-10 flex-1 !py-2 text-sm" />
                            <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-40" disabled={!input.trim()}><ArrowRight size={17} /></button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function Dots() {
    return <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink-faint/60" style={{ animation: `pulse 1s ${i * 0.15}s infinite` }} />)}</span>;
}

function respond(q: string, s: AppState): Msg {
    const ql = q.toLowerCase();
    const roll = marginRollup(s);
    const live = s.items.filter((i) => i.stage === "live");
    const active = s.items.filter((i) => i.stage !== "live");

    if (/margin|profit|earn|money|revenue/.test(ql)) {
        return { role: "agent", text: `You're capturing about ${usd(roll.realizedMonthly, { compact: roll.realizedMonthly > 9999 })}/mo in realized margin from ${roll.liveCount} live local ${roll.liveCount === 1 ? "dish" : "dishes"}, with ${usd(roll.modeledMonthly, { compact: true })}/mo more modeled in the pipeline.`, href: "/app/margins", cta: "Open Margins" };
    }
    if (/deliver/.test(ql)) {
        const up = s.items.flatMap((i) => i.deliveries.filter((d) => d.status === "scheduled").map((d) => ({ i, d }))).sort((a, b) => +new Date(a.d.date) - +new Date(b.d.date));
        if (!up.length) return { role: "agent", text: "Nothing is scheduled right now. Source an ingredient and I'll set up the weekly drops.", href: "/app/sourcing/new", cta: "Source one" };
        const next = up[0];
        return { role: "agent", text: `You have ${up.length} ${up.length === 1 ? "delivery" : "deliveries"} scheduled. The next is ${next.i.crop} from ${farmById(next.i.farmId)?.name} on ${new Date(next.d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`, href: "/app/orders", cta: "Track orders" };
    }
    if (/escrow|pay|bank|contract|invoice/.test(ql)) {
        const totals = s.items.reduce((a, i) => { const e = orderEscrow(i); a.held += e.held; a.released += e.released; return a; }, { held: 0, released: 0 });
        return { role: "agent", text: `${usd(totals.held, { compact: true })} is held in escrow for upcoming deliveries, and ${usd(totals.released, { compact: true })} has been released to your farms on confirmed drops. You hold ${active.length} active contracts.`, href: "/app/banking", cta: "Open Banking" };
    }
    if (/roadmap|next step|to do|todo|what.*(do|next)/.test(ql)) {
        const next = agentRoadmap(s).find((r) => !r.done);
        if (!next) return { role: "agent", text: "You're all set up. The best move now is to add another ingredient so I can run it in parallel.", href: "/app/sourcing/new", cta: "Add one" };
        return { role: "agent", text: `Next on your roadmap: ${next.title}. ${next.detail}`, href: next.href, cta: next.cta };
    }
    if (/source|add|new|suggest|test|start|recommend|which|product|ingredient/.test(ql)) {
        const deal = computeDeals(s).find((d) => !d.sourced);
        if (deal) return { role: "agent", text: `Good first test: ${deal.crop} from ${farmById(deal.farmId)?.name} at ${usd(deal.price)}/${deal.unit}. ${deal.blurb} I'd put it on one dish and we'll see the margin in a week.`, href: `/app/sourcing/new?crop=${encodeURIComponent(deal.crop)}&unit=${deal.unit}&price=${deal.price}`, cta: "Source this" };
        return { role: "agent", text: "Name any ingredient you'd like to bring local and I'll match the farms, draft the agreement, and schedule delivery.", href: "/app/sourcing/new", cta: "Source an ingredient" };
    }
    if (/order|status|track/.test(ql)) {
        return { role: "agent", text: `You have ${s.items.length} ${s.items.length === 1 ? "order" : "orders"}: ${live.length} live on the menu and ${active.length} in progress. I'm running each one for you.`, href: "/app/orders", cta: "Track orders" };
    }
    if (/farm|who|grower/.test(ql)) {
        const names = [...new Set(s.items.map((i) => farmById(i.farmId)?.name).filter(Boolean))];
        return { role: "agent", text: names.length ? `I've matched you with ${names.slice(0, 4).join(", ")}. Every one is vetted for distance, record, and price.` : "No farms matched yet. Source an ingredient and I'll find the best growers near you.", href: "/app/sourcing", cta: "See the board" };
    }
    if (/hello|^hi|hey|help|what can you/.test(ql)) {
        return { role: "agent", text: "I can help with sourcing, margins, deliveries, orders, escrow, and your roadmap. Try one of the suggestions, or just tell me what you want on the menu." };
    }
    return { role: "agent", text: "I've got your whole account in view. I can help with sourcing, margins, deliveries, orders, escrow, and your roadmap. What would you like to do?" };
}
