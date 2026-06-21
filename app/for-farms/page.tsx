import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { LinkButton, Card, Eyebrow } from "@/components/ui/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import {
    MatchingMap,
    DemandStability,
    PaydayTimeline,
    FarmStepsRail,
    FarmStat,
} from "@/components/marketing/ForFarmsViz";
import {
    ArrowRight,
    Calendar,
    Receipt,
    Handshake,
    Farm,
    Route,
    Check,
    Sparkle,
    Shield,
} from "@/components/icons";

export const metadata: Metadata = {
    title: "For farms — CropConnect",
    description: "Restaurants want committed local supply. Sage brings you recurring demand, reliable pay, and handles the chef relationship and logistics.",
};

const BENEFITS: { icon: ReactNode; title: string; body: string }[] = [
    {
        icon: <Calendar size={20} />,
        title: "Committed recurring demand",
        body: "Restaurants sign on for the season, not the day. You know what they want and when, weeks ahead.",
    },
    {
        icon: <Receipt size={20} />,
        title: "Pay you can rely on",
        body: "Clear terms set in advance. No chasing checks. The money lands on schedule, every week.",
    },
    {
        icon: <Handshake size={20} />,
        title: "Sage runs the relationship",
        body: "Sage manages the chefs, the orders, and the logistics. You grow. The agent runs the rest.",
    },
    {
        icon: <Farm size={20} />,
        title: "Plant to real orders",
        body: "Grow against demand you can count on. Less guessing in spring. Less waste in the field come harvest.",
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
                    <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
                    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <Reveal>
                                    <Eyebrow>For farms</Eyebrow>
                                </Reveal>
                                <Reveal delay={0.05}>
                                    <h1 className="mt-5 max-w-xl text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
                                        We bring you <span className="ink-grad">buyers who show up.</span>
                                    </h1>
                                </Reveal>
                                <Reveal delay={0.1}>
                                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-muted">
                                        Restaurants want committed local supply. Sage connects you to kitchens near you, sets fair terms, and runs the chef relationship and the logistics. You grow. We handle the rest.
                                    </p>
                                </Reveal>
                                <Reveal delay={0.15}>
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                                            Talk to us
                                            <ArrowRight size={18} />
                                        </LinkButton>
                                        <LinkButton href="/how-it-works" variant="ghost" size="lg">
                                            How it works
                                        </LinkButton>
                                    </div>
                                </Reveal>
                            </div>
                            <Reveal delay={0.18}>
                                <MatchingMap />
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* -------------------------------------------------------- Benefits */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>Why growers join</Eyebrow>
                            <h2 className="mt-4 max-w-xl text-3xl sm:text-4xl">Steady demand. Reliable pay. Less hassle.</h2>
                        </Reveal>
                        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

                {/* ------------------------------------------------------ Stability */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <div className="flex justify-center"><Eyebrow>Trade the guesswork</Eyebrow></div>
                            <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl sm:text-4xl">Flat, committed demand beats the spot market.</h2>
                            <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-ink-muted">
                                Selling week to week means good weeks and weeks you dump crops. A standing order is a line you can plan a whole season around.
                            </p>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <div className="mt-12">
                                <DemandStability />
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ----------------------------------------------------- How it works */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>How it works for you</Eyebrow>
                            <h2 className="mt-4 text-3xl sm:text-4xl">Three steps, then you grow.</h2>
                            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                                You tell Sage what comes off your land. Sage does the matchmaking and the management.
                            </p>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <div className="mt-12">
                                <FarmStepsRail />
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* --------------------------------------------------------- Payday */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <Reveal>
                                <Eyebrow>The money</Eyebrow>
                                <h2 className="mt-4 max-w-md text-3xl sm:text-4xl">Get paid on a schedule, not a maybe.</h2>
                                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted">
                                    Terms are set before the first harvest. Sage handles the invoicing with the restaurant, so the cash reaches you on time without a single phone call.
                                </p>
                                <ul className="mt-6 space-y-3">
                                    {[
                                        "Prices agreed up front for the season",
                                        "One point of contact for every kitchen",
                                        "No late checks, no awkward follow-ups",
                                    ].map((p) => (
                                        <li key={p} className="flex items-center gap-2.5 text-[15px] text-ink-soft">
                                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                                                <Check size={14} strokeWidth={2.4} />
                                            </span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <PaydayTimeline />
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ---------------------------------------------------------- Stats */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <div className="flex justify-center"><Eyebrow>What changes for you</Eyebrow></div>
                            <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl sm:text-4xl">Less selling. More growing.</h2>
                        </Reveal>
                        <Stagger className="mt-12 grid gap-6 sm:grid-cols-3">
                            {[
                                { to: 0, prefix: "$", suffix: "", label: "to join", sub: "No fee to list what you grow with Sage." },
                                { to: 1, prefix: "", suffix: "", label: "point of contact", sub: "Sage manages every kitchen for you." },
                                { to: 100, prefix: "", suffix: "%", label: "of the food price is yours", sub: "Restaurants fund your crops at cost. No cut taken from you." },
                            ].map((s) => (
                                <StaggerItem key={s.label}>
                                    <Card className="h-full p-7 text-center">
                                        <p className="font-display text-5xl text-brand-600">
                                            <FarmStat to={s.to} prefix={s.prefix} suffix={s.suffix} className="tnum" />
                                        </p>
                                        <p className="mt-3 text-[15px] font-semibold text-ink">{s.label}</p>
                                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{s.sub}</p>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>

                {/* ------------------------------------------------------ Close CTA */}
                <section className="relative overflow-hidden bg-canvas">
                    <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
                    <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
                        <Reveal>
                            <span className="badge-harvest mx-auto w-fit"><Sparkle size={13} /> Built for growers</span>
                            <h2 className="mt-6 text-3xl sm:text-4xl">Grow for buyers who show up.</h2>
                            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                                Tell Sage what you grow. It finds the kitchens, sets the terms, and keeps the orders coming.
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                                    Talk to us
                                    <ArrowRight size={18} />
                                </LinkButton>
                                <LinkButton href="/how-it-works" variant="ghost" size="lg" className="gap-2">
                                    <Route size={16} /> See the flow
                                </LinkButton>
                            </div>
                            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-ink-muted">
                                {[
                                    { i: <Shield size={14} className="text-brand-500" />, t: "No fee to join" },
                                    { i: <Handshake size={14} className="text-brand-500" />, t: "Fair terms up front" },
                                    { i: <Check size={14} className="text-brand-500" />, t: "Recurring orders" },
                                ].map((x) => (
                                    <span key={x.t} className="inline-flex items-center gap-1.5">{x.i} {x.t}</span>
                                ))}
                            </p>
                        </Reveal>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
