"use client";

import { useState, useRef } from "react";
import SafeImage from "./SafeImage";

type PhotoType = "packing" | "shipping_label" | "delivery_proof" | "receipt_condition" | "dispute_evidence";

interface PhotoUploadCardProps {
    orderId: string;
    photoType: PhotoType;
    title: string;
    description: string;
    onUploadComplete?: (photo: { id: string; photo_url: string; photo_type: string }) => void;
    existingPhotos?: { id: string; photo_url: string; caption?: string; created_at: string }[];
    disabled?: boolean;
}

const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
    packing: "Packing Quality",
    shipping_label: "Shipping Label",
    delivery_proof: "Delivery Proof",
    receipt_condition: "Received Condition",
    dispute_evidence: "Dispute Evidence",
};

export default function PhotoUploadCard({
    orderId,
    photoType,
    title,
    description,
    onUploadComplete,
    existingPhotos = [],
    disabled = false,
}: PhotoUploadCardProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("Only JPEG, PNG, and WebP images are allowed");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("File must be under 10MB");
            return;
        }

        setError(null);
        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            // Get auth token
            const { data: { session } } = await (await import("@/lib/supabase")).supabase.auth.getSession();
            if (!session?.access_token) {
                setError("Please log in to upload photos");
                return;
            }

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("orderId", orderId);
            formData.append("photoType", photoType);
            if (caption.trim()) formData.append("caption", caption.trim());

            const res = await fetch("/api/orders/photos", {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Upload failed");
                return;
            }

            // Success
            setPreview(null);
            setSelectedFile(null);
            setCaption("");
            if (inputRef.current) inputRef.current.value = "";
            onUploadComplete?.(data.photo);
        } catch {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const cancelSelection = () => {
        setPreview(null);
        setSelectedFile(null);
        setCaption("");
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="bg-white dark:bg-[#1a2c15] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-black text-[#131613] dark:text-white">{title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-1 rounded-md">
                        {PHOTO_TYPE_LABELS[photoType]}
                    </span>
                </div>
            </div>

            {/* Existing photos */}
            {existingPhotos.length > 0 && (
                <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
                    <div className="grid grid-cols-3 gap-2">
                        {existingPhotos.map((photo) => (
                            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
                                <SafeImage
                                    src={photo.photo_url}
                                    alt={photo.caption || photoType}
                                    className="w-full h-full object-cover"
                                />
                                {photo.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                                        <p className="text-[9px] text-white font-medium truncate">{photo.caption}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload area */}
            {!disabled && (
                <div className="p-5">
                    {!preview ? (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all group">
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-8 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity=".3" />
                                <path d="M21 15l-5-5L5 21" />
                            </svg>
                            <span className="text-xs font-bold text-gray-400 mt-2 group-hover:text-primary transition-colors">
                                Click to upload photo
                            </span>
                            <span className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">JPEG, PNG, WebP &middot; Max 10MB</span>
                        </label>
                    ) : (
                        <div className="space-y-3">
                            {/* Preview */}
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={cancelSelection}
                                    className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>

                            {/* Caption */}
                            <input
                                type="text"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Add a caption (optional)"
                                className="w-full h-10 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            />

                            {/* Upload button */}
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full h-10 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50"
                            >
                                {uploading ? "Uploading..." : "Upload Photo"}
                            </button>
                        </div>
                    )}

                    {error && (
                        <p className="text-red-500 text-xs font-bold mt-2">{error}</p>
                    )}
                </div>
            )}
        </div>
    );
}
