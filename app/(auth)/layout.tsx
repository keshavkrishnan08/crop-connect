import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-paper bg-aurora">
            {/* decorative blurred blobs */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-forest-300/30 blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-harvest-400/15 blur-3xl"
            />

            {/* brand mark */}
            <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-7">
                <Logo href="/" />
            </div>

            {/* centered slot */}
            <main className="relative z-0 flex min-h-screen items-center justify-center px-5 py-24">
                <div className="w-full max-w-md">{children}</div>
            </main>
        </div>
    );
}
