"use client";

import * as React from "react";
import Link from "next/link";
import { useStore, getState, farmNotifications, unreadNotifCount, actions, SUPPLY_TONE, type SupplyKind } from "@/lib/store";
import { Bell, Leaf, Truck, Shield, Check, X } from "@/components/icons";
import { cn } from "@/lib/utils";

function ago(ts: number) { const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); if (m < 60) return `${m}m ago`; const h = Math.round(m / 60); if (h < 24) return `${h}h ago`; return `${Math.round(h / 24)}d ago`; }
const ICON: Record<SupplyKind, React.ComponentType<{ size?: number }>> = { quality: Shield, transit: Truck, delivered: Check, delay: Bell, shortfall: Bell, harvest: Leaf, packed: Leaf, ontrack: Leaf };

export function NotificationBell() {
    useStore((s) => s.items);
    useStore((s) => s.notifsReadTs);
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);
    const notifs = farmNotifications(getState()).slice(0, 14);
    const unread = unreadNotifCount(getState());

    function toggle() { const willOpen = !open; setOpen(willOpen); if (willOpen) actions.markNotifsRead(); }

    return (
        <>
            <button onClick={toggle} aria-label="Notifications" title="Updates from your farms"
                className="fixed right-5 top-5 z-[70] grid h-11 w-11 place-items-center rounded-full border border-line bg-canvas-soft/90 shadow-card backdrop-blur transition hover:shadow-lift">
                <Bell size={18} className="text-ink-soft" />
                {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-[69]" onClick={() => setOpen(false)} />
                    <div className="fixed right-5 top-[68px] z-[70] w-[min(384px,calc(100vw-2.5rem))] origin-top-right overflow-hidden rounded-3xl border border-line bg-canvas-soft shadow-lift animate-scale-in">
                        <div className="flex items-center justify-between border-b border-line px-4 py-3">
                            <p className="text-sm font-semibold text-ink">Updates from your farms</p>
                            <button onClick={() => setOpen(false)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint hover:bg-white"><X size={15} /></button>
                        </div>
                        <div className="max-h-[440px] divide-y divide-line overflow-y-auto">
                            {notifs.length === 0
                                ? <p className="px-4 py-10 text-center text-sm text-ink-muted">No updates yet. Your farms will post here.</p>
                                : notifs.map((n) => {
                                    const Icon = ICON[n.kind] ?? Leaf;
                                    const tone = SUPPLY_TONE[n.kind];
                                    const color = tone === "harvest" ? "bg-harvest-400/15 text-harvest-600" : tone === "sky" ? "bg-sky-50 text-sky-600" : tone === "violet" ? "bg-violet-50 text-violet-600" : "bg-brand-50 text-brand-600";
                                    return (
                                        <Link key={n.id} href={`/app/sourcing/${n.itemId}`} onClick={() => setOpen(false)} className="flex items-start gap-3 px-4 py-3 transition hover:bg-canvas">
                                            <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg", color)}><Icon size={15} /></span>
                                            <div className="min-w-0 flex-1"><p className="text-[13px] leading-snug text-ink">{n.text}</p><p className="mt-0.5 text-2xs text-ink-faint"><span className="capitalize">{n.crop}</span> · {ago(n.ts)}</p></div>
                                        </Link>
                                    );
                                })}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
