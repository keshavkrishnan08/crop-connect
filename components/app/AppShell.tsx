"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";
import { Dashboard, Route, StoryTag, MarginUp, Settings, Plus, Menu, X, MapPin } from "@/components/icons";
import { cn } from "@/lib/utils";

const NAV = [
    { href: "/app", label: "Dashboard", icon: Dashboard, exact: true },
    { href: "/app/sourcing", label: "Sourcing", icon: Route },
    { href: "/app/story", label: "Story Studio", icon: StoryTag },
    { href: "/app/margins", label: "Margins", icon: MarginUp },
    { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const restaurant = useStore((s) => s.restaurant);
    const [open, setOpen] = React.useState(false);

    const Side = (
        <>
            <div className="px-5 py-5"><Logo size="md" /></div>
            <nav className="flex-1 space-y-1 px-3" onClick={() => setOpen(false)}>
                {NAV.map((n) => {
                    const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                    return (
                        <Link key={n.href} href={n.href}
                            className={cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-150",
                                active ? "bg-brand-500 text-white shadow-[0_8px_18px_-10px_rgba(35,92,58,0.6)]" : "text-ink-soft hover:bg-white hover:text-ink")}>
                            <n.icon size={20} /> {n.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="px-3 pb-3">
                <Link href="/app/sourcing/new" onClick={() => setOpen(false)} className="btn-primary mb-3 w-full"><Plus size={18} /> Source an ingredient</Link>
                <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white/70 p-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink font-display text-sm text-white">{restaurant.name.slice(0, 2)}</span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{restaurant.name}</p>
                        <p className="flex items-center gap-1 text-2xs text-ink-faint"><MapPin size={11} /> {restaurant.location}</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-canvas bg-aura">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] flex-col border-r border-line bg-canvas-soft/80 backdrop-blur-xl md:flex">{Side}</aside>

            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-canvas-soft/80 px-4 py-3 backdrop-blur-xl md:hidden">
                <Logo size="sm" />
                <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl hairline bg-white/70"><Menu size={20} /></button>
            </header>
            {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
                    <div className="absolute inset-y-0 left-0 flex w-[260px] flex-col bg-canvas-soft p-0 animate-fade-up">
                        <div className="flex justify-end p-3"><button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl hairline"><X size={18} /></button></div>
                        {Side}
                    </div>
                </div>
            )}

            <main className="md:pl-[244px]">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-9 md:py-9">{children}</div>
            </main>
        </div>
    );
}
