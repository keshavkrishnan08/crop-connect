import { Logo } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/kit";
import { Compass } from "@/components/icons";

export default function NotFound() {
    return (
        <main className="relative grid min-h-screen place-items-center bg-paper bg-aurora px-6">
            <div className="flex w-full max-w-md flex-col items-center text-center animate-fade-up">
                <Logo size="md" />

                <div className="mt-12 grid h-16 w-16 place-items-center rounded-2xl bg-white text-forest-500 shadow-glass">
                    <Compass size={30} strokeWidth={1.6} />
                </div>

                <h1 className="mt-8 font-display text-7xl tracking-tight text-ink sm:text-8xl">404</h1>
                <p className="mt-4 text-base text-ink-muted">We couldn&apos;t find that page.</p>

                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                    <LinkButton href="/">Back home</LinkButton>
                    <LinkButton href="/app" variant="ghost">Go to dashboard</LinkButton>
                </div>
            </div>
        </main>
    );
}
