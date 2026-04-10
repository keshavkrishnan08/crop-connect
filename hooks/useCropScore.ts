"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { authFetch } from '@/lib/api-client';

export interface CropScoreData {
    score: number;
    tier: string;
    label?: string;
    breakdown?: Record<string, { raw: number; weighted: number; weight: number }>;
}

const TIER_INFO: Record<string, { label: string; color: string; icon: string }> = {
    platinum: { label: 'Elite', color: 'emerald', icon: 'diamond' },
    gold: { label: 'Trusted', color: 'yellow', icon: 'workspace_premium' },
    silver: { label: 'Rising', color: 'gray', icon: 'trending_up' },
    bronze: { label: 'New Member', color: 'amber', icon: 'eco' },
};

export function getTierInfo(tier: string) {
    return TIER_INFO[tier] || TIER_INFO.bronze;
}

export function useCropScore(userId?: string | null) {
    const [data, setData] = useState<CropScoreData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchScore = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);

        try {
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('crop_score, crop_score_tier')
                .eq('id', userId)
                .single();

            if (fetchError) throw fetchError;

            if (profile) {
                setData({
                    score: Number(profile.crop_score) || 0,
                    tier: profile.crop_score_tier || 'bronze',
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch CropScore');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const recalculate = useCallback(async (): Promise<CropScoreData | null> => {
        setLoading(true);
        setError(null);

        try {
            const res = await authFetch('/api/cropscore/calculate', { method: 'POST' });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Recalculation failed');

            const newData: CropScoreData = {
                score: result.score,
                tier: result.tier,
                label: result.label,
                breakdown: result.breakdown,
            };
            setData(newData);
            return newData;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Recalculation failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchScore();
    }, [fetchScore]);

    return { data, loading, error, recalculate, refetch: fetchScore };
}
