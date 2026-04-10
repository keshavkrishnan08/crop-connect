"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/AuthProvider";

interface HeaderProps {
    role: "farmer" | "buyer";
}

const farmerLinks = [
    { icon: "home", label: "Home", href: "/dashboard/farmer" },
    { icon: "eco", label: "My Crops", href: "/dashboard/farmer/crops" },
    { icon: "storefront", label: "Marketplace", href: "/dashboard/marketplace" },
    { icon: "local_shipping", label: "Orders", href: "/dashboard/farmer/distribution" },
    { icon: "analytics", label: "Analytics", href: "/dashboard/farmer/analytics" },
    { icon: "chat_bubble", label: "Messages", href: "/dashboard/messages" },
];

const buyerLinks = [
    { icon: "grid_view", label: "Dashboard", href: "/dashboard/buyer" },
    { icon: "storefront", label: "Marketplace", href: "/dashboard/marketplace" },
    { icon: "receipt_long", label: "Orders", href: "/dashboard/buyer/orders" },
    { icon: "local_shipping", label: "Shipping", href: "/dashboard/buyer/shipping" },
    { icon: "request_quote", label: "Requests", href: "/dashboard/buyer/request" },
    { icon: "chat_bubble", label: "Messages", href: "/dashboard/messages" },
];

export default function Header({ role }: HeaderProps) {
    const { profile } = useProfile();
    const { signOut } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const links = role === "farmer" ? farmerLinks : buyerLinks;

    const handleLogout = async () => {
        setMobileMenuOpen(false);
        await signOut();
        router.push("/");
    };

    return (
        <>
            <header className="flex items-center justify-between h-16 md:h-20 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl sticky top-0 z-20 px-4 md:px-8 border-b border-white/20 dark:border-white/[0.06]">
                {/* Mobile Logo - shown on small screens */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined !text-[18px]">spa</span>
                    </div>
                    <span className="font-bold text-lg dark:text-white">CropConnect</span>
                </div>

                {/* Desktop: Page context / breadcrumb area */}
                <div className="hidden md:block">
                    <p className="text-sm font-bold text-[#131613] dark:text-white">
                        {(() => {
                            if (pathname === "/dashboard/farmer") return "Farm Dashboard";
                            if (pathname === "/dashboard/buyer") return "Buyer Dashboard";
                            if (pathname.includes("/crops")) return "My Crops";
                            if (pathname.includes("/marketplace")) return "Marketplace";
                            if (pathname.includes("/distribution")) return "Orders & Shipping";
                            if (pathname.includes("/messages")) return "Messages";
                            if (pathname.includes("/analytics")) return "Analytics";
                            if (pathname.includes("/settings")) return "Settings";
                            if (pathname.includes("/orders")) return "My Orders";
                            if (pathname.includes("/shipping")) return "Shipment Tracking";
                            if (pathname.includes("/request")) return "Produce Requests";
                            if (pathname.includes("/profile")) return "Profile";
                            if (pathname.includes("/inquiry")) return "Inquiry";
                            if (pathname.includes("/offer")) return "New Offer";
                            return role === "farmer" ? "Farm Dashboard" : "Buyer Dashboard";
                        })()}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                        {role === "farmer" ? "Farmer Account" : "Buyer Account"}
                    </p>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-3">
                    <button aria-label="Notifications" className="relative p-2 text-gray-500 hover:text-primary transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-[#1E2A20] hover:ring-2 hover:ring-primary/20">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-white/10"></span>
                    </button>

                    {/* Profile indicator */}
                    <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-white/10">
                        <div
                            className="size-9 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center overflow-hidden"
                            style={profile?.profile_picture ? { backgroundImage: `url("${profile.profile_picture}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                        >
                            {!profile?.profile_picture && (
                                <span className="material-symbols-outlined text-primary !text-[18px]">person</span>
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-sm font-bold text-[#131613] dark:text-white truncate max-w-[120px]">
                                {profile?.farm_name || profile?.full_name || 'User'}
                            </p>
                            <p className="text-[10px] font-medium text-gray-400 capitalize">{role}</p>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileMenuOpen}
                        className="md:hidden p-2 text-[#131613] dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                        <span className="material-symbols-outlined">
                            {mobileMenuOpen ? "close" : "menu"}
                        </span>
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="absolute right-0 top-0 h-full w-72 bg-white/95 dark:bg-[#141e15]/95 backdrop-blur-2xl shadow-2xl flex flex-col animate-slide-in-right">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2f3a2f]">
                            <div className="flex items-center gap-3">
                                <div
                                    className="size-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden"
                                    style={profile?.profile_picture ? { backgroundImage: `url("${profile.profile_picture}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!profile?.profile_picture && (
                                        <span className="material-symbols-outlined text-primary !text-[20px]">person</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-[#131613] dark:text-white truncate max-w-[160px]">
                                        {profile?.farm_name || profile?.full_name || 'User'}
                                    </p>
                                    <p className="text-[10px] font-medium text-gray-400 capitalize">{role}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Close menu"
                                className="size-9 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined !text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 py-2 overflow-y-auto">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 mx-2 px-4 py-3 rounded-xl transition-all ${
                                            isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined !text-[22px] ${isActive ? "" : ""}`}>
                                            {link.icon}
                                        </span>
                                        <span className="text-sm font-medium">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Bottom Actions */}
                        <div className="p-3 border-t border-gray-100 dark:border-[#2f3a2f] space-y-2">
                            {role === "farmer" && (
                                <Link
                                    href="/dashboard/farmer/crops"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 rounded-xl h-11 bg-primary text-white text-sm font-bold shadow-sm"
                                >
                                    <span className="material-symbols-outlined !text-[18px]">add</span>
                                    Post Crop
                                </Link>
                            )}
                            <Link
                                href={role === "farmer" ? "/dashboard/farmer/settings" : "/dashboard/buyer/profile"}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 rounded-xl h-11 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-medium"
                            >
                                <span className="material-symbols-outlined !text-[18px]">person</span>
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 rounded-xl h-11 w-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-medium"
                            >
                                <span className="material-symbols-outlined !text-[18px]">logout</span>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
