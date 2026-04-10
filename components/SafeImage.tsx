"use client";

import { useState } from "react";

interface SafeImageProps {
    src: string | null | undefined;
    alt?: string;
    className?: string;
    fallbackIcon?: string;
    fallbackText?: string;
    fallbackClassName?: string;
}

/**
 * Image component that gracefully handles broken/missing image URLs.
 * Uses a hidden <img> to detect load failures and falls back to an icon placeholder.
 * Renders as a CSS background-image div for bg-cover/bg-center styling.
 */
export default function SafeImage({
    src,
    alt = "",
    className = "w-full h-full bg-cover bg-center",
    fallbackIcon = "image",
    fallbackText,
    fallbackClassName = "w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-100 dark:bg-white/5",
}: SafeImageProps) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className={fallbackClassName}>
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 !text-[32px]">
                    {fallbackIcon}
                </span>
                {fallbackText && (
                    <span className="text-xs text-gray-400 font-medium">{fallbackText}</span>
                )}
            </div>
        );
    }

    return (
        <div
            className={className}
            style={{ backgroundImage: `url("${src}")` }}
            role="img"
            aria-label={alt}
        >
            {/* Hidden img to detect load failures */}
            <img
                src={src}
                alt=""
                onError={() => setFailed(true)}
                className="sr-only"
                aria-hidden="true"
            />
        </div>
    );
}
