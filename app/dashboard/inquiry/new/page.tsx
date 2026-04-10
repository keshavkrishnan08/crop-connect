"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useInquiries, CreateInquiryInput } from "@/hooks/useInquiries";

interface ReceiverProfile {
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

interface ListingData {
    id: string;
    crop_name: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    description: string | null;
    image_url: string | null;
    category: string | null;
    farmer_id: string;
}

interface RequestData {
    id: string;
    crop_name: string;
    quantity: number;
    unit: string;
    max_price: number | null;
    description: string | null;
    category: string | null;
    buyer_id: string;
}

type Step = 'verify' | 'details' | 'review' | 'success';

export default function NewInquiryPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { createInquiry } = useInquiries();

    const type = searchParams.get('type') as 'buy' | 'sell' | null;
    const listingId = searchParams.get('listingId');
    const requestId = searchParams.get('requestId');

    const [step, setStep] = useState<Step>('verify');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Password verification
    const [password, setPassword] = useState('');
    const [verifying, setVerifying] = useState(false);

    // Source data
    const [listing, setListing] = useState<ListingData | null>(null);
    const [request, setRequest] = useState<RequestData | null>(null);
    const [receiver, setReceiver] = useState<ReceiverProfile | null>(null);

    // Inquiry form data
    const [quantity, setQuantity] = useState(1);
    const [proposedPrice, setProposedPrice] = useState('');
    const [message, setMessage] = useState('');

    // Fetch listing or request data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                if (type === 'buy' && listingId) {
                    const { data: listingData, error: listingError } = await supabase
                        .from('listings')
                        .select('id, crop_name, quantity, unit, price_per_unit, description, image_url, category, farmer_id')
                        .eq('id', listingId)
                        .single();

                    if (listingError) throw listingError;
                    setListing(listingData);
                    setQuantity(1);
                    setProposedPrice(String(listingData.price_per_unit));

                    // Fetch farmer profile
                    const { data: farmerData, error: farmerError } = await supabase
                        .from('profiles')
                        .select('id, full_name, farm_name, company_name, location, profile_picture, is_verified, role, bio, business_type')
                        .eq('id', listingData.farmer_id)
                        .single();

                    if (farmerError) throw farmerError;
                    setReceiver(farmerData);

                } else if (type === 'sell' && requestId) {
                    const { data: requestData, error: requestError } = await supabase
                        .from('produce_requests')
                        .select('id, crop_name, quantity, unit, max_price, description, category, buyer_id')
                        .eq('id', requestId)
                        .single();

                    if (requestError) throw requestError;
                    setRequest(requestData);
                    setQuantity(requestData.quantity);
                    if (requestData.max_price) setProposedPrice(String(requestData.max_price));

                    // Fetch buyer profile
                    const { data: buyerData, error: buyerError } = await supabase
                        .from('profiles')
                        .select('id, full_name, farm_name, company_name, location, profile_picture, is_verified, role, bio, business_type')
                        .eq('id', requestData.buyer_id)
                        .single();

                    if (buyerError) throw buyerError;
                    setReceiver(buyerData);
                } else {
                    setError('Invalid inquiry parameters');
                }
            } catch (err) {
                setError('Failed to load inquiry data. Please go back and try again.');
            } finally {
                setLoading(false);
            }
        };

        if (type && (listingId || requestId)) {
            fetchData();
        } else {
            setLoading(false);
            setError('Missing inquiry parameters');
        }
    }, [type, listingId, requestId]);

    const handlePasswordVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.email) return;

        setVerifying(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password,
            });

            if (authError) {
                setError('Incorrect password. Please try again.');
                return;
            }

            setStep('details');
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmitInquiry = async () => {
        if (!receiver) return;

        setSubmitting(true);
        setError(null);

        const input: CreateInquiryInput = {
            receiver_id: receiver.id,
            type: type!,
            crop_name: listing?.crop_name || request?.crop_name || '',
            quantity,
            unit: listing?.unit || request?.unit || 'lbs',
            proposed_price: proposedPrice ? parseFloat(proposedPrice) : undefined,
            message: message || undefined,
        };

        if (listingId) input.listing_id = listingId;
        if (requestId) input.request_id = requestId;

        const result = await createInquiry(input);

        if (result.success) {
            setStep('success');
        } else {
            setError(result.error || 'Failed to send inquiry');
        }

        setSubmitting(false);
    };

    const cropName = listing?.crop_name || request?.crop_name || '';
    const unit = listing?.unit || request?.unit || '';
    const imageUrl = listing?.image_url;
    const maxQty = listing?.quantity || request?.quantity || 999;
    const receiverName = receiver?.farm_name || receiver?.company_name || receiver?.full_name || 'Unknown';
    const isBuy = type === 'buy';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary animate-pulse">
                        <span className="material-symbols-outlined text-3xl">hourglass_empty</span>
                    </div>
                    <p className="text-gray-500 text-sm">Loading inquiry...</p>
                </div>
            </div>
        );
    }

    if (error && step === 'verify' && !listing && !request) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                    <span className="material-symbols-outlined text-red-400 !text-[48px] mb-4">error</span>
                    <h2 className="text-xl font-bold text-[#131613] dark:text-white mb-2">Something went wrong</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 pb-12">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {(['verify', 'details', 'review', 'success'] as Step[]).map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            step === s
                                ? 'bg-primary text-white'
                                : (['verify', 'details', 'review', 'success'].indexOf(step) > i)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 dark:bg-white/10 text-gray-400'
                        }`}>
                            {(['verify', 'details', 'review', 'success'].indexOf(step) > i) ? (
                                <span className="material-symbols-outlined !text-[16px]">check</span>
                            ) : (
                                i + 1
                            )}
                        </div>
                        {i < 3 && (
                            <div className={`w-8 h-0.5 ${
                                (['verify', 'details', 'review', 'success'].indexOf(step) > i)
                                    ? 'bg-green-500'
                                    : 'bg-gray-200 dark:bg-white/10'
                            }`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Password Verification */}
            {step === 'verify' && (
                <div className="bg-white dark:bg-[#1a2c15] rounded-3xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-primary !text-[32px]">lock</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#131613] dark:text-white mb-2">
                            Verify Your Identity
                        </h1>
                        <p className="text-gray-500">
                            For security, please re-enter your password to {isBuy ? 'send a purchase inquiry' : 'send a supply offer'}
                        </p>
                    </div>

                    {/* Preview Card */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-4">
                            {imageUrl ? (
                                <div
                                    className="size-16 rounded-xl bg-cover bg-center shrink-0"
                                    style={{ backgroundImage: `url("${imageUrl}")` }}
                                />
                            ) : (
                                <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary !text-[24px]">eco</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#131613] dark:text-white truncate">{cropName}</p>
                                <p className="text-sm text-gray-500">
                                    {isBuy ? 'Purchase from' : 'Supply to'} {receiverName}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                isBuy ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                                {isBuy ? 'Buy' : 'Sell'}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordVerify} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[#131613] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                required
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={verifying || !password}
                            className="w-full py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {verifying ? (
                                <>
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined !text-[20px]">verified_user</span>
                                    Continue
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: Inquiry Details */}
            {step === 'details' && (
                <div className="bg-white dark:bg-[#1a2c15] rounded-3xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-primary !text-[32px]">
                                {isBuy ? 'shopping_cart' : 'local_shipping'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-[#131613] dark:text-white mb-2">
                            {isBuy ? 'Purchase Details' : 'Supply Offer Details'}
                        </h1>
                        <p className="text-gray-500">
                            Customize your {isBuy ? 'purchase inquiry' : 'supply offer'} for {cropName}
                        </p>
                    </div>

                    {/* Receiver Profile Card */}
                    {receiver && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-xl bg-primary/10 overflow-hidden shrink-0">
                                    {receiver.profile_picture ? (
                                        <div
                                            className="w-full h-full bg-cover bg-center"
                                            style={{ backgroundImage: `url("${receiver.profile_picture}")` }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary !text-[24px]">
                                                {isBuy ? 'person' : 'storefront'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-[#131613] dark:text-white truncate">
                                            {receiverName}
                                        </h3>
                                        {receiver.is_verified && (
                                            <span className="material-symbols-outlined text-blue-500 !text-[16px]">verified</span>
                                        )}
                                    </div>
                                    {receiver.location && (
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined !text-[14px]">location_on</span>
                                            {receiver.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Preview */}
                    {imageUrl && (
                        <div className="mb-6 h-40 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5">
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url("${imageUrl}")` }}
                            />
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Crop Name (read-only) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Crop</label>
                            <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#131613] dark:text-white font-medium">
                                {cropName}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Quantity ({unit})
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="size-10 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5"
                                >
                                    <span className="material-symbols-outlined">remove</span>
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1)))}
                                    className="w-24 h-10 text-center border border-gray-200 dark:border-white/10 rounded-lg font-bold dark:bg-white/5 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                                    className="size-10 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                                <span className="text-sm text-gray-400">of {maxQty} {unit}</span>
                            </div>
                        </div>

                        {/* Proposed Price */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {isBuy ? 'Offered Price' : 'Proposed Price'} (per {unit})
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={proposedPrice}
                                    onChange={(e) => setProposedPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[#131613] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>
                            {proposedPrice && quantity > 0 && (
                                <p className="mt-2 text-sm text-primary font-bold">
                                    Total: ${(parseFloat(proposedPrice) * quantity).toFixed(2)}
                                </p>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Message (optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={isBuy
                                    ? "Tell the farmer about your needs, delivery preferences, etc."
                                    : "Describe your supply capabilities, delivery timeline, etc."
                                }
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[#131613] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={() => { setStep('verify'); setPassword(''); }}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => { setError(null); setStep('review'); }}
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            Review Inquiry
                            <span className="material-symbols-outlined !text-[20px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 'review' && (
                <div className="bg-white dark:bg-[#1a2c15] rounded-3xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-primary !text-[32px]">fact_check</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#131613] dark:text-white mb-2">
                            Review Your Inquiry
                        </h1>
                        <p className="text-gray-500">
                            Please confirm the details below before sending
                        </p>
                    </div>

                    {/* Receiver Profile */}
                    {receiver && (
                        <div className="mb-6 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                                {isBuy ? 'Purchasing From' : 'Supplying To'}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="size-16 rounded-xl bg-primary/10 overflow-hidden shrink-0">
                                    {receiver.profile_picture ? (
                                        <div
                                            className="w-full h-full bg-cover bg-center"
                                            style={{ backgroundImage: `url("${receiver.profile_picture}")` }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary !text-[28px]">
                                                {isBuy ? 'person' : 'storefront'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-[#131613] dark:text-white">
                                            {receiverName}
                                        </h3>
                                        {receiver.is_verified && (
                                            <span className="material-symbols-outlined text-blue-500 !text-[16px]">verified</span>
                                        )}
                                    </div>
                                    {receiver.location && (
                                        <p className="text-sm text-gray-500">{receiver.location}</p>
                                    )}
                                    {receiver.bio && (
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{receiver.bio}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image */}
                    {imageUrl && (
                        <div className="mb-6 h-36 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5">
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url("${imageUrl}")` }}
                            />
                        </div>
                    )}

                    {/* Inquiry Summary */}
                    <div className="mb-6 space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                            <span className="text-gray-500 text-sm">Type</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                isBuy ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                                {isBuy ? 'Purchase Inquiry' : 'Supply Offer'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                            <span className="text-gray-500 text-sm">Crop</span>
                            <span className="font-bold text-[#131613] dark:text-white">{cropName}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                            <span className="text-gray-500 text-sm">Quantity</span>
                            <span className="font-bold text-[#131613] dark:text-white">{quantity} {unit}</span>
                        </div>
                        {proposedPrice && (
                            <>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                                    <span className="text-gray-500 text-sm">Price per {unit}</span>
                                    <span className="font-bold text-[#131613] dark:text-white">${parseFloat(proposedPrice).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                                    <span className="text-gray-500 text-sm">Estimated Total</span>
                                    <span className="text-xl font-black text-primary">
                                        ${(parseFloat(proposedPrice) * quantity).toFixed(2)}
                                    </span>
                                </div>
                            </>
                        )}
                        {message && (
                            <div className="py-3">
                                <span className="text-gray-500 text-sm block mb-2">Message</span>
                                <p className="text-sm text-[#131613] dark:text-white bg-gray-50 dark:bg-white/5 p-3 rounded-xl whitespace-pre-line">
                                    {message}
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep('details')}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmitInquiry}
                            disabled={submitting}
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined !text-[20px]">send</span>
                                    Send Inquiry
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
                <div className="bg-white dark:bg-[#1a2c15] rounded-3xl shadow-lg p-8 text-center">
                    <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-green-500 !text-[40px]">check_circle</span>
                    </div>
                    <h1 className="text-3xl font-black text-[#131613] dark:text-white mb-3">
                        Inquiry Sent!
                    </h1>
                    <p className="text-gray-500 mb-2 max-w-md mx-auto">
                        Your {isBuy ? 'purchase inquiry' : 'supply offer'} for <strong className="text-[#131613] dark:text-white">{cropName}</strong> has been sent to <strong className="text-[#131613] dark:text-white">{receiverName}</strong>.
                    </p>
                    <p className="text-sm text-gray-400 mb-8">
                        They will be notified and can review your inquiry on their dashboard. You can track the status from your dashboard.
                    </p>

                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        <Link
                            href={isBuy ? '/dashboard/buyer' : '/dashboard/farmer'}
                            className="py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined !text-[20px]">dashboard</span>
                            Go to Dashboard
                        </Link>
                        <Link
                            href={isBuy ? '/dashboard/marketplace' : '/dashboard/farmer/distribution'}
                            className="py-3 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined !text-[20px]">
                                {isBuy ? 'store' : 'local_shipping'}
                            </span>
                            {isBuy ? 'Back to Marketplace' : 'Back to Distribution'}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
