"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useListings } from "@/hooks/useListings";
import { useProfile } from "@/hooks/useProfile";

export default function AnalyticsPage() {
    const { profile } = useProfile();
    const { orders, loading: ordersLoading, fetchFarmerOrders, fetchBuyerOrders, getStats } = useOrders();
    const { listings, loading: listingsLoading, fetchMyListings, fetchAllListings } = useListings();
    const [timeRange, setTimeRange] = useState("Last 30 Days");

    // Fetch data based on user role
    useEffect(() => {
        if (profile?.role === 'farmer') {
            fetchFarmerOrders();
            fetchMyListings();
        } else {
            fetchBuyerOrders();
            fetchAllListings();
        }
    }, [profile?.role, fetchFarmerOrders, fetchBuyerOrders, fetchMyListings, fetchAllListings]);

    const orderStats = useMemo(() => getStats(), [getStats]);

    // Calculate fulfillment rate
    const fulfillmentRate = useMemo(() => {
        if (orders.length === 0) return 0;
        const delivered = orders.filter(o => o.status === 'delivered').length;
        return Math.round((delivered / orders.length) * 100);
    }, [orders]);

    // Calculate metrics based on role
    const metrics = useMemo(() => {
        if (profile?.role === 'farmer') {
            return [
                { label: "Total Listings", value: listings.length.toString(), trend: "", color: "text-emerald-500" },
                { label: "Total Revenue", value: `$${orderStats.totalRevenue.toLocaleString()}`, trend: "", color: "text-blue-500" },
                { label: "Fulfillment Rate", value: `${fulfillmentRate}%`, trend: "", color: "text-amber-500" },
                { label: "Pending Orders", value: orderStats.pendingOrders.toString(), trend: "", color: "text-purple-500" }
            ];
        } else {
            return [
                { label: "Total Orders", value: orderStats.totalOrders.toString(), trend: "", color: "text-emerald-500" },
                { label: "Total Spent", value: `$${orderStats.totalRevenue.toLocaleString()}`, trend: "", color: "text-blue-500" },
                { label: "Completed Orders", value: orderStats.completedOrders.toString(), trend: "", color: "text-amber-500" },
                { label: "Pending Orders", value: orderStats.pendingOrders.toString(), trend: "", color: "text-purple-500" }
            ];
        }
    }, [profile?.role, listings.length, orderStats, fulfillmentRate]);

    // Generate chart data from orders
    const chartData = useMemo(() => {
        // Group orders by week and calculate revenue
        const weeks: number[] = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();

        orders.forEach(order => {
            const orderDate = new Date(order.created_at);
            const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / 86400000);
            const weekIndex = Math.min(Math.floor(diffDays / 7), 6);
            weeks[6 - weekIndex] += order.total_price;
        });

        // Normalize to percentages for display
        const max = Math.max(...weeks, 1);
        return weeks.map(w => Math.round((w / max) * 100) || 10);
    }, [orders]);

    // Get top performing crops (for farmers) or top purchased crops (for buyers)
    const topCrops = useMemo(() => {
        const cropRevenue: Record<string, number> = {};

        orders.forEach(order => {
            const cropName = order.listing?.crop_name || 'Unknown';
            cropRevenue[cropName] = (cropRevenue[cropName] || 0) + order.total_price;
        });

        const sorted = Object.entries(cropRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        const total = sorted.reduce((sum, [, val]) => sum + val, 0) || 1;

        const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500"];

        return sorted.map(([name, value], i) => ({
            name,
            share: `${Math.round((value / total) * 100)}%`,
            color: colors[i] || "bg-gray-500"
        }));
    }, [orders]);

    const loading = ordersLoading || listingsLoading;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-white/5 pb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter dark:text-white">Performance Analytics</h1>
                    <p className="text-sm text-gray-500 font-medium">
                        {profile?.role === 'farmer' ? 'Track your farm sales and performance' : 'Track your purchasing history and spending'}
                    </p>
                </div>
                <div className="flex gap-2 bg-gray-50 dark:bg-white/5 p-1 rounded-xl border border-gray-100 dark:border-white/5">
                    {["Last 7 Days", "Last 30 Days", "Year to Date"].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-primary text-white shadow-glow' : 'text-gray-400 hover:text-primary'}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white dark:bg-[#1a2c15] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-premium">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{m.label}</p>
                        <div className="flex items-baseline justify-between">
                            <p className="text-2xl font-black tracking-tight dark:text-white">{m.value}</p>
                            {m.trend && <span className={`text-[10px] font-black ${m.color}`}>{m.trend}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#1a2c15] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-premium">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-black tracking-tight dark:text-white">
                            {profile?.role === 'farmer' ? 'Revenue Trend' : 'Spending Trend'}
                        </h3>
                        <span className="material-symbols-outlined text-gray-300">more_horiz</span>
                    </div>
                    {orders.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center">
                            <div className="size-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                                <span className="material-symbols-outlined !text-[32px]">bar_chart</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">No order data yet</p>
                        </div>
                    ) : (
                        <div className="h-64 flex items-end gap-3 pb-2">
                            {chartData.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div
                                        className="w-full bg-primary/10 rounded-t-lg relative transition-all group-hover:bg-primary/20"
                                        style={{ height: `${val}%` }}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-primary rounded-full"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">W{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-[#1a2c15] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-premium flex flex-col justify-between">
                    <div className="space-y-6">
                        <h3 className="text-lg font-black tracking-tight dark:text-white">
                            {profile?.role === 'farmer' ? 'Top Performing Crops' : 'Top Purchased Crops'}
                        </h3>
                        {topCrops.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {topCrops.map(crop => (
                                    <div key={crop.name} className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest dark:text-white">
                                            <span>{crop.name}</span>
                                            <span>{crop.share}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${crop.color}`} style={{ width: crop.share }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-[#1a2c15] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-premium">
                <h3 className="text-lg font-black tracking-tight dark:text-white mb-6">Recent Orders</h3>
                {orders.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">eco</span>
                                    </div>
                                    <div>
                                        <p className="font-bold dark:text-white">{order.listing?.crop_name || "Unknown Crop"}</p>
                                        <p className="text-xs text-gray-400">{order.quantity} {order.listing?.unit}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-primary">${order.total_price.toLocaleString()}</p>
                                    <p className={`text-xs font-bold ${
                                        order.status === 'delivered' ? 'text-emerald-500' :
                                        order.status === 'cancelled' ? 'text-red-500' :
                                        order.status === 'shipped' ? 'text-blue-500' :
                                        'text-amber-500'
                                    }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
