import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { LinkButton, Card, Badge, Eyebrow } from "@/components/ui/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import {
    Search,
    Truck,
    Shield,
    Receipt,
    Check,
    ArrowRight,
    Plate,
    Pen,
} from "@/components/icons";

export const metadata = {
    title: "What we handle · CropConnect",
    description: "CropConnect runs the entire local supply chain for your restaurant. You say what you want and put it on the menu.",
};

const WE_HANDLE = [
    "Finding the farms",
    "Vetting quality and reliability",
    "Negotiating the price",
    "The contract and the paperwork",
    "Weekly delivery and logistics",
    "Backup farms when a crop fails",
    "Provenance and menu copy",
    "Margin tracking per dish",
    "Renewals each season",
];

const YOU_HANDLE = [
    "Tell us what you want",
    "Put it on the menu",
];

export default function WhatWeHandlePage() {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <main>
                <Hero />
                <Contrast />
                <DeepDive />
                <CloseBand />
            </main>
            <MarketingFooter />
        </div>
    );
}

/* ------------------------------------------------------------------ Hero */

function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-line">
            <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
            <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
                <Reveal>
                    <Eyebrow>The full service</Eyebrow>
                </Reveal>
                <Reveal delay={0.05}>
                    <h1 className="mt-5 max-w-2xl text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
                        We handle all of it.
                    </h1>
                </Reveal>
                <Reveal delay={0.1}>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                        Local sourcing is a job. Finding farms. Checking them. Setting prices. Driving the route. We took the whole job. You keep two small parts.
                    </p>
                </Reveal>
                <Reveal delay={0.15}>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                            See your numbers
                            <ArrowRight size={18} />
                        </LinkButton>
                        <LinkButton href="/how-it-works" variant="ghost" size="lg">
                            How it works
                        </LinkButton>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------- Contrast */

function Contrast() {
    return (
        <section className="border-b border-line bg-canvas-soft">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                <Reveal>
                    <h2 className="max-w-2xl text-3xl sm:text-4xl">The whole list is on us.</h2>
                    <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                        One column is ours. One is yours. Look at the size of each.
                    </p>
                </Reveal>

                <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <Reveal>
                        <Card className="h-full p-7">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl">What we handle</h3>
                                <Badge tone="brand">
                                    {WE_HANDLE.length} things
                                </Badge>
                            </div>
                            <ul className="mt-6 space-y-3">
                                {WE_HANDLE.map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                                            <Check size={14} strokeWidth={2.2} />
                                        </span>
                                        <span className="text-[15px] text-ink">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </Reveal>

                    <Reveal delay={0.08}>
                        <Card className="flex h-full flex-col p-7">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl">What you handle</h3>
                                <Badge tone="harvest">
                                    {YOU_HANDLE.length} things
                                </Badge>
                            </div>
                            <ul className="mt-6 space-y-3">
                                {YOU_HANDLE.map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-harvest-400 text-ink">
                                            <Check size={14} strokeWidth={2.2} />
                                        </span>
                                        <span className="text-[15px] font-medium text-ink">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto pt-8">
                                <p className="text-[13px] leading-relaxed text-ink-faint">
                                    That is the entire ask. You stay in the kitchen. We run the supply.
                                </p>
                            </div>
                        </Card>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------- DeepDive */

const LIFTS = [
    {
        icon: <Search size={22} />,
        title: "Sourcing",
        body: "We keep a vetted bench of local farms. We match each item to the best one by distance, price, and track record. We taste before we buy. You never make a call.",
        points: ["Ranked farm matches", "Taste and quality checks", "Volume confirmed up front"],
    },
    {
        icon: <Truck size={22} />,
        title: "Logistics",
        body: "We plan the route, pack the cooler, and set a fixed delivery day. It lands at your door the same time every week. You build a menu you can count on.",
        points: ["Fixed weekly drop", "Cold chain handled", "One door, one schedule"],
    },
    {
        icon: <Shield size={22} />,
        title: "Reliability",
        body: "Crops fail. Weather turns. When a farm comes up short, a backup farm fills the order before you notice. Your dish stays on the menu.",
        points: ["Backup farm on standby", "Gaps filled automatically", "No 86'd items"],
    },
    {
        icon: <Receipt size={22} />,
        title: "Paperwork",
        body: "One standing contract per item at a fixed seasonal price. We handle the terms, the invoices, and the renewals. No haggling. No surprise line items.",
        points: ["Fixed seasonal pricing", "Invoices handled", "Auto renewal each season"],
    },
];

function DeepDive() {
    return (
        <section className="border-b border-line">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                <Reveal>
                    <Eyebrow>The heavy lifts</Eyebrow>
                    <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">The work we take off your plate.</h2>
                </Reveal>
                <Stagger className="mt-12 grid gap-6 sm:grid-cols-2">
                    {LIFTS.map((lift) => (
                        <StaggerItem key={lift.title}>
                            <Card hover className="h-full p-7">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                                    {lift.icon}
                                </span>
                                <h3 className="mt-5 text-xl">{lift.title}</h3>
                                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{lift.body}</p>
                                <ul className="mt-5 space-y-2 border-t border-line pt-5">
                                    {lift.points.map((p) => (
                                        <li key={p} className="flex items-center gap-2.5 text-[14px] text-ink-soft">
                                            <Check size={15} className="shrink-0 text-brand-500" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------ Close band */

function CloseBand() {
    return (
        <section className="relative overflow-hidden border-b border-line bg-canvas-soft">
            <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
            <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
                <Reveal>
                    <Badge tone="harvest" className="mx-auto">
                        Free to start
                    </Badge>
                    <h2 className="mt-6 text-balance text-3xl sm:text-4xl">You say it. We run it.</h2>
                    <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
                        <Card className="flex items-center gap-3 p-5 text-left">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                                <Plate size={20} />
                            </span>
                            <p className="text-[15px] font-medium text-ink">Say what you want.</p>
                        </Card>
                        <Card className="flex items-center gap-3 p-5 text-left">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                                <Pen size={20} />
                            </span>
                            <p className="text-[15px] font-medium text-ink">Put it on the menu.</p>
                        </Card>
                    </div>
                    <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-ink-muted">
                        We carry the other nine. Source one item this week and see what it does to the check.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                            See your numbers
                            <ArrowRight size={18} />
                        </LinkButton>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
