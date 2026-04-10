"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Listing } from "@/hooks/useListings";
import ReportButton from "@/components/ReportButton";

interface CompatibilityInfo {
    score: number;
    reasons: { type: 'positive' | 'neutral' | 'warning'; message: string }[];
}

interface ListingDetailModalProps {
    listing: Listing;
    isOpen: boolean;
    onClose: () => void;
    onOrder?: (listing: Listing) => void;
    compatibility?: CompatibilityInfo;
    userLocation?: string | null;
}

export default function ListingDetailModal({
    listing,
    isOpen,
    onClose,
    onOrder,
    compatibility,
    userLocation,
}: ListingDetailModalProps) {
    const [showMoreFarmer, setShowMoreFarmer] = useState(false);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const farmer = listing.farmer;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-orange-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent Match';
        if (score >= 80) return 'Great Match';
        if (score >= 70) return 'Good Match';
        if (score >= 60) return 'Fair Match';
        return 'May Not Be Ideal';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Listing details: ${listing.crop_name}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                role="presentation"
            />

            {/* Modal */}
            <div className="relative bg-white/95 dark:bg-[#1a2e1f]/95 backdrop-blur-2xl rounded-3xl shadow-glass-lg max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 size-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Photo Header — Producer + Produce Side by Side */}
                <div className="relative flex flex-row h-56 sm:h-64 bg-gray-100 dark:bg-white/5">
                    {/* Producer Photo (Left) */}
                    <div className="w-1/3 sm:w-2/5 relative overflow-hidden bg-primary/5">
                        {farmer?.profile_picture ? (
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url("${farmer.profile_picture}")` }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-primary/30 !text-[56px]">person</span>
                                <span className="text-xs text-gray-400 font-medium truncate max-w-full px-2">{farmer?.farm_name || 'Producer'}</span>
                            </div>
                        )}
                        {/* Producer name overlay */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                            <p className="text-white text-sm font-bold truncate flex items-center gap-1">
                                {farmer?.farm_name || farmer?.full_name || 'Farm'}
                                {farmer?.is_verified && (
                                    <span className="material-symbols-outlined text-blue-400 !text-[14px]">verified</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Produce Photo (Right) */}
                    <div className="flex-1 relative overflow-hidden">
                        {listing.image_url ? (
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url("${listing.image_url}")` }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
                                <span className="material-symbols-outlined text-primary/30 !text-[56px]">eco</span>
                                <span className="text-xs text-gray-400 font-medium">{listing.crop_name}</span>
                            </div>
                        )}
                        {listing.category && (
                            <div className="absolute top-3 right-3">
                                <span className="px-3 py-1.5 bg-white/90 dark:bg-black/50 backdrop-blur-sm text-xs font-bold rounded-lg uppercase text-gray-700 dark:text-white">
                                    {listing.category}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Compatibility Badge */}
                    {compatibility && (
                        <div className="absolute top-3 left-3 px-3 py-2 bg-white/95 dark:bg-[#1a2c15]/95 rounded-xl shadow-lg backdrop-blur-sm z-10">
                            <div className="flex items-center gap-2">
                                <div className={`text-2xl font-black ${getScoreColor(compatibility.score)}`}>
                                    {compatibility.score}%
                                </div>
                                <div className="text-xs">
                                    <p className={`font-bold ${getScoreColor(compatibility.score)}`}>
                                        {getScoreLabel(compatibility.score)}
                                    </p>
                                    <p className="text-gray-500">Compatibility</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Key Numbers Bar */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between flex-wrap gap-4 bg-gray-50/50 dark:bg-white/[0.02]">
                    <div>
                        <p className="text-3xl font-black text-primary">${listing.price_per_unit}</p>
                        <p className="text-xs text-gray-500">per {listing.unit}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-[#131613] dark:text-white">{listing.quantity} {listing.unit}</p>
                        <p className="text-xs text-gray-500">available</p>
                    </div>
                    {farmer?.location && (
                        <div className="text-right">
                            <p className="text-sm font-bold text-[#131613] dark:text-white flex items-center gap-1 justify-end">
                                <span className="material-symbols-outlined !text-[16px] text-primary">location_on</span>
                                {farmer.location}
                            </p>
                            <p className="text-xs text-gray-500">farm location</p>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-22rem)]">
                    {/* Title & Basic Info */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between">
                            <h2 className="text-2xl font-black text-[#131613] dark:text-white mb-2">
                                {listing.crop_name}
                            </h2>
                            <ReportButton reportType="listing" targetId={listing.id} variant="text" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined !text-[16px]">schedule</span>
                                Listed {new Date(listing.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Description (moved up for prominence) */}
                    {listing.description && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                {listing.description}
                            </p>
                        </div>
                    )}

                    {/* Compatibility Insights */}
                    {compatibility && compatibility.reasons.length > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary !text-[18px]">tips_and_updates</span>
                                Smart Insights
                            </h3>
                            <div className="space-y-2">
                                {compatibility.reasons.map((reason, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                        <span className={`material-symbols-outlined !text-[16px] mt-0.5 ${
                                            reason.type === 'positive' ? 'text-green-500' :
                                            reason.type === 'warning' ? 'text-orange-500' : 'text-gray-400'
                                        }`}>
                                            {reason.type === 'positive' ? 'check_circle' :
                                             reason.type === 'warning' ? 'warning' : 'info'}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">{reason.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Farmer Profile Card (smaller avatar since photo is in header) */}
                    {farmer && (
                        <div className="mb-6 border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-primary/10 overflow-hidden shrink-0">
                                        {farmer.profile_picture ? (
                                            <div
                                                className="w-full h-full bg-cover bg-center"
                                                style={{ backgroundImage: `url("${farmer.profile_picture}")` }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary !text-[20px]">person</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-[#131613] dark:text-white truncate text-sm">
                                                {farmer.farm_name || farmer.full_name || 'Farm'}
                                            </h3>
                                            {farmer.is_verified && (
                                                <span className="material-symbols-outlined text-blue-500 !text-[16px]">verified</span>
                                            )}
                                        </div>
                                        {farmer.years_farming && (
                                            <p className="text-xs text-gray-400">
                                                {farmer.years_farming}+ years farming
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowMoreFarmer(!showMoreFarmer)}
                                        className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    >
                                        {showMoreFarmer ? 'Show Less' : 'Show More'}
                                    </button>
                                </div>

                                {/* Expanded Farmer Details */}
                                {showMoreFarmer && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 space-y-3 animate-fade-in">
                                        {farmer.bio && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{farmer.bio}</p>
                                        )}

                                        {farmer.farm_size && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="material-symbols-outlined text-primary !text-[16px]">landscape</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {farmer.farm_size} {farmer.farm_unit || 'acres'} farm
                                                </span>
                                            </div>
                                        )}

                                        {farmer.certifications && farmer.certifications.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Certifications</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {farmer.certifications.map((cert, i) => (
                                                        <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-lg font-medium">
                                                            {cert}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {farmer.farming_practices && farmer.farming_practices.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Farming Practices</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {farmer.farming_practices.map((practice, i) => (
                                                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg font-medium">
                                                            {practice}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {farmer.crops && farmer.crops.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Also Grows</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {farmer.crops.slice(0, 5).join(', ')}
                                                    {farmer.crops.length > 5 && ` +${farmer.crops.length - 5} more`}
                                                </p>
                                            </div>
                                        )}

                                        <Link
                                            href={`/profile/public?id=${farmer.id}`}
                                            className="inline-flex items-center gap-1 text-sm text-primary font-bold hover:underline"
                                        >
                                            View Full Profile
                                            <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Section */}
                    {onOrder && (
                        <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                            <div className="flex items-end gap-4 mb-4">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Available</p>
                                    <p className="text-lg font-bold text-[#131613] dark:text-white">
                                        {listing.quantity} {listing.unit}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Price</p>
                                    <p className="text-2xl font-black text-primary">${listing.price_per_unit}<span className="text-sm font-medium text-gray-500">/{listing.unit}</span></p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <Link
                                    href={`/dashboard/offer/new?type=buy&listingId=${listing.id}`}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined !text-[20px]">local_offer</span>
                                    Make an Offer
                                </Link>
                                <Link
                                    href={`/dashboard/messages?userId=${listing.farmer_id}`}
                                    className="w-full py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined !text-[20px]">chat</span>
                                    Message Farmer
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
