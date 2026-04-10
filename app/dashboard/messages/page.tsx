"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useMessages } from "@/hooks/useMessages";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";

export default function MessagesPage() {
    const { user } = useAuth();
    const { profile } = useProfile();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const {
        conversations,
        messages,
        loading,
        messagesLoading,
        fetchConversations,
        fetchMessages,
        sendMessage,
        startConversation,
    } = useMessages();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMobileSidebar, setShowMobileSidebar] = useState(true);
    const [creatingConversation, setCreatingConversation] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const handledUserIdRef = useRef<string | null>(null);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Handle conversationId URL param — auto-select that conversation
    useEffect(() => {
        const convId = searchParams.get("conversationId");
        if (convId && conversations.length > 0) {
            const found = conversations.find(c => c.id === convId);
            if (found) {
                setSelectedId(convId);
                setShowMobileSidebar(false);
            }
        }
    }, [searchParams, conversations]);

    // Handle userId URL param — find or create conversation with that user
    const handleUserIdParam = useCallback(async () => {
        const userId = searchParams.get("userId");
        if (!userId || !user?.id) return;
        // Only handle this userId once to prevent loops
        if (handledUserIdRef.current === userId) return;

        // Check if we already have a conversation with this user
        const existing = conversations.find(c => c.other_participant?.id === userId);
        if (existing) {
            handledUserIdRef.current = userId;
            setSelectedId(existing.id);
            setShowMobileSidebar(false);
            return;
        }

        // Only try to create after conversations have loaded
        if (loading) return;

        // Prevent self-messaging (also checked in hook, but UX is better here)
        if (userId === user.id) {
            handledUserIdRef.current = userId;
            toast("You cannot message yourself", "error");
            return;
        }

        setCreatingConversation(true);
        const result = await startConversation(userId);
        setCreatingConversation(false);

        if (result.success && result.data) {
            handledUserIdRef.current = userId; // Only set ref on success
            await fetchConversations();
            setSelectedId(result.data.id);
            setShowMobileSidebar(false);
        } else {
            // Show error and allow retry by NOT setting handledUserIdRef
            toast(result.error || "Failed to start conversation", "error");
        }
    }, [searchParams, conversations, loading, user?.id, startConversation, fetchConversations, toast]);

    useEffect(() => {
        handleUserIdParam();
    }, [handleUserIdParam]);

    // Select first conversation by default (only when no URL param)
    useEffect(() => {
        const hasParam = searchParams.get("conversationId") || searchParams.get("userId");
        if (conversations.length > 0 && !selectedId && !hasParam) {
            setSelectedId(conversations[0].id);
        }
    }, [conversations, selectedId, searchParams]);

    // Fetch messages when conversation changes
    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId);
        }
    }, [selectedId, fetchMessages]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const filteredConversations = conversations.filter(c => {
        if (!searchQuery.trim()) return true;
        const name = c.other_participant?.full_name?.toLowerCase() || '';
        return name.includes(searchQuery.toLowerCase());
    });

    const activeConv = conversations.find(c => c.id === selectedId);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !selectedId) return;

        const content = inputValue;
        setInputValue("");
        setSending(true);
        await sendMessage(selectedId, content);
        setSending(false);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-transparent">
            {/* Sidebar */}
            <aside className={`${showMobileSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[280px] border-r border-white/20 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden`}>
                <div className="px-4 pt-4 pb-3 space-y-3 shrink-0">
                    <h1 className="text-base font-black text-[#131613] dark:text-white tracking-tighter">Messages</h1>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors !text-[16px]">search</span>
                        <input
                            className="w-full h-8 pl-8 pr-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/10 font-medium text-xs transition-all"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4 space-y-0.5">
                    {loading ? (
                        <div className="py-8 flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="py-8 text-center px-4">
                            <p className="text-gray-400 text-xs">{searchQuery ? 'No matches found' : 'No conversations yet'}</p>
                            {!searchQuery && (
                                <p className="text-gray-300 text-[10px] mt-1">
                                    Message someone from the marketplace to start chatting
                                </p>
                            )}
                        </div>
                    ) : filteredConversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => {
                                setSelectedId(conv.id);
                                setShowMobileSidebar(false);
                            }}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${selectedId === conv.id ? 'bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            <div className="relative shrink-0">
                                {conv.other_participant?.profile_picture ? (
                                    <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${conv.other_participant.profile_picture}")` }}></div>
                                ) : (
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined !text-[20px] text-primary">person</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className={`text-sm font-bold truncate transition-colors ${selectedId === conv.id ? 'text-primary' : 'text-[#131613] dark:text-white'}`}>
                                        {conv.other_participant?.full_name || "Unknown User"}
                                    </h3>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-2 shrink-0">{formatTime(conv.last_message_at)}</span>
                                </div>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${conv.other_participant?.role === 'buyer' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'}`}>
                                    {conv.other_participant?.role === 'buyer' ? 'Buyer' : 'Farmer'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={`${!showMobileSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col overflow-hidden bg-transparent`}>
                {/* Chat Header */}
                <header className="bg-white/60 dark:bg-[#111811]/60 backdrop-blur-2xl border-b border-white/20 dark:border-white/[0.06] px-5 h-14 flex items-center justify-between shrink-0 sticky top-0 z-10">
                    {activeConv ? (
                        <>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowMobileSidebar(true)}
                                    className="md:hidden size-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all text-gray-400"
                                >
                                    <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
                                </button>
                                {activeConv.other_participant?.profile_picture ? (
                                    <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${activeConv.other_participant.profile_picture}")` }}></div>
                                ) : (
                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary !text-[16px]">person</span>
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-[#131613] dark:text-white font-bold text-sm leading-tight">{activeConv.other_participant?.full_name || "Unknown User"}</h2>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                        {activeConv.other_participant?.role === 'buyer' ? 'Buyer' : 'Farmer'}
                                    </span>
                                </div>
                            </div>
                            <button className="size-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all text-gray-400 border border-gray-100 dark:border-white/10">
                                <span className="material-symbols-outlined !text-[18px]">more_horiz</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="md:hidden size-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all text-gray-400"
                            >
                                <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
                            </button>
                            <span className="text-gray-400 text-sm">Select a conversation</span>
                        </div>
                    )}
                </header>

                {/* Messages Feed */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar scroll-smooth">
                    {!activeConv ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="size-14 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-300 mb-3">
                                <span className="material-symbols-outlined !text-[28px]">chat</span>
                            </div>
                            <h3 className="text-sm font-bold text-[#131613] dark:text-white mb-1">No conversation selected</h3>
                            <p className="text-gray-500 dark:text-[#a3b2a4] text-xs">Select a conversation to start messaging</p>
                        </div>
                    ) : messagesLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 py-4 opacity-40">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0">Start of conversation</span>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
                            </div>

                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center text-center py-6">
                                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                                        <span className="material-symbols-outlined !text-[20px]">waving_hand</span>
                                    </div>
                                    <p className="text-gray-500 dark:text-[#a3b2a4] text-xs font-medium">
                                        Say hello to {activeConv.other_participant?.full_name || 'this user'}!
                                    </p>
                                </div>
                            )}

                            {messages.map(msg => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 animate-fade-in ${isMe ? 'flex-row-reverse' : ''}`}>
                                        {isMe ? (
                                            profile?.profile_picture ? (
                                                <div className="size-7 shrink-0 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${profile.profile_picture}")` }}></div>
                                            ) : (
                                                <div className="size-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary !text-[14px]">person</span>
                                                </div>
                                            )
                                        ) : (
                                            activeConv.other_participant?.profile_picture ? (
                                                <div className="size-7 shrink-0 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${activeConv.other_participant.profile_picture}")` }}></div>
                                            ) : (
                                                <div className="size-7 shrink-0 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-gray-400 !text-[14px]">person</span>
                                                </div>
                                            )
                                        )}
                                        <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[60%] ${isMe ? 'items-end' : ''}`}>
                                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm font-medium border ${isMe ? 'bg-gradient-to-br from-primary to-green-600 text-white border-primary rounded-br-sm shadow-colored-green' : 'bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm text-[#131613] dark:text-white border-white/20 dark:border-white/[0.06] rounded-bl-sm'}`}>
                                                <p className="leading-snug">{msg.content}</p>
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1">{formatTime(msg.created_at)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Message Input */}
                {activeConv && (
                    <footer className="px-5 py-3 shrink-0">
                        <div className="card-glass !rounded-2xl px-3 py-1.5 flex items-center gap-2 focus-within:!border-primary/30 focus-within:!shadow-glass-lg">
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-[#131613] dark:text-white font-medium text-sm placeholder:text-gray-300 outline-none ml-2"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                disabled={sending}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={sending || !inputValue.trim()}
                                className="size-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all active:scale-90 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <span className="material-symbols-outlined !text-[18px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">send</span>
                                )}
                            </button>
                        </div>
                    </footer>
                )}
            </main>
        </div>
    );
}
