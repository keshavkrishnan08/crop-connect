"use client";

import { useEffect } from "react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console (could be sent to monitoring service)
        console.error("[Dashboard Error]", error);
    }, [error]);

    return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh] p-4 bg-transparent">
            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-8 max-w-md w-full text-center">
                <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-red-500 !text-[32px]">
                        error_outline
                    </span>
                </div>

                <h2 className="text-xl font-bold text-[#131613] dark:text-white mb-2">
                    Something went wrong
                </h2>

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    We encountered an unexpected error. Please try again or contact support if the problem persists.
                </p>

                {process.env.NODE_ENV === "development" && error.message && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                        <p className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={reset}
                        className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined !text-[18px]">
                            refresh
                        </span>
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}
