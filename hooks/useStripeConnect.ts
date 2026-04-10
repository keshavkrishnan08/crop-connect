"use client";

import { useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { authFetch } from '@/lib/api-client';

interface StripeConnectState {
    isLoading: boolean;
    error: string | null;
}

export const useStripeConnect = () => {
    const { user } = useAuth();
    const [state, setState] = useState<StripeConnectState>({
        isLoading: false,
        error: null,
    });

    /** Start Stripe Connect onboarding — redirects farmer to Stripe */
    const startOnboarding = useCallback(async () => {
        if (!user?.id) {
            setState(prev => ({ ...prev, error: 'Not authenticated' }));
            return;
        }

        setState({ isLoading: true, error: null });

        try {
            const res = await authFetch('/api/stripe/connect', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to start onboarding');
            }

            // Redirect to Stripe onboarding
            window.location.href = data.url;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to start Stripe onboarding';
            setState({ isLoading: false, error: message });
        }
    }, [user?.id]);

    /** Check if farmer has completed Stripe onboarding */
    const checkOnboardingStatus = useCallback(async (): Promise<{
        connected: boolean;
        payoutsEnabled: boolean;
        chargesEnabled: boolean;
    } | null> => {
        if (!user?.id) return null;

        setState({ isLoading: true, error: null });

        try {
            const res = await authFetch('/api/stripe/connect/status');
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to check status');
            }

            setState({ isLoading: false, error: null });
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to check onboarding status';
            setState({ isLoading: false, error: message });
            return null;
        }
    }, [user?.id]);

    return {
        ...state,
        startOnboarding,
        checkOnboardingStatus,
        clearError: () => setState(prev => ({ ...prev, error: null })),
    };
};
