"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useListings, Listing } from "@/hooks/useListings";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import { useProduceRequests, ProduceRequest } from "@/hooks/useProduceRequests";
import ListingDetailModal from "@/components/ListingDetailModal";
import RequestDetailModal from "@/components/RequestDetailModal";
import TrustBadges from "@/components/TrustBadges";
import CropScoreBadge from "@/components/CropScoreBadge";
import { calculateListingCompatibility } from "@/lib/compatibility";

interface ListingWithCompatibility extends Listing {
    compatibilityScore?: number;
    compatibilityReasons?: { type: 'positive' | 'neutral' | 'warning'; message: string }[];
}

export default function MarketplacePage() {
    const { profile } = useProfile();
    const { listings, loading, fetchAllListings } = useListings();
    const { createOrder } = useOrders();
    const { requests: produceRequests, loading: requestsLoading, fetchOpenRequests } = useProduceRequests();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ListingWithCompatibility | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<ProduceRequest | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [sortBy, setSortBy] = useState("compatibility");
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [listingsWithScores, setListingsWithScores] = useState<ListingWithCompatibility[]>([]);
    const [calculatingScores, setCalculatingScores] = useState(false);
    const userRole = profile?.role || "buyer";
    const [activeTab, setActiveTab] = useState<"listings" | "requests">(
        userRole === "farmer" ? "requests" : "listings"
    );

    // Sync active tab when profile loads
    useEffect(() => {
        setActiveTab(userRole === "farmer" ? "requests" : "listings");
    }, [userRole]);

    useEffect(() => {
        fetchAllListings();
        fetchOpenRequests();
    }, [fetchAllListings, fetchOpenRequests]);

    // Calculate compatibility scores for all listings
    const calculateScores = useCallback(async () => {
        if (!listings.length || !profile) {
            setListingsWithScores(listings);
            return;
        }

        setCalculatingScores(true);

        const scoredListings = await Promise.all(
            listings.map(async (listing) => {
                try {
                    const compatibility = await calculateListingCompatibility(
                        {
                            farmer_id: listing.farmer_id,
                            crop_name: listing.crop_name,
                            category: listing.category,
                            price_per_unit: listing.price_per_unit,
                            quantity: listing.quantity,
                            farmer: listing.farmer ? {
                                location: listing.farmer.location,
                                is_verified: listing.farmer.is_verified,
                                years_farming: listing.farmer.years_farming,
                                certifications: listing.farmer.certifications,
                            } : undefined,
                        },
                        {
                            location: profile.location,
                            preferred_categories: profile.preferred_categories,
                        }
                    );

                    return {
                        ...listing,
                        compatibilityScore: compatibility.score,
                        compatibilityReasons: compatibility.reasons,
                    };
                } catch (error) {
                    return {
                        ...listing,
                        compatibilityScore: 50,
                        compatibilityReasons: [],
                    };
                }
            })
        );

        setListingsWithScores(scoredListings);
        setCalculatingScores(false);
    }, [listings, profile]);

    useEffect(() => {
        calculateScores();
    }, [calculateScores]);

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        } else {
            setSelectedCategories([...selectedCategories, cat]);
        }
    };

    const sortedItems = useMemo(() => {
        const filtered = listingsWithScores.filter((listing) => {
            // Exclude own listings
            if (listing.farmer_id === profile?.id) return false;
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                listing.crop_name.toLowerCase().includes(q) ||
                (listing.farmer?.farm_name?.toLowerCase().includes(q) || false) ||
                (listing.farmer?.full_name?.toLowerCase().includes(q) || false) ||
                (listing.description?.toLowerCase().includes(q) || false);
            const matchesCategory =
                selectedCategories.length === 0 ||
                (listing.category && selectedCategories.includes(listing.category));
            const matchesPrice = listing.price_per_unit >= priceRange[0] && listing.price_per_unit <= priceRange[1];
            const matchesVerified = !verifiedOnly || listing.farmer?.is_verified;
            return matchesSearch && matchesCategory && matchesPrice && matchesVerified;
        });

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "compatibility":
                    return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
                case "price-low":
                    return a.price_per_unit - b.price_per_unit;
                case "price-high":
                    return b.price_per_unit - a.price_per_unit;
                case "name":
                    return a.crop_name.localeCompare(b.crop_name);
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });
    }, [listingsWithScores, searchQuery, selectedCategories, priceRange, verifiedOnly, sortBy]);

    const handleOrder = async (listing: Listing) => {
        // This is handled by the modal, but we need to provide an order handler
        setIsCheckingOut(true);

        const result = await createOrder({
            listing_id: listing.id,
            farmer_id: listing.farmer_id,
            quantity: 1, // Default quantity, modal will have its own
            total_price: listing.price_per_unit,
        });

        if (result.success) {
            setCheckoutSuccess(true);
            setTimeout(() => {
                setCheckoutSuccess(false);
                setSelectedProduct(null);
            }, 3000);
        }

        setIsCheckingOut(false);
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, 1000]);
        setSortBy("compatibility");
        setVerifiedOnly(false);
        setSearchQuery("");
    };

    const activeFiltersCount = selectedCategories.length + (verifiedOnly ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

    const categories = useMemo(() => Array.from(new Set(listings.map(l => l.category).filter((c): c is string => Boolean(c)))), [listings]);

    // Filter produce requests (exclude own, match search)
    const filteredRequests = useMemo(() => produceRequests.filter(req => {
        if (req.buyer_id === profile?.id) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return req.crop_name.toLowerCase().includes(q) ||
            req.buyer?.full_name?.toLowerCase().includes(q) ||
            req.buyer?.company_name?.toLowerCase().includes(q) ||
            req.category?.toLowerCase().includes(q);
    }), [produceRequests, profile?.id, searchQuery]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    return (
        <div className="flex-1 w-full overflow-y-auto no-scrollbar bg-transparent">
            {/* Centered Hero Section - Google Style */}
            <div className="w-full max-w-4xl mx-auto px-4 pt-16 pb-6">
                {/* Title */}
                <div className="text-center mb-10">
                    <h1 className="text-[#131613] dark:text-white text-4xl md:text-5xl font-black tracking-tighter mb-4">
                        Marketplace
                    </h1>
                    <p className="text-gray-500 dark:text-[#a3b2a4] text-base font-medium">
                        {userRole === "farmer"
                            ? "Browse open requests from buyers looking for produce"
                            : "Discover fresh produce directly from local farmers"}
                    </p>
                </div>

                {/* Search Bar - Wide and Centered */}
                <div className="relative group mb-4">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors !text-[24px]">search</span>
                    <input
                        className="w-full h-16 pl-16 pr-6 rounded-full bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-white/30 dark:border-white/[0.08] shadow-glass-lg outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary font-medium text-lg dark:text-white transition-all"
                        placeholder="Search for crops, farms, or categories..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>

                {/* Filters Button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => setShowFilters(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1a2c15] border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined !text-[20px]">tune</span>
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="size-5 bg-primary text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Quick Category Pills */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        <button
                            onClick={() => setSelectedCategories([])}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                selectedCategories.length === 0
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white dark:bg-[#1a2c15] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                            }`}
                        >
                            All
                        </button>
                        {categories.slice(0, 6).map(cat => cat && (
                            <button
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                    selectedCategories.includes(cat)
                                        ? 'bg-primary text-white shadow-colored-green'
                                        : 'bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-white/30 dark:border-white/[0.08] text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Role-specific content indicator */}
                <div className="flex justify-center mt-4">
                    <div className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-white shadow-md flex items-center gap-2">
                        <span className="material-symbols-outlined !text-[18px]">
                            {userRole === "farmer" ? "campaign" : "eco"}
                        </span>
                        {userRole === "farmer" ? "Buyer Requests" : "Farmer Listings"}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                            {userRole === "farmer" ? filteredRequests.length : sortedItems.length}
                        </span>
                    </div>
                </div>

                {/* Results Count & Sort Indicator */}
                <div className="text-center text-sm text-gray-400 mt-2">
                    {activeTab === "listings" ? (
                        loading || calculatingScores ? (
                            "Loading..."
                        ) : (
                            <>
                                {sortedItems.length} listing{sortedItems.length !== 1 ? 's' : ''} available
                                {sortBy === 'compatibility' && ' • Sorted by best match for you'}
                            </>
                        )
                    ) : (
                        requestsLoading ? "Loading..." : `${filteredRequests.length} open request${filteredRequests.length !== 1 ? 's' : ''} from buyers`
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-12">
                {activeTab === "listings" ? (
                    <>
                        {loading || calculatingScores ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary animate-pulse">
                                        <span className="material-symbols-outlined !text-[40px]">eco</span>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                                        {calculatingScores ? 'Finding best matches for you...' : 'Loading fresh produce...'}
                                    </p>
                                </div>
                            </div>
                        ) : sortedItems.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {sortedItems.map(listing => (
                                    <div
                                        key={listing.id}
                                        onClick={() => setSelectedProduct(listing)}
                                        className="group card-glass overflow-hidden hover:!shadow-card-hover hover:!-translate-y-0.5 cursor-pointer flex flex-row"
                                    >
                                        {/* Left: Producer Profile Picture */}
                                        <div className="shrink-0 w-28 sm:w-36 md:w-44 bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                                            {listing.farmer?.profile_picture ? (
                                                <div
                                                    className="w-full h-full bg-cover bg-center min-h-[120px] sm:min-h-[140px] transition-transform duration-500 group-hover:scale-105"
                                                    style={{ backgroundImage: `url("${listing.farmer.profile_picture}")` }}
                                                />
                                            ) : (
                                                <div className="w-full h-full min-h-[120px] sm:min-h-[140px] flex items-center justify-center bg-primary/5">
                                                    <span className="material-symbols-outlined text-primary/30 !text-[48px] sm:!text-[56px]">person</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Listing Details */}
                                        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <h3 className="text-[#131613] dark:text-white text-lg font-bold group-hover:text-primary transition-colors truncate">
                                                            {listing.crop_name}
                                                        </h3>
                                                        {listing.farmer?.is_verified && (
                                                            <span className="material-symbols-outlined text-blue-500 !text-[18px] shrink-0">verified</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {listing.category && (
                                                            <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden sm:inline">
                                                                {listing.category}
                                                            </span>
                                                        )}
                                                        {listing.compatibilityScore !== undefined && sortBy === 'compatibility' && (
                                                            <div className={`px-2 py-1 ${getScoreColor(listing.compatibilityScore)} text-white text-xs font-bold rounded-full flex items-center gap-1`}>
                                                                <span className="material-symbols-outlined !text-[12px]">thumb_up</span>
                                                                {listing.compatibilityScore}%
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mb-3 text-sm">
                                                    <span className="text-gray-500 dark:text-[#a3b2a4] font-medium truncate">
                                                        {listing.farmer?.farm_name || listing.farmer?.full_name || 'Local Farm'}
                                                    </span>
                                                    {listing.farmer?.rating_average && Number(listing.farmer.rating_average) > 0 && (
                                                        <span className="flex items-center gap-0.5 text-amber-500 shrink-0">
                                                            <span className="material-symbols-outlined filled !text-[14px]">star</span>
                                                            <span className="text-xs font-bold">{Number(listing.farmer.rating_average).toFixed(1)}</span>
                                                        </span>
                                                    )}
                                                    {listing.farmer?.crop_score != null && Number(listing.farmer.crop_score) > 0 && (
                                                        <CropScoreBadge
                                                            score={Number(listing.farmer.crop_score)}
                                                            tier={listing.farmer.crop_score_tier}
                                                            variant="compact"
                                                        />
                                                    )}
                                                    <TrustBadges
                                                        stripeVerified={listing.farmer?.stripe_onboarding_complete}
                                                        ratingAverage={listing.farmer?.rating_average}
                                                        ratingCount={listing.farmer?.rating_count}
                                                        yearsFarming={listing.farmer?.years_farming}
                                                        userType={listing.farmer?.user_type}
                                                        compact
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-end justify-between gap-4">
                                                <p className="text-2xl font-black text-primary">
                                                    ${listing.price_per_unit.toFixed(2)}
                                                    <span className="text-sm font-medium text-gray-400">/{listing.unit}</span>
                                                </p>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 font-medium">Available</p>
                                                    <p className="text-sm font-bold text-[#131613] dark:text-white">{listing.quantity} {listing.unit}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <div className="size-32 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                                    <span className="material-symbols-outlined !text-[64px]">search_off</span>
                                </div>
                                <h3 className="text-2xl font-black text-[#131613] dark:text-white mb-2">No listings found</h3>
                                <p className="text-gray-500 dark:text-[#a3b2a4] font-medium max-w-md mb-6">
                                    Try adjusting your search or filters to find what you&apos;re looking for.
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Produce Requests Tab */
                    requestsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-500 animate-pulse">
                                    <span className="material-symbols-outlined !text-[40px]">campaign</span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading buyer requests...</p>
                            </div>
                        </div>
                    ) : filteredRequests.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {filteredRequests.map(request => (
                                <div
                                    key={request.id}
                                    onClick={() => setSelectedRequest(request)}
                                    className="group card-glass overflow-hidden hover:!shadow-card-hover hover:!-translate-y-0.5 cursor-pointer flex flex-row"
                                >
                                    {/* Left: Buyer Profile Picture */}
                                    <div className="shrink-0 w-28 sm:w-36 md:w-44 bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                                        {request.buyer?.profile_picture ? (
                                            <div
                                                className="w-full h-full bg-cover bg-center min-h-[120px] sm:min-h-[140px] transition-transform duration-500 group-hover:scale-105"
                                                style={{ backgroundImage: `url("${request.buyer.profile_picture}")` }}
                                            />
                                        ) : (
                                            <div className="w-full h-full min-h-[120px] sm:min-h-[140px] flex items-center justify-center bg-purple-50 dark:bg-purple-900/20">
                                                <span className="material-symbols-outlined text-purple-300 !text-[48px] sm:!text-[56px]">person</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Request Details */}
                                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wide">
                                                        {request.category || 'Produce'}
                                                    </span>
                                                    <h3 className="text-[#131613] dark:text-white text-lg font-bold group-hover:text-purple-500 transition-colors truncate">
                                                        {request.crop_name}
                                                    </h3>
                                                </div>
                                                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-bold uppercase shrink-0">
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 dark:text-[#a3b2a4] text-sm font-medium mb-3 truncate">
                                                {request.buyer?.company_name || request.buyer?.full_name || 'Buyer'}
                                                {request.buyer?.location && (
                                                    <span className="inline-flex items-center gap-0.5 ml-1">
                                                        <span className="material-symbols-outlined !text-[14px]">location_on</span>
                                                        {request.buyer.location}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-end justify-between gap-4 flex-wrap">
                                            <div className="flex items-center gap-4">
                                                <p className="text-sm text-gray-500">
                                                    <strong className="text-[#131613] dark:text-white">{request.quantity}</strong> {request.unit}
                                                </p>
                                                {request.needed_by && (
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <span className="material-symbols-outlined !text-[14px]">event</span>
                                                        {new Date(request.needed_by).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            {request.max_price && (
                                                <p className="text-lg font-black text-purple-500">
                                                    Up to ${request.max_price}
                                                    <span className="text-xs font-medium text-gray-400">/{request.unit}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="size-32 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                                <span className="material-symbols-outlined !text-[64px]">campaign</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#131613] dark:text-white mb-2">No buyer requests yet</h3>
                            <p className="text-gray-500 dark:text-[#a3b2a4] font-medium max-w-md">
                                No buyers have posted produce requests at the moment. Check back later.
                            </p>
                        </div>
                    )
                )}
            </div>

            {/* Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
                    <div className="relative w-full sm:max-w-lg bg-white/90 dark:bg-[#1a2c15]/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                        <div className="sticky top-0 bg-white dark:bg-[#1a2c15] p-6 border-b border-gray-100 dark:border-white/5 z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-[#131613] dark:text-white">Filters</h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="size-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Sort By */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sort By</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: "compatibility", label: "Best Match", icon: "thumb_up" },
                                        { value: "newest", label: "Newest", icon: "schedule" },
                                        { value: "price-low", label: "Price: Low", icon: "arrow_downward" },
                                        { value: "price-high", label: "Price: High", icon: "arrow_upward" },
                                        { value: "name", label: "Name A-Z", icon: "sort_by_alpha" },
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSortBy(option.value)}
                                            className={`px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                                                sortBy === option.value
                                                    ? 'bg-gradient-to-r from-primary to-green-500 text-white shadow-lg shadow-primary/25'
                                                    : 'bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-primary/50 hover:text-primary'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined !text-[18px]">{option.icon}</span>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => cat && (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={`chip-select ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                                        >
                                            {selectedCategories.includes(cat) && (
                                                <span className="material-symbols-outlined !text-[14px] mr-1">check</span>
                                            )}
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price Range</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-400 mb-1 block">Min</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                                            <input
                                                type="number"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                                className="input-premium pl-8 font-bold"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <span className="text-primary mt-5 font-bold">to</span>
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-400 mb-1 block">Max</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                                            <input
                                                type="number"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                                                className="input-premium pl-8 font-bold"
                                                placeholder="1000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verified Only */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Other</label>
                                <button
                                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                                        verifiedOnly
                                            ? 'bg-gradient-to-r from-primary/10 to-green-500/10 border-2 border-primary shadow-lg shadow-primary/10'
                                            : 'bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 hover:border-primary/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${verifiedOnly ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                                            <span className="material-symbols-outlined !text-[20px]">verified</span>
                                        </div>
                                        <span className={`font-bold ${verifiedOnly ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>Verified Farms Only</span>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center ${
                                        verifiedOnly ? 'bg-primary justify-end' : 'bg-gray-200 dark:bg-white/20 justify-start'
                                    }`}>
                                        <div className={`size-5 rounded-full bg-white shadow-md mx-1 transition-transform duration-300`}></div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-[#1a2c15] p-4 border-t border-gray-100 dark:border-white/5 flex gap-3">
                            <button
                                onClick={clearAllFilters}
                                className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="flex-[2] h-12 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                Show {sortedItems.length} Results
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Listing Detail Modal */}
            {selectedProduct && (
                <ListingDetailModal
                    listing={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onOrder={userRole === 'buyer' ? handleOrder : undefined}
                    compatibility={selectedProduct.compatibilityScore !== undefined ? {
                        score: selectedProduct.compatibilityScore,
                        reasons: selectedProduct.compatibilityReasons || []
                    } : undefined}
                    userLocation={profile?.location}
                />
            )}

            {/* Request Detail Modal */}
            {selectedRequest && (
                <RequestDetailModal
                    request={selectedRequest}
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onRespond={userRole === 'farmer' ? () => {} : undefined}
                    userLocation={profile?.location}
                    userCrops={profile?.crops}
                />
            )}
        </div>
    );
}
