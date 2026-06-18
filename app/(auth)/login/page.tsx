"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Button, Field, FieldGroup, GlassCard, Eyebrow } from "@/components/ui/kit";
import { ArrowRight } from "@/components/icons";

export default function LoginPage() {
    const router = useRouter();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (err) {
            setError(err.message);
            toast.error("Couldn't sign in", err.message);
            return;
        }
        toast.success("Welcome back");
        router.push("/app");
    }

    return (
        <GlassCard className="animate-fade-up p-8 sm:p-9">
            <Eyebrow>Sign in</Eyebrow>
            <h1 className="mt-3 text-[1.9rem] leading-tight text-ink">Welcome back</h1>
            <p className="mt-1.5 text-sm text-ink-muted">
                Pick up where you left off — your contracts are waiting.
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
                <FieldGroup label="Email" className="animate-fade-up animate-delay-100">
                    <Field
                        type="email"
                        autoComplete="email"
                        placeholder="you@farm.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </FieldGroup>

                <FieldGroup className="animate-fade-up animate-delay-200">
                    <div className="flex items-baseline justify-between">
                        <label className="label">Password</label>
                        <Link
                            href="/reset-password"
                            className="focus-ring rounded text-[12.5px] font-medium text-forest-600 hover:text-forest-700"
                        >
                            Forgot?
                        </Link>
                    </div>
                    <Field
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </FieldGroup>

                {error && (
                    <p className="animate-fade-in text-sm text-berry" role="alert">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    loading={loading}
                    size="lg"
                    className="w-full animate-fade-up animate-delay-300"
                >
                    Sign in
                    {!loading && <ArrowRight size={18} />}
                </Button>
            </form>

            <p className="mt-7 text-center text-sm text-ink-muted">
                New here?{" "}
                <Link
                    href="/signup"
                    className="focus-ring rounded font-semibold text-forest-600 hover:text-forest-700"
                >
                    Create an account
                </Link>
            </p>
        </GlassCard>
    );
}
