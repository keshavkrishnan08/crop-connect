"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Menu, X, ArrowRight } from "@/components/icons";

const LINKS = [
    { href: "/how-it-works", label: "How it works" },
    { href: "/what-we-handle", label: "What we handle" },
    { href: "/pricing", label: "Pricing" },
    { href: "/for-farms", label: "For farms" },
];

export function MarketingNav() {
    const [open, setOpen] = React.useState(false);
    return (
        <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 lg:px-8">
                <Logo />
                <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
                    {LINKS.map((l) => <Link key={l.href} href={l.href} className="transition hover:text-ink">{l.label}</Link>)}
                </nav>
                <div className="flex items-center gap-2.5">
                    <Link href="/sign-in" className="hidden text-sm font-semibold text-ink-soft transition hover:text-ink sm:block">Sign in</Link>
                    <Link href="/demo" className="btn-primary btn-sm">See your numbers <ArrowRight size={15} /></Link>
                    <button onClick={() => setOpen((v) => !v)} className="grid h-9 w-9 place-items-center rounded-lg hairline bg-white/70 md:hidden">{open ? <X size={18} /> : <Menu size={18} />}</button>
                </div>
            </div>
            {open && (
                <div className="border-t border-line bg-canvas px-5 py-3 md:hidden">
                    {LINKS.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-[15px] font-medium text-ink-soft">{l.label}</Link>)}
                    <Link href="/sign-in" onClick={() => setOpen(false)} className="block py-2 text-[15px] font-semibold text-ink">Sign in</Link>
                </div>
            )}
        </header>
    );
}
