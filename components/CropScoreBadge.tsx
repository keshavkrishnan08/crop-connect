"use client";

import { getTierInfo } from '@/hooks/useCropScore';

interface CropScoreBadgeProps {
    score: number | null | undefined;
    tier: string | null | undefined;
    variant?: 'compact' | 'full';
    className?: string;
}

const TIER_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
    platinum: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-700 dark:text-emerald-300',
        ring: 'ring-emerald-200 dark:ring-emerald-800',
    },
    gold: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-300',
        ring: 'ring-yellow-200 dark:ring-yellow-800',
    },
    silver: {
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        text: 'text-gray-600 dark:text-gray-300',
        ring: 'ring-gray-200 dark:ring-gray-700',
    },
    bronze: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-300',
        ring: 'ring-amber-200 dark:ring-amber-800',
    },
};

export default function CropScoreBadge({ score, tier, variant = 'compact', className = '' }: CropScoreBadgeProps) {
    const effectiveTier = tier || 'bronze';
    const effectiveScore = score ?? 0;
    const tierInfo = getTierInfo(effectiveTier);
    const styles = TIER_STYLES[effectiveTier] || TIER_STYLES.bronze;

    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ring-1 ${styles.bg} ${styles.ring} ${className}`}>
                <span className={`material-symbols-outlined !text-[14px] ${styles.text}`}>
                    {tierInfo.icon}
                </span>
                <span className={`text-xs font-bold ${styles.text}`}>
                    {effectiveScore}
                </span>
            </div>
        );
    }

    // Full variant — for profiles
    return (
        <div className={`p-4 rounded-xl ring-1 ${styles.bg} ${styles.ring} ${className}`}>
            <div className="flex items-center gap-3">
                <div className={`size-10 rounded-full flex items-center justify-center ${styles.bg} ring-2 ${styles.ring}`}>
                    <span className={`material-symbols-outlined !text-[20px] ${styles.text}`}>
                        {tierInfo.icon}
                    </span>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-black ${styles.text}`}>{effectiveScore}</span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${styles.text} opacity-70`}>
                            CropScore
                        </span>
                    </div>
                    <p className={`text-xs font-medium ${styles.text} opacity-80`}>
                        {tierInfo.label} Tier
                    </p>
                </div>
            </div>

            {/* Score bar */}
            <div className="mt-3 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                        effectiveTier === 'platinum' ? 'bg-emerald-500'
                        : effectiveTier === 'gold' ? 'bg-yellow-500'
                        : effectiveTier === 'silver' ? 'bg-gray-400'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${effectiveScore}%` }}
                />
            </div>
        </div>
    );
}
