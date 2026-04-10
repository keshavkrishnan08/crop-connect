"use client";

import { ORDER_UPDATE_LABELS, ORDER_UPDATE_ICONS, type OrderUpdate } from '@/hooks/useOrderUpdates';

interface OrderUpdatesFeedProps {
    updates: OrderUpdate[];
    loading?: boolean;
}

function formatTimestamp(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const UPDATE_COLORS: Record<string, string> = {
    delivered: 'bg-green-500 text-white',
    in_transit: 'bg-primary text-white',
    out_for_delivery: 'bg-primary text-white',
    delayed: 'bg-amber-500 text-white',
    order_placed: 'bg-gray-400 text-white',
    payment_received: 'bg-gray-400 text-white',
    preparing: 'bg-gray-400 text-white',
    packed: 'bg-gray-400 text-white',
    picked_up: 'bg-gray-400 text-white',
    custom: 'bg-gray-400 text-white',
};

export default function OrderUpdatesFeed({ updates, loading }: OrderUpdatesFeedProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="size-7 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
                        <div className="flex-1 space-y-1">
                            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10" />
                            <div className="h-2 w-40 rounded bg-gray-200 dark:bg-white/10" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (updates.length === 0) {
        return (
            <div className="text-center py-4">
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 !text-[28px]">
                    update
                </span>
                <p className="text-xs text-gray-400 mt-1">No updates yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {updates.map((update, i) => {
                const isLast = i === updates.length - 1;
                const icon = ORDER_UPDATE_ICONS[update.update_type] || 'info';
                const label = ORDER_UPDATE_LABELS[update.update_type] || update.update_type;
                const colorClass = UPDATE_COLORS[update.update_type] || UPDATE_COLORS.custom;

                return (
                    <div key={update.id} className="flex gap-3">
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center">
                            <div className={`size-7 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                                <span className="material-symbols-outlined !text-[14px]">{icon}</span>
                            </div>
                            {!isLast && (
                                <div className="w-0.5 flex-1 my-1 min-h-[16px] bg-gray-200 dark:bg-gray-700" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="pb-3 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#131613] dark:text-white">
                                    {label}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {formatTimestamp(update.created_at)}
                                </span>
                            </div>
                            {update.message && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                    {update.message}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
