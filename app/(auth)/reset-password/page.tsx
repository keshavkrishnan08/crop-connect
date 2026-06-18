"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Button, Field, FieldGroup, GlassCard, Eyebrow } from "@/components/ui/kit";
import { ArrowRight, Check } from "@/components/icons";

type Mode = "request" | "recovery";

export default function ResetPasswordPage() {
    const router = useRouter();
    const toast = useToast();

    const [mode, setMode] = useState<Mode>("request");
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Detect the recovery session established by the email link.
    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") setMode("recovery");
        });

        supabase.auth.getSession().then(({ data }) => {
            const hasRecoveryHash =
                typeof window !== "undefined" && window.location.hash.includes("type=recovery");
            if (data.session && hasRecoveryHash) setMode("recovery");
        });

        return () => sub.subscription.unsubscribe();
    }, []);

    async function onRequest(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/reset-password",
        });
        setLoading(false);
        if (err) {
            setError(err.message);
            toast.error("Couldn't send reset link", err.message);
            return;
        }
        setSent(true);
    }

    async function onRecovery(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords don't match.");
            return;
        }

        setLoading(true);
        const { error: err } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (err) {
            setError(err.message);
            toast.error("Couldn't update password", err.message);
            return;
        }
        toast.success("Password updated", "You're all set — welcome back.");
        router.push("/app");
    }

    // ---- Confirmation panel (link sent) ----
    if (mode === "request" && sent) {
        return (
            <GlassCard className="animate-scale-in p-8 sm:p-9 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-forest-50 text-forest-500 shadow-glass">
                    <Check size={26} />
                </div>
                <h1 className="mt-5 text-[1.9rem] leading-tight text-ink">Check your email</h1>
                <p className="mt-2 text-sm text-ink-muted">
                    We sent a reset link to{" "}
                    <span className="font-semibold text-ink-soft">{email}</span>. Open it to choose a
                    new password — the link expires in an hour.
                </p>

                <div className="divider my-7" />

                <p className="text-sm text-ink-muted">
                    Didn't get it?{" "}
                    <button
                        type="button"
                        onClick={() => setSent(false)}
                        className="focus-ring rounded font-semibold text-forest-600 hover:text-forest-700"
                    >
                        Try again
                    </button>
                </p>
                <p className="mt-3 text-center text-sm text-ink-muted">
                    <Link
                        href="/login"
                        className="focus-ring rounded font-semibold text-forest-600 hover:text-forest-700"
                    >
                        Back to sign in
                    </Link>
                </p>
            </GlassCard>
        );
    }

    // ---- Recovery mode (set a new password) ----
    if (mode === "recovery") {
        return (
            <GlassCard className="animate-fade-up p-8 sm:p-9">
                <Eyebrow>Reset password</Eyebrow>
                <h1 className="mt-3 text-[1.9rem] leading-tight text-ink">Choose a new password</h1>
                <p className="mt-1.5 text-sm text-ink-muted">
                    Pick something strong — at least 8 characters.
                </p>

                <form onSubmit={onRecovery} className="mt-7 space-y-4">
                    <FieldGroup label="New password" className="animate-fade-up animate-delay-100">
                        <Field
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </FieldGroup>

                    <FieldGroup label="Confirm password" className="animate-fade-up animate-delay-200">
                        <Field
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
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
                        Update password
                        {!loading && <ArrowRight size={18} />}
                    </Button>
                </form>

                <p className="mt-7 text-center text-sm text-ink-muted">
                    <Link
                        href="/login"
                        className="focus-ring rounded font-semibold text-forest-600 hover:text-forest-700"
                    >
                        Back to sign in
                    </Link>
                </p>
            </GlassCard>
        );
    }

    // ---- Request mode (default) ----
    return (
        <GlassCard className="animate-fade-up p-8 sm:p-9">
            <Eyebrow>Reset password</Eyebrow>
            <h1 className="mt-3 text-[1.9rem] leading-tight text-ink">Forgot your password?</h1>
            <p className="mt-1.5 text-sm text-ink-muted">
                No worries — enter your email and we'll send you a link to get back in.
            </p>

            <form onSubmit={onRequest} className="mt-7 space-y-4">
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

                {error && (
                    <p className="animate-fade-in text-sm text-berry" role="alert">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    loading={loading}
                    size="lg"
                    className="w-full animate-fade-up animate-delay-200"
                >
                    Send reset link
                    {!loading && <ArrowRight size={18} />}
                </Button>
            </form>

            <p className="mt-7 text-center text-sm text-ink-muted">
                Remembered it?{" "}
                <Link
                    href="/login"
                    className="focus-ring rounded font-semibold text-forest-600 hover:text-forest-700"
                >
                    Back to sign in
                </Link>
            </p>
        </GlassCard>
    );
}
