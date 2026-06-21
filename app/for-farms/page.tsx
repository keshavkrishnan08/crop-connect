import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { LinkButton, Card, Eyebrow } from "@/components/ui/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import {
    ArrowRight,
    Calendar,
    Receipt,
    Handshake,
    Farm,
    Route,
} from "@/components/icons";

export const metadata: Metadata = {
    title: "For farms — CropConnect",
    description: "Restaurants want committed local supply. We connect you and handle the rest.",
};

const BENEFITS: { icon: ReactNode; title: string; body: string }[] = [
    {
        icon: <Calendar size={20} />,
        title: "Committed recurring demand",
        body: "Restaurants sign on for the season, not the day. You know what they want and when.",
    },
    {
        icon: <Receipt size={20} />,
        title: "You get paid reliably",
        body: "Clear terms, set in advance. No chasing checks. The money lands on schedule.",
    },
    {
        icon: <Handshake size={20} />,
        title: "We handle the relationship",
        body: "We manage the chefs, the orders, and the logistics. You grow. We run the rest.",
    },
    {
        icon: <Farm size={20} />,
        title: "You plant to real orders",
        body: "Grow against demand you can count on. Less guessing. Less waste in the field.",
    },
];

const STEPS: { n: string; title: string; body: string }[] = [
    {
        n: "01",
        title: "Tell us what you grow",
        body: "Your crops, your acreage, your season. We learn what you can supply and when.",
    },
    {
        n: "02",
        title: "We match you to kitchens",
        body: "We find restaurants that want your crops and set the terms with you.",
    },
    {
        n: "03",
        title: "You harvest. We handle delivery.",
        body: "You fill the orders. We orchestrate the trucks and keep the chefs happy.",
    },
];

export default function ForFarmsPage() {
    return (
        <div className="relative min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <main>
                {/* ---------------------------------------------------------- Hero */}
                <section className="relative overflow-hidden border-b border-line">
                    <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
                    <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8 lg:py-28">
                        <Reveal>
                            <Eyebrow>For farms</Eyebrow>
                        </Reveal>
                        <Reveal delay={0.05}>
                            <h1 className="mt-5 text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
                                We bring you <span className="ink-grad">buyers.</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-ink-muted">
                                Restaurants want committed local supply. We connect you and handle the rest.
                            </p>
                        </Reveal>
                        <Reveal delay={0.15}>
                            <div className="mt-8 flex justify-center">
                                <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                                    Talk to us
                                    <ArrowRight size={18} />
                                </LinkButton>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* -------------------------------------------------------- Benefits */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>Why growers join</Eyebrow>
                            <h2 className="mt-4 max-w-xl text-3xl sm:text-4xl">Steady demand. Reliable pay. Less hassle.</h2>
                        </Reveal>
                        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2">
                            {BENEFITS.map((b) => (
                                <StaggerItem key={b.title}>
                                    <Card className="h-full p-7">
                                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-600">{b.icon}</span>
                                        <h3 className="mt-5 text-lg font-semibold text-ink">{b.title}</h3>
                                        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{b.body}</p>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>

                {/* ----------------------------------------------------- How it works */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>How it works for you</Eyebrow>
                            <h2 className="mt-4 text-3xl sm:text-4xl">Three steps.</h2>
                        </Reveal>
                        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
                            {STEPS.map((s) => (
                                <StaggerItem key={s.n}>
                                    <Card className="h-full p-7">
                                        <span className="font-mono tnum text-2xl font-semibold text-brand-500/70">{s.n}</span>
                                        <h3 className="mt-3 text-lg font-semibold text-ink">{s.title}</h3>
                                        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{s.body}</p>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>

                {/* ------------------------------------------------------ Close CTA */}
                <section className="bg-canvas-soft">
                    <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8 lg:py-24">
                        <Reveal>
                            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600 mx-auto">
                                <Route size={22} />
                            </span>
                            <h2 className="mt-6 text-3xl sm:text-4xl">Grow for buyers who show up.</h2>
                            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                                Tell us what you grow. We will find the kitchens and set up the supply.
                            </p>
                            <div className="mt-8 flex justify-center">
                                <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                                    Talk to us
                                    <ArrowRight size={18} />
                                </LinkButton>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
