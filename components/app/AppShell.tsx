"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getMyContracts, getUpcomingDeliveries } from "@/lib/queries";
import { Logo } from "@/components/ui/Logo";
import { Avatar, Spinner } from "@/components/ui/kit";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { CommandPalette } from "@/components/app/CommandPalette";
import { NotificationsBell, deriveNotifications, type NotifItem } from "@/components/app/NotificationsBell";
import {
    Dashboard, Compass, Contract as ContractIcon, Wheat, Nodes, User as UserIcon,
    Logout, Plus, Menu, X, Barn, Storefront, Search,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { ComfortToggle } from "@/components/a11y/ComfortMode";

const NAV = [
    { href: "/app", label: "Dashboard", icon: Dashboard, exact: true },
    { href: "/app/discover", label: "Discover", icon: Compass },
    { href: "/app/contracts", label: "Contracts", icon: ContractIcon },
    { href: "/app/listings", label: "My Listings", icon: Wheat },
    { href: "/app/hub", label: "Supply Hub", icon: Nodes },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const { session, profile, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [notif, setNotif] = React.useState<NotifItem[]>([]);

    React.useEffect(() => {
        if (loading) return;
        if (!session) { router.replace("/login"); return; }
        if (profile && !profile.full_name && pathname !== "/app/onboarding") {
            router.replace("/app/onboarding");
        }
    }, [loading, session, profile, pathname, router]);

    // notification feed
    React.useEffect(() => {
        if (!profile?.full_name) return;
        let active = true;
        Promise.all([getMyContracts(profile.id), getUpcomingDeliveries(6)]).then(([c, d]) => {
            if (active) setNotif(deriveNotifications(c as never, d as never, profile.id));
        });
        return () => { active = false; };
    }, [profile, pathname]);

    const doSignOut = () => signOut().then(() => router.replace("/"));

    if (loading || !session) {
        return <div className="grid min-h-screen place-items-center bg-paper"><Spinner size={26} className="text-forest-500" /></div>;
    }
    if (pathname === "/app/onboarding") return <>{children}</>;

    return (
        <ConfirmProvider>
            <div className="min-h-screen bg-paper bg-aurora">
                {/* Sidebar — always visible from tablet up */}
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-line bg-white/55 backdrop-blur-xl md:flex">
                    <div className="px-5 py-5"><Logo size="md" /></div>
                    <nav className="flex-1 space-y-1 px-3">
                        {NAV.map((item) => <NavLink key={item.href} {...item} active={isActive(pathname, item)} />)}
                    </nav>
                    <div className="px-3 pb-3">
                        <Link href="/app/listings/new" className="btn-primary mb-3 w-full"><Plus size={18} /> New listing</Link>
                        <UserChip profile={profile} onSignOut={doSignOut} />
                    </div>
                </aside>

                {/* Mobile top bar */}
                <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white/70 px-4 py-3 backdrop-blur-xl md:hidden">
                    <Logo size="sm" />
                    <div className="flex items-center gap-2">
                        <NotificationsBell items={notif} />
                        <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl hairline bg-white/70"><Menu size={20} /></button>
                    </div>
                </header>

                {/* Mobile drawer */}
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
                        <div className="absolute inset-y-0 left-0 flex w-[270px] flex-col bg-paper p-4 animate-fade-up">
                            <div className="mb-4 flex items-center justify-between">
                                <Logo size="sm" />
                                <button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl hairline"><X size={18} /></button>
                            </div>
                            <nav className="flex-1 space-y-1" onClick={() => setMobileOpen(false)}>
                                {NAV.map((item) => <NavLink key={item.href} {...item} active={isActive(pathname, item)} />)}
                                <NavLink href="/app/profile" label="Profile" icon={UserIcon} active={pathname === "/app/profile"} />
                            </nav>
                            <ComfortToggle className="mb-3 w-full justify-center" />
                            <Link href="/app/listings/new" onClick={() => setMobileOpen(false)} className="btn-primary mb-3 w-full"><Plus size={18} /> New listing</Link>
                            <UserChip profile={profile} onSignOut={doSignOut} />
                        </div>
                    </div>
                )}

                {/* Main */}
                <main className="md:pl-[252px]">
                    {/* Utility bar */}
                    <div className="sticky top-0 z-30 hidden items-center justify-end gap-2.5 border-b border-line bg-paper/55 px-6 py-2.5 backdrop-blur-xl md:flex lg:px-10">
                        <button
                            onClick={() => window.dispatchEvent(new Event("cmdk:open"))}
                            className="flex items-center gap-2 rounded-xl border border-line bg-white/70 px-3 py-2 text-sm text-ink-faint transition hover:bg-white hover:text-ink-soft"
                        >
                            <Search size={16} /> Search
                            <kbd className="ml-4 rounded-md border border-line bg-paper-warm px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint">⌘K</kbd>
                        </button>
                        <ComfortToggle />
                        <NotificationsBell items={notif} />
                    </div>
                    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</div>
                </main>

                <CommandPalette onSignOut={doSignOut} />
            </div>
        </ConfirmProvider>
    );
}

function isActive(pathname: string, item: { href: string; exact?: boolean }) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ComponentType<{ size?: number }>; active?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-200",
                active ? "bg-forest-500 text-white shadow-[0_8px_20px_-10px_rgba(30,142,90,0.7)]" : "text-ink-soft hover:bg-white hover:text-ink",
            )}
        >
            <Icon size={20} /> {label}
        </Link>
    );
}

function UserChip({ profile, onSignOut }: { profile: ReturnType<typeof useAuth>["profile"]; onSignOut: () => void }) {
    const [open, setOpen] = React.useState(false);
    const RoleIcon = profile?.role === "farm" ? Barn : Storefront;
    return (
        <div className="relative">
            <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-white/70 p-2 text-left transition hover:bg-white">
                <Avatar name={profile?.full_name} src={profile?.avatar_url} size={36} />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight text-ink">{profile?.full_name || "You"}</p>
                    <p className="flex items-center gap-1 text-2xs font-medium uppercase tracking-wide text-ink-faint">
                        <RoleIcon size={12} /> {profile?.role === "farm" ? "Farm" : "Buyer"}
                    </p>
                </div>
            </button>
            {open && (
                <div className="absolute bottom-full left-0 mb-2 w-full glass-card p-1.5 animate-scale-in">
                    <Link href="/app/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper-sunk">
                        <UserIcon size={17} /> Profile
                    </Link>
                    <button onClick={onSignOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-berry hover:bg-berry/5">
                        <Logout size={17} /> Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
