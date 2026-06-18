"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Handshake, Pen, Truck, Repeat, Check, ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

export type NotifTone = "forest" | "amber" | "sky";
export interface NotifItem {
    key: string;
    kind: "proposal" | "counter" | "delivery" | "renewal" | "confirm";
    title: string;
    sub?: string;
    href: string;
}

const ICONS: Record<NotifItem["kind"], React.ComponentType<{ size?: number }>> = {
    proposal: Handshake, counter: Pen, delivery: Truck, renewal: Repeat, confirm: Check,
};
const TONE: Record<NotifItem["kind"], string> = {
    proposal: "bg-forest-50 text-forest-600",
    counter: "bg-harvest-400/12 text-harvest-500",
    delivery: "bg-sky/10 text-sky",
    renewal: "bg-forest-50 text-forest-600",
    confirm: "bg-forest-50 text-forest-600",
};

const SEEN_KEY = "cc:notif:seen";

export function NotificationsBell({ items }: { items: NotifItem[] }) {
    const [open, setOpen] = React.useState(false);
    const [seen, setSeen] = React.useState<Set<string>>(new Set());
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        try { setSeen(new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"))); } catch { /* noop */ }
    }, []);

    React.useEffect(() => {
        const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        window.addEventListener("mousedown", onClick);
        return () => window.removeEventListener("mousedown", onClick);
    }, []);

    const unread = items.filter((i) => !seen.has(i.key)).length;

    const markAllSeen = () => {
        const next = new Set(items.map((i) => i.key));
        setSeen(next);
        try { localStorage.setItem(SEEN_KEY, JSON.stringify([...next])); } catch { /* noop */ }
    };

    const toggle = () => {
        const next = !open;
        setOpen(next);
        if (next && unread) markAllSeen();
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={toggle}
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-white/70 text-ink-soft transition hover:bg-white hover:text-ink"
                aria-label="Notifications"
            >
                <Bell size={19} />
                {unread > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-berry px-1 text-[10px] font-bold text-white ring-2 ring-paper animate-scale-in">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[340px] glass-card overflow-hidden p-0 animate-scale-in">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <p className="font-display text-lg text-ink">Notifications</p>
                        <span className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">{items.length} active</span>
                    </div>
                    <div className="max-h-[380px] overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-forest-50 text-forest-500"><Check size={20} /></div>
                                <p className="text-sm font-medium text-ink">You're all caught up</p>
                                <p className="text-[13px] text-ink-muted">Nothing needs your attention.</p>
                            </div>
                        ) : (
                            items.map((it) => {
                                const Icon = ICONS[it.kind];
                                return (
                                    <Link key={it.key} href={it.href} onClick={() => setOpen(false)} className="flex items-center gap-3 border-b border-line/60 px-4 py-3 transition hover:bg-paper-warm/60 last:border-0">
                                        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", TONE[it.kind])}><Icon size={17} /></span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-ink">{it.title}</p>
                                            {it.sub && <p className="truncate text-[13px] text-ink-muted">{it.sub}</p>}
                                        </div>
                                        <ArrowRight size={15} className="text-ink-faint" />
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/** Derive the actionable feed from the viewer's contracts + upcoming deliveries. */
export function deriveNotifications(
    contracts: { id: string; status: string; farm_id: string; buyer_id: string; farm_confirmed: boolean; buyer_confirmed: boolean; terms: { crop: string; term_end: string }; current_version: number }[],
    deliveries: { id: string; scheduled_date: string; quantity: number; contract: { id: string; terms: { crop: string; unit: string } } }[],
    meId: string,
): NotifItem[] {
    const items: NotifItem[] = [];
    for (const c of contracts) {
        const isFarm = c.farm_id === meId;
        const myConfirmed = isFarm ? c.farm_confirmed : c.buyer_confirmed;
        if (["proposed", "countered", "agreed"].includes(c.status) && !myConfirmed) {
            items.push({
                key: `move:${c.id}:v${c.current_version}`,
                kind: c.status === "countered" ? "counter" : "proposal",
                title: `${c.terms.crop} — your move`,
                sub: c.status === "countered" ? "New counter-offer to review" : "Terms awaiting your confirmation",
                href: `/app/contracts/${c.id}`,
            });
        }
        if ((c.status === "active" || c.status === "renewed")) {
            const days = (new Date(c.terms.term_end).getTime() - Date.now()) / 86_400_000;
            if (days >= 0 && days < 14) {
                items.push({ key: `renew:${c.id}`, kind: "renewal", title: `${c.terms.crop} up for renewal`, sub: "Term ends soon", href: `/app/contracts/${c.id}` });
            }
        }
    }
    for (const d of deliveries.slice(0, 3)) {
        const days = (new Date(d.scheduled_date).getTime() - Date.now()) / 86_400_000;
        if (days >= 0 && days < 7) {
            items.push({ key: `deliv:${d.id}`, kind: "delivery", title: `Delivery due — ${d.contract.terms.crop}`, sub: `${d.quantity} ${d.contract.terms.unit} scheduled`, href: `/app/contracts/${d.contract.id}` });
        }
    }
    return items;
}
