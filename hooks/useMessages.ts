"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Request deduplication flag
let isFetchingConversations = false;

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    read: boolean;
    created_at: string;
    sender?: {
        id: string;
        full_name: string | null;
        profile_picture: string | null;
    };
}

export interface Conversation {
    id: string;
    participant_1: string;
    participant_2: string;
    last_message_at: string;
    created_at: string;
    other_participant?: {
        id: string;
        full_name: string | null;
        profile_picture: string | null;
        role: 'farmer' | 'buyer' | null;
    };
    last_message?: Message;
    unread_count?: number;
}

export const useMessages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const activeConversationRef = useRef<string | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const convChannelRef = useRef<RealtimeChannel | null>(null);

    // Fetch all conversations for the current user (with deduplication)
    const fetchConversations = useCallback(async () => {
        if (!user?.id) return;

        // Prevent duplicate concurrent requests
        if (isFetchingConversations) return;
        isFetchingConversations = true;

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('conversations')
                .select(`
                    *,
                    participant_1_profile:profiles!participant_1 (
                        id,
                        full_name,
                        profile_picture,
                        role
                    ),
                    participant_2_profile:profiles!participant_2 (
                        id,
                        full_name,
                        profile_picture,
                        role
                    )
                `)
                .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
                .order('last_message_at', { ascending: false });

            if (fetchError) throw fetchError;

            const processed = (data || []).map(conv => {
                const isParticipant1 = conv.participant_1 === user.id;
                const otherParticipant = isParticipant1
                    ? conv.participant_2_profile
                    : conv.participant_1_profile;

                return {
                    ...conv,
                    other_participant: otherParticipant,
                };
            });

            setConversations(processed);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
        } finally {
            setLoading(false);
            isFetchingConversations = false;
        }
    }, [user?.id]);

    // Fetch messages for a specific conversation
    const fetchMessages = useCallback(async (conversationId: string) => {
        if (!user?.id) return;
        activeConversationRef.current = conversationId;

        try {
            setMessagesLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id (
                        id,
                        full_name,
                        profile_picture
                    )
                `)
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;
            setMessages(data || []);

            // Mark messages as read
            await supabase
                .from('messages')
                .update({ read: true })
                .eq('conversation_id', conversationId)
                .neq('sender_id', user.id);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        } finally {
            setMessagesLoading(false);
        }
    }, [user?.id]);

    // Send a message
    const sendMessage = async (conversationId: string, content: string): Promise<{ success: boolean; error?: string; data?: Message }> => {
        if (!user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const { data, error: sendError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content,
                })
                .select(`
                    *,
                    sender:profiles!sender_id (
                        id,
                        full_name,
                        profile_picture
                    )
                `)
                .single();

            if (sendError) throw sendError;

            // Update local state immediately (real-time will also fire but we dedupe)
            setMessages(prev => {
                if (prev.some(m => m.id === data.id)) return prev;
                return [...prev, data];
            });

            return { success: true, data };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' };
        }
    };

    // Start a new conversation
    const startConversation = useCallback(async (otherUserId: string, inquiryId?: string): Promise<{ success: boolean; error?: string; data?: Conversation }> => {
        if (!user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        // Prevent self-messaging
        if (otherUserId === user.id) {
            return { success: false, error: 'You cannot message yourself' };
        }

        // Validate otherUserId is provided
        if (!otherUserId || otherUserId.trim() === '') {
            return { success: false, error: 'Invalid user ID' };
        }

        try {
            // Check if conversation already exists
            const { data: existing } = await supabase
                .from('conversations')
                .select('*')
                .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
                .single();

            if (existing) {
                if (inquiryId && !existing.inquiry_id) {
                    await supabase
                        .from('conversations')
                        .update({ inquiry_id: inquiryId })
                        .eq('id', existing.id);
                }
                return { success: true, data: existing };
            }

            // Create new conversation
            const { data, error: createError } = await supabase
                .from('conversations')
                .insert({
                    participant_1: user.id,
                    participant_2: otherUserId,
                    inquiry_id: inquiryId || null,
                })
                .select()
                .single();

            if (createError) throw createError;

            return { success: true, data };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to start conversation' };
        }
    }, [user?.id]);

    // Find a conversation by the other user's ID
    const findConversationByUserId = useCallback((otherUserId: string) => {
        return conversations.find(c =>
            c.other_participant?.id === otherUserId
        ) || null;
    }, [conversations]);

    // Get unread message count
    const getUnreadCount = useCallback(async (): Promise<number> => {
        if (!user?.id) return 0;

        try {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .neq('sender_id', user.id)
                .eq('read', false);

            return count || 0;
        } catch (err) {
            return 0;
        }
    }, [user?.id]);

    // Real-time subscription for messages in the active conversation
    useEffect(() => {
        if (!user?.id) return;

        // Clean up previous channel
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }

        // Subscribe to all messages where the user is involved
        // We filter client-side to only show messages for the active conversation
        const channel = supabase
            .channel('messages-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    const newMsg = payload.new as { id: string; conversation_id: string; sender_id: string; content: string; read: boolean; created_at: string };

                    // Only add to state if it's for the active conversation
                    if (newMsg.conversation_id === activeConversationRef.current) {
                        // Don't duplicate messages we sent ourselves (already added optimistically)
                        if (newMsg.sender_id === user.id) return;

                        // Fetch the full message with sender profile
                        const { data } = await supabase
                            .from('messages')
                            .select(`
                                *,
                                sender:profiles!sender_id (
                                    id,
                                    full_name,
                                    profile_picture
                                )
                            `)
                            .eq('id', newMsg.id)
                            .single();

                        if (data) {
                            setMessages(prev => {
                                if (prev.some(m => m.id === data.id)) return prev;
                                return [...prev, data];
                            });

                            // Mark as read since we're viewing this conversation
                            await supabase
                                .from('messages')
                                .update({ read: true })
                                .eq('id', data.id);
                        }
                    }

                    // Refresh conversations list to update last_message_at ordering
                    fetchConversations();
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [user?.id, fetchConversations]);

    // Real-time subscription for conversation updates (new conversations, timestamp changes)
    useEffect(() => {
        if (!user?.id) return;

        if (convChannelRef.current) {
            supabase.removeChannel(convChannelRef.current);
            convChannelRef.current = null;
        }

        const channel = supabase
            .channel('conversations-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                },
                () => {
                    // Refresh conversations whenever any conversation changes
                    fetchConversations();
                }
            )
            .subscribe();

        convChannelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            convChannelRef.current = null;
        };
    }, [user?.id, fetchConversations]);

    // Auto-clear errors after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return {
        conversations,
        messages,
        loading,
        messagesLoading,
        error,
        fetchConversations,
        fetchMessages,
        sendMessage,
        startConversation,
        findConversationByUserId,
        getUnreadCount,
    };
};
