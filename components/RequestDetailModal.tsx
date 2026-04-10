"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProduceRequest } from "@/hooks/useProduceRequests";

interface CompatibilityInfo {
    score: number;
    reasons: { type: 'positive' | 'neutral' | 'warning'; message: string }[];
}

interface RequestDetailModalProps {
    request: ProduceRequest;
    isOpen: boolean;
    onClose: () => void;
    onRespond?: (request: ProduceRequest) => void;
    compatibility?: CompatibilityInfo;
    userLocation?: string | null;
    userCrops?: string[] | null;
}

export default function RequestDetailModal({
    request,
    isOpen,
    onClose,
    onRespond,
    compatibility,
    userLocation,
    userCrops,
}: RequestDetailModalProps) {
    const [showMoreBuyer, setShowMoreBuyer] = useState(false);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const buyer = request.buyer;
    const daysUntilNeeded = request.needed_by
        ? Math.ceil((new Date(request.needed_by).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Request details: ${request.crop_name}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                role="presentation"
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1a2c15] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 size-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Buyer Photo Header */}
                <div className="relative h-52 sm:h-60 bg-gray-100 dark:bg-white/5 overflow-hidden">
                    {buyer?.profile_picture ? (
                        <>
                            {/* Blurred background fill */}
                            <div
                                className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-40"
                                style={{ backgroundImage: `url("${buyer.profile_picture}")` }}
                            />
                            {/* Sharp centered photo */}
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="size-28 sm:size-32 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl">
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url("${buyer.profile_picture}")` }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10">
                            <div className="size-28 sm:size-32 rounded-2xl bg-white/50 dark:bg-white/10 flex items-center justify-center border-4 border-white/30">
                                <span className="material-symbols-outlined text-purple-300 !text-[56px]">person</span>
                            </div>
                        </div>
                    )}

                    {/* Buyer name overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-20 text-center">
                        <h3 className="text-xl font-black text-white drop-shadow-lg">
                            {buyer?.company_name || buyer?.full_name || 'Buyer'}
                        </h3>
                        <div className="flex items-center justify-center gap-3 mt-1">
                            {buyer?.location && (
                                <span className="text-white/80 text-sm flex items-center gap-1">
                                    <span className="material-symbols-outlined !text-[14px]">location_on</span>
                                    {buyer.location}
                                </span>
                            )}
                            {buyer?.business_type && (
                                <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full capitalize">
                                    {buyer.business_type}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Compatibility Badge */}
                    {compatibility && (
                        <div className="absolute top-3 left-3 px-3 py-2 bg-white/95 dark:bg-[#1a2c15]/95 rounded-xl shadow-lg backdrop-blur-sm z-20">
                            <div className="flex items-center gap-2">
                                <div className={`text-2xl font-black ${getScoreColor(compatibility.score)}`}>
                                    {compatibility.score}%
                                </div>
                                <div className="text-xs">
                                    <p className={`font-bold ${getScoreColor(compatibility.score)}`}>
                                        {getScoreLabel(compatibility.score)}
                                    </p>
                                    <p className="text-gray-500">Match</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Produce Request Banner */}
                <div className="px-6 -mt-0 relative z-10">
                    <div className="bg-white dark:bg-[#223c1c] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-5 flex items-center gap-5">
                        <div className="size-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-purple-500 !text-[28px]">eco</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-purple-500 font-bold uppercase tracking-wide">Looking for</p>
                            <h2 className="text-2xl font-black text-[#131613] dark:text-white truncate">
                                {request.crop_name}
                            </h2>
                            <div className="flex items-center gap-3 mt-0.5">
                                {request.category && (
                                    <span className="text-xs text-gray-500 capitalize">{request.category}</span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    request.status === 'open'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {request.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-20rem)]">
                    {/* Key Details Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Quantity</p>
                            <p className="text-xl font-black text-[#131613] dark:text-white">
                                {request.quantity} <span className="text-sm font-medium text-gray-500">{request.unit}</span>
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Max Budget</p>
                            <p className="text-xl font-black text-primary">
                                {request.max_price ? `$${request.max_price}` : 'Open'}
                                {request.max_price && <span className="text-sm font-medium text-gray-500">/{request.unit}</span>}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Needed By</p>
                            <p className={`text-xl font-black ${
                                daysUntilNeeded !== null && daysUntilNeeded < 7 ? 'text-orange-500' : 'text-[#131613] dark:text-white'
                            }`}>
                                {daysUntilNeeded !== null ? (
                                    daysUntilNeeded <= 0 ? 'ASAP' : `${daysUntilNeeded}d`
                                ) : 'Flexible'}
                            </p>
                        </div>
                    </div>

                    {/* Potential Earnings */}
                    {request.max_price && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">Potential Earnings</p>
                                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                                        ${(request.quantity * request.max_price).toFixed(2)}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-green-500 !text-[40px]">payments</span>
                            </div>
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

                    {/* Buyer Details (expandable) */}
                    {buyer && (
                        <div className="mb-6 border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-4">
                                <button
                                    onClick={() => setShowMoreBuyer(!showMoreBuyer)}
                                    className="w-full flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary !text-[18px]">info</span>
                                        More about this buyer
                                    </span>
                                    <span className={`material-symbols-outlined !text-[18px] transition-transform ${showMoreBuyer ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>

                                {showMoreBuyer && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 space-y-3 animate-fade-in">
                                        {buyer.bio && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{buyer.bio}</p>
                                        )}

                                        {buyer.years_in_business && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="material-symbols-outlined text-primary !text-[16px]">work_history</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {buyer.years_in_business}+ years in business
                                                </span>
                                            </div>
                                        )}

                                        {buyer.average_order_size && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="material-symbols-outlined text-primary !text-[16px]">shopping_cart</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Typical order: {buyer.average_order_size}
                                                </span>
                                            </div>
                                        )}

                                        {buyer.preferred_categories && buyer.preferred_categories.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Usually Buys</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {buyer.preferred_categories.map((cat, i) => (
                                                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg font-medium capitalize">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Link
                                            href={`/profile/public?id=${buyer.id}`}
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

                    {/* Description */}
                    {request.description && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Request Details</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                {request.description}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {request.status === 'open' && (
                        <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                            <div className="flex flex-col gap-2.5">
                                {onRespond && (
                                    <Link
                                        href={`/dashboard/offer/new?type=sell&requestId=${request.id}`}
                                        className="w-full py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined !text-[20px]">local_offer</span>
                                        Make an Offer
                                    </Link>
                                )}
                                <Link
                                    href={`/dashboard/messages?userId=${request.buyer_id}`}
                                    className="w-full py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined !text-[20px]">chat</span>
                                    Message Buyer
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Posted Date */}
                    <p className="mt-4 text-xs text-gray-400 text-center">
                        Posted {new Date(request.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
