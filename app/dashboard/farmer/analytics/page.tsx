"use client";

import { useState, useEffect, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useOrders } from "@/hooks/useOrders";
import { useListings } from "@/hooks/useListings";
import Link from "next/link";

export default function AnalyticsPage() {
    const { profile } = useProfile();
    const { orders, fetchFarmerOrders } = useOrders();
    const { listings, fetchMyListings } = useListings();
    const [period, setPeriod] = useState<"30" | "90" | "365">("30");

    useEffect(() => {
        fetchFarmerOrders();
        fetchMyListings();
    }, [fetchFarmerOrders, fetchMyListings]);

    const stats = useMemo(() => {
        const now = Date.now();
        const cutoff = now - parseInt(period) * 24 * 60 * 60 * 1000;

        const periodOrders = orders.filter(o => new Date(o.created_at).getTime() > cutoff);
        const completedOrders = periodOrders.filter(o => o.escrow_status === "funds_released");
        const totalSales = completedOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const activeListings = listings.filter(l => l.status === "available").length;
        const pendingOrders = periodOrders.filter(o =>
            o.escrow_status === "funds_held" || o.escrow_status === "shipped_awaiting_confirmation"
        ).length;
        const cancelledOrders = periodOrders.filter(o =>
            o.status === "cancelled" || o.escrow_status === "refunded"
        ).length;

        return {
            totalSales,
            completedCount: completedOrders.length,
            activeListings,
            totalOrders: periodOrders.length,
            pendingOrders,
            cancelledOrders,
        };
    }, [orders, listings, period]);

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
    }, [orders]);

    const topListings = useMemo(() => {
        return [...listings]
            .filter(l => l.status === "available")
            .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
            .slice(0, 3);
    }, [listings]);

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return "just now";
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const escrowLabel = (status: string | null) => {
        const labels: Record<string, string> = {
            funds_held: "Payment Secured",
            shipped_awaiting_confirmation: "Shipped",
            funds_released: "Completed",
            disputed: "Disputed",
            refunded: "Refunded",
            awaiting_payment: "Awaiting Payment",
            cancelled: "Cancelled",
        };
        return labels[status || ""] || status || "Pending";
    };

    const escrowColor = (status: string | null) => {
        const colors: Record<string, string> = {
            funds_released: "text-green-600 bg-green-50",
            funds_held: "text-blue-600 bg-blue-50",
            shipped_awaiting_confirmation: "text-purple-600 bg-purple-50",
            disputed: "text-red-600 bg-red-50",
            refunded: "text-orange-600 bg-orange-50",
            awaiting_payment: "text-yellow-700 bg-yellow-50",
            cancelled: "text-gray-500 bg-gray-50",
        };
        return colors[status || ""] || "text-gray-500 bg-gray-50";
    };

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-6 py-8 max-w-[1440px] mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#131613] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Analytics & Insights</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-base font-normal">
                        {profile?.full_name ? (
                            <>Welcome back, <span className="font-semibold text-[#131613] dark:text-white">{profile.full_name}</span>.</>
                        ) : (
                            <>Your farm performance at a glance.</>
                        )}
                    </p>
                </div>
                <div className="relative">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as "30" | "90" | "365")}
                        className="appearance-none h-10 pl-4 pr-10 rounded-lg bg-white dark:bg-[#1a2c15] border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer text-[#131613] dark:text-white"
                    >
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="365">Last Year</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="stat-card flex flex-col gap-3 stagger-1">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Sales</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md text-[20px]">payments</span>
                    </div>
                    <p className="text-[#131613] dark:text-white font-mono text-2xl font-bold">{formatCurrency(stats.totalSales)}</p>
                </div>
                <div className="stat-card flex flex-col gap-3 stagger-2">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Orders Completed</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md text-[20px]">check_circle</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-[#131613] dark:text-white font-mono text-2xl font-bold">{stats.completedCount}</p>
                        {stats.totalOrders > 0 && (
                            <p className="text-gray-400 text-xs font-mono">of {stats.totalOrders} total</p>
                        )}
                    </div>
                </div>
                <div className="stat-card flex flex-col gap-3 stagger-3">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending Orders</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md text-[20px]">hourglass_top</span>
                    </div>
                    <p className="text-[#131613] dark:text-white font-mono text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
                <div className="stat-card flex flex-col gap-3 stagger-4">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Listings</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md text-[20px]">inventory_2</span>
                    </div>
                    <p className="text-[#131613] dark:text-white font-mono text-2xl font-bold">{stats.activeListings}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 card-glass p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[#131613] dark:text-white">Recent Orders</h3>
                        <Link href="/dashboard/farmer/distribution" className="text-sm text-primary font-medium hover:underline">View All</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="py-16 text-center">
                            <span className="material-symbols-outlined text-gray-300 !text-[48px] mb-3">receipt_long</span>
                            <p className="text-gray-400 font-medium">No orders yet</p>
                            <p className="text-gray-400 text-sm mt-1">Orders will appear here as buyers purchase your listings.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#131613] dark:text-white truncate">
                                            {order.listing?.crop_name || "Order"} &middot; {order.quantity} {order.listing?.unit || "units"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${escrowColor(order.escrow_status)}`}>
                                            {escrowLabel(order.escrow_status)}
                                        </span>
                                        <span className="text-sm font-mono font-bold text-[#131613] dark:text-white">
                                            {formatCurrency(order.total_price || 0)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Listings */}
                <div className="lg:col-span-1 card-glass p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[#131613] dark:text-white">Active Listings</h3>
                        <Link href="/dashboard/farmer/crops" className="text-sm text-primary font-medium hover:underline">Manage</Link>
                    </div>
                    {topListings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-12">
                            <span className="material-symbols-outlined text-gray-300 !text-[48px] mb-3">storefront</span>
                            <p className="text-gray-400 font-medium">No active listings</p>
                            <Link href="/dashboard/farmer/listings/new" className="text-primary text-sm font-medium mt-2 hover:underline">
                                Create your first listing
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5 flex-1">
                            {topListings.map((listing) => (
                                <div key={listing.id} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-[#131613] dark:text-white truncate">{listing.crop_name}</span>
                                        <span className="font-mono text-gray-600 dark:text-gray-300 flex-shrink-0 ml-2">
                                            ${listing.price_per_unit}/{listing.unit}
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${Math.min(100, (listing.quantity / (topListings[0]?.quantity || 1)) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {listing.quantity} {listing.unit} available
                                        {listing.category && <> &middot; {listing.category}</>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link
                        href="/dashboard/farmer/listings/new"
                        className="mt-6 w-full py-2.5 text-sm font-medium text-center text-[#131613] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white transition-colors block"
                    >
                        + Add New Listing
                    </Link>
                </div>
            </div>
        </div>
    );
}
