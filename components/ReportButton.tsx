"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/api-client";

const REASONS = [
    { value: "fraud", label: "Fraud or scam" },
    { value: "fake_listing", label: "Fake listing" },
    { value: "harassment", label: "Harassment" },
    { value: "spam", label: "Spam" },
    { value: "scam", label: "Suspicious activity" },
    { value: "impersonation", label: "Impersonation" },
    { value: "inappropriate_content", label: "Inappropriate content" },
    { value: "other", label: "Other" },
] as const;

interface ReportButtonProps {
    reportType: "user" | "listing" | "order" | "message";
    targetId: string;
    /** Optional: small icon-only variant */
    variant?: "icon" | "text";
}

export default function ReportButton({ reportType, targetId, variant = "icon" }: ReportButtonProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!user) return null;

    const handleSubmit = async () => {
        if (!reason) {
            toast("Please select a reason", "error");
            return;
        }

        setSubmitting(true);
        try {
            const res = await authFetch("/api/reports", {
                method: "POST",
                body: JSON.stringify({ reportType, targetId, reason, description }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            toast("Report submitted. We will review it shortly.", "success");
            setShowModal(false);
            setReason("");
            setDescription("");
        } catch (err) {
            toast(err instanceof Error ? err.message : "Failed to submit report", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={
                    variant === "icon"
                        ? "text-gray-400 hover:text-red-500 transition-colors p-1"
                        : "text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                }
                title="Report"
            >
                <span className="material-symbols-outlined !text-[16px]">flag</span>
                {variant === "text" && <span>Report</span>}
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-[#1a2c15] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="size-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-500 !text-[20px]">flag</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[#131613] dark:text-white">Report {reportType}</h3>
                                <p className="text-xs text-gray-500">Help us keep CropConnect safe</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="mt-1 w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none dark:text-white"
                                >
                                    <option value="">Select a reason...</option>
                                    {REASONS.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Details (optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell us more about what happened..."
                                    rows={3}
                                    maxLength={1000}
                                    className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none resize-none dark:text-white"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 h-10 text-sm font-medium text-gray-600 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!reason || submitting}
                                    className="flex-1 h-10 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Submitting..." : "Submit Report"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
