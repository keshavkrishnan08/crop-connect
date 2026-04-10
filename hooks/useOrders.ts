"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Order {
    id: string;
    buyer_id: string;
    listing_id: string | null;
    farmer_id: string;
    inquiry_id: string | null;
    quantity: number;
    total_price: number;
    status: 'pending' | 'awaiting_payment' | 'funds_held' | 'confirmed' | 'shipped' | 'delivered' | 'funds_released' | 'disputed' | 'cancelled' | 'payment_failed' | 'refunded';
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Escrow fields
    escrow_status: 'none' | 'awaiting_payment' | 'funds_held' | 'shipped_awaiting_confirmation' | 'funds_released' | 'disputed' | 'payment_failed' | 'refunded' | null;
    stripe_payment_intent_id: string | null;
    stripe_transfer_id: string | null;
    platform_fee_amount: number | null;
    farmer_payout_amount: number | null;
    farmer_shipped_at: string | null;
    buyer_confirmed_at: string | null;
    funds_released_at: string | null;
    auto_release_at: string | null;
    dispute_reason: string | null;
    dispute_created_at: string | null;
    tracking_number: string | null;
    carrier: string | null;
    estimated_delivery_date: string | null;
    listing?: {
        id: string;
        crop_name: string;
        unit: string;
        price_per_unit: number;
        image_url: string | null;
    };
    buyer?: {
        id: string;
        full_name: string | null;
        location: string | null;
        profile_picture: string | null;
        company_name: string | null;
        delivery_address: string | null;
        phone: string | null;
        email: string | null;
    };
    farmer?: {
        id: string;
        full_name: string | null;
        farm_name: string | null;
        location: string | null;
        profile_picture: string | null;
        farm_address: string | null;
        phone: string | null;
        email: string | null;
    };
}

export interface CreateOrderInput {
    buyer_id?: string;
    listing_id?: string | null;
    farmer_id: string;
    quantity: number;
    total_price: number;
    notes?: string;
    inquiry_id?: string;
}

interface UseOrdersOptions {
    enableRealtime?: boolean;
    onError?: (error: string) => void;
    onSuccess?: (message: string) => void;
    onNewOrder?: (order: Order) => void;
    onStatusChange?: (order: Order, previousStatus: string) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useOrders = (options: UseOrdersOptions = {}) => {
    const { enableRealtime = false, onError, onSuccess, onNewOrder, onStatusChange } = options;
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefetching, setIsRefetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const userRoleRef = useRef<'buyer' | 'farmer'>('buyer');
    const ordersLenRef = useRef(0);
    const initialLoadRef = useRef(true);
    ordersLenRef.current = orders.length;
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

    // Fetch orders for buyer
    const fetchBuyerOrders = useCallback(async () => {
        if (!user?.id) return;

        const isInitial = ordersLenRef.current === 0 && initialLoadRef.current;

        if (isInitial) {
            setIsInitialLoading(true);
        } else {
            setIsRefetching(true);
        }

        setError(null);
        userRoleRef.current = 'buyer';

        try {
            const data = await withRetry(async () => {
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        listing:listings (
                            id,
                            crop_name,
                            unit,
                            price_per_unit,
                            image_url
                        ),
                        farmer:profiles!farmer_id (
                            id,
                            full_name,
                            farm_name,
                            location,
                            profile_picture,
                            farm_address,
                            phone,
                            email
                        )
                    `)
                    .eq('buyer_id', user.id)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                return data || [];
            }, 'fetch buyer orders');

            setOrders(data);
            setLastFetched(new Date());
        } catch (err) {
            handleError(err, 'fetch buyer orders');
        } finally {
            setIsInitialLoading(false);
            setIsRefetching(false);
        }
    }, [user?.id, withRetry, handleError]);

    // Fetch orders for farmer
    const fetchFarmerOrders = useCallback(async () => {
        if (!user?.id) return;

        const isInitial = ordersLenRef.current === 0 && initialLoadRef.current;

        if (isInitial) {
            setIsInitialLoading(true);
        } else {
            setIsRefetching(true);
        }

        setError(null);
        userRoleRef.current = 'farmer';

        try {
            const data = await withRetry(async () => {
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        listing:listings (
                            id,
                            crop_name,
                            unit,
                            price_per_unit,
                            image_url
                        ),
                        buyer:profiles!buyer_id (
                            id,
                            full_name,
                            location,
                            profile_picture,
                            company_name,
                            delivery_address,
                            phone,
                            email
                        )
                    `)
                    .eq('farmer_id', user.id)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                return data || [];
            }, 'fetch farmer orders');

            setOrders(data);
            setLastFetched(new Date());
        } catch (err) {
            handleError(err, 'fetch farmer orders');
        } finally {
            setIsInitialLoading(false);
            setIsRefetching(false);
        }
    }, [user?.id, withRetry, handleError]);

    // Create a new order with optimistic update
    const createOrder = async (input: CreateOrderInput): Promise<{ success: boolean; error?: string; data?: Order }> => {
        if (!user?.id) {
            const error = 'Not authenticated';
            onError?.(error);
            return { success: false, error };
        }

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const effectiveBuyerId = input.buyer_id || user.id;
        const optimisticOrder: Order = {
            id: tempId,
            buyer_id: effectiveBuyerId,
            listing_id: input.listing_id || null,
            farmer_id: input.farmer_id,
            inquiry_id: input.inquiry_id || null,
            quantity: input.quantity,
            total_price: input.total_price,
            status: 'pending',
            notes: input.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            escrow_status: null,
            stripe_payment_intent_id: null,
            stripe_transfer_id: null,
            platform_fee_amount: null,
            farmer_payout_amount: null,
            farmer_shipped_at: null,
            buyer_confirmed_at: null,
            funds_released_at: null,
            auto_release_at: null,
            dispute_reason: null,
            dispute_created_at: null,
            tracking_number: null,
            carrier: null,
            estimated_delivery_date: null,
        };

        setOrders(prev => [optimisticOrder, ...prev]);

        try {
            const { data, error: createError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: effectiveBuyerId,
                    listing_id: input.listing_id || null,
                    farmer_id: input.farmer_id,
                    quantity: input.quantity,
                    total_price: input.total_price,
                    notes: input.notes || null,
                    inquiry_id: input.inquiry_id || null,
                })
                .select()
                .single();

            if (createError) throw createError;

            // Replace optimistic with real data
            setOrders(prev => prev.map(o => o.id === tempId ? data : o));
            onSuccess?.('Order placed successfully');

            return { success: true, data };
        } catch (err) {
            // Rollback
            setOrders(prev => prev.filter(o => o.id !== tempId));
            const errorMessage = handleError(err, 'create order');
            return { success: false, error: errorMessage };
        }
    };

    // Update order status with optimistic update
    const updateOrderStatus = async (id: string, status: Order['status']): Promise<{ success: boolean; error?: string }> => {
        if (!user?.id) {
            const error = 'Not authenticated';
            onError?.(error);
            return { success: false, error };
        }

        // Store previous state
        const previousOrders = [...orders];
        const orderToUpdate = orders.find(o => o.id === id);
        const previousStatus = orderToUpdate?.status;

        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o));

        try {
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            onSuccess?.(`Order ${status}`);
            if (orderToUpdate && previousStatus && onStatusChange) {
                onStatusChange({ ...orderToUpdate, status }, previousStatus);
            }

            return { success: true };
        } catch (err) {
            // Rollback
            setOrders(previousOrders);
            const errorMessage = handleError(err, 'update order');
            return { success: false, error: errorMessage };
        }
    };

    // Cancel order
    const cancelOrder = async (id: string): Promise<{ success: boolean; error?: string }> => {
        return updateOrderStatus(id, 'cancelled');
    };

    // Get order statistics
    const getStats = useCallback(() => {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
        const shippedOrders = orders.filter(o => o.status === 'shipped').length;
        const completedOrders = orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
        const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

        const totalRevenue = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total_price, 0);

        const averageOrderValue = totalOrders > 0 ? totalRevenue / (totalOrders - cancelledOrders || 1) : 0;

        return {
            totalOrders,
            pendingOrders,
            confirmedOrders,
            shippedOrders,
            completedOrders,
            cancelledOrders,
            activeOrders,
            totalRevenue,
            averageOrderValue,
        };
    }, [orders]);

    // Get order by ID
    const getOrderById = useCallback((id: string) => {
        return orders.find(o => o.id === id);
    }, [orders]);

    // Setup real-time subscription
    useEffect(() => {
        if (!enableRealtime || !user?.id) return;

        const channel = supabase
            .channel('orders-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newOrder = payload.new as Order;
                        // Check if this order is relevant to current user
                        const isRelevant = userRoleRef.current === 'buyer'
                            ? newOrder.buyer_id === user.id
                            : newOrder.farmer_id === user.id;

                        if (isRelevant) {
                            setOrders(prev => [newOrder, ...prev]);
                            onNewOrder?.(newOrder);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new as Order;
                        const old = payload.old as Order;

                        setOrders(prev => {
                            const existing = prev.find(o => o.id === updated.id);
                            if (existing && existing.status !== updated.status && onStatusChange) {
                                onStatusChange(updated, old.status);
                            }
                            return prev.map(o => o.id === updated.id ? { ...o, ...updated } : o);
                        });
                    } else if (payload.eventType === 'DELETE') {
                        const deleted = payload.old as { id: string };
                        setOrders(prev => prev.filter(o => o.id !== deleted.id));
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
        };
    }, [enableRealtime, user?.id, onNewOrder, onStatusChange]);

    // Clear error after timeout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return {
        orders,
        loading: isInitialLoading,
        isRefetching,
        error,
        lastFetched,
        fetchBuyerOrders,
        fetchFarmerOrders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        getStats,
        getOrderById,
        clearError: () => setError(null),
    };
};
