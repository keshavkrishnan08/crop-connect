"use client";

import AutoReleaseCountdown from '@/components/AutoReleaseCountdown';

type EscrowStatusType = 'none' | 'awaiting_payment' | 'funds_held' | 'shipped_awaiting_confirmation' | 'funds_released' | 'disputed' | 'payment_failed' | 'refunded' | null;

interface ShippingTimelineProps {
    escrowStatus: EscrowStatusType;
    orderStatus: string;
    createdAt: string;
    farmerShippedAt?: string | null;
    buyerConfirmedAt?: string | null;
    fundsReleasedAt?: string | null;
    autoReleaseAt?: string | null;
    disputeCreatedAt?: string | null;
    trackingNumber?: string | null;
    carrier?: string | null;
    disputeReason?: string | null;
    estimatedDeliveryDate?: string | null;
    isFarmer?: boolean;
}

interface TimelineStep {
    label: string;
    icon: string;
    status: 'completed' | 'active' | 'pending' | 'error';
    timestamp?: string | null;
    detail?: string;
}

export default function ShippingTimeline({
    escrowStatus,
    orderStatus,
    createdAt,
    farmerShippedAt,
    buyerConfirmedAt,
    fundsReleasedAt,
    autoReleaseAt,
    disputeCreatedAt,
    trackingNumber,
    carrier,
    disputeReason,
    estimatedDeliveryDate,
    isFarmer = false,
}: ShippingTimelineProps) {
    const formatDate = (date: string | null | undefined) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    // Build timeline steps based on escrow status
    const steps: TimelineStep[] = [];

    // Step 1: Order Placed
    steps.push({
        label: 'Order Placed',
        icon: 'receipt_long',
        status: 'completed',
        timestamp: createdAt,
        detail: 'Order confirmed and payment processed',
    });

    // Step 2: Payment Secured
    const paymentDone = escrowStatus && escrowStatus !== 'none' && escrowStatus !== 'awaiting_payment' && escrowStatus !== 'payment_failed';
    steps.push({
        label: 'Payment Secured',
        icon: 'lock',
        status: paymentDone ? 'completed' : escrowStatus === 'awaiting_payment' ? 'active' : escrowStatus === 'payment_failed' ? 'error' : 'pending',
        detail: paymentDone ? 'Funds held in escrow' : escrowStatus === 'payment_failed' ? 'Payment failed' : 'Awaiting payment',
    });

    // Step 3: Shipped
    const isShipped = escrowStatus === 'shipped_awaiting_confirmation' || escrowStatus === 'funds_released';
    steps.push({
        label: 'Shipped',
        icon: 'local_shipping',
        status: isShipped ? 'completed' : escrowStatus === 'funds_held' ? (isFarmer ? 'active' : 'pending') : 'pending',
        timestamp: farmerShippedAt,
        detail: isShipped
            ? (trackingNumber ? `${carrier}: ${trackingNumber}` : 'Package shipped')
            : (isFarmer ? 'Ready to ship' : 'Waiting for farmer to ship'),
    });

    // Step 4: Delivery Confirmed / Funds Released
    if (escrowStatus === 'disputed') {
        steps.push({
            label: 'Disputed',
            icon: 'gavel',
            status: 'error',
            timestamp: disputeCreatedAt,
            detail: disputeReason || 'Under review',
        });
    } else if (escrowStatus === 'refunded') {
        steps.push({
            label: 'Refunded',
            icon: 'replay',
            status: 'error',
            detail: 'Payment refunded to buyer',
        });
    } else {
        steps.push({
            label: isFarmer ? 'Funds Released' : 'Delivery Confirmed',
            icon: 'check_circle',
            status: escrowStatus === 'funds_released' ? 'completed' : escrowStatus === 'shipped_awaiting_confirmation' ? 'active' : 'pending',
            timestamp: fundsReleasedAt || buyerConfirmedAt,
            detail: escrowStatus === 'funds_released'
                ? (isFarmer ? 'Payment transferred to your account' : 'Order complete')
                : escrowStatus === 'shipped_awaiting_confirmation'
                    ? (isFarmer ? 'Waiting for buyer confirmation' : 'Confirm when you receive your order')
                    : 'Pending delivery',
        });
    }

    const statusColors = {
        completed: 'bg-green-500 text-white',
        active: 'bg-primary text-white animate-pulse',
        pending: 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500',
        error: 'bg-red-500 text-white',
    };

    const lineColors = {
        completed: 'bg-green-500',
        active: 'bg-primary/40',
        pending: 'bg-gray-200 dark:bg-gray-700',
        error: 'bg-red-500',
    };

    const textColors = {
        completed: 'text-green-700 dark:text-green-400',
        active: 'text-primary',
        pending: 'text-gray-400 dark:text-gray-500',
        error: 'text-red-600 dark:text-red-400',
    };

    // Estimated delivery helper
    const eddDisplay = (() => {
        if (!estimatedDeliveryDate) return null;
        const edd = new Date(estimatedDeliveryDate + 'T00:00:00');
        const now = new Date();
        const diffDays = Math.ceil((edd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const dateStr = edd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (escrowStatus === 'funds_released') {
            return { text: `Delivered`, sub: dateStr, icon: 'check_circle', color: 'text-green-600 dark:text-green-400' };
        }
        if (diffDays < 0) {
            return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, sub: dateStr, icon: 'warning', color: 'text-amber-600 dark:text-amber-400' };
        }
        if (diffDays === 0) {
            return { text: 'Arriving today', sub: dateStr, icon: 'local_shipping', color: 'text-primary' };
        }
        if (diffDays === 1) {
            return { text: 'Arriving tomorrow', sub: dateStr, icon: 'local_shipping', color: 'text-primary' };
        }
        return { text: `Arriving in ${diffDays} days`, sub: dateStr, icon: 'schedule', color: 'text-gray-600 dark:text-gray-300' };
    })();

    return (
        <div className="space-y-1">
            {/* Estimated Delivery */}
            {eddDisplay && (
                <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <span className={`material-symbols-outlined !text-[18px] ${eddDisplay.color}`}>{eddDisplay.icon}</span>
                    <div>
                        <p className={`text-sm font-bold ${eddDisplay.color}`}>{eddDisplay.text}</p>
                        <p className="text-[10px] text-gray-400">{eddDisplay.sub}</p>
                    </div>
                </div>
            )}

            {steps.map((step, i) => {
                const isLast = i === steps.length - 1;

                return (
                    <div key={i} className="flex gap-3">
                        {/* Timeline Column */}
                        <div className="flex flex-col items-center">
                            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${statusColors[step.status]} transition-all duration-500`}>
                                <span className="material-symbols-outlined !text-[16px]">{step.icon}</span>
                            </div>
                            {!isLast && (
                                <div className={`w-0.5 flex-1 my-1 min-h-[24px] ${lineColors[step.status === 'completed' ? 'completed' : 'pending']} transition-all duration-500`} />
                            )}
                        </div>

                        {/* Content */}
                        <div className={`pb-4 ${isLast ? '' : ''}`}>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${textColors[step.status]}`}>
                                    {step.label}
                                </span>
                                {step.timestamp && (
                                    <span className="text-xs text-gray-400">{formatDate(step.timestamp)}</span>
                                )}
                            </div>
                            {step.detail && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.detail}</p>
                            )}
                            {/* Auto-release countdown on shipped step */}
                            {step.status === 'active' && step.icon === 'check_circle' && autoReleaseAt && (
                                <div className="mt-2">
                                    <AutoReleaseCountdown autoReleaseAt={autoReleaseAt} compact />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
