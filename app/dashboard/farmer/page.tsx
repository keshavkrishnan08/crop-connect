"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useListings } from "@/hooks/useListings";
import { useOrders } from "@/hooks/useOrders";
import { useInquiries } from "@/hooks/useInquiries";
import { useProduceRequests } from "@/hooks/useProduceRequests";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface NearbyBuyer {
    id: string;
    full_name: string | null;
    company_name: string | null;
    location: string | null;
    profile_picture: string | null;
    business_type: string | null;
    preferred_categories: string[] | null;
}

export default function FarmerDashboard() {
    const { profile } = useProfile();
    const { listings, loading: listingsLoading, fetchMyListings, deleteListing } = useListings();
    const { orders, fetchFarmerOrders, updateOrderStatus, getStats } = useOrders();
    const { incomingInquiries, outgoingInquiries, pendingCount: inquiryPendingCount, updateInquiryStatus, releaseInquiry, withdrawInquiry, getInquiriesForListing, hasAcceptedForListing } = useInquiries();
    const { requests: produceRequests, fetchOpenRequests, respondToRequest, myResponses, fetchMyResponses, hasRespondedTo } = useProduceRequests();
    const { toast } = useToast();
    const [expandedListingId, setExpandedListingId] = useState<string | null>(null);
    const [nearbyBuyers, setNearbyBuyers] = useState<NearbyBuyer[]>([]);
    const [buyersLoading, setBuyersLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [responsePrice, setResponsePrice] = useState("");
    const [respondLoading, setRespondLoading] = useState(false);
    const notifiedRef = useRef(false);

    // Batched data fetching
    useEffect(() => {
        if (!profile?.id) return;
        const fetchAllData = async () => {
            const results = await Promise.allSettled([
                fetchMyListings(),
                fetchFarmerOrders(),
                fetchOpenRequests(),
                fetchMyResponses(),
                (async () => {
                    setBuyersLoading(true);
                    const { data } = await supabase
                        .from("profiles")
                        .select("id, full_name, company_name, location, profile_picture, business_type, preferred_categories")
                        .eq("role", "buyer")
                        .not("id", "eq", profile.id)
                        .limit(6);
                    setNearbyBuyers(data || []);
                    setBuyersLoading(false);
                })(),
            ]);
            // Partial failures handled gracefully — sections show empty state
        };
        fetchAllData();
    }, [profile?.id, fetchMyListings, fetchFarmerOrders, fetchOpenRequests, fetchMyResponses]);

    // Toast notifications
    useEffect(() => {
        if (notifiedRef.current || outgoingInquiries.length === 0) return;
        notifiedRef.current = true;
        const notifiedKey = "notified_inquiry_ids";
        const notified = new Set<string>(JSON.parse(localStorage.getItem(notifiedKey) || "[]"));
        const newIds: string[] = [];
        outgoingInquiries.forEach((inq) => {
            if ((inq.status === "accepted" || inq.status === "declined") && !notified.has(inq.id)) {
                toast(`Your offer for ${inq.crop_name} was ${inq.status}!`, inq.status === "accepted" ? "success" : "info");
                newIds.push(inq.id);
            }
        });
        if (newIds.length > 0) {
            localStorage.setItem(notifiedKey, JSON.stringify([...Array.from(notified), ...newIds]));
        }
    }, [outgoingInquiries, toast]);

    const orderStats = getStats();

    // Memoized derived state
    const paidAwaitingShipment = useMemo(
        () => orders.filter((o) => o.escrow_status === "funds_held" && o.status !== "shipped"),
        [orders]
    );

    const soldListingIds = useMemo(
        () => new Set(
            orders
                .filter((o) => ["funds_held", "shipped", "delivered", "funds_released"].includes(o.escrow_status || "") ||
                              ["confirmed", "shipped", "delivered", "funds_released"].includes(o.status))
                .map((o) => o.listing_id)
        ),
        [orders]
    );

    const availableListings = useMemo(
        () => listings.filter((l) => l.status === "available" && !soldListingIds.has(l.id)),
        [listings, soldListingIds]
    );

    const pendingOrders = useMemo(() => orders.filter((o) => o.status === "pending"), [orders]);
    const activeOrders = useMemo(() => orders.filter((o) => ["confirmed", "shipped", "funds_held"].includes(o.status)), [orders]);
    const pendingInquiries = useMemo(() => incomingInquiries.filter((i) => i.status === "pending"), [incomingInquiries]);

    const suggestedRequests = useMemo(() => {
        if (!profile?.crops || profile.crops.length === 0) return produceRequests.filter((r) => r.buyer_id !== profile?.id).slice(0, 4);
        const farmerCrops = profile.crops.map((c) => c.toLowerCase());
        const matched = produceRequests
            .filter((r) => r.buyer_id !== profile?.id)
            .map((r) => {
                const cropLower = r.crop_name.toLowerCase();
                const isMatch = farmerCrops.some((fc) => cropLower.includes(fc) || fc.includes(cropLower));
                return { ...r, isMatch };
            })
            .sort((a, b) => (b.isMatch ? 1 : 0) - (a.isMatch ? 1 : 0));
        return matched.slice(0, 4);
    }, [produceRequests, profile?.crops, profile?.id]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        const result = await deleteListing(id);
        toast(result.success ? "Listing deleted" : result.error || "Failed to delete", result.success ? "success" : "error");
    };

    const handleConfirmOrder = async (orderId: string) => {
        const result = await updateOrderStatus(orderId, "confirmed");
        toast(result.success ? "Order confirmed" : result.error || "Failed to confirm", result.success ? "success" : "error");
    };

    const handleInquiryAction = async (inquiryId: string, action: "accepted" | "declined") => {
        const result = await updateInquiryStatus(inquiryId, action);
        toast(result.success ? `Inquiry ${action}` : result.error || `Failed to ${action}`, result.success ? "success" : "error");
    };

    const displayName = profile?.farm_name || profile?.full_name || "Farmer";
    const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[#131613] dark:text-white tracking-tight">
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {displayName}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Here&apos;s what&apos;s happening on your farm today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-glass p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-black text-[#131613] dark:text-white mt-1">{formatCurrency(orderStats.totalRevenue)}</p>
                        </div>
                        <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-500 !text-[20px]">payments</span>
                        </div>
                    </div>
                </div>
                <div className="card-glass p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Listings</p>
                            <p className="text-2xl font-black text-[#131613] dark:text-white mt-1">{availableListings.length}</p>
                        </div>
                        <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500 !text-[20px]">inventory_2</span>
                        </div>
                    </div>
                </div>
                <div className="card-glass p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending Orders</p>
                            <p className="text-2xl font-black text-[#131613] dark:text-white mt-1">{pendingOrders.length}</p>
                        </div>
                        <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-500 !text-[20px]">pending_actions</span>
                        </div>
                    </div>
                </div>
                <div className="card-glass p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed</p>
                            <p className="text-2xl font-black text-[#131613] dark:text-white mt-1">{orderStats.completedOrders}</p>
                        </div>
                        <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-500 !text-[20px]">check_circle</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stripe Onboarding Alert */}
            {profile && !profile.stripe_onboarding_complete && (
                <div className="card-glass !border-amber-300/50 dark:!border-amber-700/50 p-5 bg-amber-50/50 dark:bg-amber-900/10">
                    <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-amber-500 !text-[20px]">warning</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-[#131613] dark:text-white">Set Up Payouts</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Connect your bank account to receive payments from buyers.
                            </p>
                            <Link
                                href="/dashboard/farmer/settings"
                                className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-colored-amber"
                            >
                                <span className="material-symbols-outlined !text-[16px]">account_balance</span>
                                Set Up Now
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Received - Orders Awaiting Shipment */}
            {paidAwaitingShipment.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-500 !text-[20px]">payments</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#131613] dark:text-white">Payment Received</h2>
                                <p className="text-xs text-gray-500">{paidAwaitingShipment.length} order{paidAwaitingShipment.length > 1 ? 's' : ''} awaiting shipment</p>
                            </div>
                        </div>
                        <Link href="/dashboard/farmer/distribution" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                            View All
                            <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paidAwaitingShipment.slice(0, 3).map((order) => (
                            <div key={order.id} className="card-glass !border-green-300/50 dark:!border-green-700/30 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full uppercase">
                                        Funds in Escrow
                                    </span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {order.listing?.image_url ? (
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${order.listing.image_url}")` }} />
                                        ) : (
                                            <span className="material-symbols-outlined text-primary/40 !text-[24px]">eco</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[#131613] dark:text-white truncate">{order.listing?.crop_name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{order.buyer?.full_name}</p>
                                        <p className="text-lg font-black text-green-600 dark:text-green-400 mt-1">{formatCurrency(order.total_price)}</p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/farmer/distribution"
                                    className="mt-3 w-full py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-colored-green"
                                >
                                    <span className="material-symbols-outlined !text-[16px]">local_shipping</span>
                                    Ship Now
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Inquiries */}
            {pendingInquiries.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500 !text-[20px]">mail</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#131613] dark:text-white">New Inquiries</h2>
                            <p className="text-xs text-gray-500">{pendingInquiries.length} pending response{pendingInquiries.length > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {pendingInquiries.slice(0, 3).map((inquiry) => (
                            <div key={inquiry.id} className="card-glass p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center overflow-hidden shrink-0">
                                            {inquiry.sender?.profile_picture ? (
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${inquiry.sender.profile_picture}")` }} />
                                            ) : (
                                                <span className="material-symbols-outlined text-blue-500 !text-[20px]">person</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-[#131613] dark:text-white truncate">{inquiry.crop_name}</h3>
                                            <p className="text-xs text-gray-500 truncate">
                                                {inquiry.sender?.full_name || inquiry.sender?.company_name} &middot; {inquiry.quantity} {inquiry.unit}
                                                {inquiry.proposed_price && ` \u00b7 $${inquiry.proposed_price}/${inquiry.unit}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {!hasAcceptedForListing(inquiry.listing_id) && (
                                            <button
                                                onClick={() => handleInquiryAction(inquiry.id, "accepted")}
                                                className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
                                            >
                                                Accept
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleInquiryAction(inquiry.id, "declined")}
                                            className="px-3.5 py-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Listings & Orders */}
                <div className="lg:col-span-2 space-y-8">
                    {/* My Listings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary !text-[20px]">eco</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#131613] dark:text-white">My Listings</h2>
                                    <p className="text-xs text-gray-500">{availableListings.length} active listing{availableListings.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href="/dashboard/farmer/listings/new"
                                    className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-colored-green"
                                >
                                    <span className="material-symbols-outlined !text-[16px]">add</span>
                                    New Listing
                                </Link>
                                <Link
                                    href="/dashboard/farmer/crops"
                                    className="px-3 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
                                >
                                    Manage All
                                </Link>
                            </div>
                        </div>

                        {listingsLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="card-glass overflow-hidden animate-pulse">
                                        <div className="h-32 bg-gray-200 dark:bg-white/10" />
                                        <div className="p-4 space-y-2">
                                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                                            <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 rounded" />
                                            <div className="flex gap-2 mt-3">
                                                <div className="h-8 flex-1 bg-gray-100 dark:bg-white/5 rounded-xl" />
                                                <div className="h-8 w-10 bg-gray-100 dark:bg-white/5 rounded-xl" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : availableListings.length === 0 ? (
                            <div className="card-glass p-8 text-center">
                                <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-primary !text-[32px]">eco</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#131613] dark:text-white mb-2">No active listings</h3>
                                <p className="text-gray-500 text-sm mb-4">Create your first listing to start selling</p>
                                <Link
                                    href="/dashboard/farmer/listings/new"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-colored-green"
                                >
                                    <span className="material-symbols-outlined !text-[18px]">add</span>
                                    Create Listing
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {availableListings.slice(0, 6).map((listing) => {
                                    const listingInquiries = getInquiriesForListing(listing.id);
                                    return (
                                        <div key={listing.id} className="card-glass overflow-hidden hover:!shadow-card-hover hover:!-translate-y-0.5 transition-all group">
                                            <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5">
                                                {listing.image_url ? (
                                                    <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url("${listing.image_url}")` }} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary/30 !text-[48px]">eco</span>
                                                    </div>
                                                )}
                                                {listingInquiries.length > 0 && (
                                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                                                        <span className="material-symbols-outlined !text-[12px]">person</span>
                                                        {listingInquiries.length}
                                                    </div>
                                                )}
                                                {listing.category && (
                                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/90 dark:bg-black/50 text-gray-700 dark:text-gray-300">
                                                        {listing.category}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-[#131613] dark:text-white">{listing.crop_name}</h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{listing.quantity} {listing.unit}</p>
                                                    </div>
                                                    <p className="text-lg font-black text-primary">${listing.price_per_unit}/{listing.unit}</p>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <Link
                                                        href={`/dashboard/farmer/listings/new?edit=${listing.id}`}
                                                        className="flex-1 py-2 bg-gray-50 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl text-center hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(listing.id)}
                                                        className="py-2 px-3 bg-gray-50 dark:bg-white/10 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined !text-[16px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Active Orders */}
                    {activeOrders.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-500 !text-[20px]">local_shipping</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[#131613] dark:text-white">Active Orders</h2>
                                        <p className="text-xs text-gray-500">{activeOrders.length} in progress</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/farmer/distribution" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                                    View All
                                    <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
                                </Link>
                            </div>
                            <div className="card-glass divide-y divide-gray-100 dark:divide-white/[0.06]">
                                {activeOrders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                                                {order.listing?.image_url ? (
                                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${order.listing.image_url}")` }} />
                                                ) : (
                                                    <span className="material-symbols-outlined text-primary/40 !text-[20px]">eco</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-[#131613] dark:text-white">{order.listing?.crop_name}</h4>
                                                <p className="text-xs text-gray-500">{order.buyer?.full_name} &middot; {order.quantity} {order.listing?.unit}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <p className="font-black text-[#131613] dark:text-white text-sm">{formatCurrency(order.total_price)}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                order.status === "confirmed" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                                order.status === "shipped" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                                                "bg-green-500/10 text-green-600 dark:text-green-400"
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Buyer Requests */}
                    {suggestedRequests.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-500 !text-[20px]">campaign</span>
                                    </div>
                                    <h2 className="text-lg font-black text-[#131613] dark:text-white">Buyer Requests</h2>
                                </div>
                                <Link href="/dashboard/marketplace" className="text-primary font-bold text-xs hover:underline">
                                    View All
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {suggestedRequests.map((req) => {
                                    const alreadyResponded = hasRespondedTo(req.id);
                                    const isResponding = respondingTo === req.id;

                                    return (
                                        <div
                                            key={req.id}
                                            className="card-glass p-4 transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-sm text-[#131613] dark:text-white">{req.crop_name}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">{req.quantity} {req.unit}</p>
                                                    {req.buyer?.full_name && (
                                                        <p className="text-xs text-gray-400 mt-0.5">from {req.buyer.full_name}{req.buyer.location ? ` · ${req.buyer.location}` : ""}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    {req.max_price && (
                                                        <span className="text-xs font-black text-primary">Up to ${req.max_price}/{req.unit}</span>
                                                    )}
                                                    {alreadyResponded ? (
                                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Responded</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setRespondingTo(isResponding ? null : req.id)}
                                                            className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
                                                        >
                                                            {isResponding ? "Cancel" : "Respond"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {req.description && (
                                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{req.description}</p>
                                            )}
                                            {req.needed_by && (
                                                <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                                                    <span className="material-symbols-outlined !text-[12px]">event</span>
                                                    Needed by {formatDate(req.needed_by)}
                                                </p>
                                            )}

                                            {/* Inline Response Form */}
                                            {isResponding && !alreadyResponded && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 space-y-3">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Your Proposed Price (per {req.unit})</label>
                                                        <input
                                                            type="number"
                                                            value={responsePrice}
                                                            onChange={(e) => setResponsePrice(e.target.value)}
                                                            placeholder={req.max_price ? `Max budget: $${req.max_price}` : "Enter price"}
                                                            className="mt-1 w-full h-9 px-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Message to Buyer</label>
                                                        <textarea
                                                            value={responseMessage}
                                                            onChange={(e) => setResponseMessage(e.target.value)}
                                                            placeholder="Tell them about your crop quality, availability, delivery options..."
                                                            rows={2}
                                                            className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none dark:text-white"
                                                        />
                                                    </div>
                                                    <button
                                                        disabled={!responseMessage.trim() || respondLoading}
                                                        onClick={async () => {
                                                            setRespondLoading(true);
                                                            const success = await respondToRequest(
                                                                req.id,
                                                                responseMessage.trim(),
                                                                responsePrice ? parseFloat(responsePrice) : undefined
                                                            );
                                                            setRespondLoading(false);
                                                            if (success) {
                                                                toast("Response sent to buyer!", "success");
                                                                setRespondingTo(null);
                                                                setResponseMessage("");
                                                                setResponsePrice("");
                                                            } else {
                                                                toast("Failed to send response", "error");
                                                            }
                                                        }}
                                                        className="w-full h-9 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        {respondLoading ? (
                                                            <span className="material-symbols-outlined !text-[16px] animate-spin">progress_activity</span>
                                                        ) : (
                                                            <>
                                                                <span className="material-symbols-outlined !text-[16px]">send</span>
                                                                Send Response
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Active Buyers */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-500 !text-[20px]">groups</span>
                            </div>
                            <h2 className="text-lg font-black text-[#131613] dark:text-white">Active Buyers</h2>
                        </div>
                        {buyersLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="card-glass p-3 animate-pulse flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                                            <div className="h-2 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : nearbyBuyers.length === 0 ? (
                            <div className="card-glass p-6 text-center">
                                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 !text-[32px]">groups</span>
                                <p className="text-sm text-gray-400 mt-2">No buyers found yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {nearbyBuyers.slice(0, 4).map((buyer) => (
                                    <Link
                                        key={buyer.id}
                                        href={`/profile/public?id=${buyer.id}`}
                                        className="flex items-center gap-3 card-glass p-3 hover:!border-primary/30 hover:!-translate-y-0.5 transition-all group"
                                    >
                                        <div className="size-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center overflow-hidden shrink-0">
                                            {buyer.profile_picture ? (
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${buyer.profile_picture}")` }} />
                                            ) : (
                                                <span className="material-symbols-outlined text-blue-400 !text-[20px]">person</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-[#131613] dark:text-white truncate">
                                                {buyer.company_name || buyer.full_name}
                                            </h4>
                                            {buyer.business_type && (
                                                <p className="text-[11px] text-gray-500 capitalize">{buyer.business_type}</p>
                                            )}
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 !text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary !text-[20px]">bolt</span>
                            </div>
                            <h2 className="text-lg font-black text-[#131613] dark:text-white">Quick Actions</h2>
                        </div>
                        <div className="space-y-2">
                            <Link href="/dashboard/farmer/listings/new" className="flex items-center gap-3 card-glass p-3 hover:!border-primary/30 hover:!-translate-y-0.5 transition-all group">
                                <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-500 !text-[20px]">add_circle</span>
                                </div>
                                <span className="font-bold text-sm text-[#131613] dark:text-white">Create New Listing</span>
                                <span className="material-symbols-outlined text-gray-400 !text-[16px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                            </Link>
                            <Link href="/dashboard/farmer/distribution" className="flex items-center gap-3 card-glass p-3 hover:!border-primary/30 hover:!-translate-y-0.5 transition-all group">
                                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-500 !text-[20px]">local_shipping</span>
                                </div>
                                <span className="font-bold text-sm text-[#131613] dark:text-white">Manage Orders</span>
                                <span className="material-symbols-outlined text-gray-400 !text-[16px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                            </Link>
                            <Link href="/dashboard/messages" className="flex items-center gap-3 card-glass p-3 hover:!border-primary/30 hover:!-translate-y-0.5 transition-all group">
                                <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-purple-500 !text-[20px]">chat</span>
                                </div>
                                <span className="font-bold text-sm text-[#131613] dark:text-white">Messages</span>
                                <span className="material-symbols-outlined text-gray-400 !text-[16px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
