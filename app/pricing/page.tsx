import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { LinkButton, Card, Badge, Eyebrow } from "@/components/ui/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { usd } from "@/lib/utils";
import {
    Check,
    X,
    ArrowRight,
    MarginUp,
    Receipt,
    Shield,
    Truck,
    Route,
    Handshake,
    Leaf,
    Calendar,
} from "@/components/icons";

export const metadata: Metadata = {
    title: "Pricing — CropConnect",
    description: "One flat monthly service fee. We take no markup on your food and no cut of your sales. You keep the margin you earn.",
};

const FEE = 499;

const INCLUDED: { icon: ReactNode; label: string; sub: string }[] = [
    { icon: <Route size={18} />, label: "Sourcing", sub: "We find the farms and lock the supply." },
    { icon: <Shield size={18} />, label: "Farm vetting", sub: "Food safety, growing practices, capacity checked." },
    { icon: <Handshake size={18} />, label: "Contracts", sub: "We write and hold the grower agreements." },
    { icon: <Truck size={18} />, label: "Weekly delivery and logistics", sub: "We orchestrate the trucks and the schedule." },
    { icon: <Leaf size={18} />, label: "Provenance and menu copy", sub: "Farm names and lines you can put on the plate." },
    { icon: <MarginUp size={18} />, label: "Margin tracking", sub: "See what each local dish earns over the old spec." },
    { icon: <Calendar size={18} />, label: "Backup farms", sub: "A second grower stands by for every crop." },
];

export default function PricingPage() {
    return (
        <div className="relative min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <main>
                {/* ---------------------------------------------------------- Hero */}
                <section className="relative overflow-hidden border-b border-line">
                    <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
                    <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8 lg:py-28">
                        <Reveal>
                            <Eyebrow>Pricing</Eyebrow>
                        </Reveal>
                        <Reveal delay={0.05}>
                            <h1 className="mt-5 text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
                                One flat fee. <span className="ink-grad">You keep the upside.</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                                We charge a flat monthly service fee. We are not a distributor. We take no markup on your food and no cut of your sales. Every extra dollar of margin stays with you.
                            </p>
                        </Reveal>
                        <Reveal delay={0.15}>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                                    See your numbers
                                    <ArrowRight size={18} />
                                </LinkButton>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ------------------------------------------------------ Plan card */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <Card className="overflow-hidden p-0 shadow-lift">
                                <div className="border-b border-line bg-canvas px-7 py-8 sm:px-9">
                                    <div className="flex items-center justify-between">
                                        <Badge tone="brand" dot>One plan</Badge>
                                        <Badge tone="ink">Month to month</Badge>
                                    </div>
                                    <div className="mt-6 flex items-end gap-2">
                                        <span className="font-mono tnum text-5xl font-semibold tracking-tight text-ink sm:text-6xl">{usd(FEE)}</span>
                                        <span className="mb-2 text-lg text-ink-muted">/ mo</span>
                                    </div>
                                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">
                                        A flat service fee. Not a markup on food. Not a cut of sales. The food costs what the farm charges and no more.
                                    </p>
                                </div>
                                <div className="px-7 py-8 sm:px-9">
                                    <p className="eyebrow"><span className="h-px w-5 bg-brand-400/60" />What is included</p>
                                    <Stagger className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                                        {INCLUDED.map((f) => (
                                            <StaggerItem key={f.label}>
                                                <div className="flex gap-3">
                                                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-600">
                                                        <Check size={14} strokeWidth={2.6} />
                                                    </span>
                                                    <div>
                                                        <p className="text-[15px] font-semibold text-ink">{f.label}</p>
                                                        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{f.sub}</p>
                                                    </div>
                                                </div>
                                            </StaggerItem>
                                        ))}
                                    </Stagger>
                                    <div className="mt-9 flex flex-wrap items-center gap-3">
                                        <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                                            See your numbers
                                            <ArrowRight size={18} />
                                        </LinkButton>
                                        <span className="text-[13px] text-ink-faint">No setup fee. Cancel any month.</span>
                                    </div>
                                </div>
                            </Card>
                        </Reveal>
                    </div>
                </section>

                {/* ------------------------------------------------ Model contrast */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>How we make money</Eyebrow>
                            <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">We earn one flat fee. Nothing hides in your food cost.</h2>
                            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                                Here is the honest comparison. Read how each option gets paid and decide for yourself.
                            </p>
                        </Reveal>
                        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
                            <StaggerItem>
                                <Card className="flex h-full flex-col p-7 ring-1 ring-brand-500/20">
                                    <div className="flex items-center justify-between">
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600"><Receipt size={20} /></span>
                                        <Badge tone="brand">CropConnect</Badge>
                                    </div>
                                    <h3 className="mt-5 text-lg font-semibold text-ink">Flat monthly fee</h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                                        {usd(FEE)} a month, fixed. You pay the farm directly for the food. We never touch the food price.
                                    </p>
                                    <p className="mt-4 flex items-start gap-2 text-[13.5px] font-medium text-brand-700">
                                        <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-brand-600" />
                                        Aligned with you. When you earn more, we charge the same.
                                    </p>
                                </Card>
                            </StaggerItem>
                            <StaggerItem>
                                <Card className="flex h-full flex-col p-7">
                                    <div className="flex items-center justify-between">
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink/[0.05] text-ink-muted"><Truck size={20} /></span>
                                        <Badge tone="ink">Broadline distributor</Badge>
                                    </div>
                                    <h3 className="mt-5 text-lg font-semibold text-ink">Markup baked into food cost</h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                                        The margin sits inside the per-case price. You rarely see what the grower got paid.
                                    </p>
                                    <p className="mt-4 flex items-start gap-2 text-[13.5px] font-medium text-ink-muted">
                                        <X size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-danger" />
                                        Hidden. The more you buy, the more they make.
                                    </p>
                                </Card>
                            </StaggerItem>
                            <StaggerItem>
                                <Card className="flex h-full flex-col p-7">
                                    <div className="flex items-center justify-between">
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink/[0.05] text-ink-muted"><Handshake size={20} /></span>
                                        <Badge tone="ink">A sourcing hire</Badge>
                                    </div>
                                    <h3 className="mt-5 text-lg font-semibold text-ink">A salary on the books</h3>
                                    <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                                        A full salary plus benefits. One person, building farm relationships from scratch.
                                    </p>
                                    <p className="mt-4 flex items-start gap-2 text-[13.5px] font-medium text-ink-muted">
                                        <X size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-danger" />
                                        Slow and costly. Months to ramp. Gone if they leave.
                                    </p>
                                </Card>
                            </StaggerItem>
                        </Stagger>
                    </div>
                </section>

                {/* ------------------------------------------------------- ROI band */}
                <section className="border-b border-line bg-ink text-canvas">
                    <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <span className="badge bg-white/10 text-canvas">A model with editable assumptions</span>
                            <h2 className="mt-5 max-w-2xl text-3xl text-canvas sm:text-4xl">One featured dish usually clears the fee on its own.</h2>
                            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-canvas/70">
                                Worked example. A single local dish you can charge a little more for. Your covers and prices set the real number.
                            </p>
                        </Reveal>
                        <div className="mt-12 grid gap-6 sm:grid-cols-3">
                            <Reveal delay={0.05}>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                                    <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-canvas/50">Added margin, one dish</p>
                                    <p className="mt-3 font-mono tnum text-4xl font-semibold value-pos">
                                        +$<CountUp to={1800} />
                                    </p>
                                    <p className="mt-2 text-[13px] text-canvas/60">~150 covers a month at +$12 each.</p>
                                </div>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                                    <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-canvas/50">Our flat fee</p>
                                    <p className="mt-3 font-mono tnum text-4xl font-semibold text-canvas">
                                        {usd(FEE)}
                                    </p>
                                    <p className="mt-2 text-[13px] text-canvas/60">Same every month, whatever you earn.</p>
                                </div>
                            </Reveal>
                            <Reveal delay={0.15}>
                                <div className="rounded-2xl border border-harvest-400/30 bg-harvest-400/[0.08] p-7">
                                    <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-harvest-300">Net to you, one dish</p>
                                    <p className="mt-3 font-mono tnum text-4xl font-semibold value-pos">
                                        +$<CountUp to={1301} />
                                    </p>
                                    <p className="mt-2 text-[13px] text-canvas/60">Before the rest of your local menu.</p>
                                </div>
                            </Reveal>
                        </div>
                        <p className="mt-6 text-[12.5px] text-canvas/40">Illustrative. Adjust covers, price, and food cost on your own numbers in the demo.</p>
                    </div>
                </section>

                {/* ------------------------------------------------------------ FAQ */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>Questions</Eyebrow>
                            <h2 className="mt-4 text-3xl sm:text-4xl">Straight answers.</h2>
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
                <section className="bg-canvas-soft">
                    <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8 lg:py-24">
                        <Reveal>
                            <h2 className="text-3xl sm:text-4xl">See the number on your own menu.</h2>
                            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                                We will model the added margin against the flat fee using your covers and prices.
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
            </main>
            <MarketingFooter />
        </div>
    );
}

const FAQ: { q: string; a: string }[] = [
    {
        q: "Is this a markup on the food?",
        a: "No. You pay the farm what the farm charges. We add nothing to the food price. Our only charge is the flat monthly fee.",
    },
    {
        q: "Do you take a cut of my sales?",
        a: "No. We take no percentage of sales and no share of your margin. The fee is the same whether you earn a little more or a lot more.",
    },
    {
        q: "What if a crop fails?",
        a: "We line up a backup farm for every crop. If one grower comes up short, we move to the second. No penalty to you.",
    },
    {
        q: "Can I cancel?",
        a: "Yes. It is month to month. No setup fee and no long contract. Cancel at the end of any month.",
    },
    {
        q: "Who delivers?",
        a: "We orchestrate the logistics. We line up the trucks and the schedule so the food shows up the day you need it.",
    },
    {
        q: "Do I have to commit to volume?",
        a: "No. You set what you want and how much. We size the supply to your menu, not the other way around.",
    },
];
