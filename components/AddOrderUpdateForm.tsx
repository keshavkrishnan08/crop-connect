"use client";

import { useState } from 'react';
import { ORDER_UPDATE_LABELS } from '@/hooks/useOrderUpdates';

interface AddOrderUpdateFormProps {
    onSubmit: (updateType: string, message?: string) => Promise<{ success: boolean; error?: string }>;
    orderStatus?: string;
    escrowStatus?: string | null;
    disabled?: boolean;
}

// Which update types are available based on order state
function getAvailableUpdateTypes(escrowStatus: string | null | undefined): string[] {
    switch (escrowStatus) {
        case 'funds_held':
            return ['preparing', 'packed', 'delayed', 'custom'];
        case 'shipped_awaiting_confirmation':
            return ['picked_up', 'in_transit', 'out_for_delivery', 'delayed', 'custom'];
        default:
            return ['custom'];
    }
}

export default function AddOrderUpdateForm({ onSubmit, escrowStatus, disabled }: AddOrderUpdateFormProps) {
    const [updateType, setUpdateType] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const availableTypes = getAvailableUpdateTypes(escrowStatus);

    const handleSubmit = async () => {
        if (!updateType) return;
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        const result = await onSubmit(updateType, message || undefined);

        if (result.success) {
            setSuccess(true);
            setUpdateType('');
            setMessage('');
            setTimeout(() => setSuccess(false), 3000);
        } else {
            setError(result.error || 'Failed to add update');
        }
        setSubmitting(false);
    };

    if (availableTypes.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary !text-[18px]">edit_note</span>
                <span className="text-sm font-bold text-[#131613] dark:text-white">Post Update to Buyer</span>
            </div>

            <select
                value={updateType}
                onChange={e => setUpdateType(e.target.value)}
                disabled={disabled || submitting}
                className="select-premium w-full text-sm"
            >
                <option value="">Select update type...</option>
                {availableTypes.map(type => (
                    <option key={type} value={type}>
                        {ORDER_UPDATE_LABELS[type] || type}
                    </option>
                ))}
            </select>

            <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Optional message for the buyer..."
                disabled={disabled || submitting}
                rows={2}
                className="input-premium w-full text-sm resize-none"
            />

            <div className="flex items-center gap-2">
                <button
                    onClick={handleSubmit}
                    disabled={!updateType || submitting || disabled}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {submitting ? 'Posting...' : 'Post Update'}
                </button>

                {success && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <span className="material-symbols-outlined !text-[14px]">check_circle</span>
                        Update posted
                    </span>
                )}

                {error && (
                    <span className="text-xs text-red-500">{error}</span>
                )}
            </div>
        </div>
    );
}
