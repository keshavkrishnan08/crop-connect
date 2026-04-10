"use client";

import { useState } from 'react';

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
    className?: string;
}

export default function StarRating({
    rating,
    maxStars = 5,
    size = 'md',
    interactive = false,
    onChange,
    showValue = false,
    className = '',
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: '!text-[16px]',
        md: '!text-[22px]',
        lg: '!text-[28px]',
    };

    const valueSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex items-center">
                {Array.from({ length: maxStars }, (_, i) => {
                    const starValue = i + 1;
                    const isFilled = starValue <= displayRating;
                    const isHalf = !isFilled && starValue - 0.5 <= displayRating;

                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={!interactive}
                            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform disabled:opacity-100`}
                            onClick={() => interactive && onChange?.(starValue)}
                            onMouseEnter={() => interactive && setHoverRating(starValue)}
                            onMouseLeave={() => interactive && setHoverRating(0)}
                        >
                            <span
                                className={`material-symbols-outlined ${sizeClasses[size]} ${
                                    isFilled
                                        ? 'filled text-amber-400'
                                        : isHalf
                                            ? 'text-amber-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                } transition-colors`}
                            >
                                {isFilled ? 'star' : isHalf ? 'star_half' : 'star'}
                            </span>
                        </button>
                    );
                })}
            </div>
            {showValue && rating > 0 && (
                <span className={`font-bold text-gray-700 dark:text-gray-300 ${valueSizeClasses[size]} ml-1`}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
