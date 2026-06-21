import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { Photo } from "@/components/marketing/Photo";
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
    Truck,
    Sprout,
    Star,
    MapPin,
    Check,
    Sparkle,
    Shield,
} from "@/components/icons";

export const metadata: Metadata = {
    title: "For farms — CropConnect",
    description: "Restaurants want committed local supply. Sage brings you recurring demand, prices set up front, reliable pay, and runs the chef relationship and logistics.",
};

const BENEFITS: { icon: ReactNode; title: string; body: string }[] = [
    {
        icon: <Calendar size={20} />,
        title: "Committed volume",
        body: "Kitchens sign on for the season, not the day. You know what they want and when, weeks ahead of harvest.",
    },
    {
        icon: <Handshake size={20} />,
        title: "Prices set up front",
        body: "We agree a fair price before the first crop goes in the ground. It holds for the season. No haggling at the tailgate.",
    },
    {
        icon: <Receipt size={20} />,
        title: "Pay on a schedule",
        body: "Sage invoices the restaurant and pays you on a fixed day. The money lands every week. No chasing checks.",
    },
    {
        icon: <Truck size={20} />,
        title: "We run the relationship",
        body: "Sage manages the chefs, the orders, and the route. One point of contact covers every kitchen you supply.",
    },
    {
        icon: <Sprout size={20} />,
        title: "Plant to real orders",
        body: "Grow against demand you can count on. Less guessing in spring. Less waste in the field come harvest.",
    },
    {
        icon: <Star size={20} />,
        title: "No marketing, no chasing",
        body: "Stop building a booth, a website, and a wholesale list. We bring the buyers. You stay in the field.",
    },
];

const DETAIL_STEPS: { n: string; title: string; body: string }[] = [
    { n: "01", title: "Tell us what you grow", body: "Your crops, your acreage, your season, and how much you can supply each week. A short call covers it." },
    { n: "02", title: "We match you to nearby kitchens", body: "Sage finds restaurants close to you that want exactly what you grow, then sizes the order to your capacity." },
    { n: "03", title: "We set a standing seasonal agreement", body: "One simple deal per crop at a price you both agree on. It runs the whole season and renews when it ends." },
    { n: "04", title: "You harvest for weekly pickups", body: "Pick to a fixed weekly order. Sage runs the route and the cold chain. You pack it and it goes." },
    { n: "05", title: "You get paid on schedule", body: "We invoice the kitchens and pay you on a set day, every week, with no follow-up and no late checks." },
];

const FIT: { icon: ReactNode; title: string; body: string }[] = [
    {
        icon: <Sprout size={20} />,
        title: "Small and mid-size local growers",
        body: "Family farms, market gardens, and orchards within delivery range of a town with restaurants. If you sell at a market today, you fit.",
    },
    {
        icon: <Check size={20} />,
        title: "Steady, honest quality",
        body: "You grow well and you grade fairly. Chefs come back for the crop you said you would send, week after week.",
    },
    {
        icon: <Shield size={20} />,
        title: "Food-safety basics covered",
        body: "Clean handling, safe wash and storage, and the records a kitchen expects. If you need help getting there, we point the way.",
    },
];

const FAQ: { q: string; a: string }[] = [
    { q: "How do I get paid, and when?", a: "Sage invoices the restaurant for you and pays you on a fixed day each week. Terms are set before the first harvest, so the amount is never a surprise and you never chase a check." },
    { q: "Who handles delivery?", a: "We do. Sage plans the route, sets a fixed pickup day, and runs the cold chain to the kitchen. You pack the order. We move it." },
    { q: "What if my crop comes up short?", a: "Tell us early. We adjust the order and lean on a backup grower to cover the gap for the kitchen. An honest short week does not cost you the account." },
    { q: "Is there a fee to join?", a: "No. Listing what you grow with Sage is free. The restaurant pays the service fee. You keep the full price of your food." },
    { q: "Do I keep my other accounts?", a: "Yes. Sell at the market, run your CSA, keep your wholesale buyers. Sage fills the committed volume you set aside for us and nothing more." },
    { q: "Can I set my own prices?", a: "You agree the price with us before the season starts. We bring the kitchen demand and a fair number to the table. Nothing gets locked in without your yes." },
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
                    <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-36">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <Reveal>
                                    <Eyebrow>For farms</Eyebrow>
                                </Reveal>
                                <Reveal delay={0.05}>
                                    <h1 className="mt-5 max-w-xl text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
                                        Trade the spot market for <span className="ink-grad">buyers who show up.</span>
                                    </h1>
                                </Reveal>
                                <Reveal delay={0.1}>
                                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-muted">
                                        Selling week to week is a grind. Sage connects you to kitchens near you, agrees a fair price up front, and runs the chef relationship and the logistics. You get committed, recurring demand. You grow. We handle the rest.
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
                                <Reveal delay={0.2}>
                                    <p className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-ink-muted">
                                        {[
                                            { i: <Shield size={14} className="text-brand-500" />, t: "No fee to join" },
                                            { i: <Handshake size={14} className="text-brand-500" />, t: "Prices set up front" },
                                            { i: <Receipt size={14} className="text-brand-500" />, t: "Paid weekly" },
                                        ].map((x) => (
                                            <span key={x.t} className="inline-flex items-center gap-1.5">{x.i} {x.t}</span>
                                        ))}
                                    </p>
                                </Reveal>
                            </div>
                            <Reveal delay={0.18}>
                                <MatchingMap />
                            </Reveal>
                        </div>

                        {/* photo strip */}
                        <Reveal delay={0.24}>
                            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <Photo q="farm,field,rows" alt="Rows in an open farm field" seed={31} caption="The land" className="aspect-[4/5]" />
                                <Photo q="farmer,harvest,vegetables" alt="A grower harvesting vegetables" seed={32} caption="The harvest" className="aspect-[4/5]" />
                                <Photo q="fresh,vegetables,crate" alt="A packed crate of fresh produce" seed={33} caption="Packed to order" className="aspect-[4/5]" />
                                <Photo q="delivery,van,produce" alt="Produce loaded for delivery" seed={34} caption="On the route" className="aspect-[4/5]" />
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* -------------------------------------------------------- Benefits */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
                        <Reveal>
                            <Eyebrow>Why sell through us</Eyebrow>
                            <h2 className="mt-4 max-w-xl text-3xl sm:text-4xl">Steady demand. Fair prices. Less hassle.</h2>
                            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                                The spot market pays you to gamble. We pay you to grow. Here is what changes when a kitchen commits to your crop for a season.
                            </p>
                        </Reveal>
                        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {BENEFITS.map((b, i) => (
                                <StaggerItem key={b.title}>
                                    <Card className="group relative h-full overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                                        <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-brand-400 to-harvest-400 transition-transform duration-300 group-hover:scale-x-100" />
                                        <span className={`grid h-12 w-12 place-items-center rounded-2xl text-white shadow-brand ${i % 3 === 1 ? "bg-gradient-to-br from-harvest-400 to-harvest-500" : "bg-gradient-to-br from-brand-500 to-brand-700"}`}>{b.icon}</span>
                                        <h3 className="mt-5 font-display text-xl text-ink">{b.title}</h3>
                                        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{b.body}</p>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>

                {/* ------------------------------------------------------ Stability */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-5xl px-5 py-24 lg:px-8 lg:py-32">
                        <Reveal>
                            <div className="flex justify-center"><Eyebrow>Trade the guesswork</Eyebrow></div>
                            <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl sm:text-4xl">Flat committed demand beats the spot market.</h2>
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
                    <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
                        <Reveal>
                            <Eyebrow>How it works for a farm</Eyebrow>
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

                        {/* detailed walkthrough with photo */}
                        <div className="mt-16 grid items-start gap-10 lg:grid-cols-2">
                            <Reveal>
                                <div className="grid gap-4">
                                    <Photo q="farm,field,crops" alt="Rows of crops on a local farm" seed={62} caption="Tell us what you grow" place="Your farm" className="aspect-[16/10]" />
                                    <Photo q="vegetable,harvest,basket" alt="A basket of harvested vegetables" seed={64} caption="We match it to nearby kitchens" className="aspect-[16/9]" />
                                </div>
                            </Reveal>
                            <Reveal delay={0.08}>
                                <ol className="relative space-y-1">
                                    {DETAIL_STEPS.map((s) => (
                                        <li key={s.n} className="flex gap-5 rounded-2xl px-4 py-4 transition-colors hover:bg-white">
                                            <span className="font-mono text-lg text-brand-500 tnum">{s.n}</span>
                                            <div>
                                                <h3 className="text-[16px] font-semibold text-ink">{s.title}</h3>
                                                <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{s.body}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* --------------------------------------------------------- Payday */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
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

                {/* ------------------------------------------------------- Who it is for */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <Reveal>
                                <div className="grid gap-4">
                                    <Photo q="small,farm,barn" alt="A small family farm" seed={38} caption="Family farms and market gardens" place="Within range" className="aspect-[16/10]" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Photo q="tomatoes,vine,farm" alt="Ripe tomatoes on the vine" seed={39} className="aspect-square" />
                                        <Photo q="produce,washing,packing" alt="Produce washed and packed for safety" seed={40} className="aspect-square" />
                                    </div>
                                </div>
                            </Reveal>
                            <Reveal delay={0.08}>
                                <Eyebrow>Who it is for</Eyebrow>
                                <h2 className="mt-4 max-w-md text-3xl sm:text-4xl">Built for local growers.</h2>
                                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                                    You do not need scale or a sales team. You need good crops and the will to fill a steady order. Here is the fit.
                                </p>
                                <div className="mt-8 space-y-4">
                                    {FIT.map((f) => (
                                        <div key={f.title} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600">{f.icon}</span>
                                            <div>
                                                <h3 className="text-[15px] font-semibold text-ink">{f.title}</h3>
                                                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">{f.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ---------------------------------------------------------- Stats */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
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

                {/* ----------------------------------------------------------- FAQ */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-3xl px-5 py-24 lg:px-8 lg:py-32">
                        <Reveal>
                            <Eyebrow>Questions from growers</Eyebrow>
                            <h2 className="mt-4 text-3xl sm:text-4xl">Straight answers for farms.</h2>
                        </Reveal>
                        <div className="mt-10 divide-y divide-line border-y border-line">
                            {FAQ.map((f) => (
                                <div key={f.q} className="py-6">
                                    <h3 className="text-[16px] font-semibold text-ink">{f.q}</h3>
                                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ------------------------------------------------------ Close CTA */}
                <section className="relative overflow-hidden bg-canvas">
                    <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
                    <div className="mx-auto max-w-5xl px-5 py-24 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                            <Reveal>
                                <span className="badge-harvest w-fit"><Sparkle size={13} /> Built for growers</span>
                                <h2 className="mt-6 text-3xl sm:text-4xl">Grow for buyers who show up.</h2>
                                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                                    Tell Sage what you grow. It finds the kitchens, sets the terms, and keeps the orders coming.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                                        Talk to us
                                        <ArrowRight size={18} />
                                    </LinkButton>
                                    <LinkButton href="/how-it-works" variant="ghost" size="lg" className="gap-2">
                                        <Route size={16} /> See the flow
                                    </LinkButton>
                                </div>
                                <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-ink-muted">
                                    {[
                                        { i: <Shield size={14} className="text-brand-500" />, t: "No fee to join" },
                                        { i: <Handshake size={14} className="text-brand-500" />, t: "Fair terms up front" },
                                        { i: <MapPin size={14} className="text-brand-500" />, t: "Kitchens near you" },
                                    ].map((x) => (
                                        <span key={x.t} className="inline-flex items-center gap-1.5">{x.i} {x.t}</span>
                                    ))}
                                </p>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <Photo q="farm,sunset,crops" alt="Crops at golden hour on a local farm" seed={41} caption="Plant to real orders" place="This season" className="aspect-[4/5]" />
                            </Reveal>
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
