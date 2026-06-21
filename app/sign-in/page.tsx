"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient, supabaseConfigured } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight, Leaf } from "@/components/icons";

export default function SignInPage() {
    const router = useRouter();
    const [mode, setMode] = React.useState<"signin" | "signup">("signin");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [notice, setNotice] = React.useState<string | null>(null);
    const configured = supabaseConfigured();

    const nextPath = () => {
        if (typeof window === "undefined") return "/app";
        return new URLSearchParams(window.location.search).get("next") || "/app";
    };

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null); setNotice(null);
        const supabase = getBrowserClient();
        if (!supabase) { setError("Accounts are not connected yet."); return; }
        setLoading(true);
        try {
            if (mode === "signup") {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.session) router.push(nextPath());
                else { setNotice("Check your email to confirm your account, then sign in."); setMode("signin"); }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push(nextPath());
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative grid min-h-screen place-items-center overflow-hidden bg-aura px-5 py-12">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.5] [mask-image:radial-gradient(60%_50%_at_50%_30%,black,transparent)]" />
            <div className="relative w-full max-w-sm">
                <div className="mb-8 flex justify-center"><Link href="/"><Logo /></Link></div>

                <div className="card p-7">
                    <h1 className="font-display text-2xl text-ink">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
                    <p className="mt-1 text-[14px] text-ink-muted">{mode === "signin" ? "Sign in to your sourcing dashboard." : "Start sourcing local in minutes."}</p>

                    <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-canvas-sunk p-1">
                        {(["signin", "signup"] as const).map((m) => (
                            <button key={m} onClick={() => { setMode(m); setError(null); setNotice(null); }} type="button"
                                className={`rounded-lg py-2 text-[13px] font-semibold transition ${mode === m ? "bg-white text-ink shadow-sm" : "text-ink-muted"}`}>
                                {m === "signin" ? "Sign in" : "Create account"}
                            </button>
                        ))}
                    </div>

                    {!configured && <p className="mt-5 rounded-xl bg-harvest-400/10 px-3.5 py-3 text-[13px] text-harvest-600">Accounts are not connected yet. Add your Supabase keys to <code>.env.local</code> to enable sign-in.</p>}

                    <form onSubmit={submit} className="mt-5 space-y-3">
                        <div>
                            <label className="label">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@restaurant.com" className="field" autoComplete="email" />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="field" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
                        </div>
                        {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
                        {notice && <p className="flex items-center gap-1.5 text-[13px] font-medium text-brand-600"><Leaf size={14} /> {notice}</p>}
                        <button type="submit" disabled={loading || !configured} className="btn-primary w-full">
                            {loading ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"} <ArrowRight size={16} />
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-[13px] text-ink-muted">
                    Want to see the numbers first? <Link href="/demo" className="font-semibold text-brand-600 hover:underline">Try the demo</Link>
                </p>
            </div>
        </div>
    );
}
