"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/hooks/useProfile";

interface SidebarProps {
    role: "farmer" | "buyer";
    forceCollapsed?: boolean;
}

export default function Sidebar({ role, forceCollapsed = false }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const { profile } = useProfile();
    const [isExpanded, setIsExpanded] = useState(false);

    // Keep sidebar collapsed on certain pages like the new listing page
    const shouldStayCollapsed = forceCollapsed || pathname.includes('/listings/new');
    const expanded = shouldStayCollapsed ? false : isExpanded;

    const displayName = profile?.farm_name || profile?.full_name || "CropConnect";
    const profilePicture = profile?.profile_picture;

    const handleLogout = async () => {
        await signOut();
        router.push("/");
    };

    interface LinkItem {
        icon: string;
        label: string;
        href: string;
        weight?: string;
    }

    const farmerLinks: LinkItem[] = [
        { icon: "home", label: "Home", href: "/dashboard/farmer" },
        { icon: "eco", label: "My Crops", href: "/dashboard/farmer/crops" },
        { icon: "storefront", label: "Marketplace", href: "/dashboard/marketplace" },
        { icon: "local_shipping", label: "Orders", href: "/dashboard/farmer/distribution" },
        { icon: "analytics", label: "Analytics", href: "/dashboard/farmer/analytics" },
        { icon: "chat_bubble", label: "Messages", href: "/dashboard/messages" },
    ];

    const buyerLinks: LinkItem[] = [
        { icon: "grid_view", label: "Dashboard", href: "/dashboard/buyer", weight: "fill" },
        { icon: "storefront", label: "Marketplace", href: "/dashboard/marketplace" },
        { icon: "receipt_long", label: "Orders", href: "/dashboard/buyer/orders" },
        { icon: "local_shipping", label: "Shipping", href: "/dashboard/buyer/shipping" },
        { icon: "request_quote", label: "Requests", href: "/dashboard/buyer/request" },
        { icon: "chat_bubble", label: "Messages", href: "/dashboard/messages" },
    ];

    const links = role === "farmer" ? farmerLinks : buyerLinks;

    return (
        <aside
            onMouseEnter={() => !shouldStayCollapsed && setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={`hidden md:flex flex-col bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl m-3 rounded-2xl border border-white/30 dark:border-white/[0.06] h-[calc(100%-24px)] shrink-0 transition-all duration-300 ease-in-out shadow-glass ${
                expanded ? "w-56" : "w-16"
            }`}
        >
            {/* Logo */}
            <div className={`p-3 flex items-center ${expanded ? "gap-3 px-4" : "justify-center"} h-16 border-b border-white/20 dark:border-white/[0.06]`}>
                <div
                    className={`bg-center bg-no-repeat bg-cover rounded-lg flex items-center justify-center shrink-0 transition-all size-9 ${profilePicture ? "" : "bg-primary/10"}`}
                    style={profilePicture ? { backgroundImage: `url("${profilePicture}")` } : {}}
                >
                    {!profilePicture && (
                        <span className="material-symbols-outlined text-primary !text-[18px]">
                            {role === "farmer" ? "agriculture" : "shopping_basket"}
                        </span>
                    )}
                </div>
                {expanded && (
                    <div className="flex flex-col overflow-hidden animate-fade-in">
                        <h1 className="text-[#131613] dark:text-white text-xs font-bold leading-tight truncate">{displayName}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-[9px] font-medium truncate">
                            {role === "farmer" ? "Producer" : "Buyer"}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`flex items-center gap-2.5 mx-1.5 px-2.5 py-2.5 rounded-xl group transition-all ${
                                expanded ? "" : "justify-center"
                            } ${
                                isActive
                                    ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-2 border-primary"
                                    : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-[#131613] dark:hover:text-white hover:translate-x-0.5"
                            }`}
                            title={!expanded ? link.label : undefined}
                        >
                            <span
                                className={`material-symbols-outlined !text-[20px] shrink-0 ${isActive ? "font-medium" : ""}`}
                                data-weight={link.weight}
                            >
                                {link.icon}
                            </span>
                            {expanded && (
                                <span className={`text-xs whitespace-nowrap ${isActive ? "font-semibold" : "font-medium"}`}>
                                    {link.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className={`p-2 border-t border-white/20 dark:border-white/[0.06] space-y-1.5`}>
                {role === "farmer" && (
                    <Link
                        href="/dashboard/farmer/crops"
                        className={`flex items-center justify-center rounded-xl h-10 bg-primary text-white text-xs font-bold shadow-colored-green hover:shadow-glow-md hover:scale-[1.02] hover:bg-primary-dark transition-all duration-200 ${
                            expanded ? "px-3 gap-2" : ""
                        }`}
                        title={!expanded ? "Post Crop" : undefined}
                    >
                        <span className="material-symbols-outlined !text-[18px]">add</span>
                        {expanded && <span className="truncate">Post Crop</span>}
                    </Link>
                )}

                <Link
                    href={role === "farmer" ? "/dashboard/farmer/settings" : "/dashboard/buyer/profile"}
                    className={`flex items-center justify-center rounded-xl h-10 w-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${
                        expanded ? "px-3 gap-2" : ""
                    }`}
                    title={!expanded ? "Profile" : undefined}
                >
                    <span className="material-symbols-outlined !text-[18px]">person</span>
                    {expanded && <span>Profile</span>}
                </Link>

                <button
                    onClick={handleLogout}
                    className={`flex items-center justify-center rounded-xl h-10 w-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${
                        expanded ? "px-3 gap-2" : ""
                    }`}
                    title={!expanded ? "Log Out" : undefined}
                >
                    <span className="material-symbols-outlined !text-[18px]">logout</span>
                    {expanded && <span>Log Out</span>}
                </button>
            </div>
        </aside>
    );
}
