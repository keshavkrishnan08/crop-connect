"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    farm_name: string | null;
    location: string | null;
    farm_size: string | null;
    farm_unit: string | null;
    year_established: number | null;
    crops: string[] | null;
    role: 'farmer' | 'buyer' | null;
    profile_picture: string | null;
    bio: string | null;
    delivery_radius: number | null;
    preferred_categories: string[] | null;
    is_verified: boolean;
    updated_at: string;
    // Buyer-specific fields
    company_name: string | null;
    company_address: string | null;
    delivery_address: string | null;
    business_type: string | null;
    years_in_business: number | null;
    average_order_size: string | null;
    business_photos: string[] | null;
    // Farmer-specific fields
    farm_address: string | null;
    years_farming: number | null;
    website: string | null;
    certifications: string[] | null;
    farming_practices: string[] | null;
    crops_grown: string | null;
    payment_methods: string[] | null;
    operating_hours: string | null;
    seasonal_availability: string | null;
    farm_photos: string[] | null;
    // Stripe Connect fields
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean;
    // CropScore fields
    crop_score: number;
    crop_score_tier: string;
    crop_score_updated_at: string | null;
}

interface UseProfileOptions {
    enableRealtime?: boolean;
    onError?: (error: string) => void;
    onSuccess?: (message: string) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useProfile = (options: UseProfileOptions = {}) => {
    const { enableRealtime = false, onError, onSuccess } = options;
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefetching, setIsRefetching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const profileRef = useRef(profile);
    const initialLoadRef = useRef(isInitialLoading);
    profileRef.current = profile;
    initialLoadRef.current = isInitialLoading;

    // Helper to handle errors
    const handleError = useCallback((err: unknown, context: string) => {
        const message = err instanceof Error ? err.message : `Failed to ${context}`;
        setError(message);
        onError?.(message);
        return message;
    }, [onError]);

    // Retry wrapper
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

    const fetchProfile = useCallback(async (forceRefresh = false) => {
        if (!user?.id) {
            setProfile(null);
            setIsInitialLoading(false);
            return;
        }

        const isInitial = profileRef.current === null && initialLoadRef.current;

        if (isInitial) {
            setIsInitialLoading(true);
        } else if (forceRefresh) {
            setIsRefetching(true);
        }

        setError(null);

        try {
            const data = await withRetry(async () => {
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (fetchError) {
                    // PGRST116 means no rows returned - profile doesn't exist yet
                    if (fetchError.code === 'PGRST116') {
                        return null;
                    }
                    throw fetchError;
                }
                return data;
            }, 'fetch profile');

            setProfile(data);
            setLastFetched(new Date());
        } catch (err) {
            handleError(err, 'fetch profile');
        } finally {
            setIsInitialLoading(false);
            setIsRefetching(false);
        }
    }, [user?.id, withRetry, handleError]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) {
            const error = 'No user logged in';
            onError?.(error);
            return { success: false, error };
        }

        setIsSaving(true);
        setError(null);

        // Store previous profile for rollback
        const previousProfile = profile;

        // Optimistic update
        setProfile(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...updates,
                    updated_at: new Date().toISOString(),
                });

            if (updateError) throw updateError;

            // Refresh to get server state
            await fetchProfile(true);
            onSuccess?.('Profile updated successfully');

            return { success: true };
        } catch (err) {
            // Rollback
            setProfile(previousProfile);
            const errorMessage = handleError(err, 'update profile');
            return { success: false, error: errorMessage };
        } finally {
            setIsSaving(false);
        }
    };

    // Upload profile picture
    const uploadProfilePicture = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
        if (!user?.id) {
            const error = 'No user logged in';
            onError?.(error);
            return { success: false, error };
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile with new picture URL
            const result = await updateProfile({ profile_picture: publicUrl });

            if (result.success) {
                return { success: true, url: publicUrl };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = handleError(err, 'upload profile picture');
            return { success: false, error: errorMessage };
        }
    };

    // Upload farm/business photos
    const uploadPhoto = async (file: File, bucket: 'avatars' | 'crops' = 'crops'): Promise<{ success: boolean; url?: string; error?: string }> => {
        if (!user?.id) {
            const error = 'No user logged in';
            onError?.(error);
            return { success: false, error };
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return { success: true, url: publicUrl };
        } catch (err) {
            const errorMessage = handleError(err, 'upload photo');
            return { success: false, error: errorMessage };
        }
    };

    // Check if profile is complete
    const isProfileComplete = useCallback(() => {
        if (!profile) return false;

        const requiredFields = ['full_name', 'role'];
        const hasRequired = requiredFields.every(field => profile[field as keyof Profile]);

        if (profile.role === 'farmer') {
            return hasRequired && !!profile.farm_name && !!profile.location;
        } else if (profile.role === 'buyer') {
            return hasRequired && !!profile.location;
        }

        return hasRequired;
    }, [profile]);

    // Get profile completion percentage
    const getProfileCompletion = useCallback(() => {
        if (!profile) return 0;

        const baseFields = ['full_name', 'email', 'phone', 'location', 'bio', 'profile_picture'];
        const farmerFields = ['farm_name', 'farm_size', 'farm_address', 'crops_grown', 'certifications'];
        const buyerFields = ['company_name', 'company_address', 'delivery_address', 'business_type'];

        const fields = profile.role === 'farmer'
            ? [...baseFields, ...farmerFields]
            : [...baseFields, ...buyerFields];

        const filledFields = fields.filter(field => {
            const value = profile[field as keyof Profile];
            if (Array.isArray(value)) return value.length > 0;
            return !!value;
        });

        return Math.round((filledFields.length / fields.length) * 100);
    }, [profile]);

    // Setup real-time subscription
    useEffect(() => {
        if (!enableRealtime || !user?.id) return;

        const channel = supabase
            .channel('profile-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`,
                },
                (payload) => {
                    const updated = payload.new as Profile;
                    setProfile(updated);
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
        profile,
        loading: isInitialLoading,
        isRefetching,
        isSaving,
        error,
        lastFetched,
        updateProfile,
        uploadProfilePicture,
        uploadPhoto,
        refreshProfile: () => fetchProfile(true),
        isProfileComplete,
        getProfileCompletion,
        clearError: () => setError(null),
    };
};
