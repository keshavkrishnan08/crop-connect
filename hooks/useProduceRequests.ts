"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "./useProfile";

export interface ProduceRequest {
    id: string;
    buyer_id: string;
    crop_name: string;
    category: string | null;
    quantity: number;
    unit: string;
    max_price: number | null;
    description: string | null;
    needed_by: string | null;
    status: 'open' | 'fulfilled' | 'cancelled';
    created_at: string;
    updated_at: string;
    buyer?: {
        id: string;
        full_name: string | null;
        company_name: string | null;
        location: string | null;
        profile_picture: string | null;
        email: string | null;
        phone: string | null;
        bio: string | null;
        business_type: string | null;
        years_in_business: number | null;
        average_order_size: string | null;
        preferred_categories: string[] | null;
    };
}

export interface ProduceRequestResponse {
    id: string;
    request_id: string;
    farmer_id: string;
    message: string | null;
    proposed_price: number | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

export function useProduceRequests() {
    const { profile } = useProfile();
    const [requests, setRequests] = useState<ProduceRequest[]>([]);
    const [myResponses, setMyResponses] = useState<ProduceRequestResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all open produce requests (for farmers to view)
    const fetchOpenRequests = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('produce_requests')
                .select(`
                    *,
                    buyer:profiles!buyer_id (
                        id,
                        full_name,
                        company_name,
                        location,
                        profile_picture,
                        email,
                        phone,
                        bio,
                        business_type,
                        years_in_business,
                        average_order_size,
                        preferred_categories
                    )
                `)
                .eq('status', 'open')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setRequests((data as ProduceRequest[]) || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch produce requests');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch requests made by the current buyer
    const fetchMyRequests = useCallback(async () => {
        if (!profile?.id) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('produce_requests')
                .select('*')
                .eq('buyer_id', profile.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setRequests((data as ProduceRequest[]) || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch your requests');
        } finally {
            setLoading(false);
        }
    }, [profile?.id]);

    // Fetch farmer's responses to requests
    const fetchMyResponses = useCallback(async () => {
        if (!profile?.id) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('produce_request_responses')
                .select('*')
                .eq('farmer_id', profile.id);

            if (fetchError) throw fetchError;
            setMyResponses(data || []);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch responses';
            setError(message);
        }
    }, [profile?.id]);

    // Respond to a produce request (for farmers)
    // For now, this creates a conversation/message instead of using a separate responses table
    const respondToRequest = useCallback(async (
        requestId: string,
        message: string,
        proposedPrice?: number
    ) => {
        if (!profile?.id) {
            setError('You must be logged in to respond');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            // Find the request to get the buyer_id
            const request = requests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            // Try to use the responses table first
            const { data, error: insertError } = await supabase
                .from('produce_request_responses')
                .insert({
                    request_id: requestId,
                    farmer_id: profile.id,
                    message,
                    proposed_price: proposedPrice || null,
                    status: 'pending',
                })
                .select()
                .single();

            if (insertError) throw insertError;

            setMyResponses(prev => [...prev, data]);
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to send response');
            return false;
        } finally {
            setLoading(false);
        }
    }, [profile?.id, requests]);

    // Update request status (for buyers)
    const updateRequestStatus = useCallback(async (
        requestId: string,
        status: 'open' | 'fulfilled' | 'cancelled'
    ) => {
        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('produce_requests')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', requestId);

            if (updateError) throw updateError;

            setRequests(prev =>
                prev.map(r => r.id === requestId ? { ...r, status } : r)
            );
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to update request');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Check if farmer has already responded to a request
    const hasRespondedTo = useCallback((requestId: string) => {
        return myResponses.some(r => r.request_id === requestId);
    }, [myResponses]);

    // Get stats for dashboard
    const getStats = useCallback(() => {
        const openRequests = requests.filter(r => r.status === 'open').length;
        const respondedRequests = myResponses.length;
        return { openRequests, respondedRequests };
    }, [requests, myResponses]);

    return {
        requests,
        myResponses,
        loading,
        error,
        fetchOpenRequests,
        fetchMyRequests,
        fetchMyResponses,
        respondToRequest,
        updateRequestStatus,
        hasRespondedTo,
        getStats,
    };
}
