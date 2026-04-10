"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe-client";
import { useAuth } from "@/components/AuthProvider";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/components/Toast";
import StripePaymentForm from "@/components/StripePaymentForm";
import { authFetch } from "@/lib/api-client";
import { PLATFORM_FEE_PERCENT } from "@/lib/escrow-states";

interface InquiryData {
    id: string;
    sender_id: string;
    receiver_id: string;
    type: "buy" | "sell";
    crop_name: string;
    quantity: number;
    unit: string;
    proposed_price: number | null;
    image_url: string | null;
    delivery_method: string | null;
    listing_id: string | null;
    request_id: string | null;
    status: string;
    sender: {
        id: string;
        full_name: string | null;
        farm_name: string | null;
        company_name: string | null;
        profile_picture: string | null;
        is_verified: boolean;
    } | null;
    receiver: {
        id: string;
        full_name: string | null;
        farm_name: string | null;
        company_name: string | null;
        profile_picture: string | null;
        is_verified: boolean;
    } | null;
}

const PROFILE_SELECT = `id, full_name, farm_name, company_name, profile_picture, is_verified`;

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { createOrder } = useOrders();
    const { toast } = useToast();

    const inquiryId = params.id as string;

    const [inquiry, setInquiry] = useState<InquiryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderExists, setOrderExists] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [farmerNotOnboarded, setFarmerNotOnboarded] = useState(false);

    const stripePromise = getStripe();

    useEffect(() => {
        const fetchData = async () => {
            if (!inquiryId || !user?.id) return;

            setLoading(true);
            setError(null);

            try {
                const { data: inquiryData, error: inquiryError } = await supabase
                    .from("inquiries")
                    .select(`
                        *,
                        sender:profiles!sender_id (${PROFILE_SELECT}),
                        receiver:profiles!receiver_id (${PROFILE_SELECT})
                    `)
                    .eq("id", inquiryId)
                    .single();

                if (inquiryError) throw inquiryError;

                if (inquiryData.status !== "accepted") {
                    setError("This offer has not been accepted yet.");
                    setLoading(false);
                    return;
                }

                const isBuyer =
                    (inquiryData.type === "buy" && inquiryData.sender_id === user.id) ||
                    (inquiryData.type === "sell" && inquiryData.receiver_id === user.id);

                if (!isBuyer) {
                    setError("Only the buyer can make payment.");
                    setLoading(false);
                    return;
                }

                setInquiry(inquiryData);

                // Check if order already exists
                const { data: existingOrder } = await supabase
                    .from("orders")
                    .select("id, status, escrow_status")
                    .eq("inquiry_id", inquiryId)
                    .limit(1);

                if (existingOrder && existingOrder.length > 0) {
                    const order = existingOrder[0];
                    // If order exists but payment hasn't succeeded, re-create payment intent
                    if (order.escrow_status === 'awaiting_payment' || order.escrow_status === 'payment_failed') {
                        setOrderId(order.id);
                        await initializePayment(order.id, user.id);
                    } else {
                        setOrderExists(true);
                    }
                }
            } catch {
                setError("Failed to load payment details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [inquiryId, user?.id]);

    const initializePayment = async (existingOrderId: string, _buyerId: string) => {
        try {
            const res = await authFetch("/api/stripe/create-payment", {
                method: "POST",
                body: JSON.stringify({ orderId: existingOrderId }),
            });
            const data = await res.json();
            if (!res.ok) {
                // Check if farmer hasn't set up payment account
                if (data.error?.toLowerCase().includes("payment account") ||
                    data.error?.toLowerCase().includes("not set up")) {
                    setFarmerNotOnboarded(true);
                    return;
                }
                throw new Error(data.error);
            }
            setClientSecret(data.clientSecret);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to initialize payment";
            if (message.toLowerCase().includes("payment account") ||
                message.toLowerCase().includes("not set up")) {
                setFarmerNotOnboarded(true);
            } else {
                setError(message);
            }
        }
    };

    const handleCreateOrderAndPay = async () => {
        if (!inquiry || !user?.id) return;

        setCreatingOrder(true);
        setError(null);

        const buyerId = inquiry.type === "buy" ? inquiry.sender_id : inquiry.receiver_id;
        const farmerId = inquiry.type === "buy" ? inquiry.receiver_id : inquiry.sender_id;
        const totalPrice = inquiry.proposed_price ? inquiry.quantity * inquiry.proposed_price : 0;

        try {
            const result = await createOrder({
                buyer_id: buyerId,
                farmer_id: farmerId,
                listing_id: inquiry.listing_id,
                inquiry_id: inquiry.id,
                quantity: inquiry.quantity,
                total_price: totalPrice,
                notes: `Escrow payment — funds held until delivery confirmed.`,
            });

            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to create order");
            }

            setOrderId(result.data.id);
            await initializePayment(result.data.id, buyerId);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to set up payment";
            setError(message);
        } finally {
            setCreatingOrder(false);
        }
    };

    const handlePaymentSuccess = () => {
        toast("Payment successful! Funds are held securely in escrow.", "success");
        router.push("/dashboard/buyer");
    };

    const handlePaymentError = (errorMsg: string) => {
        setError(errorMsg);
    };



    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-primary !text-[32px] animate-spin">
                        progress_activity
                    </span>
                    <p className="text-sm text-gray-500">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if ((error && !inquiry) || !inquiry) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] p-4">
                <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 max-w-md w-full text-center">
                    <span className="material-symbols-outlined text-red-400 !text-[48px] mb-4 block">error</span>
                    <h2 className="text-lg font-bold text-[#131613] dark:text-white mb-2">
                        {error || "Something went wrong"}
                    </h2>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
                    >
                        <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (orderExists) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] p-4">
                <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 max-w-md w-full text-center">
                    <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-green-500 !text-[32px]">check_circle</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#131613] dark:text-white mb-2">Payment Already Made</h2>
                    <p className="text-gray-500 text-sm mb-4">An order has already been created for this offer.</p>
                    <Link
                        href="/dashboard/buyer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
                    >
                        View Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Farmer hasn't set up payment account yet
    if (farmerNotOnboarded && inquiry) {
        const farmer = inquiry.type === "buy" ? inquiry.receiver : inquiry.sender;
        const farmerName = farmer?.farm_name || farmer?.company_name || farmer?.full_name || "The seller";

        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] p-4">
                <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 max-w-md w-full text-center">
                    <div className="size-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-amber-500 !text-[32px]">account_balance</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#131613] dark:text-white mb-2">Awaiting Seller Setup</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        {farmerName} needs to set up their payment account to receive funds.
                        We&apos;ve notified them and they should complete this soon.
                    </p>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-6 text-left">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-500 !text-[20px] mt-0.5">info</span>
                            <div className="text-sm text-blue-800 dark:text-blue-300">
                                <p className="font-bold mb-1">What happens next?</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400 text-xs">
                                    <li>The seller will set up secure bank transfers</li>
                                    <li>You&apos;ll be able to complete payment once ready</li>
                                    <li>Your order details are saved</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={`/dashboard/messages`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                        >
                            <span className="material-symbols-outlined !text-[18px]">chat</span>
                            Message Seller
                        </Link>
                        <Link
                            href="/dashboard/buyer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
                        >
                            <span className="material-symbols-outlined !text-[18px]">home</span>
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const farmer = inquiry.type === "buy" ? inquiry.receiver : inquiry.sender;
    const farmerName = farmer?.farm_name || farmer?.company_name || farmer?.full_name || "Farmer";
    const totalPrice = inquiry.proposed_price ? inquiry.quantity * inquiry.proposed_price : 0;
    const platformFee = Math.round(totalPrice * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;

    return (
        <div className="flex-1 w-full overflow-y-auto no-scrollbar bg-transparent">
            <div className="max-w-xl mx-auto p-4 md:p-8 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="size-10 rounded-xl bg-white dark:bg-[#1a2c15] border border-gray-100 dark:border-white/5 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined !text-[20px] text-gray-600 dark:text-gray-400">
                            arrow_back
                        </span>
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#131613] dark:text-white">
                            Secure Escrow Payment
                        </h1>
                        <p className="text-xs text-gray-500">
                            Funds held safely until you confirm delivery
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5 space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Order Summary
                    </h3>

                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-xl bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {inquiry.image_url ? (
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url("${inquiry.image_url}")` }}
                                />
                            ) : (
                                <span className="material-symbols-outlined text-primary !text-[28px]">eco</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-[#131613] dark:text-white truncate">
                                {inquiry.crop_name}
                            </h2>
                            <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                                {farmer?.profile_picture ? (
                                    <span
                                        className="inline-block size-4 rounded-full bg-cover bg-center shrink-0"
                                        style={{ backgroundImage: `url("${farmer.profile_picture}")` }}
                                    />
                                ) : (
                                    <span className="material-symbols-outlined !text-[14px]">person</span>
                                )}
                                {farmerName}
                                {farmer?.is_verified && (
                                    <span className="material-symbols-outlined text-blue-500 !text-[14px]">verified</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/10">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Quantity</span>
                            <span className="font-bold text-[#131613] dark:text-white">
                                {inquiry.quantity} {inquiry.unit}
                            </span>
                        </div>
                        {inquiry.proposed_price && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Price per {inquiry.unit}</span>
                                <span className="font-bold text-[#131613] dark:text-white">
                                    ${inquiry.proposed_price.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {inquiry.delivery_method && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery</span>
                                <span className="font-bold text-[#131613] dark:text-white capitalize">
                                    {inquiry.delivery_method}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Platform fee ({PLATFORM_FEE_PERCENT}%)</span>
                            <span className="text-gray-500">${platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-white/10">
                            <span className="font-bold text-[#131613] dark:text-white">Total</span>
                            <span className="text-2xl font-black text-primary">
                                ${totalPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Notice */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-green-600 !text-[20px] mt-0.5">shield</span>
                        <div className="text-sm text-green-800 dark:text-green-300">
                            <p className="font-bold mb-1">Protected by Escrow</p>
                            <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-400 text-xs">
                                <li>Your full payment is held securely in escrow</li>
                                <li>Farmer ships your order after payment is confirmed</li>
                                <li>Confirm delivery to release funds to the farmer</li>
                                <li>Funds auto-release 7 days after shipping if not disputed</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Payment Section */}
                {clientSecret && stripePromise ? (
                    <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5">
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: 'stripe',
                                    variables: {
                                        colorPrimary: '#16a34a',
                                        borderRadius: '12px',
                                    },
                                },
                            }}
                        >
                            <StripePaymentForm
                                amount={totalPrice}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </Elements>
                    </div>
                ) : (
                    <div className="flex gap-3 pb-8">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateOrderAndPay}
                            disabled={creatingOrder || totalPrice <= 0}
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {creatingOrder ? (
                                <>
                                    <span className="material-symbols-outlined !text-[20px] animate-spin">
                                        progress_activity
                                    </span>
                                    Setting up payment...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined !text-[20px]">lock</span>
                                    Proceed to Pay ${totalPrice.toFixed(2)}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
