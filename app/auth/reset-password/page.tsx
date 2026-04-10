"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Supabase will automatically handle the token from the URL hash
        // and establish a session. We just need to check if we have one.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setHasSession(!!session);
            setChecking(false);
        };

        // Listen for auth state changes (Supabase processes the hash token)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setHasSession(true);
                setChecking(false);
            }
        });

        checkSession();

        return () => subscription.unsubscribe();
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        }

        setLoading(false);
    };

    if (checking) {
        return (
            <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D130E] font-display items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500 font-medium">Verifying reset link...</p>
            </div>
        );
    }

    if (!hasSession) {
        return (
            <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D130E] font-display">
                <header className="fixed top-0 z-[100] w-full h-20 md:h-24 flex items-center justify-between section-zoom">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft group-hover:rotate-6 transition-all duration-500">
                            <span className="material-symbols-outlined !text-[24px] font-black">spa</span>
                        </div>
                        <h2 className="text-[#131613] dark:text-white text-xl font-black tracking-tighter">CropConnect</h2>
                    </Link>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
                    <div className="w-full max-w-lg text-center">
                        <div className="bg-white dark:bg-[#1a2c15] p-10 md:p-14 rounded-[3.5rem] shadow-premium border border-gray-100 dark:border-white/5 space-y-6">
                            <div className="size-20 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-orange-500 !text-[40px]">link_off</span>
                            </div>
                            <h1 className="text-2xl font-black text-[#131613] dark:text-white">Invalid or Expired Link</h1>
                            <p className="text-gray-500 dark:text-[#a3b2a4] font-medium">
                                This password reset link is no longer valid. Please request a new one from the login page.
                            </p>
                            <Link
                                href="/auth/login"
                                className="inline-block w-full py-5 bg-primary text-white text-lg font-black rounded-2xl shadow-glow hover:bg-primary-dark transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D130E] font-display">
            <header className="fixed top-0 z-[100] w-full h-20 md:h-24 flex items-center justify-between section-zoom">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft group-hover:rotate-6 transition-all duration-500">
                        <span className="material-symbols-outlined !text-[24px] font-black">spa</span>
                    </div>
                    <h2 className="text-[#131613] dark:text-white text-xl font-black tracking-tighter">CropConnect</h2>
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
                <div className="w-full max-w-lg">
                    <div className="text-center space-y-4 mb-12">
                        <h1 className="text-[#131613] dark:text-white text-4xl md:text-5xl font-black tracking-tighter">
                            {success ? "Password Updated" : "Set New Password"}
                        </h1>
                        <p className="text-gray-500 dark:text-[#a3b2a4] text-lg font-medium">
                            {success ? "You can now log in with your new password." : "Choose a strong password for your account."}
                        </p>
                    </div>

                    {success ? (
                        <div className="bg-white dark:bg-[#1a2c15] p-10 md:p-14 rounded-[3.5rem] shadow-premium border border-gray-100 dark:border-white/5 space-y-6 text-center">
                            <div className="size-20 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-green-500 !text-[40px]">check_circle</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 font-bold">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="bg-white dark:bg-[#1a2c15] p-10 md:p-14 rounded-[3.5rem] shadow-premium border border-gray-100 dark:border-white/5 space-y-8">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl text-sm font-bold text-center border border-red-100 dark:border-red-900/10">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-4">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        className="w-full h-16 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-8 text-lg font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-4">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your password"
                                        className="w-full h-16 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-8 text-lg font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-18 bg-primary text-white text-lg font-black rounded-2xl shadow-glow hover:bg-primary-dark transition-all hover:-translate-y-1 active:scale-95 py-5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
