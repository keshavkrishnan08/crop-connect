"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { Avatar, Spinner } from "@/components/ui/kit";
import {
    Dashboard, Compass, Contract as ContractIcon, Wheat, Nodes, User as UserIcon,
    Logout, Plus, Menu, X, Barn, Storefront,
} from "@/components/icons";
import { cn } from "@/lib/utils";

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

    React.useEffect(() => {
        if (loading) return;
        if (!session) {
            router.replace("/login");
            return;
        }
        // onboarding gate — profile exists but unfinished
        if (profile && !profile.full_name && pathname !== "/app/onboarding") {
            router.replace("/app/onboarding");
        }
    }, [loading, session, profile, pathname, router]);

    if (loading || !session) {
        return (
            <div className="grid min-h-screen place-items-center bg-paper">
                <Spinner size={26} className="text-forest-500" />
            </div>
        );
    }

    // Onboarding renders without the shell chrome
    if (pathname === "/app/onboarding") return <>{children}</>;

    return (
        <div className="min-h-screen bg-paper bg-aurora">
            {/* ---- Sidebar (desktop) ---- */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-line bg-white/55 backdrop-blur-xl lg:flex">
                <div className="px-5 py-5">
                    <Logo size="md" />
                </div>
                <nav className="flex-1 space-y-1 px-3">
                    {NAV.map((item) => (
                        <NavLink key={item.href} {...item} active={isActive(pathname, item)} />
                    ))}
                </nav>
                <div className="px-3 pb-3">
                    <Link
                        href="/app/listings/new"
                        className="btn-primary w-full mb-3"
                    >
                        <Plus size={18} /> New listing
                    </Link>
                    <UserChip profile={profile} onSignOut={() => signOut().then(() => router.replace("/"))} />
                </div>
            </aside>

            {/* ---- Mobile top bar ---- */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white/70 px-4 py-3 backdrop-blur-xl lg:hidden">
                <Logo size="sm" />
                <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl hairline bg-white/70">
                    <Menu size={20} />
                </button>
            </header>

            {/* ---- Mobile drawer ---- */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-[270px] flex flex-col bg-paper p-4 animate-fade-up">
                        <div className="flex items-center justify-between mb-4">
                            <Logo size="sm" />
                            <button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl hairline">
                                <X size={18} />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-1" onClick={() => setMobileOpen(false)}>
                            {NAV.map((item) => (
                                <NavLink key={item.href} {...item} active={isActive(pathname, item)} />
                            ))}
                            <NavLink href="/app/profile" label="Profile" icon={UserIcon} active={pathname === "/app/profile"} />
                        </nav>
                        <Link href="/app/listings/new" onClick={() => setMobileOpen(false)} className="btn-primary w-full mb-3">
                            <Plus size={18} /> New listing
                        </Link>
                        <UserChip profile={profile} onSignOut={() => signOut().then(() => router.replace("/"))} />
                    </div>
                </div>
            )}

            {/* ---- Main ---- */}
            <main className="lg:pl-[252px]">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</div>
            </main>
        </div>
    );
}

function isActive(pathname: string, item: { href: string; exact?: boolean }) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function NavLink({
    href, label, icon: Icon, active,
}: { href: string; label: string; icon: React.ComponentType<{ size?: number }>; active?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-200",
                active
                    ? "bg-forest-500 text-white shadow-[0_8px_20px_-10px_rgba(30,142,90,0.7)]"
                    : "text-ink-soft hover:bg-white hover:text-ink",
            )}
        >
            <Icon size={20} />
            {label}
        </Link>
    );
}

function UserChip({ profile, onSignOut }: { profile: ReturnType<typeof useAuth>["profile"]; onSignOut: () => void }) {
    const [open, setOpen] = React.useState(false);
    const RoleIcon = profile?.role === "farm" ? Barn : Storefront;
    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-white/70 p-2 text-left transition hover:bg-white"
            >
                <Avatar name={profile?.full_name} src={profile?.avatar_url} size={36} />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink leading-tight">{profile?.full_name || "You"}</p>
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
