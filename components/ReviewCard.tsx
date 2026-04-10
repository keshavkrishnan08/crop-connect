"use client";

import StarRating from '@/components/StarRating';
import type { Review } from '@/hooks/useReviews';

interface ReviewCardProps {
    review: Review;
    compact?: boolean;
}

export default function ReviewCard({ review, compact = false }: ReviewCardProps) {
    const reviewerName = review.reviewer?.farm_name
        || review.reviewer?.company_name
        || review.reviewer?.full_name
        || 'Anonymous';

    const reviewerType = review.reviewer?.user_type === 'farmer' ? 'Farmer' : 'Buyer';

    const timeAgo = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 30) return `${days} days ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    };

    return (
        <div className={`bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 ${compact ? 'p-4' : 'p-5'}`}>
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="size-10 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0">
                    {review.reviewer?.profile_picture ? (
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url("${review.reviewer.profile_picture}")` }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400 !text-[20px]">person</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <span className="font-bold text-sm text-[#131613] dark:text-white">{reviewerName}</span>
                            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 font-medium">{reviewerType}</span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{timeAgo(review.created_at)}</span>
                    </div>

                    {/* Stars */}
                    <div className="mt-1">
                        <StarRating rating={review.rating} size="sm" />
                    </div>

                    {/* Title */}
                    {review.title && (
                        <p className="mt-2 font-semibold text-sm text-[#131613] dark:text-white">{review.title}</p>
                    )}

                    {/* Review Text */}
                    {review.review_text && (
                        <p className={`mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${compact ? 'line-clamp-2' : ''}`}>
                            {review.review_text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
