"use client";

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export interface Review {
    id: string;
    order_id: string;
    reviewer_id: string;
    reviewed_user_id: string;
    rating: number;
    title: string | null;
    review_text: string | null;
    created_at: string;
    reviewer?: {
        id: string;
        full_name: string | null;
        profile_picture: string | null;
        company_name: string | null;
        farm_name: string | null;
        user_type: string | null;
    };
}

export interface ReviewStats {
    average: number;
    count: number;
    distribution: Record<number, number>; // { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
}

export const useReviews = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const fetchReviewsForUser = useCallback(async (userId: string, page = 0, limit = 10): Promise<{ reviews: Review[]; total: number }> => {
        const from = page * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('reviews')
            .select(`
                *,
                reviewer:profiles!reviewer_id (
                    id,
                    full_name,
                    profile_picture,
                    company_name,
                    farm_name,
                    user_type:role
                )
            `, { count: 'exact' })
            .eq('reviewed_user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            return { reviews: [], total: 0 };
        }

        return { reviews: data || [], total: count || 0 };
    }, []);

    const fetchReviewStats = useCallback(async (userId: string): Promise<ReviewStats> => {
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewed_user_id', userId);

        if (error || !data?.length) {
            return { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
        }

        const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let sum = 0;
        for (const r of data) {
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            sum += r.rating;
        }

        return {
            average: sum / data.length,
            count: data.length,
            distribution,
        };
    }, []);

    const canReviewOrder = useCallback(async (orderId: string): Promise<boolean> => {
        if (!user?.id) return false;

        // Check order is in funds_released state
        const { data: order } = await supabase
            .from('orders')
            .select('escrow_status')
            .eq('id', orderId)
            .single();

        if (!order || order.escrow_status !== 'funds_released') return false;

        // Check user hasn't already reviewed this order
        const { data: existing } = await supabase
            .from('reviews')
            .select('id')
            .eq('order_id', orderId)
            .eq('reviewer_id', user.id)
            .maybeSingle();

        return !existing;
    }, [user?.id]);

    const submitReview = useCallback(async (
        orderId: string,
        reviewedUserId: string,
        rating: number,
        title?: string,
        reviewText?: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) return { success: false, error: 'Not authenticated' };

        setLoading(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    order_id: orderId,
                    reviewer_id: user.id,
                    reviewed_user_id: reviewedUserId,
                    rating,
                    title: title || null,
                    review_text: reviewText || null,
                });

            if (error) throw error;
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to submit review';
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const hasReviewedOrder = useCallback(async (orderId: string): Promise<boolean> => {
        if (!user?.id) return false;

        const { data } = await supabase
            .from('reviews')
            .select('id')
            .eq('order_id', orderId)
            .eq('reviewer_id', user.id)
            .maybeSingle();

        return !!data;
    }, [user?.id]);

    return {
        loading,
        fetchReviewsForUser,
        fetchReviewStats,
        canReviewOrder,
        submitReview,
        hasReviewedOrder,
    };
};
