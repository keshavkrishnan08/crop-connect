"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export interface InquiryProfile {
    id: string;
    full_name: string | null;
    farm_name: string | null;
    company_name: string | null;
    location: string | null;
    profile_picture: string | null;
    is_verified: boolean;
    role: string | null;
    bio: string | null;
    business_type: string | null;
}

export interface Inquiry {
    id: string;
    sender_id: string;
    receiver_id: string;
    listing_id: string | null;
    request_id: string | null;
    type: 'buy' | 'sell';
    crop_name: string;
    quantity: number;
    unit: string;
    proposed_price: number | null;
    message: string | null;
    delivery_method: string | null;
    delivery_address: string | null;
    image_url: string | null;
    status: 'pending' | 'viewed' | 'accepted' | 'declined';
    created_at: string;
    updated_at: string;
    sender?: InquiryProfile;
    receiver?: InquiryProfile;
}

export interface CreateInquiryInput {
    receiver_id: string;
    listing_id?: string;
    request_id?: string;
    type: 'buy' | 'sell';
    crop_name: string;
    quantity: number;
    unit: string;
    proposed_price?: number;
    message?: string;
    delivery_method?: string;
    delivery_address?: string;
    image_url?: string;
}

const PROFILE_SELECT = `
    id,
    full_name,
    farm_name,
    company_name,
    location,
    profile_picture,
    is_verified,
    role,
    bio,
    business_type
`;

export const useInquiries = () => {
    const { user } = useAuth();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInquiries = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('inquiries')
                .select(`
                    *,
                    sender:profiles!sender_id (${PROFILE_SELECT}),
                    receiver:profiles!receiver_id (${PROFILE_SELECT})
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setInquiries(data || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch inquiries';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const createInquiry = async (input: CreateInquiryInput): Promise<{ success: boolean; error?: string; data?: Inquiry }> => {
        if (!user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const { data, error: createError } = await supabase
                .from('inquiries')
                .insert({
                    sender_id: user.id,
                    receiver_id: input.receiver_id,
                    listing_id: input.listing_id || null,
                    request_id: input.request_id || null,
                    type: input.type,
                    crop_name: input.crop_name,
                    quantity: input.quantity,
                    unit: input.unit,
                    proposed_price: input.proposed_price || null,
                    message: input.message || null,
                    delivery_method: input.delivery_method || null,
                    delivery_address: input.delivery_address || null,
                    image_url: input.image_url || null,
                })
                .select(`
                    *,
                    sender:profiles!sender_id (${PROFILE_SELECT}),
                    receiver:profiles!receiver_id (${PROFILE_SELECT})
                `)
                .single();

            if (createError) throw createError;

            setInquiries(prev => [data, ...prev]);
            return { success: true, data };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create inquiry';
            return { success: false, error: message };
        }
    };

    const updateInquiryStatus = async (
        id: string,
        status: 'viewed' | 'accepted' | 'declined'
    ): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        const previous = [...inquiries];
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status, updated_at: new Date().toISOString() } : i));

        try {
            const { error: updateError } = await supabase
                .from('inquiries')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('receiver_id', user.id);

            if (updateError) throw updateError;
            return { success: true };
        } catch (err) {
            setInquiries(previous);
            const message = err instanceof Error ? err.message : 'Failed to update inquiry';
            const isUniqueViolation = message.includes('idx_one_accepted_per_listing')
                || message.includes('idx_one_accepted_per_request')
                || message.includes('unique constraint')
                || message.includes('duplicate key');
            if (isUniqueViolation) {
                return { success: false, error: 'Another offer for this item is already accepted. Release it first before accepting a new one.' };
            }
            return { success: false, error: message };
        }
    };

    // "Not Now" — receiver reverts an accepted inquiry back to pending
    const releaseInquiry = async (id: string): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        const previous = [...inquiries];
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'pending' as const, updated_at: new Date().toISOString() } : i));

        try {
            const { error: updateError } = await supabase
                .from('inquiries')
                .update({ status: 'pending', updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('receiver_id', user.id)
                .eq('status', 'accepted');

            if (updateError) throw updateError;
            return { success: true };
        } catch (err) {
            setInquiries(previous);
            const message = err instanceof Error ? err.message : 'Failed to release inquiry';
            return { success: false, error: message };
        }
    };

    // Sender withdraws their own pending offer
    const withdrawInquiry = async (id: string): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        const previous = [...inquiries];
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'declined' as const, updated_at: new Date().toISOString() } : i));

        try {
            const { error: updateError } = await supabase
                .from('inquiries')
                .update({ status: 'declined', updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('sender_id', user.id)
                .in('status', ['pending', 'viewed']);

            if (updateError) throw updateError;
            return { success: true };
        } catch (err) {
            setInquiries(previous);
            const message = err instanceof Error ? err.message : 'Failed to withdraw inquiry';
            return { success: false, error: message };
        }
    };

    // Derived data (memoized)
    const incomingInquiries = useMemo(() => inquiries.filter(i => i.receiver_id === user?.id), [inquiries, user?.id]);
    const outgoingInquiries = useMemo(() => inquiries.filter(i => i.sender_id === user?.id), [inquiries, user?.id]);
    const pendingCount = useMemo(() => incomingInquiries.filter(i => i.status === 'pending').length, [incomingInquiries]);

    // Filter helpers for dashboard cards
    const getInquiriesForListing = useCallback((listingId: string) => {
        return inquiries.filter(i => i.listing_id === listingId && i.receiver_id === user?.id);
    }, [inquiries, user?.id]);

    const getInquiriesForRequest = useCallback((requestId: string) => {
        return inquiries.filter(i => i.request_id === requestId && i.receiver_id === user?.id);
    }, [inquiries, user?.id]);

    // Check if a listing/request already has an accepted inquiry
    const hasAcceptedForListing = useCallback((listingId: string | null) => {
        if (!listingId) return false;
        return inquiries.some(i => i.listing_id === listingId && i.status === 'accepted');
    }, [inquiries]);

    const hasAcceptedForRequest = useCallback((requestId: string | null) => {
        if (!requestId) return false;
        return inquiries.some(i => i.request_id === requestId && i.status === 'accepted');
    }, [inquiries]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    // Clear error after timeout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return {
        inquiries,
        incomingInquiries,
        outgoingInquiries,
        pendingCount,
        loading,
        error,
        fetchInquiries,
        createInquiry,
        updateInquiryStatus,
        releaseInquiry,
        withdrawInquiry,
        getInquiriesForListing,
        getInquiriesForRequest,
        hasAcceptedForListing,
        hasAcceptedForRequest,
        clearError: () => setError(null),
    };
};
