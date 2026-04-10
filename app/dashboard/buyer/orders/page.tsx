"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import EscrowStatusBadge from "@/components/EscrowStatusBadge";
import CropScoreBadge from "@/components/CropScoreBadge";
import DisputeModal from "@/components/DisputeModal";
import ReviewModal from "@/components/ReviewModal";
import StarRating from "@/components/StarRating";
import AutoReleaseCountdown from "@/components/AutoReleaseCountdown";
import OrderDetailModal from "@/components/OrderDetailModal";
import { authFetch } from "@/lib/api-client";
import type { EscrowStatus } from "@/lib/escrow-states";
import { useToast } from "@/components/Toast";

export default function BuyerOrdersPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { orders, loading, fetchBuyerOrders, getStats } = useOrders();
    const [filterStatus, setFilterStatus] = useState("all");
    const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
    const [reviewFarmerId, setReviewFarmerId] = useState<string | null>(null);
    const [reviewFarmerName, setReviewFarmerName] = useState('');
    const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const { hasReviewedOrder } = useReviews();

    useEffect(() => {
        fetchBuyerOrders();
    }, [fetchBuyerOrders]);

    // Check which completed orders have been reviewed
    const checkReviewedOrders = useCallback(async () => {
        const completedOrders = orders.filter(o => o.status === 'funds_released' || o.escrow_status === 'funds_released');
        const reviewed = new Set<string>();
        for (const order of completedOrders) {
            const hasReview = await hasReviewedOrder(order.id);
            if (hasReview) reviewed.add(order.id);
        }
        setReviewedOrders(reviewed);
    }, [orders, hasReviewedOrder]);

    useEffect(() => {
        if (orders.length > 0) checkReviewedOrders();
    }, [orders, checkReviewedOrders]);

    const stats = useMemo(() => getStats(), [getStats]);

    const filteredOrders = orders.filter(order => {
        if (filterStatus === "all") return true;
        return order.status === filterStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleConfirmDelivery = async (orderId: string) => {
        if (!user?.id) return;
        setActionLoading(orderId);
        try {
            const res = await authFetch('/api/stripe/release-funds', {
                method: 'POST',
                body: JSON.stringify({ orderId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await fetchBuyerOrders();
            // Auto-show review modal after confirming delivery
            const order = orders.find(o => o.id === orderId);
            if (order) {
                setReviewOrderId(orderId);
                setReviewFarmerId(order.farmer_id);
                setReviewFarmerName(order.farmer?.farm_name || order.farmer?.full_name || 'Farmer');
            }
        } catch (err) {
            toast(err instanceof Error ? err.message : 'Failed to confirm delivery', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const openReviewModal = (orderId: string, farmerId: string, farmerName: string) => {
        setReviewOrderId(orderId);
        setReviewFarmerId(farmerId);
        setReviewFarmerName(farmerName);
    };

    const handleDispute = async (orderId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) return { success: false, error: 'Not authenticated' };
        try {
            const res = await authFetch('/api/stripe/dispute', {
                method: 'POST',
                body: JSON.stringify({ orderId, reason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            fetchBuyerOrders();
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to file dispute';
            return { success: false, error: message };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
            case 'awaiting_payment':
                return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
            case 'confirmed':
            case 'funds_held':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
            case 'shipped':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
            case 'delivered':
            case 'funds_released':
                return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300';
            case 'cancelled':
            case 'payment_failed':
                return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
            case 'disputed':
                return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
            case 'refunded':
                return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
            default:
                return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
                {/* Page Heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#131613] dark:text-white">My Orders</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Track and manage your produce orders.</p>
                    </div>
                    <Link
                        href="/dashboard/marketplace"
                        className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-glow hover:bg-primary-dark transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">storefront</span>
                        Browse Marketplace
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="stat-card flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Total Orders</p>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md">receipt_long</span>
                        </div>
                        <p className="text-3xl font-bold text-[#131613] dark:text-white mt-2">{stats.totalOrders}</p>
                    </div>
                    <div className="stat-card flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Pending</p>
                            <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-1 rounded-md">schedule</span>
                        </div>
                        <p className="text-3xl font-bold text-[#131613] dark:text-white mt-2">{stats.pendingOrders}</p>
                    </div>
                    <div className="stat-card flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Delivered</p>
                            <span className="material-symbols-outlined text-green-500 bg-green-500/10 p-1 rounded-md">check_circle</span>
                        </div>
                        <p className="text-3xl font-bold text-[#131613] dark:text-white mt-2">{stats.completedOrders}</p>
                    </div>
                    <div className="stat-card flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Total Spent</p>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md">payments</span>
                        </div>
                        <p className="text-3xl font-bold text-[#131613] dark:text-white mt-2">${stats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-gray-50 dark:bg-[#1a2c15]/50 p-2 rounded-xl">
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                        {['all', 'pending', 'awaiting_payment', 'funds_held', 'shipped', 'funds_released', 'disputed', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                                    filterStatus === status
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white dark:bg-[#1a2c15] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary'
                                }`}
                            >
                                {status === 'all' ? 'All Orders' : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-500 font-medium">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
                            <div className="size-32 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-300">
                                <span className="material-symbols-outlined !text-[64px]">shopping_bag</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[#131613] dark:text-white">No orders yet</h3>
                                <p className="text-gray-500 dark:text-[#a3b2a4] font-medium text-lg">
                                    {filterStatus === 'all'
                                        ? "Start shopping in the marketplace to place your first order."
                                        : `No ${filterStatus} orders found.`
                                    }
                                </p>
                            </div>
                            <Link
                                href="/dashboard/marketplace"
                                className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-glow hover:bg-primary-dark transition-all"
                            >
                                Browse Marketplace
                            </Link>
                        </div>
                    ) : filteredOrders.map(order => (
                        <div key={order.id} onClick={() => setSelectedOrder(order.id)} className="group relative flex flex-col md:flex-row gap-5 card-glass p-5 hover:!shadow-card-hover hover:!border-primary/50 cursor-pointer">
                            {/* Listing Image */}
                            <div className="w-full md:w-48 aspect-video md:aspect-square shrink-0 rounded-xl bg-cover bg-center relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                                {order.listing?.image_url ? (
                                    <div
                                        className="h-full w-full bg-cover bg-center"
                                        style={{ backgroundImage: `url("${order.listing.image_url}")` }}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary/30 !text-[48px]">eco</span>
                                    </div>
                                )}
                                <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#131613] dark:text-white group-hover:text-primary transition-colors">
                                                {order.listing?.crop_name || "Unknown Crop"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    From: {order.farmer?.farm_name || order.farmer?.full_name || "Unknown Farm"}
                                                </span>
                                                {(order.farmer as Record<string, unknown>)?.crop_score != null && (
                                                    <CropScoreBadge
                                                        score={Number((order.farmer as Record<string, unknown>)?.crop_score) || 0}
                                                        tier={String((order.farmer as Record<string, unknown>)?.crop_score_tier || 'bronze')}
                                                        variant="compact"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <span className="block text-2xl font-bold text-primary">${order.total_price.toFixed(2)}</span>
                                            <span className="text-sm text-gray-500">{order.quantity} {order.listing?.unit || 'units'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 mt-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-gray-400 text-[20px]">calendar_today</span>
                                            <span>Ordered: {formatDate(order.created_at)}</span>
                                        </div>
                                        {order.farmer?.location && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-gray-400 text-[20px]">agriculture</span>
                                                <span>Farm Location: {order.farmer.location}</span>
                                            </div>
                                        )}
                                        {order.farmer?.farm_address && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-gray-400 text-[20px]">pin_drop</span>
                                                <span>Address: {order.farmer.farm_address}</span>
                                            </div>
                                        )}
                                        {order.farmer?.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-gray-400 text-[20px]">phone</span>
                                                <span>{order.farmer.phone}</span>
                                            </div>
                                        )}
                                        {order.farmer?.email && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                                                <span>{order.farmer.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Escrow Status */}
                                {order.escrow_status && order.escrow_status !== 'none' && (
                                    <div className="mt-3">
                                        <EscrowStatusBadge status={order.escrow_status as EscrowStatus} />
                                    </div>
                                )}

                                {/* Tracking Info + Estimated Delivery + Auto-Release Countdown */}
                                {order.escrow_status === 'shipped_awaiting_confirmation' && (
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        {order.tracking_number && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm">
                                                <span className="material-symbols-outlined !text-[16px]">package_2</span>
                                                <span className="font-medium">{order.carrier}:</span>
                                                <span className="font-mono">{order.tracking_number}</span>
                                            </div>
                                        )}
                                        {order.estimated_delivery_date && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm">
                                                <span className="material-symbols-outlined !text-[16px]">schedule</span>
                                                <span className="font-medium">Est. delivery:</span>
                                                <span>{new Date(order.estimated_delivery_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        )}
                                        {order.auto_release_at && (
                                            <AutoReleaseCountdown autoReleaseAt={order.auto_release_at} compact />
                                        )}
                                    </div>
                                )}

                                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="sm:hidden">
                                        <span className="text-lg font-bold text-primary">${order.total_price.toFixed(2)}</span>
                                        <span className="text-sm text-gray-500 ml-2">{order.quantity} {order.listing?.unit || 'units'}</span>
                                    </div>
                                    <div className="flex gap-3 ml-auto w-full sm:w-auto flex-wrap" onClick={(e) => e.stopPropagation()}>
                                        <Link
                                            href="/dashboard/messages"
                                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">chat</span>
                                            Message Farmer
                                        </Link>
                                        {/* Shipped — Confirm Delivery */}
                                        {order.status === 'shipped' && order.escrow_status === 'shipped_awaiting_confirmation' && (
                                            <>
                                                <button
                                                    onClick={() => handleConfirmDelivery(order.id)}
                                                    disabled={actionLoading === order.id}
                                                    className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-bold shadow-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {actionLoading === order.id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                    )}
                                                    Confirm Delivery
                                                </button>
                                                <button
                                                    onClick={() => setDisputeOrderId(order.id)}
                                                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">flag</span>
                                                    Dispute
                                                </button>
                                            </>
                                        )}
                                        {/* Funds held — waiting for farmer to ship */}
                                        {order.escrow_status === 'funds_held' && (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
                                                <span className="material-symbols-outlined text-[18px]">lock</span>
                                                Awaiting Shipment
                                            </div>
                                        )}
                                        {/* Funds released — review or completed badge */}
                                        {order.status === 'funds_released' && (
                                            <>
                                                {reviewedOrders.has(order.id) ? (
                                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm font-medium">
                                                        <StarRating rating={5} size="sm" />
                                                        Reviewed
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => openReviewModal(
                                                            order.id,
                                                            order.farmer_id,
                                                            order.farmer?.farm_name || order.farmer?.full_name || 'Farmer'
                                                        )}
                                                        className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold shadow-sm hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">rate_review</span>
                                                        Leave Review
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium">
                                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                    Completed
                                                </div>
                                            </>
                                        )}
                                        {/* Disputed */}
                                        {order.status === 'disputed' && (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium">
                                                <span className="material-symbols-outlined text-[18px]">gavel</span>
                                                Under Review
                                            </div>
                                        )}
                                        {/* Refunded */}
                                        {order.status === 'refunded' && (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm font-medium">
                                                <span className="material-symbols-outlined text-[18px]">replay</span>
                                                Refunded
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && orders.find(o => o.id === selectedOrder) && (
                <OrderDetailModal
                    order={orders.find(o => o.id === selectedOrder)!}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    isFarmer={false}
                />
            )}

            {/* Dispute Modal */}
            {disputeOrderId && (
                <DisputeModal
                    orderId={disputeOrderId}
                    isOpen={!!disputeOrderId}
                    onClose={() => setDisputeOrderId(null)}
                    onSubmit={handleDispute}
                />
            )}

            {/* Review Modal */}
            {reviewOrderId && reviewFarmerId && (
                <ReviewModal
                    isOpen={!!reviewOrderId}
                    onClose={() => {
                        setReviewOrderId(null);
                        setReviewFarmerId(null);
                    }}
                    orderId={reviewOrderId}
                    reviewedUserId={reviewFarmerId}
                    reviewedUserName={reviewFarmerName}
                    onSuccess={() => {
                        setReviewedOrders(prev => { const next = new Set(Array.from(prev)); next.add(reviewOrderId); return next; });
                        fetchBuyerOrders();
                    }}
                />
            )}
        </div>
    );
}
