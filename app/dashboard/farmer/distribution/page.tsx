"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useReviews } from "@/hooks/useReviews";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";
import ReviewModal from "@/components/ReviewModal";
import OrderDetailModal from "@/components/OrderDetailModal";
import { authFetch } from "@/lib/api-client";

export default function DistributionPage() {
    const { profile } = useProfile();
    const { orders, loading, fetchFarmerOrders, updateOrderStatus, getStats } = useOrders();
    const [filterStatus, setFilterStatus] = useState("all");
    const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
    const [reviewBuyerId, setReviewBuyerId] = useState<string | null>(null);
    const [reviewBuyerName, setReviewBuyerName] = useState('');
    const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const { hasReviewedOrder } = useReviews();

    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('');
    const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
    const [shipError, setShipError] = useState<string | null>(null);

    useEffect(() => {
        fetchFarmerOrders();
    }, [fetchFarmerOrders]);

    // Check which completed orders have been reviewed
    const checkReviewedOrders = useCallback(async () => {
        const completedOrders = orders.filter(o => o.escrow_status === 'funds_released');
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
        if (filterStatus === "awaiting_shipment") return order.escrow_status === "funds_held" && order.status !== "shipped";
        if (filterStatus === "in_transit") return order.status === "shipped";
        return order.status === filterStatus;
    });

    const handleMarkShipped = async (orderId: string) => {
        if (!profile?.id) return;
        if (!trackingNumber.trim() || !carrier.trim()) {
            setShipError('Tracking number and carrier are required');
            return;
        }
        setShipError(null);
        setActionLoading(orderId);
        try {
            const res = await authFetch('/api/stripe/ship-order', {
                method: 'POST',
                body: JSON.stringify({
                    orderId,
                    trackingNumber: trackingNumber.trim(),
                    carrier: carrier.trim(),
                    estimatedDeliveryDate: estimatedDeliveryDate || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShippingOrderId(null);
            setTrackingNumber('');
            setCarrier('');
            setEstimatedDeliveryDate('');
            fetchFarmerOrders();
        } catch (err) {
            setShipError(err instanceof Error ? err.message : 'Failed to mark as shipped');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    };

    const awaitingShipmentCount = orders.filter(o => o.escrow_status === "funds_held" && o.status !== "shipped").length;
    const inTransitCount = orders.filter(o => o.status === "shipped").length;

    return (
        <div className="flex-1 w-full p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders & Shipping</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage orders and ship products to buyers.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Awaiting Shipment</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{awaitingShipmentCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">hourglass_top</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">In Transit</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{inTransitCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">local_shipping</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingOrders}</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">schedule</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.completedOrders}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">payments</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stripe Not Connected Banner */}
            {profile && !profile.stripe_onboarding_complete && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-600 !text-[24px]">warning</span>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-800 dark:text-amber-300">Set Up Payouts</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                Connect your bank account to receive payments from buyers.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/farmer/settings"
                            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            Set Up
                        </Link>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'All Orders' },
                    { key: 'awaiting_shipment', label: 'Awaiting Shipment' },
                    { key: 'in_transit', label: 'In Transit' },
                    { key: 'delivered', label: 'Delivered' },
                    { key: 'pending', label: 'Pending' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilterStatus(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            filterStatus === tab.key
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary/50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-16 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                        <span className="material-symbols-outlined text-gray-400 !text-[48px]">inventory_2</span>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">No orders found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {filterStatus === 'all'
                                ? "Orders from buyers will appear here."
                                : `No ${filterStatus.replace('_', ' ')} orders.`
                            }
                        </p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="p-4 flex flex-col md:flex-row gap-4">
                                {/* Order Image */}
                                <div className="w-full md:w-32 h-32 md:h-24 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                                    {order.listing?.image_url ? (
                                        <img src={order.listing.image_url} alt={order.listing.crop_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-400 !text-[32px]">eco</span>
                                        </div>
                                    )}
                                </div>

                                {/* Order Details */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{order.listing?.crop_name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {order.buyer?.full_name || order.buyer?.company_name} • {order.quantity} {order.listing?.unit}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(order.total_price)}</p>
                                            <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                                                order.escrow_status === "funds_held" && order.status !== "shipped" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                                                order.status === "shipped" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                                order.status === "delivered" || order.escrow_status === "funds_released" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                                                "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                            }`}>
                                                {order.escrow_status === "funds_held" && order.status !== "shipped" ? "Awaiting Shipment" :
                                                 order.status === "shipped" ? "In Transit" :
                                                 order.escrow_status === "funds_released" ? "Completed" :
                                                 order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Shipping Info */}
                                    {order.tracking_number && (
                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">Tracking:</span> {order.tracking_number} ({order.carrier})
                                            </p>
                                            {order.estimated_delivery_date && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Est. delivery: {formatDate(order.estimated_delivery_date)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {/* Ship Now Button */}
                                        {order.escrow_status === "funds_held" && order.status !== "shipped" && (
                                            shippingOrderId === order.id ? (
                                                <div className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">Enter Shipping Details</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Tracking Number *"
                                                            value={trackingNumber}
                                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Carrier (e.g., UPS, FedEx) *"
                                                            value={carrier}
                                                            onChange={(e) => setCarrier(e.target.value)}
                                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                        />
                                                        <input
                                                            type="date"
                                                            placeholder="Est. Delivery"
                                                            value={estimatedDeliveryDate}
                                                            onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                        />
                                                    </div>
                                                    {shipError && <p className="text-sm text-red-600">{shipError}</p>}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleMarkShipped(order.id)}
                                                            disabled={actionLoading === order.id}
                                                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                                        >
                                                            {actionLoading === order.id ? 'Processing...' : 'Confirm Shipment'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShippingOrderId(null)}
                                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShippingOrderId(order.id)}
                                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined !text-[18px]">local_shipping</span>
                                                    Ship Now
                                                </button>
                                            )
                                        )}

                                        {/* View Details */}
                                        <button
                                            onClick={() => setSelectedOrder(order.id)}
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            View Details
                                        </button>

                                        {/* Message Buyer */}
                                        <Link
                                            href={`/dashboard/messages?userId=${order.buyer_id}`}
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined !text-[18px]">chat</span>
                                            Message
                                        </Link>

                                        {/* Leave Review (for completed orders) */}
                                        {order.escrow_status === 'funds_released' && !reviewedOrders.has(order.id) && (
                                            <button
                                                onClick={() => {
                                                    setReviewOrderId(order.id);
                                                    setReviewBuyerId(order.buyer_id);
                                                    setReviewBuyerName(order.buyer?.full_name || order.buyer?.company_name || 'Buyer');
                                                }}
                                                className="px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-sm font-medium rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined !text-[18px]">star</span>
                                                Leave Review
                                            </button>
                                        )}

                                        {order.escrow_status === 'funds_released' && reviewedOrders.has(order.id) && (
                                            <span className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium rounded-lg flex items-center gap-2">
                                                <span className="material-symbols-outlined !text-[18px]">check</span>
                                                Reviewed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (() => {
                const order = orders.find(o => o.id === selectedOrder);
                return order ? (
                    <OrderDetailModal
                        order={order}
                        isOpen={true}
                        onClose={() => setSelectedOrder(null)}
                        isFarmer={true}
                    />
                ) : null;
            })()}

            {/* Review Modal */}
            {reviewOrderId && reviewBuyerId && (
                <ReviewModal
                    isOpen={true}
                    orderId={reviewOrderId}
                    reviewedUserId={reviewBuyerId}
                    reviewedUserName={reviewBuyerName}
                    onClose={() => {
                        setReviewOrderId(null);
                        setReviewBuyerId(null);
                        setReviewBuyerName('');
                    }}
                    onSuccess={() => {
                        setReviewedOrders(prev => new Set([...Array.from(prev), reviewOrderId]));
                    }}
                />
            )}
        </div>
    );
}
