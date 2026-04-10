"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useInquiries, Inquiry, InquiryProfile } from "@/hooks/useInquiries";
import { useMessages } from "@/hooks/useMessages";

interface ListingData {
    id: string;
    crop_name: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    image_url: string | null;
    category: string | null;
}

interface RequestData {
    id: string;
    crop_name: string;
    quantity: number;
    unit: string;
    max_price: number | null;
    category: string | null;
}

const PROFILE_SELECT = `
    id, full_name, farm_name, company_name, location, profile_picture,
    is_verified, role, bio, business_type
`;

export default function InquiryCheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { updateInquiryStatus, releaseInquiry } = useInquiries();
    const { startConversation } = useMessages();

    const inquiryId = params.id as string;

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [listing, setListing] = useState<ListingData | null>(null);
    const [request, setRequest] = useState<RequestData | null>(null);
    const [otherParty, setOtherParty] = useState<InquiryProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReceiver, setIsReceiver] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!inquiryId || !user?.id) return;

            setLoading(true);
            setError(null);

            try {
                const { data: inquiryData, error: inquiryError } = await supabase
                    .from('inquiries')
                    .select(`
                        *,
                        sender:profiles!sender_id (${PROFILE_SELECT}),
                        receiver:profiles!receiver_id (${PROFILE_SELECT})
                    `)
                    .eq('id', inquiryId)
                    .single();

                if (inquiryError) throw inquiryError;
                setInquiry(inquiryData);

                const userIsReceiver = inquiryData.receiver_id === user.id;
                setIsReceiver(userIsReceiver);
                setOtherParty(userIsReceiver ? inquiryData.sender : inquiryData.receiver);

                // Fetch listing or request data
                if (inquiryData.listing_id) {
                    const { data: listingData } = await supabase
                        .from('listings')
                        .select('id, crop_name, quantity, unit, price_per_unit, image_url, category')
                        .eq('id', inquiryData.listing_id)
                        .single();
                    setListing(listingData);
                }

                if (inquiryData.request_id) {
                    const { data: requestData } = await supabase
                        .from('produce_requests')
                        .select('id, crop_name, quantity, unit, max_price, category')
                        .eq('id', inquiryData.request_id)
                        .single();
                    setRequest(requestData);
                }
            } catch (err) {
                setError('Failed to load inquiry details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [inquiryId, user?.id]);

    const handleAgree = async () => {
        if (!inquiry || !otherParty) return;

        setSubmitting(true);
        setError(null);

        try {
            // 1. Accept the inquiry
            const result = await updateInquiryStatus(inquiry.id, 'accepted');
            if (!result.success) {
                setError(result.error || 'Failed to accept inquiry');
                setSubmitting(false);
                return;
            }

            // 2. If current user is buyer (accepting a supply offer), go to payment
            if (inquiry.type === 'sell' && isReceiver) {
                router.push(`/dashboard/inquiry/${inquiry.id}/payment`);
                return;
            }

            // 3. Otherwise create conversation and go to messages
            const convResult = await startConversation(otherParty.id, inquiry.id);
            if (!convResult.success || !convResult.data) {
                router.push('/dashboard/messages');
                return;
            }

            router.push(`/dashboard/messages?conversationId=${convResult.data.id}`);
        } catch {
            setError('Something went wrong. Please try again.');
            setSubmitting(false);
        }
    };

    const handleDecline = async () => {
        if (!inquiry) return;

        setSubmitting(true);
        const result = await updateInquiryStatus(inquiry.id, 'declined');
        if (result.success) {
            const dashPath = inquiry.type === 'buy' ? '/dashboard/farmer' : '/dashboard/buyer';
            router.push(dashPath);
        } else {
            setError(result.error || 'Failed to decline inquiry');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary animate-pulse">
                        <span className="material-symbols-outlined text-3xl">hourglass_empty</span>
                    </div>
                    <p className="text-gray-500 text-sm">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (!inquiry || error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                    <span className="material-symbols-outlined text-red-400 !text-[48px] mb-4 block">error</span>
                    <h2 className="text-xl font-bold text-[#131613] dark:text-white mb-2">Cannot Load Inquiry</h2>
                    <p className="text-gray-500 mb-6">{error || 'Inquiry not found.'}</p>
                    <button onClick={() => router.back()} className="px-6 py-3 bg-primary text-white font-bold rounded-xl">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const isBuy = inquiry.type === 'buy';
    const imageUrl = listing?.image_url;
    const otherName = otherParty?.farm_name || otherParty?.company_name || otherParty?.full_name || 'Unknown';
    const totalEstimate = inquiry.proposed_price ? (inquiry.proposed_price * inquiry.quantity).toFixed(2) : null;

    // If already accepted/declined, show status
    if (inquiry.status !== 'pending') {
        const showPaymentCTA = isBuy && !isReceiver && inquiry.status === 'accepted';

        return (
            <div className="max-w-2xl mx-auto p-6 pb-12">
                <div className="bg-white dark:bg-[#1a2c15] rounded-3xl shadow-lg p-8 text-center">
                    <div className={`size-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        inquiry.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-white/10'
                    }`}>
                        <span className={`material-symbols-outlined !text-[40px] ${
                            inquiry.status === 'accepted' ? 'text-green-500' : 'text-gray-400'
                        }`}>
                            {inquiry.status === 'accepted' ? 'check_circle' : 'cancel'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-[#131613] dark:text-white mb-2">
                        {showPaymentCTA ? 'Offer Accepted!' : `Inquiry ${inquiry.status === 'accepted' ? 'Accepted' : inquiry.status === 'declined' ? 'Declined' : 'Viewed'}`}
                    </h1>
                    <p className="text-gray-500 mb-6">
                        {showPaymentCTA
                            ? `${otherName} accepted your offer for ${inquiry.crop_name}. Proceed to payment to secure your order.`
                            : `This inquiry for ${inquiry.crop_name} has already been ${inquiry.status}.`
                        }
                    </p>

                    {/* Payment CTA for buyer whose buy inquiry was accepted */}
                    {showPaymentCTA && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 text-left">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-green-600 !text-[20px] mt-0.5">celebration</span>
                                <div className="text-sm text-green-800 dark:text-green-300">
                                    <p className="font-bold mb-1">Ready to complete your purchase</p>
                                    <p className="text-green-700 dark:text-green-400 text-xs">
                                        Your funds will be held securely in escrow until you confirm delivery. The farmer only gets paid once you&apos;re satisfied.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {inquiry.status === 'accepted' && (
                        <div className="flex flex-col items-center gap-3">
                            {showPaymentCTA && (
                                <Link
                                    href={`/dashboard/inquiry/${inquiry.id}/payment`}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-glow hover:shadow-xl hover:bg-primary-dark transition-all"
                                >
                                    <span className="material-symbols-outlined !text-[20px]">lock</span>
                                    Proceed to Secure Payment
                                </Link>
                            )}
                            <Link
                                href={`/dashboard/messages?userId=${otherParty?.id}`}
                                className={`inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl ${
                                    showPaymentCTA
                                        ? 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors'
                                        : 'bg-primary text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined !text-[20px]">chat</span>
                                Message {otherName}
                            </Link>
                            {isReceiver && (
                                <button
                                    onClick={async () => {
                                        const r = await releaseInquiry(inquiry.id);
                                        if (r.success) {
                                            setInquiry(prev => prev ? { ...prev, status: 'pending' } : prev);
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/10 font-bold rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <span className="material-symbols-outlined !text-[20px]">undo</span>
                                    Not Now
                                </button>
                            )}
                        </div>
                    )}
                    <div className="mt-4">
                        <button onClick={() => router.back()} className="text-primary font-bold text-sm hover:underline">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 pb-12">
            <div className="bg-white dark:bg-[#1a2c15] rounded-3xl shadow-lg overflow-hidden">
                {/* Image Header */}
                {imageUrl && (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-green-500/20 relative">
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${imageUrl}")` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                )}

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-primary !text-[32px]">handshake</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#131613] dark:text-white mb-2">
                            {isReceiver ? 'Review & Agree' : 'Inquiry Details'}
                        </h1>
                        <p className="text-gray-500">
                            {isReceiver
                                ? `${otherName} wants to ${isBuy ? 'purchase your produce' : 'supply your request'}`
                                : `Your ${isBuy ? 'purchase inquiry' : 'supply offer'} to ${otherName}`
                            }
                        </p>
                    </div>

                    {/* Other Party Profile */}
                    {otherParty && (
                        <div className="mb-6 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                                {isReceiver ? (isBuy ? 'Buyer' : 'Supplier') : (isBuy ? 'Seller' : 'Buyer')}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="size-16 rounded-xl bg-primary/10 overflow-hidden shrink-0">
                                    {otherParty.profile_picture ? (
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${otherParty.profile_picture}")` }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary !text-[28px]">
                                                {otherParty.role === 'farmer' ? 'person' : 'storefront'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-[#131613] dark:text-white">{otherName}</h3>
                                        {otherParty.is_verified && (
                                            <span className="material-symbols-outlined text-blue-500 !text-[16px]">verified</span>
                                        )}
                                    </div>
                                    {otherParty.location && (
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined !text-[14px]">location_on</span>
                                            {otherParty.location}
                                        </p>
                                    )}
                                    {otherParty.bio && (
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{otherParty.bio}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inquiry Details */}
                    <div className="mb-6 space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                            <span className="text-gray-500 text-sm">Type</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                isBuy ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                                {isBuy ? 'Purchase' : 'Supply Offer'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                            <span className="text-gray-500 text-sm">Crop</span>
                            <span className="font-bold text-[#131613] dark:text-white">{inquiry.crop_name}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                            <span className="text-gray-500 text-sm">Quantity</span>
                            <span className="font-bold text-[#131613] dark:text-white">{inquiry.quantity} {inquiry.unit}</span>
                        </div>
                        {inquiry.proposed_price && (
                            <>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                                    <span className="text-gray-500 text-sm">Price per {inquiry.unit}</span>
                                    <span className="font-bold text-[#131613] dark:text-white">${inquiry.proposed_price.toFixed(2)}</span>
                                </div>
                                {totalEstimate && (
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                                        <span className="text-gray-500 text-sm">Estimated Total</span>
                                        <span className="text-xl font-black text-primary">${totalEstimate}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {inquiry.message && (
                            <div className="py-3">
                                <span className="text-gray-500 text-sm block mb-2">Message</span>
                                <p className="text-sm text-[#131613] dark:text-white bg-gray-50 dark:bg-white/5 p-3 rounded-xl whitespace-pre-line">
                                    {inquiry.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Agreement Notice */}
                    {isReceiver && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-green-500 !text-[20px] mt-0.5">info</span>
                                <div className="text-sm text-green-700 dark:text-green-300">
                                    <p className="font-bold mb-1">By agreeing, you will:</p>
                                    <ul className="list-disc list-inside space-y-1 text-green-600 dark:text-green-400">
                                        <li>Accept this {isBuy ? 'purchase' : 'supply'} inquiry</li>
                                        <li>Open a direct messaging channel with {otherName}</li>
                                        <li>Be able to coordinate delivery and payment details</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {isReceiver ? (
                        <div className="flex gap-3">
                            <button
                                onClick={handleDecline}
                                disabled={submitting}
                                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAgree}
                                disabled={submitting}
                                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined !text-[20px]">handshake</span>
                                        Agree & Start Messaging
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.back()}
                                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
