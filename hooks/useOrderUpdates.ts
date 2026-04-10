"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { authFetch } from '@/lib/api-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface OrderUpdate {
    id: string;
    order_id: string;
    update_type: string;
    message: string | null;
    created_by: string;
    created_at: string;
}

export const ORDER_UPDATE_LABELS: Record<string, string> = {
    order_placed: 'Order Placed',
    payment_received: 'Payment Received',
    preparing: 'Preparing Order',
    packed: 'Packed & Ready',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    delayed: 'Delayed',
    custom: 'Update',
};

export const ORDER_UPDATE_ICONS: Record<string, string> = {
    order_placed: 'receipt_long',
    payment_received: 'payments',
    preparing: 'inventory_2',
    packed: 'package_2',
    picked_up: 'local_shipping',
    in_transit: 'local_shipping',
    out_for_delivery: 'near_me',
    delivered: 'check_circle',
    delayed: 'schedule',
    custom: 'info',
};

export function useOrderUpdates(orderId: string | null) {
    const [updates, setUpdates] = useState<OrderUpdate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const fetchUpdates = useCallback(async () => {
        if (!orderId) return;
        setLoading(true);
        setError(null);

        try {
            const res = await authFetch(`/api/orders/updates?orderId=${orderId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch updates');
            setUpdates(data.updates || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch updates');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const addUpdate = useCallback(async (
        updateType: string,
        message?: string
    ): Promise<{ success: boolean; error?: string }> => {
        if (!orderId) return { success: false, error: 'No order selected' };

        try {
            const res = await authFetch('/api/orders/updates', {
                method: 'POST',
                body: JSON.stringify({ orderId, updateType, message }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add update');

            // Optimistic: add to local state
            if (data.update) {
                setUpdates(prev => [...prev, data.update]);
            }
            return { success: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to add update';
            return { success: false, error: msg };
        }
    }, [orderId]);

    // Fetch on mount / orderId change
    useEffect(() => {
        fetchUpdates();
    }, [fetchUpdates]);

    // Realtime subscription
    useEffect(() => {
        if (!orderId) return;

        const channel = supabase
            .channel(`order-updates-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'order_updates',
                    filter: `order_id=eq.${orderId}`,
                },
                (payload) => {
                    const newUpdate = payload.new as OrderUpdate;
                    setUpdates(prev => {
                        if (prev.some(u => u.id === newUpdate.id)) return prev;
                        return [...prev, newUpdate];
                    });
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
        };
    }, [orderId]);

    return { updates, loading, error, addUpdate, refetch: fetchUpdates };
}
