"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState<"farmer" | "buyer" | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // Redirect to login if not authenticated after loading completes
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [authLoading, user, router]);

    const handleContinue = async () => {
        if (!selectedRole) return;

        setLoading(true);
        setError(null);

        // Get the current user directly from Supabase if not in context yet
        let userId = user?.id;
        if (!userId) {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            userId = currentUser?.id;
        }

        try {
            if (!userId) {
                setError("You must be logged in to select a role");
                setLoading(false);
                return;
            }

            // Update the profile with the selected role
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: selectedRole })
                .eq('id', userId);

            if (updateError) {
                throw updateError;
            }

            // Also update user metadata for consistency
            await supabase.auth.updateUser({
                data: { role: selectedRole }
            });

            router.push(`/auth/onboarding/${selectedRole}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save role');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark font-display">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary animate-pulse">
                        <span className="material-symbols-outlined text-3xl">spa</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-[#111811] transition-colors duration-500">
            <header className="fixed top-0 z-[100] w-full bg-white/70 dark:bg-[#0D130E]/70 backdrop-blur-3xl border-b border-gray-100 dark:border-white/5 transition-all duration-500">
                <div className="section-zoom h-20 md:h-24 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft group-hover:rotate-6 transition-all duration-500">
                            <span className="material-symbols-outlined !text-[24px] font-black">spa</span>
                        </div>
                        <h2 className="text-[#131613] dark:text-white text-xl font-black tracking-tighter">CropConnect</h2>
                    </Link>
                    <button className="h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 px-6 text-[10px] font-black uppercase tracking-widest text-[#111811] dark:text-white transition-all hover:bg-gray-200 dark:hover:bg-white/20 active:scale-95 hidden sm:flex">
                        Need Help?
                    </button>
                </div>
            </header>

            <div className="flex flex-1 flex-col items-center justify-center p-8 md:p-12 mt-20 md:mt-24">
                <div className="flex w-full max-w-[900px] flex-col gap-12 animate-fade-in">
                    <div className="flex flex-col gap-10 text-center">
                        <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
                            <div className="flex justify-between px-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Step 1 of 3</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role Selection</p>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                                <div className="h-full w-1/3 rounded-full bg-primary transition-all duration-700 ease-out shadow-glow"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black heading-tight text-[#111811] dark:text-white">First, tell us who you are.</h1>
                            <p className="text-lg text-gray-400 dark:text-[#a3b2a4] font-medium max-w-lg mx-auto leading-relaxed">Welcome! How will you use CropConnect to grow your business?</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl text-sm font-bold text-center border border-red-100 dark:border-red-900/10 max-w-md mx-auto">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                        {[
                            {
                                id: "farmer",
                                title: "I am a Farmer",
                                desc: "Sell your harvest directly to buyers and manage your crops efficiently.",
                                icon: "agriculture",
                                activeBg: "bg-primary",
                                idleBg: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            },
                            {
                                id: "buyer",
                                title: "I am a Buyer",
                                desc: "Source fresh produce directly from local farms and trusted growers.",
                                icon: "shopping_basket",
                                activeBg: "bg-earth text-white",
                                idleBg: "bg-amber-50 text-earth dark:bg-earth/10 dark:text-earth"
                            }
                        ].map(role => (
                            <label key={role.id} className="group relative cursor-pointer">
                                <input
                                    className="peer sr-only"
                                    name="role"
                                    type="radio"
                                    value={role.id}
                                    checked={selectedRole === role.id}
                                    onChange={() => setSelectedRole(role.id as "farmer" | "buyer")}
                                    disabled={loading}
                                />
                                <div
                                    className={`flex h-full flex-col items-center gap-8 rounded-[3rem] border bg-white dark:bg-surface-dark p-12 transition-all duration-500 hover:shadow-soft group-hover:-translate-y-2 ${selectedRole === role.id
                                        ? "border-primary/20 bg-primary/[0.01] dark:bg-primary/5 shadow-soft ring-4 ring-primary/5"
                                        : "border-gray-100 dark:border-white/5 shadow-card"
                                        } ${loading ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    <div className={`flex size-24 items-center justify-center rounded-3xl transition-all duration-700 ${selectedRole === role.id ? `${role.activeBg} text-white scale-110 shadow-glow` : `${role.idleBg} group-hover:scale-105`}`}>
                                        <span className="material-symbols-outlined text-[48px]">{role.icon}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <h3 className="text-2xl font-black text-[#111811] dark:text-white tracking-tight">{role.title}</h3>
                                        <p className="text-sm text-gray-400 dark:text-[#a3b2a4] leading-relaxed font-medium">
                                            {role.desc}
                                        </p>
                                    </div>
                                    <div className={`absolute right-10 top-10 transition-all duration-500 ${selectedRole === role.id ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
                                        <div className="bg-primary text-white rounded-full p-2 shadow-lg">
                                            <span className="material-symbols-outlined text-base font-bold">check</span>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleContinue}
                            disabled={!selectedRole || loading}
                            className={`button-base w-full max-w-sm h-14 !text-sm shadow-premium !rounded-2xl transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed ${selectedRole === 'buyer' ? 'bg-earth hover:bg-earth-dark active:shadow-inner' : 'bg-primary hover:bg-primary-dark active:shadow-inner'} text-white`}
                        >
                            <span>{loading ? "Saving..." : "Continue"}</span>
                            {!loading && (
                                <span className="material-symbols-outlined ml-3 text-lg transition-transform group-hover:translate-x-1">
                                    arrow_forward
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
