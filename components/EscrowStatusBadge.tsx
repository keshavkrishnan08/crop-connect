"use client";

import { ESCROW_LABELS, ESCROW_COLORS, type EscrowStatus } from '@/lib/escrow-states';

interface EscrowStatusBadgeProps {
    status: EscrowStatus | null;
    className?: string;
}

export default function EscrowStatusBadge({ status, className = '' }: EscrowStatusBadgeProps) {
    const effectiveStatus = status || 'none';
    const label = ESCROW_LABELS[effectiveStatus];
    const color = ESCROW_COLORS[effectiveStatus];

    if (effectiveStatus === 'none') return null;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
            {effectiveStatus === 'funds_held' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
            )}
            {effectiveStatus === 'funds_released' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            )}
            {effectiveStatus === 'disputed' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            )}
            {label}
        </span>
    );
}
