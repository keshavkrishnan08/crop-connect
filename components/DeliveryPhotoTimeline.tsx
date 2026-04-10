"use client";

import { useState, useEffect } from "react";
import SafeImage from "./SafeImage";
import { getTrackingUrl, getCarrierDisplayName } from "@/lib/tracking";

interface OrderPhoto {
    id: string;
    photo_type: string;
    photo_url: string;
    caption?: string;
    created_at: string;
    uploaded_by_profile?: { full_name: string; role: string };
}

interface DeliveryPhotoTimelineProps {
    orderId: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    escrowStatus?: string;
    isFarmer?: boolean;
}

const PHASE_CONFIG: Record<string, { label: string; color: string; bg: string; description: string }> = {
    packing: {
        label: "Packing Photos",
        color: "text-primary",
        bg: "bg-primary",
        description: "Farmer documented produce quality before shipping",
    },
    shipping_label: {
        label: "Shipping Label",
        color: "text-blue-500",
        bg: "bg-blue-500",
        description: "Package labeled and ready for carrier pickup",
    },
    delivery_proof: {
        label: "Delivery Proof",
        color: "text-purple-500",
        bg: "bg-purple-500",
        description: "Photo taken at delivery location",
    },
    receipt_condition: {
        label: "Received Condition",
        color: "text-amber-500",
        bg: "bg-amber-500",
        description: "Buyer documented produce condition upon arrival",
    },
    dispute_evidence: {
        label: "Dispute Evidence",
        color: "text-red-500",
        bg: "bg-red-500",
        description: "Evidence submitted for dispute resolution",
    },
};

export default function DeliveryPhotoTimeline({
    orderId,
    trackingNumber,
    carrier,
    escrowStatus,
    isFarmer = false,
}: DeliveryPhotoTimelineProps) {
    const [photos, setPhotos] = useState<OrderPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

    useEffect(() => {
        fetchPhotos();
    }, [orderId]);

    const fetchPhotos = async () => {
        try {
            const res = await fetch(`/api/orders/photos?orderId=${orderId}`);
            const data = await res.json();
            if (data.photos) setPhotos(data.photos);
        } catch {
            // Photos failed to load — non-critical, UI shows empty state
        } finally {
            setLoading(false);
        }
    };

    // Group photos by type
    const grouped = photos.reduce<Record<string, OrderPhoto[]>>((acc, photo) => {
        if (!acc[photo.photo_type]) acc[photo.photo_type] = [];
        acc[photo.photo_type].push(photo);
        return acc;
    }, {});

    // Define the expected timeline phases based on order progress
    const phases = ["packing", "shipping_label", "delivery_proof", "receipt_condition"];
    if (escrowStatus === "disputed") phases.push("dispute_evidence");

    const trackingUrl = trackingNumber && carrier ? getTrackingUrl(carrier, trackingNumber) : null;

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1a2c15] rounded-2xl border border-gray-100 dark:border-white/5 p-6">
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="size-3 rounded-full bg-gray-200 dark:bg-white/10 mt-1" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-32" />
                                <div className="h-16 bg-gray-100 dark:bg-white/5 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1a2c15] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-black text-[#131613] dark:text-white">Delivery Photo Proof</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Visual verification at every stage</p>
                </div>
                {photos.length > 0 && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {photos.length} photo{photos.length !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Tracking info */}
            {trackingNumber && carrier && (
                <div className="px-5 py-3 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="text-[11px]">
                        <span className="text-gray-400 font-medium">Carrier: </span>
                        <span className="font-bold text-[#131613] dark:text-white">{getCarrierDisplayName(carrier)}</span>
                        <span className="text-gray-300 mx-2">&middot;</span>
                        <span className="text-gray-400 font-medium">Tracking: </span>
                        <span className="font-bold text-[#131613] dark:text-white">{trackingNumber}</span>
                    </div>
                    {trackingUrl && !trackingUrl.startsWith("#") && (
                        <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-black uppercase tracking-wider text-primary hover:underline"
                        >
                            Track Package &rarr;
                        </a>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div className="p-5">
                {phases.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No delivery photos yet</p>
                ) : (
                    <div className="space-y-0">
                        {phases.map((phase, i) => {
                            const config = PHASE_CONFIG[phase];
                            const phasePhotos = grouped[phase] || [];
                            const hasPhotos = phasePhotos.length > 0;
                            const isLast = i === phases.length - 1;

                            return (
                                <div key={phase} className="flex gap-4">
                                    {/* Timeline line + dot */}
                                    <div className="flex flex-col items-center">
                                        <div className={`size-3 rounded-full flex-shrink-0 ${hasPhotos ? config.bg : "bg-gray-200 dark:bg-white/10"}`} />
                                        {!isLast && (
                                            <div className={`w-px flex-1 min-h-[24px] ${hasPhotos ? `${config.bg}/30` : "bg-gray-200 dark:bg-white/10"}`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={`pb-6 flex-1 ${!hasPhotos ? "opacity-40" : ""}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-black ${hasPhotos ? config.color : "text-gray-400"}`}>
                                                {config.label}
                                            </span>
                                            {!hasPhotos && (
                                                <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600">
                                                    {isFarmer && (phase === "packing" || phase === "shipping_label" || phase === "delivery_proof")
                                                        ? "Awaiting your upload"
                                                        : !isFarmer && phase === "receipt_condition"
                                                        ? "Upload when received"
                                                        : "Pending"}
                                                </span>
                                            )}
                                        </div>

                                        {hasPhotos ? (
                                            <div className="space-y-2">
                                                <p className="text-[11px] text-gray-400">{config.description}</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {phasePhotos.map((photo) => (
                                                        <button
                                                            key={photo.id}
                                                            onClick={() => setExpandedPhoto(expandedPhoto === photo.id ? null : photo.id)}
                                                            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 hover:ring-2 hover:ring-primary/30 transition-all"
                                                        >
                                                            <SafeImage
                                                                src={photo.photo_url}
                                                                alt={photo.caption || config.label}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {photo.caption && (
                                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
                                                                    <p className="text-[8px] text-white font-medium truncate">{photo.caption}</p>
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                {/* Expanded view */}
                                                {phasePhotos.some(p => expandedPhoto === p.id) && (
                                                    <div className="mt-2">
                                                        {phasePhotos.filter(p => expandedPhoto === p.id).map(photo => (
                                                            <div key={photo.id} className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/5">
                                                                <SafeImage
                                                                    src={photo.photo_url}
                                                                    alt={photo.caption || config.label}
                                                                    className="w-full max-h-64 object-contain bg-gray-50 dark:bg-black/20"
                                                                />
                                                                <div className="px-3 py-2 flex justify-between items-center">
                                                                    <div>
                                                                        {photo.caption && <p className="text-xs font-medium text-[#131613] dark:text-white">{photo.caption}</p>}
                                                                        <p className="text-[10px] text-gray-400">
                                                                            {photo.uploaded_by_profile?.full_name} &middot; {new Date(photo.created_at).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-gray-300 dark:text-gray-600">{config.description}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
