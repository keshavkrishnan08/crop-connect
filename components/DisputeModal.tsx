"use client";

import { useState } from 'react';

interface DisputeModalProps {
    orderId: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (orderId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
}

export default function DisputeModal({ orderId, isOpen, onClose, onSubmit }: DisputeModalProps) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Please provide a reason for the dispute');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = await onSubmit(orderId, reason.trim());

        if (result.success) {
            setReason('');
            onClose();
        } else {
            setError(result.error || 'Failed to file dispute');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">File a Dispute</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Describe the issue with this order. Our team will review your dispute and take appropriate action.
                </p>

                <form onSubmit={handleSubmit}>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain what went wrong (e.g., item not as described, damaged goods, item not received...)"
                        rows={4}
                        className="input-premium w-full resize-none"
                        disabled={isSubmitting}
                    />

                    {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !reason.trim()}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Filing...' : 'File Dispute'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
