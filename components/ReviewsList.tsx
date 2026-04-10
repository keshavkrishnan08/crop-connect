"use client";

import { useState, useEffect, useCallback } from 'react';
import StarRating from '@/components/StarRating';
import ReviewCard from '@/components/ReviewCard';
import { useReviews, type Review, type ReviewStats } from '@/hooks/useReviews';

interface ReviewsListProps {
    userId: string;
    compact?: boolean;
    limit?: number;
}

export default function ReviewsList({ userId, compact = false, limit = 5 }: ReviewsListProps) {
    const { fetchReviewsForUser, fetchReviewStats } = useReviews();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadReviews = useCallback(async (pageNum: number) => {
        setLoading(true);
        const result = await fetchReviewsForUser(userId, pageNum, limit);
        if (pageNum === 0) {
            setReviews(result.reviews);
        } else {
            setReviews(prev => [...prev, ...result.reviews]);
        }
        setTotal(result.total);
        setLoading(false);
    }, [userId, limit, fetchReviewsForUser]);

    const loadStats = useCallback(async () => {
        const s = await fetchReviewStats(userId);
        setStats(s);
    }, [userId, fetchReviewStats]);

    useEffect(() => {
        loadReviews(0);
        loadStats();
    }, [loadReviews, loadStats]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadReviews(nextPage);
    };

    const hasMore = reviews.length < total;

    if (loading && reviews.length === 0) {
        return (
            <div className="py-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            {stats && stats.count > 0 && !compact && (
                <div className="bg-white dark:bg-[#1a2e1f] rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-6">
                        {/* Overall Score */}
                        <div className="text-center shrink-0">
                            <p className="text-4xl font-black text-[#131613] dark:text-white">{stats.average.toFixed(1)}</p>
                            <StarRating rating={stats.average} size="sm" />
                            <p className="text-xs text-gray-500 mt-1">{stats.count} review{stats.count !== 1 ? 's' : ''}</p>
                        </div>

                        {/* Distribution Bars */}
                        <div className="flex-1 space-y-1.5">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = stats.distribution[star] || 0;
                                const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2 text-sm">
                                        <span className="text-xs font-medium text-gray-500 w-3">{star}</span>
                                        <span className="material-symbols-outlined filled text-amber-400 !text-[14px]">star</span>
                                        <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Stats */}
            {stats && stats.count > 0 && compact && (
                <div className="flex items-center gap-2 text-sm">
                    <StarRating rating={stats.average} size="sm" showValue />
                    <span className="text-gray-400">({stats.count})</span>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="py-8 text-center">
                    <span className="material-symbols-outlined text-gray-300 !text-[48px]">reviews</span>
                    <p className="text-gray-500 mt-2">No reviews yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map(review => (
                        <ReviewCard key={review.id} review={review} compact={compact} />
                    ))}
                </div>
            )}

            {/* Load More */}
            {hasMore && (
                <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
                    ) : (
                        <>
                            <span className="material-symbols-outlined !text-[18px]">expand_more</span>
                            Load More Reviews ({total - reviews.length} remaining)
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
