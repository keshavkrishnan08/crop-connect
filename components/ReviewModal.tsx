"use client";

import { useState } from 'react';
import StarRating from '@/components/StarRating';
import { useReviews } from '@/hooks/useReviews';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    reviewedUserId: string;
    reviewedUserName: string;
    onSuccess?: () => void;
}

export default function ReviewModal({
    isOpen,
    onClose,
    orderId,
    reviewedUserId,
    reviewedUserName,
    onSuccess,
}: ReviewModalProps) {
    const { submitReview, loading } = useReviews();
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a star rating');
            return;
        }

        setError(null);
        const result = await submitReview(orderId, reviewedUserId, rating, title, reviewText);

        if (result.success) {
            onSuccess?.();
            onClose();
        } else {
            setError(result.error || 'Failed to submit review');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-modal-dark rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#131613] dark:text-white">Leave a Review</h2>
                        <button
                            onClick={onClose}
                            className="size-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-500">close</span>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        How was your experience with <strong className="text-gray-700 dark:text-gray-300">{reviewedUserName}</strong>?
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 space-y-5">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-2 py-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <StarRating
                            rating={rating}
                            size="lg"
                            interactive
                            onChange={setRating}
                        />
                        <p className="text-sm font-medium text-gray-500">
                            {rating === 0 && 'Tap a star to rate'}
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </p>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Title (optional)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Summarize your experience"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2e1f] text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none dark:text-white"
                            maxLength={100}
                        />
                    </div>

                    {/* Review Text */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Review (optional)</label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={3}
                            placeholder="Share details about your experience..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2e1f] text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none dark:text-white"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-400 text-right">{reviewText.length}/500</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                            <span className="material-symbols-outlined !text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || loading}
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-sm hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined !text-[18px]">rate_review</span>
                                    Submit Review
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
