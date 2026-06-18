"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Button, Field, FieldGroup, GlassCard, Eyebrow } from "@/components/ui/kit";
import { Barn, Storefront, Check, ArrowRight, Mark } from "@/components/icons";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: { value: Role; title: string; blurb: string; icon: typeof Barn }[] = [
    { value: "farm", title: "I run a farm", blurb: "Sell your harvest on standing contracts.", icon: Barn },
    { value: "buyer", title: "I'm a buyer", blurb: "Source produce on reliable, recurring terms.", icon: Storefront },
];

export default function SignupPage() {
    const router = useRouter();
    const toast = useToast();

    const [role, setRole] = useState<Role>("farm");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role } },
        });
        setLoading(false);
        if (error) {
            toast.error("Couldn't create account", error.message);
            return;
        }
        if (data.session) {
            toast.success("Account created");
            router.push("/app/onboarding");
        } else {
            setSent(true);
        }
    }

    if (sent) {
        return (
            <GlassCard className="animate-scale-in p-8 text-center sm:p-9">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-forest-50 text-forest-600 shadow-glass">
                    <Mark size={26} />
                </div>
                <h1 className="mt-5 text-[1.7rem] leading-tight text-ink">Check your email</h1>
                <p className="mt-2 text-sm text-ink-muted">
                    We sent a confirmation link to{" "}
                    <span className="font-semibold text-ink">{email}</span>. Click it to finish
                    setting up your account.
                </p>
                <Link href="/login" className="btn-soft mt-7 w-full">
                    Back to sign in
                </Link>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="animate-fade-up p-8 sm:p-9">
            <Eyebrow>Get started</Eyebrow>
            <h1 className="mt-3 text-[1.9rem] leading-tight text-ink">Create your account</h1>
            <p className="mt-1.5 text-sm text-ink-muted">First, tell us how you'll use CropConnect.</p>

            <form onSubmit={onSubmit} className="mt-7 space-y-5">
                {/* role choice */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ROLES.map((r, i) => {
                        const active = role === r.value;
                        const Icon = r.icon;
                        return (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => setRole(r.value)}
                                className={cn(
                                    "focus-ring group relative animate-fade-up rounded-2xl border p-4 text-left transition-all duration-300 ease-spring",
                                    i === 1 && "animate-delay-100",
                                    active
                                        ? "border-forest-400 bg-forest-50/60 ring-2 ring-forest-400/50"
                                        : "border-line bg-white/60 hover:border-line-strong hover:-translate-y-0.5",
                                )}
                                aria-pressed={active}
                            >
                                <span
                                    className={cn(
                                        "grid h-10 w-10 place-items-center rounded-xl transition-colors",
                                        active ? "bg-forest-600 text-white" : "bg-paper-sunk text-ink-muted",
                                    )}
                                >
                                    <Icon size={20} />
                                </span>
                                <p className="mt-3 font-display text-base text-ink">{r.title}</p>
                                <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{r.blurb}</p>
                                {active && (
                                    <span className="absolute right-3 top-3 grid h-5 w-5 animate-scale-in place-items-center rounded-full bg-forest-600 text-white">
                                        <Check size={13} />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* fields */}
                <FieldGroup label="Full name" className="animate-fade-up animate-delay-100">
                    <Field
                        type="text"
                        autoComplete="name"
                        placeholder="Maria Okafor"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </FieldGroup>

                <FieldGroup label="Email" className="animate-fade-up animate-delay-200">
                    <Field
                        type="email"
                        autoComplete="email"
                        placeholder="you@farm.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </FieldGroup>

                <FieldGroup label="Password" hint="At least 6 characters." className="animate-fade-up animate-delay-300">
                    <Field
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                    />
                </FieldGroup>

                <Button type="submit" loading={loading} size="lg" className="w-full animate-fade-up animate-delay-300">
                    Create account
                    {!loading && <ArrowRight size={18} />}
                </Button>
            </form>

            <p className="mt-7 text-center text-sm text-ink-muted">
                Already have an account?{" "}
                <Link href="/login" className="focus-ring rounded font-semibold text-forest-600 hover:text-forest-700">
                    Sign in
                </Link>
            </p>
        </GlassCard>
    );
}
