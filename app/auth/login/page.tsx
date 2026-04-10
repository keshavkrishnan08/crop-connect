"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const trimmedEmail = email.trim().toLowerCase();

        const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // Fetch user profile to get their role
        if (data.user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                // If no profile, redirect to role selection
                router.push("/auth/role-selection");
            } else if (profile?.role) {
                // Redirect based on role
                router.push(`/dashboard/${profile.role}`);
            } else {
                // No role set, go to role selection
                router.push("/auth/role-selection");
            }
        }

        setLoading(false);
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError("Please enter your email address first");
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setResetSent(true);
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D130E] font-display relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

            <header className="fixed top-0 z-[100] w-full h-20 md:h-24 flex items-center justify-between section-zoom">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft group-hover:rotate-6 transition-all duration-500">
                        <span className="material-symbols-outlined !text-[24px] font-black">spa</span>
                    </div>
                    <h2 className="text-[#131613] dark:text-white text-xl font-black tracking-tighter">CropConnect</h2>
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
                <div className="w-full max-w-lg">
                    <div className="text-center space-y-4 mb-10">
                        <h1 className="text-[#131613] dark:text-white text-3xl md:text-5xl font-black tracking-tighter">Welcome Back</h1>
                        <p className="text-gray-500 dark:text-[#a3b2a4] text-base md:text-lg font-medium">Continue your journey in the fields.</p>
                    </div>

                    <form onSubmit={handleLogin} className="bg-white dark:bg-[#1a2c15] p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-100 dark:border-white/5 space-y-7">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-xl text-sm font-bold text-center border border-red-100 dark:border-red-900/10">
                                {error}
                            </div>
                        )}

                        {resetSent && (
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 p-4 rounded-xl text-sm font-bold text-center border border-green-100 dark:border-green-900/10">
                                Password reset email sent! Check your inbox.
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary pl-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all dark:text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center pl-1 pr-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Password</label>
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        disabled={loading}
                                        className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary text-white text-sm font-black uppercase tracking-wider rounded-xl shadow-glow hover:bg-primary-dark transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <p className="text-center text-gray-400 dark:text-[#a3b2a4] text-sm font-bold">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/signup" className="text-primary hover:underline underline-offset-4 decoration-2">Sign up</Link>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}
