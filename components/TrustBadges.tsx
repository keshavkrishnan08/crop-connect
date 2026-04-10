"use client";

interface TrustBadgesProps {
    stripeVerified?: boolean | null;
    ratingAverage?: number | null;
    ratingCount?: number | null;
    completedOrders?: number | null;
    yearsFarming?: number | null;
    yearsInBusiness?: number | null;
    userType?: string | null;
    compact?: boolean;
}

interface Badge {
    icon: string;
    label: string;
    color: string;
    tooltip: string;
}

export default function TrustBadges({
    stripeVerified,
    ratingAverage,
    ratingCount,
    completedOrders,
    yearsFarming,
    yearsInBusiness,
    userType,
    compact = false,
}: TrustBadgesProps) {
    const badges: Badge[] = [];

    if (stripeVerified) {
        badges.push({
            icon: 'account_balance',
            label: 'ID Verified',
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
            tooltip: 'Identity verified through Stripe KYC',
        });
    }

    const avg = ratingAverage ? Number(ratingAverage) : 0;
    const count = ratingCount || 0;
    if (avg >= 4.0 && count >= 3) {
        badges.push({
            icon: 'workspace_premium',
            label: userType === 'farmer' ? 'Trusted Seller' : 'Trusted Buyer',
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
            tooltip: `${avg.toFixed(1)} average from ${count} reviews`,
        });
    }

    if (completedOrders && completedOrders >= 10) {
        badges.push({
            icon: 'military_tech',
            label: 'Established',
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
            tooltip: `${completedOrders}+ completed orders`,
        });
    }

    const years = yearsFarming || yearsInBusiness || 0;
    if (years >= 5) {
        badges.push({
            icon: 'emoji_events',
            label: 'Veteran',
            color: 'text-green-600 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
            tooltip: `${years}+ years of experience`,
        });
    }

    if (badges.length === 0) return null;

    if (compact) {
        return (
            <div className="flex items-center gap-1">
                {badges.map((badge, i) => (
                    <span
                        key={i}
                        title={badge.tooltip}
                        className={`inline-flex items-center justify-center size-6 rounded-full border ${badge.color}`}
                    >
                        <span className="material-symbols-outlined !text-[14px]">{badge.icon}</span>
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {badges.map((badge, i) => (
                <span
                    key={i}
                    title={badge.tooltip}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                >
                    <span className="material-symbols-outlined !text-[12px]">{badge.icon}</span>
                    {badge.label}
                </span>
            ))}
        </div>
    );
}
