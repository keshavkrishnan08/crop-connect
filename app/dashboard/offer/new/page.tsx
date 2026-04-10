"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";
import { useInquiries, CreateInquiryInput } from "@/hooks/useInquiries";
import { useToast } from "@/components/Toast";

interface ReceiverProfile {
    id: string;
    full_name: string | null;
    farm_name: string | null;
    company_name: string | null;
    location: string | null;
    profile_picture: string | null;
    is_verified: boolean;
    role: string | null;
}

interface ListingData {
    id: string;
    crop_name: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
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
    category: string | null;
    buyer_id: string;
}

const deliveryMethods = [
    { value: "pickup", label: "Farm Pickup", icon: "store" },
    { value: "delivery", label: "Local Delivery", icon: "local_shipping" },
    { value: "shipping", label: "Shipping", icon: "package_2" },
    { value: "meetup", label: "Meetup / Market", icon: "storefront" },
];

export default function NewOfferPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { createInquiry } = useInquiries();
    const { toast } = useToast();

    const type = searchParams.get("type") as "buy" | "sell" | null;
    const listingId = searchParams.get("listingId");
    const requestId = searchParams.get("requestId");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [listing, setListing] = useState<ListingData | null>(null);
    const [request, setRequest] = useState<RequestData | null>(null);
    const [receiver, setReceiver] = useState<ReceiverProfile | null>(null);

    // Form state
    const [deliveryMethod, setDeliveryMethod] = useState("pickup");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [offerPrice, setOfferPrice] = useState("");
    const [message, setMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Fetch listing/request data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                if (type === "buy" && listingId) {
                    const { data: listingData, error: listingError } =
                        await supabase
                            .from("listings")
                            .select("id, crop_name, quantity, unit, price_per_unit, image_url, category, farmer_id")
                            .eq("id", listingId)
                            .single();

                    if (listingError) throw listingError;
                    setListing(listingData);
                    setQuantity(listingData.quantity);
                    setOfferPrice(String(listingData.price_per_unit));

                    const { data: farmerData, error: farmerError } =
                        await supabase
                            .from("profiles")
                            .select("id, full_name, farm_name, company_name, location, profile_picture, is_verified, role")
                            .eq("id", listingData.farmer_id)
                            .single();

                    if (farmerError) throw farmerError;
                    setReceiver(farmerData);
                } else if (type === "sell" && requestId) {
                    const { data: requestData, error: requestError } =
                        await supabase
                            .from("produce_requests")
                            .select("id, crop_name, quantity, unit, max_price, category, buyer_id")
                            .eq("id", requestId)
                            .single();

                    if (requestError) throw requestError;
                    setRequest(requestData);
                    setQuantity(requestData.quantity);
                    if (requestData.max_price)
                        setOfferPrice(String(requestData.max_price));

                    const { data: buyerData, error: buyerError } =
                        await supabase
                            .from("profiles")
                            .select("id, full_name, farm_name, company_name, location, profile_picture, is_verified, role")
                            .eq("id", requestData.buyer_id)
                            .single();

                    if (buyerError) throw buyerError;
                    setReceiver(buyerData);
                } else {
                    setError("Invalid offer parameters");
                }
            } catch {
                setError("Failed to load data. Please go back and try again.");
            } finally {
                setLoading(false);
            }
        };

        if (type && (listingId || requestId)) {
            fetchData();
        } else {
            setLoading(false);
            setError("Missing offer parameters");
        }
    }, [type, listingId, requestId]);

    const cropName = listing?.crop_name || request?.crop_name || "";
    const unit = listing?.unit || request?.unit || "lbs";
    const totalPrice =
        quantity * (parseFloat(offerPrice) || 0);
    const showAddress = deliveryMethod === "pickup" || deliveryMethod === "delivery";

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast("Please select an image file", "error");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast("Image must be under 5MB", "error");
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiver || !user?.id) return;

        if (quantity <= 0) {
            toast("Please enter a valid quantity", "error");
            return;
        }
        if (type === "sell" && !imageFile) {
            toast("Please upload a photo of your produce", "error");
            return;
        }

        setSubmitting(true);

        // Upload image (only for sell offers; buy offers use listing image)
        let imageUrl: string | undefined;
        if (type === "buy" && listing?.image_url) {
            imageUrl = listing.image_url;
        } else if (imageFile) {
            try {
                setUploadingImage(true);
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${user.id}/inquiries/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("crops")
                    .upload(fileName, imageFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("crops")
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            } catch {
                toast("Failed to upload image. Please try again.", "error");
                setSubmitting(false);
                setUploadingImage(false);
                return;
            } finally {
                setUploadingImage(false);
            }
        }

        const input: CreateInquiryInput = {
            receiver_id: receiver.id,
            type: type!,
            crop_name: cropName,
            quantity,
            unit,
            proposed_price: offerPrice ? parseFloat(offerPrice) : undefined,
            message: message || undefined,
            delivery_method: deliveryMethod,
            delivery_address: deliveryAddress || undefined,
            image_url: imageUrl,
        };

        if (listingId) input.listing_id = listingId;
        if (requestId) input.request_id = requestId;

        const result = await createInquiry(input);
        setSubmitting(false);

        if (result.success) {
            toast("Offer sent! They'll be notified.", "success");
            router.push(
                type === "buy" ? "/dashboard/buyer" : "/dashboard/farmer"
            );
        } else {
            toast(result.error || "Failed to send offer", "error");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex-1 w-full overflow-y-auto bg-transparent flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-primary !text-[32px] animate-spin">
                        progress_activity
                    </span>
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !receiver) {
        return (
            <div className="flex-1 w-full overflow-y-auto bg-transparent flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 max-w-md w-full text-center">
                    <span className="material-symbols-outlined text-red-400 !text-[48px] mb-4">
                        error
                    </span>
                    <h2 className="text-lg font-bold text-[#131613] dark:text-white mb-2">
                        {error || "Something went wrong"}
                    </h2>
                    <Link
                        href="/dashboard/marketplace"
                        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                    >
                        <span className="material-symbols-outlined !text-[18px]">
                            arrow_back
                        </span>
                        Back to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    const receiverName =
        receiver.farm_name || receiver.company_name || receiver.full_name || "User";

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
                            Make an Offer
                        </h1>
                        <p className="text-xs text-gray-500">
                            {type === "buy"
                                ? `Buy ${cropName} from ${receiverName}`
                                : `Supply ${cropName} to ${receiverName}`}
                        </p>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 flex items-center gap-4">
                    <div className="size-14 rounded-xl bg-primary/10 overflow-hidden shrink-0">
                        {listing?.image_url ? (
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url("${listing.image_url}")` }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary !text-[28px]">
                                    eco
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-[#131613] dark:text-white truncate">
                            {cropName}
                        </h2>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                            {receiver.profile_picture ? (
                                <span className="inline-block size-4 rounded-full bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${receiver.profile_picture}")` }} />
                            ) : (
                                <span className="material-symbols-outlined !text-[14px]">person</span>
                            )}
                            {receiverName}
                            {receiver.is_verified && (
                                <span className="material-symbols-outlined text-blue-500 !text-[14px]">verified</span>
                            )}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-lg font-black text-primary">
                            {listing
                                ? `$${listing.price_per_unit}`
                                : request?.max_price
                                  ? `$${request.max_price}`
                                  : "Open"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                            {listing ? "per" : "max"} {unit}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Delivery Method */}
                    <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5 space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Delivery Method
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {deliveryMethods.map((method) => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setDeliveryMethod(method.value)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                        deliveryMethod === method.value
                                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                                            : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
                                    }`}
                                >
                                    <span
                                        className={`material-symbols-outlined !text-[20px] ${
                                            deliveryMethod === method.value
                                                ? "text-primary"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {method.icon}
                                    </span>
                                    <p
                                        className={`text-sm font-bold mt-1 ${
                                            deliveryMethod === method.value
                                                ? "text-primary"
                                                : "text-[#131613] dark:text-white"
                                        }`}
                                    >
                                        {method.label}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* Address field */}
                        {showAddress && (
                            <div className="animate-fade-in">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    {deliveryMethod === "pickup"
                                        ? "Pickup Address"
                                        : "Delivery Address"}
                                </label>
                                <input
                                    type="text"
                                    value={deliveryAddress}
                                    onChange={(e) =>
                                        setDeliveryAddress(e.target.value)
                                    }
                                    className="input-premium w-full"
                                    placeholder={
                                        deliveryMethod === "pickup"
                                            ? "Farm address for pickup"
                                            : "Where should we deliver?"
                                    }
                                />
                            </div>
                        )}
                    </div>

                    {/* Produce Photo — only required for sell offers */}
                    {type === "sell" && (
                        <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5 space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                Photo of Produce
                                <span className="text-red-400">*</span>
                            </h3>

                            {imagePreview ? (
                                <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
                                    <div className="relative w-full aspect-[4/3]">
                                        <Image
                                            src={imagePreview}
                                            alt="Produce preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 size-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined !text-[18px]">close</span>
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary/50 bg-gray-50/50 dark:bg-white/[0.02] cursor-pointer transition-colors">
                                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary !text-[28px]">add_a_photo</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-[#131613] dark:text-white">Upload a photo</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Show the buyer what you&apos;re offering</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    )}

                    {/* Quantity & Price */}
                    <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5 space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Offer Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">
                                    Quantity ({unit})
                                </label>
                                <input
                                    type="number"
                                    value={quantity || ""}
                                    onChange={(e) =>
                                        setQuantity(
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    min={0}
                                    step="any"
                                    className="input-premium w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">
                                    Price per {unit} ($)
                                </label>
                                <input
                                    type="number"
                                    value={offerPrice}
                                    onChange={(e) =>
                                        setOfferPrice(e.target.value)
                                    }
                                    min={0}
                                    step="0.01"
                                    className="input-premium w-full"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">
                                Message (optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                className="input-premium w-full resize-none"
                                placeholder="Any notes about your offer..."
                            />
                        </div>
                    </div>

                    {/* Total */}
                    {totalPrice > 0 && (
                        <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">
                                    {quantity} {unit} x $
                                    {(parseFloat(offerPrice) || 0).toFixed(2)}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    Total offer value
                                </p>
                            </div>
                            <p className="text-2xl font-black text-primary">
                                ${totalPrice.toFixed(2)}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pb-8">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || quantity <= 0 || (type === "sell" && !imageFile)}
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? (
                                <>
                                    <span className="material-symbols-outlined !text-[20px] animate-spin">
                                        progress_activity
                                    </span>
                                    {uploadingImage ? "Uploading photo..." : "Sending..."}
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined !text-[20px]">
                                        send
                                    </span>
                                    Send Offer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
