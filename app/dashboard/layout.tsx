"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/hooks/useProfile";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { profile } = useProfile();
    const [role, setRole] = useState<"farmer" | "buyer">("farmer");

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!authLoading && !user) {
            router.push("/auth/login");
            return;
        }

        // Once profile is loaded, set role and enforce route boundaries
        if (profile?.role) {
            setRole(profile.role);

            // Enforce role-based routing: redirect to own dashboard if accessing wrong role's routes
            const isFarmerRoute = pathname.startsWith("/dashboard/farmer");
            const isBuyerRoute = pathname.startsWith("/dashboard/buyer");

            if (profile.role === "buyer" && isFarmerRoute) {
                router.replace("/dashboard/buyer");
                return;
            }
            if (profile.role === "farmer" && isBuyerRoute) {
                router.replace("/dashboard/farmer");
                return;
            }
        } else if (pathname.includes("/farmer")) {
            setRole("farmer");
        } else if (pathname.includes("/buyer")) {
            setRole("buyer");
        }
    }, [authLoading, user, profile, pathname, router]);

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="flex h-screen w-full bg-background-light dark:bg-background-dark items-center justify-center font-display">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-3">
                        <div className="skeleton h-12 w-12 !rounded-xl"></div>
                        <div className="skeleton h-3 w-20 !rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden font-display text-[#131613]">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
                <Header role={role} />

                {/* Main Content Area */}
                <main className={`flex-1 overflow-y-auto bg-gradient-to-br from-background-light via-background-light to-primary/[0.02] dark:from-background-dark dark:via-background-dark dark:to-primary/[0.03] relative ${role === 'buyer' ? 'scroll-smooth' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
