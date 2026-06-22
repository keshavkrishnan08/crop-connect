"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { getBrowserClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { Dashboard, Route, StoryTag, MarginUp, Settings, Plus, Menu, X, MapPin, Logout, Receipt, Handshake, Shield, Mark } from "@/components/icons";
import { cn } from "@/lib/utils";

const NAV = [
    { href: "/app", label: "Dashboard", icon: Dashboard, exact: true },
    { href: "/app/sourcing", label: "Sourcing", icon: Route },
    { href: "/app/orders", label: "Orders", icon: Receipt },
    { href: "/app/deals", label: "Deals", icon: Handshake },
    { href: "/app/banking", label: "Banking", icon: Shield },
    { href: "/app/story", label: "Story Studio", icon: StoryTag },
    { href: "/app/margins", label: "Margins", icon: MarginUp },
    { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const restaurant = useStore((s) => s.restaurant);
    const [open, setOpen] = React.useState(false);
    const fullBleed = pathname === "/app/sourcing" || pathname === "/app/onboarding"; // full-screen pages

    async function signOut() {
        const supabase = getBrowserClient();
        if (supabase) await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    const NavList = ({ collapsible }: { collapsible: boolean }) => (
        <nav className="flex-1 space-y-1 px-2.5" onClick={() => setOpen(false)}>
            {NAV.map((n) => {
                const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                return (
                    <Link key={n.href} href={n.href} title={n.label}
                        className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-150",
                            active ? "bg-brand-500 text-white shadow-[0_8px_18px_-10px_rgba(35,92,58,0.6)]" : "text-ink-soft hover:bg-white hover:text-ink")}>
                        <n.icon size={20} className="shrink-0" />
                        <span className={cn("whitespace-nowrap", collapsible && "opacity-0 transition-opacity duration-150 group-hover:opacity-100")}>{n.label}</span>
                    </Link>
                );
            })}
        </nav>
    );

    const Footer = ({ collapsible }: { collapsible: boolean }) => (
        <div className="px-2.5 pb-3">
            <Link href="/app/sourcing/new" onClick={() => setOpen(false)} title="Source an ingredient"
                className="btn-primary mb-3 w-full justify-start gap-3 overflow-hidden whitespace-nowrap">
                <Plus size={18} className="shrink-0" /><span className={cn(collapsible && "opacity-0 transition-opacity group-hover:opacity-100")}>Source an ingredient</span>
            </Link>
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white/70 p-2 pl-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink font-display text-sm text-white">{restaurant.name.slice(0, 2)}</span>
                <div className={cn("min-w-0 flex-1", collapsible && "opacity-0 transition-opacity group-hover:opacity-100")}>
                    <p className="truncate text-sm font-semibold text-ink">{restaurant.name}</p>
                    <p className="flex items-center gap-1 text-2xs text-ink-faint"><MapPin size={11} /> {restaurant.location}</p>
                </div>
                <button onClick={signOut} title="Sign out" className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-faint transition hover:bg-canvas hover:text-danger", collapsible && "opacity-0 group-hover:opacity-100")}><Logout size={16} /></button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-canvas bg-aura">
            {/* desktop rail: collapsed to icons, expands on hover */}
            <aside className="group fixed inset-y-0 left-0 z-40 hidden w-[68px] flex-col overflow-hidden border-r border-line bg-canvas-soft/90 backdrop-blur-xl transition-[width] duration-200 hover:w-[248px] hover:shadow-lift md:flex">
                <Link href="/app" className="flex items-center gap-2.5 px-[18px] py-5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-600 text-white" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.2), 0 8px 18px -10px rgba(35,92,58,.6)" }}><Mark size={20} strokeWidth={1.8} /></span>
                    <span className="font-display text-lg leading-none tracking-tight text-ink opacity-0 transition-opacity duration-150 group-hover:opacity-100">Crop<span className="text-brand-600">Connect</span></span>
                </Link>
                <NavList collapsible />
                <Footer collapsible />
            </aside>

            {/* mobile header + drawer */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-canvas-soft/80 px-4 py-3 backdrop-blur-xl md:hidden">
                <Logo size="sm" />
                <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl hairline bg-white/70"><Menu size={20} /></button>
            </header>
            {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
                    <div className="absolute inset-y-0 left-0 flex w-[264px] flex-col bg-canvas-soft animate-fade-up">
                        <div className="flex items-center justify-between px-4 py-4"><Logo size="sm" /><button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl hairline"><X size={18} /></button></div>
                        <NavList collapsible={false} />
                        <Footer collapsible={false} />
                    </div>
                </div>
            )}

            <main className="md:pl-[68px]">
                {fullBleed
                    ? <div className="h-[calc(100dvh-57px)] md:h-[100dvh]">{children}</div>
                    : <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-9 md:py-9">{children}</div>}
            </main>
        </div>
    );
}
