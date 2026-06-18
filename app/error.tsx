"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/kit";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="relative grid min-h-screen place-items-center bg-paper bg-aurora px-6">
            <div className="glass-card w-full max-w-md p-9 text-center animate-scale-in">
                <div className="flex justify-center">
                    <Logo size="md" />
                </div>

                <h1 className="mt-9 font-display text-3xl tracking-tight text-ink">Something went wrong</h1>
                <p className="mt-3 text-sm text-ink-muted">
                    An unexpected error interrupted this page. You can try again, or head back home.
                </p>

                {error.message && (
                    <p className="mt-4 truncate text-xs text-ink-faint" title={error.message}>
                        {error.message}
                    </p>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button onClick={() => reset()}>Try again</Button>
                    <Link href="/" className="btn-ghost">Back home</Link>
                </div>
            </div>
        </main>
    );
}
