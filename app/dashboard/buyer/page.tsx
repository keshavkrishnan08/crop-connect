"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import { useInquiries } from "@/hooks/useInquiries";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import CropScoreBadge from "@/components/CropScoreBadge";

interface ProduceRequest {
    id: string;
    crop_name: string;
    category: string | null;
    quantity: number;
    unit: string;
    max_price: number | null;
    status: string;
    needed_by: string | null;
    created_at: string;
}

interface NearbyFarmer {
    id: string;
    full_name: string | null;
    farm_name: string | null;
    location: string | null;
    profile_picture: string | null;
    crops: string[] | null;
    is_verified: boolean;
    crop_score: number | null;
    crop_score_tier: string | null;
    rating_average: number | null;
}

interface Listing {
    id: string;
    crop_name: string;
    category: string | null;
    quantity: number;
    unit: string;
    price_per_unit: number;
    image_url: string | null;
    farmer: {
        id: string;
        full_name: string | null;
        farm_name: string | null;
        profile_picture: string | null;
        location: string | null;
        crop_score: number | null;
        crop_score_tier: string | null;
    } | null;
}

export default function BuyerDashboard() {
    const { user } = useAuth();
    const { profile } = useProfile();
    const { orders, loading: ordersLoading, fetchBuyerOrders, getStats } = useOrders({ enableRealtime: true });
    const { incomingInquiries, outgoingInquiries, pendingCount: inquiryPendingCount, updateInquiryStatus, releaseInquiry, withdrawInquiry, getInquiriesForRequest, hasAcceptedForRequest } = useInquiries();
    const { toast } = useToast();
    const router = useRouter();
    const notifiedRef = useRef(false);
    const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
    const [myRequests, setMyRequests] = useState<ProduceRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [nearbyFarmers, setNearbyFarmers] = useState<NearbyFarmer[]>([]);
    const [farmersLoading, setFarmersLoading] = useState(true);
    const [suggestedListings, setSuggestedListings] = useState<Listing[]>([]);
    const [listingsLoading, setListingsLoading] = useState(true);

    useEffect(() => {
        fetchBuyerOrders();
    }, [fetchBuyerOrders]);

    // Batched data fetching for all dashboard data
    useEffect(() => {
        if (!profile?.id) return;

        const fetchAllData = async () => {
            // Start all fetches in parallel
            const results = await Promise.allSettled([
                // Fetch requests
                (async () => {
                    setRequestsLoading(true);
                    const { data, error } = await supabase
                        .from('produce_requests')
                        .select('*')
                        .eq('buyer_id', profile.id)
                        .order('created_at', { ascending: false });
                    if (error) throw error;
                    setMyRequests(data || []);
                    setRequestsLoading(false);
                })(),
                // Fetch farmers
                (async () => {
                    setFarmersLoading(true);
                    const { data, error } = await supabase
                        .from("profiles")
                        .select("id, full_name, farm_name, location, profile_picture, crops, is_verified, crop_score, crop_score_tier, rating_average")
                        .eq("role", "farmer")
                        .eq("stripe_onboarding_complete", true)
                        .not("id", "eq", profile.id)
                        .order("crop_score", { ascending: false, nullsFirst: false })
                        .limit(8);
                    if (error) throw error;
                    setNearbyFarmers(data || []);
                    setFarmersLoading(false);
                })(),
                // Fetch listings
                (async () => {
                    setListingsLoading(true);
                    const { data, error } = await supabase
                        .from("listings")
                        .select(`
                            id, crop_name, category, quantity, unit, price_per_unit, image_url,
                            farmer:profiles!farmer_id (
                                id, full_name, farm_name, profile_picture, location, crop_score, crop_score_tier
                            )
                        `)
                        .eq("status", "available")
                        .order("created_at", { ascending: false })
                        .limit(6);
                    if (error) throw error;
                    setSuggestedListings((data as unknown as Listing[]) || []);
                    setListingsLoading(false);
                })()
            ]);

            // Partial failures are handled gracefully — sections show empty state
        };

        fetchAllData();
    }, [profile?.id]);

    // Toast notifications for inquiry status changes
    useEffect(() => {
        if (notifiedRef.current || outgoingInquiries.length === 0) return;
        notifiedRef.current = true;
        const notifiedKey = 'notified_inquiry_ids';
        const notified = new Set<string>(JSON.parse(localStorage.getItem(notifiedKey) || '[]'));
        const newIds: string[] = [];
        outgoingInquiries.forEach(inq => {
            if ((inq.status === 'accepted' || inq.status === 'declined') && !notified.has(inq.id)) {
                toast(`Your offer for ${inq.crop_name} was ${inq.status}!`, inq.status === 'accepted' ? 'success' : 'info');
                newIds.push(inq.id);
            }
        });
        if (newIds.length > 0) {
            localStorage.setItem(notifiedKey, JSON.stringify([...Array.from(notified), ...newIds]));
        }
    }, [outgoingInquiries, toast]);

    const handleReleaseInquiry = async (inquiryId: string) => {
        const result = await releaseInquiry(inquiryId);
        toast(result.success ? 'Released' : (result.error || 'Failed'), result.success ? 'success' : 'error');
    };

    const handleWithdrawInquiry = async (inquiryId: string) => {
        if (!confirm('Withdraw this offer?')) return;
        const result = await withdrawInquiry(inquiryId);
        toast(result.success ? 'Offer withdrawn' : (result.error || 'Failed'), result.success ? 'success' : 'error');
    };

    const orderStats = useMemo(() => getStats(), [getStats]);

    // Memoized order categories to avoid recalculating on every render
    const activeShipments = useMemo(() => orders.filter(o =>
        o.escrow_status === 'funds_held' ||
        o.escrow_status === 'shipped_awaiting_confirmation' ||
        o.status === 'shipped'
    ), [orders]);

    const awaitingPayment = useMemo(() =>
        outgoingInquiries.filter(i => i.status === 'accepted' && i.type === 'buy'),
        [outgoingInquiries]
    );

    const completedOrders = useMemo(() =>
        orders.filter(o => o.escrow_status === 'funds_released' || o.status === 'funds_released'),
        [orders]
    );

    const displayName = profile?.company_name || profile?.full_name || "Buyer";
    const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">

            {/* ── Hero Section ── */}
            <div className="card-glass p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-[#131613] dark:text-white text-3xl font-black tracking-tighter">
                                Welcome back, <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{displayName}</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-[#a3b2a4] text-sm font-medium mb-6">
                            {profile?.location ? `Sourcing in ${profile.location}` : "Your sourcing dashboard at a glance"}
                        </p>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Total Spent", value: formatCurrency(orderStats.totalRevenue), icon: "payments", color: "text-green-500 bg-green-500/10" },
                                { label: "Active Shipments", value: activeShipments.length.toString(), icon: "local_shipping", color: "text-blue-500 bg-blue-500/10" },
                                { label: "Pending Payment", value: awaitingPayment.length.toString(), icon: "hourglass_top", color: "text-amber-500 bg-amber-500/10" },
                                { label: "Completed", value: completedOrders.length.toString(), icon: "check_circle", color: "text-primary bg-primary/10" },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.06]">
                                    <div className={`p-1.5 rounded-lg ${stat.color}`}>
                                        <span className="material-symbols-outlined !text-[18px]">{stat.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-[#131613] dark:text-white leading-tight">{stat.value}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3 shrink-0">
                        <Link
                            href="/dashboard/buyer/request"
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <span className="material-symbols-outlined !text-[18px]">post_add</span>
                            Post Request
                        </Link>
                        <Link
                            href="/dashboard/marketplace"
                            className="px-6 py-3 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <span className="material-symbols-outlined !text-[18px]">storefront</span>
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Accepted Offers - Payment Required ── */}
            {awaitingPayment.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-500 !text-[20px]">celebration</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#131613] dark:text-white">Offers Accepted!</h2>
                            <p className="text-xs text-gray-500">{awaitingPayment.length} offer{awaitingPayment.length !== 1 ? 's' : ''} ready for payment</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {awaitingPayment.map((inquiry) => (
                            <div key={inquiry.id} className="card-glass !border-2 !border-green-300/50 p-4 bg-gradient-to-br from-green-50/50 to-white dark:from-green-900/10 dark:to-transparent">
                                <div className="flex items-center gap-1 mb-3">
                                    <span className="material-symbols-outlined text-green-500 !text-[16px]">check_circle</span>
                                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Ready to Pay</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="size-14 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                        {inquiry.image_url ? (
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${inquiry.image_url}")` }} />
                                        ) : (
                                            <span className="material-symbols-outlined text-gray-400 !text-[28px]">eco</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[#131613] dark:text-white truncate">{inquiry.crop_name}</h3>
                                        <p className="text-sm text-gray-500 truncate">{inquiry.receiver?.farm_name || inquiry.receiver?.full_name}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-400">{inquiry.quantity} {inquiry.unit}</span>
                                            {inquiry.proposed_price && (
                                                <span className="text-lg font-black text-green-600 dark:text-green-400">
                                                    {formatCurrency(inquiry.quantity * inquiry.proposed_price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={`/dashboard/inquiry/${inquiry.id}/payment`}
                                    className="mt-4 w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined !text-[18px]">lock</span>
                                    Proceed to Payment
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Active Shipments ── */}
            {activeShipments.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-500 !text-[20px]">local_shipping</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#131613] dark:text-white">Active Shipments</h2>
                                <p className="text-xs text-gray-500">Orders in transit or awaiting shipment</p>
                            </div>
                        </div>
                        <Link href="/dashboard/buyer/shipping" className="text-blue-500 font-bold text-sm hover:underline flex items-center gap-1">
                            Track All
                            <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeShipments.slice(0, 3).map((order) => (
                            <Link key={order.id} href="/dashboard/buyer/shipping" className="card-glass p-4 hover:!border-blue-300/50 hover:!-translate-y-1 transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="size-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 overflow-hidden">
                                        {order.listing?.image_url ? (
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${order.listing.image_url}")` }} />
                                        ) : (
                                            <span className="material-symbols-outlined text-blue-400 !text-[28px]">eco</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[#131613] dark:text-white truncate">{order.listing?.crop_name}</h3>
                                        <p className="text-sm text-gray-500 truncate">{order.farmer?.farm_name || order.farmer?.full_name}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                order.escrow_status === 'shipped_awaiting_confirmation'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                                {order.escrow_status === 'shipped_awaiting_confirmation' ? 'In Transit' : 'Awaiting Ship'}
                                            </span>
                                            <span className="text-sm font-bold text-primary">{formatCurrency(order.total_price)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Supplier Offers (Incoming) ── */}
            {incomingInquiries.filter(i => i.status === 'pending').length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-500 !text-[20px]">mail</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#131613] dark:text-white">Supplier Offers</h2>
                                <p className="text-xs text-gray-500">Farmers offering to supply your requests</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-bold animate-pulse">
                            {incomingInquiries.filter(i => i.status === 'pending').length} new
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {incomingInquiries.filter(i => i.status === 'pending').slice(0, 4).map(inquiry => (
                            <div key={inquiry.id} className="card-glass !border-2 !border-purple-200/50 dark:!border-purple-800/30 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 overflow-hidden">
                                        {inquiry.sender?.profile_picture ? (
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${inquiry.sender.profile_picture}")` }} />
                                        ) : (
                                            <span className="material-symbols-outlined text-purple-500 !text-[24px]">agriculture</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[#131613] dark:text-white truncate">{inquiry.crop_name}</h3>
                                        <p className="text-sm text-gray-500 truncate">{inquiry.sender?.farm_name || inquiry.sender?.full_name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-400">{inquiry.quantity} {inquiry.unit}</span>
                                            {inquiry.proposed_price && (
                                                <span className="text-xs font-bold text-primary">${inquiry.proposed_price}/{inquiry.unit}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={async () => {
                                            const r = await updateInquiryStatus(inquiry.id, 'accepted');
                                            if (r.success) router.push(`/dashboard/inquiry/${inquiry.id}/payment`);
                                            else toast(r.error || 'Failed', 'error');
                                        }}
                                        className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors"
                                    >
                                        Accept & Pay
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const r = await updateInquiryStatus(inquiry.id, 'declined');
                                            toast(r.success ? 'Declined' : (r.error || 'Failed'), r.success ? 'success' : 'error');
                                        }}
                                        className="flex-1 py-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Suggested Listings ── */}
            {suggestedListings.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary !text-[20px]">auto_awesome</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#131613] dark:text-white">Fresh Listings</h2>
                                <p className="text-xs text-gray-500">Available produce from verified farmers</p>
                            </div>
                        </div>
                        <Link href="/dashboard/marketplace" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                            View All
                            <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
                        </Link>
                    </div>

                    {listingsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="card-glass p-4 animate-pulse">
                                    <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-xl mb-3" />
                                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {suggestedListings.map((listing) => (
                                <Link
                                    key={listing.id}
                                    href={`/dashboard/offer/new?listingId=${listing.id}&type=buy`}
                                    className="card-glass overflow-hidden hover:!shadow-card-hover hover:!-translate-y-1 transition-all group"
                                >
                                    <div className="relative h-32 w-full bg-gradient-to-br from-primary/10 to-primary/5">
                                        {listing.image_url ? (
                                            <div className="h-full w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url("${listing.image_url}")` }} />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary/30 !text-[48px]">eco</span>
                                            </div>
                                        )}
                                        {listing.category && (
                                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/90 dark:bg-black/50 text-gray-700 dark:text-gray-300">
                                                {listing.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-[#131613] dark:text-white">{listing.crop_name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {listing.farmer?.profile_picture ? (
                                                <div className="size-4 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${listing.farmer.profile_picture}")` }} />
                                            ) : (
                                                <span className="material-symbols-outlined text-gray-400 !text-[14px]">person</span>
                                            )}
                                            <span className="text-xs text-gray-500 truncate">{listing.farmer?.farm_name || listing.farmer?.full_name}</span>
                                            {listing.farmer?.crop_score != null && (
                                                <CropScoreBadge score={listing.farmer.crop_score} tier={listing.farmer.crop_score_tier || 'bronze'} variant="compact" />
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-xs text-gray-400">{listing.quantity} {listing.unit}</span>
                                            <span className="text-lg font-black text-primary">${listing.price_per_unit}/{listing.unit}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Top Farmers ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-500 !text-[20px]">workspace_premium</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#131613] dark:text-white">Top Farmers</h2>
                            <p className="text-xs text-gray-500">Highest rated suppliers ready to fulfill orders</p>
                        </div>
                    </div>
                </div>

                {farmersLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="card-glass p-4 animate-pulse">
                                <div className="size-14 rounded-full bg-gray-200 dark:bg-white/10 mx-auto mb-3" />
                                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded mx-auto w-24 mb-2" />
                                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded mx-auto w-16" />
                            </div>
                        ))}
                    </div>
                ) : nearbyFarmers.length === 0 ? (
                    <div className="card-glass p-8 text-center">
                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 !text-[48px]">agriculture</span>
                        <p className="text-sm text-gray-400 mt-2">No farmers found yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {nearbyFarmers.map((farmer) => (
                            <Link key={farmer.id} href={`/profile/public?id=${farmer.id}`} className="card-glass p-4 text-center hover:!border-primary/30 hover:!-translate-y-1 transition-all group block">
                                <div className="size-14 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                                    {farmer.profile_picture ? (
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${farmer.profile_picture}")` }} />
                                    ) : (
                                        <span className="material-symbols-outlined text-green-400 !text-[28px]">agriculture</span>
                                    )}
                                </div>
                                <h4 className="font-bold text-[#131613] dark:text-white text-sm truncate">
                                    {farmer.farm_name || farmer.full_name || "Farmer"}
                                </h4>
                                {farmer.crop_score != null && (
                                    <div className="flex justify-center mt-2">
                                        <CropScoreBadge score={farmer.crop_score} tier={farmer.crop_score_tier || 'bronze'} variant="compact" />
                                    </div>
                                )}
                                {farmer.location && (
                                    <p className="text-xs text-gray-500 mt-1 truncate flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined !text-[14px]">location_on</span>
                                        {farmer.location}
                                    </p>
                                )}
                                {farmer.crops && farmer.crops.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                                        {farmer.crops.slice(0, 2).map((crop) => (
                                            <span key={crop} className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary">{crop}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Profile
                                    <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* ── My Produce Requests ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined !text-[20px]">campaign</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#131613] dark:text-white">My Requests</h2>
                            <p className="text-xs text-gray-500">Your posted requests visible to farmers</p>
                        </div>
                    </div>
                    <Link href="/dashboard/buyer/request" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                        Post New
                        <span className="material-symbols-outlined !text-[18px]">add</span>
                    </Link>
                </div>

                {requestsLoading ? (
                    <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : myRequests.length === 0 ? (
                    <div className="card-glass p-8 text-center">
                        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-primary !text-[32px]">campaign</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#131613] dark:text-white mb-2">No requests yet</h3>
                        <p className="text-gray-500 text-sm mb-4">Post a request and let farmers come to you</p>
                        <Link href="/dashboard/buyer/request" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl">
                            <span className="material-symbols-outlined !text-[18px]">post_add</span>
                            Post Request
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myRequests.slice(0, 4).map(request => {
                            const requestInquiries = getInquiriesForRequest(request.id);
                            const isExpanded = expandedRequestId === request.id;
                            return (
                                <div key={request.id} className="flex flex-col">
                                    <div
                                        className={`card-glass p-4 cursor-pointer hover:!shadow-card-hover ${isExpanded ? '!border-primary/30 ring-2 ring-primary/10' : ''}`}
                                        onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg text-[#131613] dark:text-white truncate">{request.crop_name}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        request.status === 'open' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 dark:bg-white/10'
                                                    }`}>
                                                        {request.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        <strong>{request.quantity}</strong> {request.unit}
                                                    </span>
                                                    {request.max_price && (
                                                        <span className="text-sm text-primary font-bold">Up to ${request.max_price}/{request.unit}</span>
                                                    )}
                                                </div>
                                                {request.needed_by && (
                                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                        <span className="material-symbols-outlined !text-[14px]">event</span>
                                                        {formatDate(request.needed_by)}
                                                    </p>
                                                )}
                                            </div>
                                            {requestInquiries.length > 0 && (
                                                <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full shrink-0">
                                                    <span className="material-symbols-outlined !text-[14px]">agriculture</span>
                                                    <span className="text-[11px] font-black">{requestInquiries.length}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded && requestInquiries.length > 0 && (
                                        <div className="mt-2 card-glass !border-primary/20 p-4 space-y-3 animate-fade-in">
                                            <h4 className="text-sm font-black text-[#131613] dark:text-white flex items-center gap-2">
                                                <span className="material-symbols-outlined !text-[16px] text-purple-500">agriculture</span>
                                                Interested Farmers ({requestInquiries.length})
                                            </h4>
                                            {requestInquiries.map(inq => (
                                                <div key={inq.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-black/20">
                                                    <div className="size-10 rounded-lg overflow-hidden shrink-0 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                        {inq.sender?.profile_picture ? (
                                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${inq.sender.profile_picture}")` }} />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-purple-500 !text-[20px]">person</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-[#131613] dark:text-white truncate">{inq.sender?.farm_name || inq.sender?.full_name}</p>
                                                        <p className="text-xs text-gray-400">{inq.quantity} {inq.unit}{inq.proposed_price ? ` • $${inq.proposed_price}/${inq.unit}` : ''}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {inq.status === 'pending' && !hasAcceptedForRequest(request.id) && (
                                                            <Link href={`/dashboard/inquiry/${inq.id}/checkout`} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold" onClick={(e) => e.stopPropagation()}>
                                                                View
                                                            </Link>
                                                        )}
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                            inq.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                            {inq.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {isExpanded && requestInquiries.length === 0 && (
                                        <div className="mt-2 card-glass p-4 text-center">
                                            <p className="text-sm text-gray-400">No offers yet</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Completed Orders ── */}
            {completedOrders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined !text-[20px]">history</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#131613] dark:text-white">Completed Orders</h2>
                            <p className="text-xs text-gray-500">Your purchase history</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {completedOrders.slice(0, 4).map(order => (
                            <div key={order.id} className="card-glass p-4 flex items-center gap-3">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                                    {order.listing?.image_url ? (
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${order.listing.image_url}")` }} />
                                    ) : (
                                        <span className="material-symbols-outlined text-primary !text-[24px]">eco</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[#131613] dark:text-white truncate text-sm">{order.listing?.crop_name}</h4>
                                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                </div>
                                <span className="font-bold text-primary">{formatCurrency(order.total_price)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
