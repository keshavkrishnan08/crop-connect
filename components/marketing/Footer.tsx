import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function MarketingFooter() {
    return (
        <footer className="border-t border-line bg-canvas-soft">
            <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
                <div className="flex flex-col justify-between gap-8 sm:flex-row">
                    <div className="max-w-xs">
                        <Logo />
                        <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">Local sourcing handled for you. You run the kitchen. We run the supply.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
                        <FCol title="Product" links={[["See your numbers", "/demo"], ["How it works", "/how-it-works"], ["What we handle", "/what-we-handle"], ["Pricing", "/pricing"]]} />
                        <FCol title="Partners" links={[["For farms", "/for-farms"], ["Sign in", "/app"]]} />
                        <FCol title="Start" links={[["See your numbers", "/demo"], ["Talk to us", "/demo"]]} />
                    </div>
                </div>
                <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[12.5px] text-ink-faint sm:flex-row sm:items-center">
                    <p>Margin figures are illustrative models with editable assumptions. Not financial advice.</p>
                    <p>© {new Date().getFullYear()} CropConnect</p>
                </div>
            </div>
        </footer>
    );
}

function FCol({ title, links }: { title: string; links: [string, string][] }) {
    return (
        <div>
            <p className="mb-2.5 text-2xs font-semibold uppercase tracking-wide text-ink-faint">{title}</p>
            <ul className="space-y-1.5">
                {links.map(([l, h]) => <li key={l + h}><Link href={h} className="text-ink-soft transition hover:text-ink">{l}</Link></li>)}
            </ul>
        </div>
    );
}
