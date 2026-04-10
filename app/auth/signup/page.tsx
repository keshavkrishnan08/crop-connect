"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tosAccepted, setTosAccepted] = useState(false);

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/\d/.test(pwd)) {
            return "Password must contain at least one number";
        }
        if (!/[a-zA-Z]/.test(pwd)) {
            return "Password must contain at least one letter";
        }
        return null;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate inputs
        const trimmedName = fullName.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedName) {
            setError("Please enter your full name");
            setLoading(false);
            return;
        }

        if (!tosAccepted) {
            setError("You must accept the Terms of Service and Privacy Policy");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
                data: {
                    full_name: trimmedName,
                    tos_accepted_at: new Date().toISOString(),
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // If signup was successful but no session (email confirmation required),
        // sign in the user directly
        if (data.user && !data.session) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }
        }

        // Small delay to ensure auth state is propagated
        await new Promise(resolve => setTimeout(resolve, 100));

        router.push("/auth/role-selection");
        setLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D130E] font-display relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

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
                        <h1 className="text-[#131613] dark:text-white text-3xl md:text-5xl font-black tracking-tighter">Create Account</h1>
                        <p className="text-gray-500 dark:text-[#a3b2a4] text-base md:text-lg font-medium">Join the marketplace and start growing.</p>
                    </div>

                    <form onSubmit={handleSignup} className="bg-white dark:bg-[#1a2c15] p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-100 dark:border-white/5 space-y-7">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-xl text-sm font-bold text-center border border-red-100 dark:border-red-900/10">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary pl-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all dark:text-white"
                                />
                            </div>

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
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary pl-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all dark:text-white"
                                />
                                <p className="text-xs text-gray-400 pl-1">At least 8 characters with letters and numbers</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary pl-1">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all dark:text-white"
                                />
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={tosAccepted}
                                onChange={(e) => setTosAccepted(e.target.checked)}
                                className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                I agree to the{" "}
                                <Link href="/terms" target="_blank" className="text-primary font-bold hover:underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/privacy" target="_blank" className="text-primary font-bold hover:underline">Privacy Policy</Link>,
                                including the escrow payment terms and Stripe&apos;s terms for payment processing.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading || !tosAccepted}
                            className="w-full h-14 bg-primary text-white text-sm font-black uppercase tracking-wider rounded-xl shadow-glow hover:bg-primary-dark transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        <p className="text-center text-gray-400 dark:text-[#a3b2a4] text-sm font-bold">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-primary hover:underline underline-offset-4 decoration-2">Login</Link>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}
