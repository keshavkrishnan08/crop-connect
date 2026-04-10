"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import EscrowStatusBadge from "@/components/EscrowStatusBadge";
import ShippingTimeline from "@/components/ShippingTimeline";
import CropScoreBadge from "@/components/CropScoreBadge";
import AutoReleaseCountdown from "@/components/AutoReleaseCountdown";
import OrderDetailModal from "@/components/OrderDetailModal";
import DisputeModal from "@/components/DisputeModal";
import ReviewModal from "@/components/ReviewModal";
import StarRating from "@/components/StarRating";
import { authFetch } from "@/lib/api-client";
import type { EscrowStatus } from "@/lib/escrow-states";
import { useToast } from "@/components/Toast";

type ShipFilter = "all" | "awaiting_shipment" | "in_transit" | "delivered" | "issues";

function getDeliveryText(estimatedDate: string, escrowStatus: string | null): string {
    if (escrowStatus === "funds_released") return "Delivered";
    const delivery = new Date(estimatedDate + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Arriving today";
    if (diffDays === 1) return "Arriving tomorrow";
    return `Arriving in ${diffDays} days`;
}

function getDeliveryColor(estimatedDate: string, escrowStatus: string | null): string {
    if (escrowStatus === "funds_released") return "text-green-600 dark:text-green-400";
    const delivery = new Date(estimatedDate + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "text-red-600 dark:text-red-400";
    if (diffDays <= 1) return "text-amber-600 dark:text-amber-400";
    return "text-primary dark:text-primary";
}

export default function BuyerShippingPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { orders, loading, fetchBuyerOrders, getStats } = useOrders({ enableRealtime: true });
    const [filter, setFilter] = useState<ShipFilter>("all");
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
    const [reviewFarmerId, setReviewFarmerId] = useState<string | null>(null);
    const [reviewFarmerName, setReviewFarmerName] = useState("");
    const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
    const { hasReviewedOrder } = useReviews();

    useEffect(() => {
        fetchBuyerOrders();
    }, [fetchBuyerOrders]);

    // Check which completed orders have been reviewed
    const checkReviewedOrders = useCallback(async () => {
        const completedOrders = orders.filter(
            (o) => o.status === "funds_released" || o.escrow_status === "funds_released"
        );
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

    // Filter to shipping-relevant orders only (past payment stage)
    const shippingOrders = useMemo(() => {
        return orders.filter((o) => {
            const relevant = ["funds_held", "shipped", "delivered", "funds_released", "disputed", "refunded"];
            return (
                relevant.includes(o.status) ||
                (o.escrow_status &&
                    o.escrow_status !== "none" &&
                    o.escrow_status !== "awaiting_payment" &&
                    o.escrow_status !== "payment_failed")
            );
        });
    }, [orders]);

    const filteredOrders = useMemo(() => {
        switch (filter) {
            case "awaiting_shipment":
                return shippingOrders.filter((o) => o.escrow_status === "funds_held");
            case "in_transit":
                return shippingOrders.filter(
                    (o) => o.escrow_status === "shipped_awaiting_confirmation" || o.status === "shipped"
                );
            case "delivered":
                return shippingOrders.filter(
                    (o) => o.escrow_status === "funds_released" || o.status === "funds_released"
                );
            case "issues":
                return shippingOrders.filter(
                    (o) => o.status === "disputed" || o.status === "refunded" || o.escrow_status === "disputed"
                );
            default:
                return shippingOrders;
        }
    }, [shippingOrders, filter]);

    const stats = useMemo(
        () => ({
            active: shippingOrders.filter(
                (o) => !["funds_released", "refunded"].includes(o.escrow_status || "")
            ).length,
            awaiting: shippingOrders.filter((o) => o.escrow_status === "funds_held").length,
            inTransit: shippingOrders.filter((o) => o.escrow_status === "shipped_awaiting_confirmation").length,
            delivered: shippingOrders.filter((o) => o.escrow_status === "funds_released").length,
        }),
        [shippingOrders]
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleConfirmDelivery = async (orderId: string) => {
        if (!user?.id) return;
        setActionLoading(orderId);
        try {
            const res = await authFetch("/api/stripe/release-funds", {
                method: "POST",
                body: JSON.stringify({ orderId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await fetchBuyerOrders();
            const order = orders.find((o) => o.id === orderId);
            if (order) {
                setReviewOrderId(orderId);
                setReviewFarmerId(order.farmer_id);
                setReviewFarmerName(order.farmer?.farm_name || order.farmer?.full_name || "Farmer");
            }
        } catch (err) {
            toast(err instanceof Error ? err.message : 'Failed to confirm delivery', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDispute = async (
        orderId: string,
        reason: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) return { success: false, error: "Not authenticated" };
        try {
            const res = await authFetch("/api/stripe/dispute", {
                method: "POST",
                body: JSON.stringify({ orderId, reason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            fetchBuyerOrders();
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to file dispute";
            return { success: false, error: message };
        }
    };

    const filters: { key: ShipFilter; label: string; icon: string }[] = [
        { key: "all", label: "All Orders", icon: "package_2" },
        { key: "awaiting_shipment", label: "Awaiting Shipment", icon: "hourglass_top" },
        { key: "in_transit", label: "In Transit", icon: "local_shipping" },
        { key: "delivered", label: "Delivered", icon: "check_circle" },
        { key: "issues", label: "Issues", icon: "warning" },
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#131613] dark:text-white">
                            Shipping & Tracking
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Track your orders in real-time from payment to delivery.
                        </p>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="stat-card flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Active</p>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md !text-[18px]">
                                package_2
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-[#131613] dark:text-white mt-1">{stats.active}</p>
                    </div>
                    <div className="stat-card flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Awaiting Shipment</p>
                            <span className="material-symbols-outlined text-blue-500 bg-blue-500/10 p-1 rounded-md !text-[18px]">
                                hourglass_top
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-[#131613] dark:text-white mt-1">{stats.awaiting}</p>
                    </div>
                    <div className="stat-card flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">In Transit</p>
                            <span className="material-symbols-outlined text-purple-500 bg-purple-500/10 p-1 rounded-md !text-[18px]">
                                local_shipping
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-[#131613] dark:text-white mt-1">{stats.inTransit}</p>
                    </div>
                    <div className="stat-card flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Delivered</p>
                            <span className="material-symbols-outlined text-green-500 bg-green-500/10 p-1 rounded-md !text-[18px]">
                                check_circle
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-[#131613] dark:text-white mt-1">{stats.delivered}</p>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar bg-gray-50 dark:bg-[#1a2c15]/50 p-2 rounded-xl">
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                                filter === f.key
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-white dark:bg-[#1a2c15] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary"
                            }`}
                        >
                            <span className="material-symbols-outlined !text-[16px]">{f.icon}</span>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                <div className="space-y-5">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-500 font-medium">Loading shipments...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
                            <div className="size-32 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-300">
                                <span className="material-symbols-outlined !text-[64px]">local_shipping</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[#131613] dark:text-white">
                                    {filter === "all" ? "No shipments yet" : `No ${filters.find((f) => f.key === filter)?.label.toLowerCase()} orders`}
                                </h3>
                                <p className="text-gray-500 dark:text-[#a3b2a4] font-medium text-lg">
                                    {filter === "all"
                                        ? "Once you make a purchase, your orders will appear here."
                                        : "Try a different filter to see your orders."}
                                </p>
                            </div>
                            {filter === "all" && (
                                <Link
                                    href="/dashboard/marketplace"
                                    className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-glow hover:bg-primary-dark transition-all"
                                >
                                    Browse Marketplace
                                </Link>
                            )}
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order.id)}
                                className="group card-glass p-0 overflow-hidden hover:!shadow-card-hover hover:!border-primary/50 cursor-pointer transition-all"
                            >
                                {/* Top: Crop + Farmer + Price */}
                                <div className="flex flex-col md:flex-row gap-4 p-5 pb-0">
                                    <div className="w-full md:w-36 aspect-video md:aspect-square shrink-0 rounded-xl bg-cover bg-center relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                                        {order.listing?.image_url ? (
                                            <div
                                                className="h-full w-full bg-cover bg-center"
                                                style={{ backgroundImage: `url("${order.listing.image_url}")` }}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary/30 !text-[40px]">eco</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#131613] dark:text-white group-hover:text-primary transition-colors">
                                                    {order.listing?.crop_name || "Unknown Crop"}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {order.farmer?.profile_picture ? (
                                                        <div
                                                            className="size-5 rounded-full bg-cover bg-center shrink-0"
                                                            style={{ backgroundImage: `url("${order.farmer.profile_picture}")` }}
                                                        />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-gray-400 !text-[16px]">person</span>
                                                    )}
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                        {order.farmer?.farm_name || order.farmer?.full_name || "Farm"}
                                                    </span>
                                                    {(order.farmer as Record<string, unknown>)?.crop_score != null && (
                                                        <CropScoreBadge
                                                            score={Number((order.farmer as Record<string, unknown>)?.crop_score) || 0}
                                                            tier={String((order.farmer as Record<string, unknown>)?.crop_score_tier || "bronze")}
                                                            variant="compact"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 hidden sm:block">
                                                <span className="block text-2xl font-bold text-primary">
                                                    ${order.total_price.toFixed(2)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {order.quantity} {order.listing?.unit || "units"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info row */}
                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <span className="material-symbols-outlined !text-[16px]">calendar_today</span>
                                                {formatDate(order.created_at)}
                                            </div>
                                            {order.farmer?.location && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <span className="material-symbols-outlined !text-[16px]">location_on</span>
                                                    {order.farmer.location}
                                                </div>
                                            )}
                                            <EscrowStatusBadge status={order.escrow_status as EscrowStatus} />
                                        </div>

                                        {/* Estimated delivery */}
                                        {order.estimated_delivery_date && (
                                            <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 w-fit">
                                                <span className="material-symbols-outlined text-primary !text-[18px]">schedule</span>
                                                <div>
                                                    <p className={`text-sm font-bold ${getDeliveryColor(order.estimated_delivery_date, order.escrow_status)}`}>
                                                        {getDeliveryText(order.estimated_delivery_date, order.escrow_status)}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {new Date(order.estimated_delivery_date + "T00:00:00").toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tracking info bar */}
                                {order.escrow_status === "shipped_awaiting_confirmation" && order.tracking_number && (
                                    <div className="mx-5 mt-3 flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm">
                                            <span className="material-symbols-outlined !text-[16px]">package_2</span>
                                            <span className="font-medium">{order.carrier}:</span>
                                            <span className="font-mono text-xs">{order.tracking_number}</span>
                                        </div>
                                        {order.auto_release_at && <AutoReleaseCountdown autoReleaseAt={order.auto_release_at} compact />}
                                    </div>
                                )}

                                {/* Timeline */}
                                <div className="px-5 py-4">
                                    <ShippingTimeline
                                        escrowStatus={order.escrow_status}
                                        orderStatus={order.status}
                                        createdAt={order.created_at}
                                        farmerShippedAt={order.farmer_shipped_at}
                                        buyerConfirmedAt={order.buyer_confirmed_at}
                                        fundsReleasedAt={order.funds_released_at}
                                        autoReleaseAt={order.auto_release_at}
                                        disputeCreatedAt={order.dispute_created_at}
                                        trackingNumber={order.tracking_number}
                                        carrier={order.carrier}
                                        disputeReason={order.dispute_reason}
                                        estimatedDeliveryDate={order.estimated_delivery_date}
                                        isFarmer={false}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="sm:hidden">
                                        <span className="text-lg font-bold text-primary">${order.total_price.toFixed(2)}</span>
                                    </div>
                                    <div
                                        className="flex gap-3 ml-auto flex-wrap"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Link
                                            href="/dashboard/messages"
                                            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined !text-[16px]">chat</span>
                                            Message
                                        </Link>

                                        {/* Shipped — Confirm Delivery */}
                                        {order.status === "shipped" && order.escrow_status === "shipped_awaiting_confirmation" && (
                                            <>
                                                <button
                                                    onClick={() => handleConfirmDelivery(order.id)}
                                                    disabled={actionLoading === order.id}
                                                    className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-bold shadow-sm hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {actionLoading === order.id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                    ) : (
                                                        <span className="material-symbols-outlined !text-[16px]">check_circle</span>
                                                    )}
                                                    Confirm Delivery
                                                </button>
                                                <button
                                                    onClick={() => setDisputeOrderId(order.id)}
                                                    className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined !text-[16px]">flag</span>
                                                    Dispute
                                                </button>
                                            </>
                                        )}

                                        {/* Funds held — awaiting farmer shipment */}
                                        {order.escrow_status === "funds_held" && (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
                                                <span className="material-symbols-outlined !text-[16px]">lock</span>
                                                Awaiting Shipment
                                            </div>
                                        )}

                                        {/* Completed — review */}
                                        {order.status === "funds_released" && (
                                            <>
                                                {reviewedOrders.has(order.id) ? (
                                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm font-medium">
                                                        <StarRating rating={5} size="sm" />
                                                        Reviewed
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setReviewOrderId(order.id);
                                                            setReviewFarmerId(order.farmer_id);
                                                            setReviewFarmerName(
                                                                order.farmer?.farm_name || order.farmer?.full_name || "Farmer"
                                                            );
                                                        }}
                                                        className="px-5 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold shadow-sm hover:bg-amber-600 transition-all flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined !text-[16px]">rate_review</span>
                                                        Review
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium">
                                                    <span className="material-symbols-outlined !text-[16px]">check_circle</span>
                                                    Completed
                                                </div>
                                            </>
                                        )}

                                        {/* Disputed */}
                                        {order.status === "disputed" && (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium">
                                                <span className="material-symbols-outlined !text-[16px]">gavel</span>
                                                Under Review
                                            </div>
                                        )}

                                        {/* Refunded */}
                                        {order.status === "refunded" && (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm font-medium">
                                                <span className="material-symbols-outlined !text-[16px]">replay</span>
                                                Refunded
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && orders.find((o) => o.id === selectedOrder) && (
                <OrderDetailModal
                    order={orders.find((o) => o.id === selectedOrder)!}
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
                        setReviewedOrders((prev) => {
                            const next = new Set(Array.from(prev));
                            next.add(reviewOrderId);
                            return next;
                        });
                        fetchBuyerOrders();
                    }}
                />
            )}
        </div>
    );
}
