import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { Photo } from "@/components/marketing/Photo";
import { LinkButton, Card, Badge, Eyebrow } from "@/components/ui/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SplitScale, SageWeek, StatCountUp } from "@/components/marketing/WhatWeHandleViz";
import {
    Search,
    Truck,
    Shield,
    Receipt,
    Check,
    ArrowRight,
    Plate,
    Pen,
    Handshake,
    StoryTag,
    MarginUp,
    Sparkle,
} from "@/components/icons";

export const metadata = {
    title: "What we handle · CropConnect",
    description: "Sage runs the entire local supply chain for your restaurant. You say what you want and put it on the menu. Here is everything in between.",
};

export default function WhatWeHandlePage() {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <main>
                <Hero />
                <Contrast />
                <Stats />
                <DeepDive />
                <Week />
                <NeverDo />
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
            <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-36">
                <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                    <div>
                        <Reveal>
                            <Eyebrow>The full service</Eyebrow>
                        </Reveal>
                        <Reveal delay={0.05}>
                            <h1 className="mt-5 max-w-2xl text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
                                Sage handles all of it.
                            </h1>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                                Local sourcing is a real job. Finding farms. Vetting them. Setting prices. Driving the route. Sage is the agent that took the whole job. You keep two small parts.
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
                    <Reveal delay={0.18}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-4">
                                <Photo q="farmer,harvest,field" alt="A farmer harvesting in the field" seed={50} caption="The farm" className="aspect-[3/4]" />
                                <Photo q="delivery,van,produce" alt="Produce loaded for delivery" seed={51} caption="The route" className="aspect-square" />
                            </div>
                            <div className="grid gap-4 pt-8">
                                <Photo q="chef,plating,restaurant" alt="A chef plating a dish" seed={52} caption="The plate" className="aspect-square" />
                                <Photo q="fresh,vegetables,crate" alt="A crate of fresh vegetables" seed={53} caption="The crop" className="aspect-[3/4]" />
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------- Contrast */

function Contrast() {
    return (
        <section className="border-b border-line bg-canvas-soft">
            <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
                <Reveal>
                    <Eyebrow>The whole list</Eyebrow>
                    <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">One column is Sage. One is you.</h2>
                    <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                        Look at the size of each. That gap is the point.
                    </p>
                </Reveal>
                <Reveal delay={0.1}>
                    <div className="mt-12">
                        <SplitScale />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* ----------------------------------------------------------------- Stats */

function Stats() {
    const stats = [
        { to: 12, prefix: "", suffix: "", label: "jobs Sage runs for you", sub: "From the first farm call to the last invoice." },
        { to: 2, prefix: "", suffix: "", label: "things left to you", sub: "Say what you want. Put it on the menu." },
        { to: 10, prefix: "", suffix: " min", label: "to set the whole thing up", sub: "No installs. No training. No integrations." },
        { to: 0, prefix: "$", suffix: "", label: "to start your first item", sub: "First local item runs free for a week." },
    ];
    return (
        <section className="border-b border-line">
            <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
                <Reveal>
                    <div className="flex justify-center"><Eyebrow>The shape of it</Eyebrow></div>
                    <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl sm:text-4xl">A lot off your plate. Almost nothing on it.</h2>
                </Reveal>
                <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((s) => (
                        <StaggerItem key={s.label}>
                            <Card className="h-full p-7 text-center">
                                <p className="font-display text-5xl text-brand-600">
                                    <StatCountUp to={s.to} prefix={s.prefix} suffix={s.suffix} className="tnum" />
                                </p>
                                <p className="mt-3 text-[15px] font-semibold text-ink">{s.label}</p>
                                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{s.sub}</p>
                            </Card>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------- DeepDive */

const LIFTS = [
    {
        icon: <Search size={22} />,
        title: "Sourcing and vetting",
        body: "Sage keeps a vetted bench of local farms. It matches each item to the best one by distance, price, and track record, and confirms the volume before it commits.",
        points: ["Ranked farm matches", "Safety and practice checks", "Volume confirmed up front"],
    },
    {
        icon: <Handshake size={22} />,
        title: "Contracts and pricing",
        body: "One standing agreement per item at a fixed seasonal price. Sage drafts the terms, holds the paperwork, and renews it each season. No haggling, no surprise line items.",
        points: ["Fixed seasonal pricing", "Drafted and held for you", "Auto renewal each season"],
    },
    {
        icon: <Truck size={22} />,
        title: "Delivery and logistics",
        body: "Sage plans the route, packs the cold chain, and sets a fixed delivery day. It lands at your door the same time every week. You build a menu you can count on.",
        points: ["Fixed weekly drop", "Cold chain handled", "One door, one schedule"],
    },
    {
        icon: <Shield size={22} />,
        title: "Reliability and backups",
        body: "Crops fail and weather turns. When a farm comes up short, a backup farm fills the order before you notice. Your dish stays on the menu either way.",
        points: ["Backup farm on standby", "Gaps filled automatically", "No 86'd items"],
    },
    {
        icon: <StoryTag size={22} />,
        title: "Provenance and menu copy",
        body: "Sage hands you the farm name and the miles, ready for the plate. The proof is what lets you charge a little more for the same dish.",
        points: ["Farm names and miles", "Menu-ready lines", "Refreshed each season"],
    },
    {
        icon: <Receipt size={22} />,
        title: "Invoices and margin",
        body: "One bill, not a pile of vendor invoices. Sage tracks what each local dish earns over the old spec so you can see the lift per cover.",
        points: ["One clean invoice", "Margin tracked per dish", "Lift per cover, in view"],
    },
];

function DeepDive() {
    return (
        <section className="border-b border-line bg-canvas-soft">
            <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
                <Reveal>
                    <Eyebrow>The heavy lifts</Eyebrow>
                    <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">The work Sage takes off your plate.</h2>
                    <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                        Six jobs that would eat a manager&apos;s week. Sage runs every one of them in the background.
                    </p>
                </Reveal>
                <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

/* ------------------------------------------------------------------ Week */

function Week() {
    return (
        <section className="border-b border-line">
            <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8 lg:py-32">
                <Reveal>
                    <div className="flex justify-center"><Eyebrow>Behind the scenes</Eyebrow></div>
                    <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl sm:text-4xl">What a week looks like for Sage.</h2>
                    <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-ink-muted">
                        You never see any of this. It runs while you cook.
                    </p>
                </Reveal>
                <Reveal delay={0.1}>
                    <div className="mt-12">
                        <SageWeek />
                    </div>
                </Reveal>
                <Reveal delay={0.16}>
                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <Photo q="farm,call,phone" alt="Lining up the farms" seed={54} caption="Lines up farms" className="aspect-[4/3]" />
                        <Photo q="produce,packing,boxes" alt="Packing the order" seed={55} caption="Packs the order" className="aspect-[4/3]" />
                        <Photo q="truck,road,delivery" alt="Running the route" seed={56} caption="Runs the route" className="aspect-[4/3]" />
                        <Photo q="invoice,paperwork,desk" alt="Settling the invoice" seed={57} caption="Settles the bill" className="aspect-[4/3]" />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* --------------------------------------------------------------- NeverDo */

function NeverDo() {
    const items = [
        "Cold-call a single farm",
        "Negotiate a price",
        "Chase a late delivery",
        "Sort through vendor invoices",
        "Cover a crop that failed",
        "Write a provenance line from scratch",
    ];
    return (
        <section className="border-b border-line bg-canvas-soft">
            <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8 lg:py-32">
                <Reveal>
                    <Eyebrow>Off your plate for good</Eyebrow>
                    <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Things you never do again.</h2>
                </Reveal>
                <Stagger className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {items.map((it) => (
                        <StaggerItem key={it}>
                            <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4">
                                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                                    <Check size={15} strokeWidth={2.4} />
                                </span>
                                <span className="text-[15px] text-ink">{it}</span>
                            </div>
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
        <section className="relative overflow-hidden border-b border-line">
            <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
            <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
                <Reveal>
                    <Badge tone="harvest" className="mx-auto"><Sparkle size={12} /> Free to start</Badge>
                    <h2 className="mt-6 text-balance text-3xl sm:text-4xl">You say it. Sage runs it.</h2>
                    <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
                        <Card className="flex items-center gap-3 p-5 text-left">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-harvest-400/15 text-harvest-500">
                                <Pen size={20} />
                            </span>
                            <p className="text-[15px] font-medium text-ink">Say what you want.</p>
                        </Card>
                        <Card className="flex items-center gap-3 p-5 text-left">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-harvest-400/15 text-harvest-500">
                                <Plate size={20} />
                            </span>
                            <p className="text-[15px] font-medium text-ink">Put it on the menu.</p>
                        </Card>
                    </div>
                    <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-ink-muted">
                        Sage carries the rest. Source one item this week and watch what it does to the check.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                            See your numbers
                            <ArrowRight size={18} />
                        </LinkButton>
                        <LinkButton href="/pricing" variant="ghost" size="lg" className="gap-2">
                            <MarginUp size={16} /> See pricing
                        </LinkButton>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
