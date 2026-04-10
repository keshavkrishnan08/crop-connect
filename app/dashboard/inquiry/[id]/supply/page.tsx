"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/components/Toast";
import type { Inquiry } from "@/hooks/useInquiries";

export default function SupplyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const { createOrder } = useOrders();
    const inquiryId = params.id as string;

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [quantity, setQuantity] = useState<number>(0);
    const [pricePerUnit, setPricePerUnit] = useState<number>(0);
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");

    useEffect(() => {
        if (!inquiryId || !user?.id) return;

        const fetchInquiry = async () => {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from("inquiries")
                .select(`
                    *,
                    sender:profiles!sender_id (
                        id, full_name, farm_name, company_name, location,
                        profile_picture, is_verified, role, bio, business_type
                    ),
                    receiver:profiles!receiver_id (
                        id, full_name, farm_name, company_name, location,
                        profile_picture, is_verified, role, bio, business_type
                    )
                `)
                .eq("id", inquiryId)
                .single();

            if (fetchError || !data) {
                setError("Inquiry not found");
                setLoading(false);
                return;
            }

            if (data.status !== "accepted") {
                setError("This inquiry has not been accepted yet");
                setLoading(false);
                return;
            }

            // Verify user is the sender (the one who put in the request)
            if (data.sender_id !== user.id) {
                setError("You don't have permission to supply for this inquiry");
                setLoading(false);
                return;
            }

            setInquiry(data);
            setQuantity(data.quantity);
            setPricePerUnit(data.proposed_price || 0);
            setLoading(false);
        };

        fetchInquiry();
    }, [inquiryId, user?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inquiry || !user?.id) return;

        if (quantity <= 0) {
            toast("Please enter a valid quantity", "error");
            return;
        }
        if (pricePerUnit <= 0) {
            toast("Please enter a valid price", "error");
            return;
        }

        setSubmitting(true);

        // Determine buyer and farmer IDs based on inquiry type
        const isBuyInquiry = inquiry.type === "buy";
        const buyerId = isBuyInquiry ? inquiry.sender_id : inquiry.receiver_id;
        const farmerId = isBuyInquiry ? inquiry.receiver_id : inquiry.sender_id;

        const totalPrice = quantity * pricePerUnit;
        const notes = [
            deliveryNotes,
            estimatedDelivery ? `Estimated delivery: ${estimatedDelivery}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        const result = await createOrder({
            buyer_id: buyerId,
            farmer_id: farmerId,
            listing_id: inquiry.listing_id || undefined,
            inquiry_id: inquiry.id,
            quantity,
            total_price: totalPrice,
            notes: notes || undefined,
        });

        setSubmitting(false);

        if (result.success) {
            toast("Order created successfully!", "success");
            // Redirect to the appropriate dashboard
            const otherUserId =
                inquiry.sender_id === user.id
                    ? inquiry.receiver_id
                    : inquiry.sender_id;
            router.push(`/dashboard/messages?userId=${otherUserId}`);
        } else {
            toast(result.error || "Failed to create order", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-primary !text-[32px] animate-spin">
                        progress_activity
                    </span>
                    <p className="text-sm text-gray-500">Loading inquiry...</p>
                </div>
            </div>
        );
    }

    if (error || !inquiry) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <span className="material-symbols-outlined text-red-400 !text-[48px] mb-4">
                        error
                    </span>
                    <h2 className="text-lg font-bold text-[#131613] dark:text-white mb-2">
                        {error || "Something went wrong"}
                    </h2>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                    >
                        <span className="material-symbols-outlined !text-[18px]">
                            arrow_back
                        </span>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const otherParty =
        inquiry.sender_id === user?.id ? inquiry.receiver : inquiry.sender;
    const totalPrice = quantity * pricePerUnit;

    return (
        <div className="min-h-screen bg-transparent">
            {/* Header */}
            <div className="bg-white dark:bg-[#1a2c15] border-b border-gray-100 dark:border-white/5 px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="size-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined !text-[20px] text-gray-600 dark:text-gray-400">
                            arrow_back
                        </span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-[#131613] dark:text-white">
                            Supply Details
                        </h1>
                        <p className="text-xs text-gray-500">
                            Finalize your{" "}
                            {inquiry.type === "buy" ? "supply" : "order"} details
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {/* Accepted Inquiry Summary */}
                <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-green-500 !text-[20px]">
                            check_circle
                        </span>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            Request Accepted
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-primary/10 overflow-hidden shrink-0">
                            {otherParty?.profile_picture ? (
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url("${otherParty.profile_picture}")`,
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary !text-[24px]">
                                        person
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#131613] dark:text-white truncate">
                                {otherParty?.company_name ||
                                    otherParty?.farm_name ||
                                    otherParty?.full_name ||
                                    "User"}
                            </p>
                            <p className="text-sm text-gray-500">
                                {inquiry.type === "buy"
                                    ? "accepted your purchase request"
                                    : "accepted your supply offer"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">
                                Crop
                            </p>
                            <p className="text-sm font-bold text-[#131613] dark:text-white mt-0.5">
                                {inquiry.crop_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">
                                Qty Requested
                            </p>
                            <p className="text-sm font-bold text-[#131613] dark:text-white mt-0.5">
                                {inquiry.quantity} {inquiry.unit}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">
                                Proposed Price
                            </p>
                            <p className="text-sm font-bold text-primary mt-0.5">
                                {inquiry.proposed_price
                                    ? `$${inquiry.proposed_price}/${inquiry.unit}`
                                    : "Open"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Supply Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5 space-y-5">
                        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary !text-[18px]">
                                edit_note
                            </span>
                            Confirm Details
                        </h2>

                        {/* Quantity */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Quantity ({inquiry.unit})
                            </label>
                            <input
                                type="number"
                                value={quantity || ""}
                                onChange={(e) =>
                                    setQuantity(parseFloat(e.target.value) || 0)
                                }
                                min={0}
                                step="any"
                                className="input-premium w-full"
                                placeholder={`e.g. ${inquiry.quantity}`}
                            />
                        </div>

                        {/* Price per Unit */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Price per {inquiry.unit} ($)
                            </label>
                            <input
                                type="number"
                                value={pricePerUnit || ""}
                                onChange={(e) =>
                                    setPricePerUnit(
                                        parseFloat(e.target.value) || 0
                                    )
                                }
                                min={0}
                                step="0.01"
                                className="input-premium w-full"
                                placeholder={`e.g. ${inquiry.proposed_price || "0.00"}`}
                            />
                        </div>

                        {/* Estimated Delivery */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Estimated Delivery Date
                            </label>
                            <input
                                type="date"
                                value={estimatedDelivery}
                                onChange={(e) =>
                                    setEstimatedDelivery(e.target.value)
                                }
                                min={new Date().toISOString().split("T")[0]}
                                className="input-premium w-full"
                            />
                        </div>

                        {/* Delivery Notes */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Notes (optional)
                            </label>
                            <textarea
                                value={deliveryNotes}
                                onChange={(e) =>
                                    setDeliveryNotes(e.target.value)
                                }
                                rows={3}
                                className="input-premium w-full resize-none"
                                placeholder="Delivery instructions, packaging requirements, etc."
                            />
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-5 border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {quantity} {inquiry.unit} x ${pricePerUnit.toFixed(2)}
                            </span>
                            <span className="text-2xl font-black text-primary">
                                ${totalPrice.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Total order value
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                submitting || quantity <= 0 || pricePerUnit <= 0
                            }
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? (
                                <>
                                    <span className="material-symbols-outlined !text-[20px] animate-spin">
                                        progress_activity
                                    </span>
                                    Creating Order...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined !text-[20px]">
                                        check_circle
                                    </span>
                                    Confirm Order
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
