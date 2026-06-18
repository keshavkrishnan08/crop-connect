"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Dashboard, Compass, Contract as ContractIcon, Wheat, Nodes, User as UserIcon,
    Plus, Search, ArrowRight, Logout, Pen,
} from "@/components/icons";
import { cn } from "@/lib/utils";

interface Cmd {
    id: string;
    label: string;
    hint?: string;
    keywords?: string;
    icon: React.ComponentType<{ size?: number }>;
    run: () => void;
}

export function CommandPalette({ onSignOut }: { onSignOut: () => void }) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const [active, setActive] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const go = React.useCallback((href: string) => () => { router.push(href); setOpen(false); }, [router]);

    const commands: Cmd[] = React.useMemo(() => [
        { id: "dash", label: "Go to Dashboard", icon: Dashboard, keywords: "home overview", run: go("/app") },
        { id: "discover", label: "Find matches", hint: "Discover", icon: Compass, keywords: "search match counterparty", run: go("/app/discover") },
        { id: "contracts", label: "View contracts", icon: ContractIcon, keywords: "deals negotiation", run: go("/app/contracts") },
        { id: "listings", label: "My listings", icon: Wheat, keywords: "supply need posting", run: go("/app/listings") },
        { id: "new", label: "New listing", hint: "Create", icon: Plus, keywords: "post supply offer need add create", run: go("/app/listings/new") },
        { id: "hub", label: "Open Supply Hub", icon: Nodes, keywords: "board map supply chain", run: go("/app/hub") },
        { id: "profile", label: "Edit profile", icon: UserIcon, keywords: "account settings", run: go("/app/profile") },
        { id: "signout", label: "Sign out", icon: Logout, keywords: "logout leave", run: () => { setOpen(false); onSignOut(); } },
    ], [go, onSignOut]);

    const filtered = React.useMemo(() => {
        const s = q.toLowerCase().trim();
        if (!s) return commands;
        return commands.filter((c) => `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(s));
    }, [q, commands]);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
            if (e.key === "Escape") setOpen(false);
        };
        const onOpen = () => setOpen(true);
        window.addEventListener("keydown", onKey);
        window.addEventListener("cmdk:open", onOpen as EventListener);
        return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("cmdk:open", onOpen as EventListener); };
    }, []);

    React.useEffect(() => {
        if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 40); }
    }, [open]);
    React.useEffect(() => { setActive(0); }, [q]);

    if (!open) return null;

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(filtered.length - 1, a + 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
        if (e.key === "Enter") { e.preventDefault(); filtered[active]?.run(); }
    };

    return (
        <div className="fixed inset-0 z-[170] flex items-start justify-center p-4 pt-[14vh]">
            <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
            <div className="relative z-10 w-full max-w-lg glass-card overflow-hidden p-0 animate-scale-in" onKeyDown={onKeyDown}>
                <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
                    <Search size={18} className="text-ink-faint" />
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search actions…"
                        className="flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
                    />
                    <kbd className="rounded-md border border-line bg-paper-warm px-1.5 py-0.5 text-2xs font-semibold text-ink-faint">ESC</kbd>
                </div>
                <div className="max-h-[340px] overflow-y-auto p-2">
                    {filtered.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">No actions found</p>}
                    {filtered.map((c, i) => (
                        <button
                            key={c.id}
                            onMouseEnter={() => setActive(i)}
                            onClick={c.run}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                                i === active ? "bg-forest-500 text-white" : "text-ink-soft hover:bg-paper-sunk",
                            )}
                        >
                            <span className={cn("grid h-8 w-8 place-items-center rounded-lg", i === active ? "bg-white/15" : "bg-paper-sunk text-forest-600")}>
                                <c.icon size={16} />
                            </span>
                            <span className="flex-1 text-sm font-medium">{c.label}</span>
                            {c.hint && <span className={cn("text-2xs font-semibold uppercase tracking-wide", i === active ? "text-white/70" : "text-ink-faint")}>{c.hint}</span>}
                            {i === active && <ArrowRight size={15} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
