"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Listing {
    id: string;
    farmer_id: string;
    crop_name: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    status: 'available' | 'pending' | 'sold';
    description: string | null;
    image_url: string | null;
    category: string | null;
    created_at: string;
    updated_at: string;
    farmer?: {
        id: string;
        full_name: string | null;
        farm_name: string | null;
        location: string | null;
        profile_picture: string | null;
        is_verified: boolean;
        bio: string | null;
        crops: string[] | null;
        certifications: string[] | null;
        farming_practices: string[] | null;
        years_farming: number | null;
        farm_size: number | null;
        farm_unit: string | null;
        rating_average: number | null;
        rating_count: number | null;
        stripe_onboarding_complete: boolean | null;
        user_type: string | null;
        crop_score: number | null;
        crop_score_tier: string | null;
    };
}

export interface CreateListingInput {
    crop_name: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    description?: string;
    image_url?: string;
    category?: string;
}

interface UseListingsOptions {
    enableRealtime?: boolean;
    onError?: (error: string) => void;
    onSuccess?: (message: string) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useListings = (options: UseListingsOptions = {}) => {
    const { enableRealtime = false, onError, onSuccess } = options;
    const { user } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefetching, setIsRefetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const fetchModeRef = useRef<'all' | 'my'>('all');
    const listingsLenRef = useRef(0);
    const initialLoadRef = useRef(true);
    listingsLenRef.current = listings.length;
    initialLoadRef.current = isInitialLoading;

    // Helper to handle errors
    const handleError = useCallback((err: unknown, context: string) => {
        const message = err instanceof Error ? err.message : `Failed to ${context}`;
        setError(message);
        onError?.(message);
        return message;
    }, [onError]);

    // Retry wrapper for fetch operations
    const withRetry = useCallback(async <T>(
        operation: () => Promise<T>,
        context: string,
        retries = MAX_RETRIES
    ): Promise<T> => {
        let lastError: unknown;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await operation();
            } catch (err) {
                lastError = err;
                if (attempt < retries) {
                    const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
                    await wait(delay);
                }
            }
        }

        throw lastError;
    }, []);

    // Fetch all available listings (for marketplace)
    const fetchAllListings = useCallback(async (forceRefresh = false) => {
        const isInitial = listingsLenRef.current === 0 && initialLoadRef.current;

        if (isInitial) {
            setIsInitialLoading(true);
        } else {
            setIsRefetching(true);
        }

        setError(null);
        fetchModeRef.current = 'all';

        try {
            const data = await withRetry(async () => {
                const { data, error: fetchError } = await supabase
                    .from('listings')
                    .select(`
                        *,
                        farmer:profiles!farmer_id (
                            id,
                            full_name,
                            farm_name,
                            location,
                            profile_picture,
                            is_verified,
                            bio,
                            crops,
                            certifications,
                            farming_practices,
                            years_farming,
                            farm_size,
                            farm_unit,
                            rating_average,
                            rating_count,
                            stripe_onboarding_complete,
                            user_type:role
                        )
                    `)
                    .eq('status', 'available')
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                return data || [];
            }, 'fetch listings');

            setListings(data);
            setLastFetched(new Date());
        } catch (err) {
            handleError(err, 'fetch listings');
        } finally {
            setIsInitialLoading(false);
            setIsRefetching(false);
        }
    }, [withRetry, handleError]);

    // Fetch farmer's own listings
    const fetchMyListings = useCallback(async () => {
        if (!user?.id) return;

        const isInitial = listingsLenRef.current === 0 && initialLoadRef.current;

        if (isInitial) {
            setIsInitialLoading(true);
        } else {
            setIsRefetching(true);
        }

        setError(null);
        fetchModeRef.current = 'my';

        try {
            const data = await withRetry(async () => {
                const { data, error: fetchError } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('farmer_id', user.id)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                return data || [];
            }, 'fetch my listings');

            setListings(data);
            setLastFetched(new Date());
        } catch (err) {
            handleError(err, 'fetch my listings');
        } finally {
            setIsInitialLoading(false);
            setIsRefetching(false);
        }
    }, [user?.id, withRetry, handleError]);

    // Create a new listing with optimistic update
    const createListing = async (input: CreateListingInput): Promise<{ success: boolean; error?: string; data?: Listing }> => {
        if (!user?.id) {
            const error = 'Not authenticated';
            onError?.(error);
            return { success: false, error };
        }

        // Validate listing guardrails
        if (input.price_per_unit < 0.01 || input.price_per_unit > 100000) {
            return { success: false, error: 'Price must be between $0.01 and $100,000 per unit' };
        }
        if (input.quantity < 0.01 || input.quantity > 10000000) {
            return { success: false, error: 'Quantity must be between 0.01 and 10,000,000' };
        }

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticListing: Listing = {
            id: tempId,
            farmer_id: user.id,
            crop_name: input.crop_name,
            quantity: input.quantity,
            unit: input.unit,
            price_per_unit: input.price_per_unit,
            status: 'available',
            description: input.description || null,
            image_url: input.image_url || null,
            category: input.category || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        setListings(prev => [optimisticListing, ...prev]);

        try {
            const { data, error: createError } = await supabase
                .from('listings')
                .insert({
                    farmer_id: user.id,
                    ...input,
                })
                .select()
                .single();

            if (createError) throw createError;

            // Replace optimistic with real data
            setListings(prev => prev.map(l => l.id === tempId ? data : l));
            onSuccess?.('Listing created successfully');

            return { success: true, data };
        } catch (err) {
            // Rollback optimistic update
            setListings(prev => prev.filter(l => l.id !== tempId));
            const errorMessage = handleError(err, 'create listing');
            return { success: false, error: errorMessage };
        }
    };

    // Update a listing with optimistic update
    const updateListing = async (
        id: string,
        updates: Partial<CreateListingInput> & { status?: Listing['status'] }
    ): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) {
            const error = 'Not authenticated';
            onError?.(error);
            return { success: false, error };
        }

        // Store previous state for rollback
        const previousListings = [...listings];

        // Optimistic update
        setListings(prev => prev.map(l => l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l));

        try {
            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .eq('farmer_id', user.id);

            if (updateError) throw updateError;
            onSuccess?.('Listing updated successfully');

            return { success: true };
        } catch (err) {
            // Rollback
            setListings(previousListings);
            const errorMessage = handleError(err, 'update listing');
            return { success: false, error: errorMessage };
        }
    };

    // Delete a listing with optimistic update
    const deleteListing = async (id: string): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) {
            const error = 'Not authenticated';
            onError?.(error);
            return { success: false, error };
        }

        // Store for rollback
        const previousListings = [...listings];
        const deletedListing = listings.find(l => l.id === id);

        // Optimistic delete
        setListings(prev => prev.filter(l => l.id !== id));

        try {
            const { error: deleteError } = await supabase
                .from('listings')
                .delete()
                .eq('id', id)
                .eq('farmer_id', user.id);

            if (deleteError) throw deleteError;
            onSuccess?.('Listing deleted successfully');

            return { success: true };
        } catch (err) {
            // Rollback
            setListings(previousListings);
            const errorMessage = handleError(err, 'delete listing');
            return { success: false, error: errorMessage };
        }
    };

    // Setup real-time subscription
    useEffect(() => {
        if (!enableRealtime) return;

        const channel = supabase
            .channel('listings-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'listings',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newListing = payload.new as Listing;
                        // Only add if it matches current filter mode
                        if (fetchModeRef.current === 'all' && newListing.status === 'available') {
                            setListings(prev => [newListing, ...prev]);
                        } else if (fetchModeRef.current === 'my' && newListing.farmer_id === user?.id) {
                            setListings(prev => [newListing, ...prev]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new as Listing;
                        setListings(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
                    } else if (payload.eventType === 'DELETE') {
                        const deleted = payload.old as { id: string };
                        setListings(prev => prev.filter(l => l.id !== deleted.id));
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
        };
    }, [enableRealtime, user?.id]);

    // Clear error after timeout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return {
        listings,
        loading: isInitialLoading,
        isRefetching,
        error,
        lastFetched,
        fetchAllListings,
        fetchMyListings,
        createListing,
        updateListing,
        deleteListing,
        clearError: () => setError(null),
    };
};
