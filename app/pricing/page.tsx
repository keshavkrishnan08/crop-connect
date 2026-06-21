import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { PricingCalculator } from "@/components/marketing/PricingCalculator";
import { LinkButton, Card, Badge, Eyebrow } from "@/components/ui/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Check, X, ArrowRight, Receipt, Shield, Truck, Handshake, Leaf, Route, Calendar, MarginUp, Sparkle } from "@/components/icons";

export const metadata: Metadata = {
    title: "Pricing — CropConnect",
    description: "You fund the food at cost. We charge a monthly service fee that scales with your farms and items, and drops the longer you commit.",
};

const INCLUDED: { icon: ReactNode; label: string; sub: string }[] = [
    { icon: <Route size={18} />, label: "Sourcing", sub: "We find the farms and lock the supply." },
    { icon: <Shield size={18} />, label: "Farm vetting", sub: "Safety, growing practices, and capacity checked." },
    { icon: <Handshake size={18} />, label: "Contracts", sub: "We write and hold the grower agreements." },
    { icon: <Truck size={18} />, label: "Delivery and logistics", sub: "We orchestrate the trucks and the schedule." },
    { icon: <Leaf size={18} />, label: "Provenance and menu copy", sub: "Farm names and lines for the plate." },
    { icon: <MarginUp size={18} />, label: "Margin tracking", sub: "What each local dish earns over the old spec." },
    { icon: <Calendar size={18} />, label: "Backup farms", sub: "A second grower stands by for every crop." },
];

const TERMS: { name: string; off: string; note: string; featured?: boolean }[] = [
    { name: "Monthly", off: "Full rate", note: "No commitment. Cancel any month." },
    { name: "6 months", off: "Save 10%", note: "A lower monthly rate for the season." },
    { name: "12 months", off: "Save 20%", note: "Our best rate for a full year.", featured: true },
];

export default function PricingPage() {
    return (
        <div className="relative min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <main>
                {/* Hero */}
                <section className="relative overflow-hidden border-b border-line">
                    <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
                    <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8 lg:py-28">
                        <Reveal><Eyebrow>Pricing</Eyebrow></Reveal>
                        <Reveal delay={0.05}><h1 className="mt-5 text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">Pricing that <span className="ink-grad">scales with you.</span></h1></Reveal>
                        <Reveal delay={0.1}><p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">You fund the food at cost, no markup and no cut of your sales. On top of that is one monthly service fee. It scales with how much we run for you and drops the longer you commit.</p></Reveal>
                        <Reveal delay={0.15}><div className="mt-8 flex justify-center"><LinkButton href="/demo" size="lg" className="gap-2">Start free <ArrowRight size={18} /></LinkButton></div></Reveal>
                    </div>
                </section>

                {/* The model in three points */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal><Eyebrow>The model</Eyebrow><h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Three simple parts.</h2></Reveal>
                        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
                            <StaggerItem><ModelCard icon={<Receipt size={20} />} title="Food at cost" body="You pay the farm price and nothing more. We make zero on the food itself, and we never take a cut of your sales." /></StaggerItem>
                            <StaggerItem><ModelCard icon={<Leaf size={20} />} title="A modular service fee" body="One monthly fee for the work. It scales with the number of farms we manage and items we keep live. Pay for what you use." /></StaggerItem>
                            <StaggerItem><ModelCard icon={<Handshake size={20} />} title="Discounts for commitment" body="The longer the term you agree to, the lower your monthly rate. Up to 20 percent off on a full year." featured /></StaggerItem>
                        </Stagger>
                    </div>
                </section>

                {/* Calculator */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal><Eyebrow>Build your plan</Eyebrow><h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Size the fee to your kitchen.</h2><p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">Set how many farms and items you want us to run, pick a term, and see the monthly service fee. The food is funded separately, at cost.</p></Reveal>
                        <Reveal delay={0.1}><div className="mt-10"><PricingCalculator /></div></Reveal>
                    </div>
                </section>

                {/* Term tiers */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal><Eyebrow>Commit and save</Eyebrow><h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">The longer you stay, the less you pay.</h2></Reveal>
                        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
                            {TERMS.map((t) => (
                                <StaggerItem key={t.name}>
                                    <Card className={`flex h-full flex-col p-7 ${t.featured ? "ring-1 ring-brand-500/30" : ""}`}>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-display text-xl text-ink">{t.name}</h3>
                                            {t.featured && <Badge tone="brand" dot>Best rate</Badge>}
                                        </div>
                                        <p className={`mt-4 font-display text-3xl ${t.featured ? "text-brand-600" : "text-ink"}`}>{t.off}</p>
                                        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{t.note}</p>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>

                {/* What the fee covers */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal><Eyebrow>What the fee covers</Eyebrow><h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">The whole job, handled.</h2></Reveal>
                        <Stagger className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                            {INCLUDED.map((f) => (
                                <StaggerItem key={f.label}>
                                    <div className="flex gap-3">
                                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-600"><Check size={14} strokeWidth={2.6} /></span>
                                        <div><p className="text-[15px] font-semibold text-ink">{f.label}</p><p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{f.sub}</p></div>
                                    </div>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>

                {/* Start free */}
                <section className="border-b border-line bg-canvas-soft">
                    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal>
                            <div className="rounded-4xl border border-harvest-300 bg-gradient-to-br from-harvest-400/10 to-canvas p-10 text-center sm:p-12">
                                <span className="badge-harvest"><Sparkle size={13} /> No risk to try</span>
                                <h2 className="mt-5 text-3xl sm:text-4xl">Start free.</h2>
                                <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">One local item. One week. Free, with no commitment. The first taste is on us, and the value sells the rest.</p>
                                <div className="mt-8 flex justify-center"><LinkButton href="/demo" size="lg" className="gap-2">Start free <ArrowRight size={18} /></LinkButton></div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* FAQ */}
                <section className="border-b border-line">
                    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-24">
                        <Reveal><Eyebrow>Questions</Eyebrow><h2 className="mt-4 text-3xl sm:text-4xl">Straight answers.</h2></Reveal>
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

                {/* Close */}
                <section className="bg-canvas">
                    <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8 lg:py-24">
                        <Reveal>
                            <h2 className="text-3xl sm:text-4xl">Start with one dish, free.</h2>
                            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">See your numbers, then let us source one ingredient for a week. Build your plan when you are ready.</p>
                            <div className="mt-8 flex justify-center"><LinkButton href="/demo" size="lg" className="gap-2">Start free <ArrowRight size={18} /></LinkButton></div>
                        </Reveal>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}

function ModelCard({ icon, title, body, featured }: { icon: ReactNode; title: string; body: string; featured?: boolean }) {
    return (
        <Card className={`flex h-full flex-col p-7 ${featured ? "ring-1 ring-brand-500/20" : ""}`}>
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${featured ? "bg-brand-500 text-white" : "bg-brand-500/10 text-brand-600"}`}>{icon}</span>
            <h3 className="mt-5 font-display text-xl text-ink">{title}</h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted">{body}</p>
        </Card>
    );
}

const FAQ: { q: string; a: string }[] = [
    { q: "Is this a markup on the food?", a: "No. You pay the farm what the farm charges, at cost. We add nothing to the food price. Our only charge is the monthly service fee." },
    { q: "How is the service fee set?", a: "It is modular. There is a base, plus a small amount for each farm we manage and each item we keep live for you. You pay for what you actually use." },
    { q: "How do the term discounts work?", a: "The longer the commitment, the lower your monthly rate. Six months takes 10 percent off. Twelve months takes 20 percent off. Month to month is the full rate." },
    { q: "Do you take a cut of my sales?", a: "No. We take no percentage of sales and no share of your margin. Every extra dollar your menu earns stays with you." },
    { q: "Can I cancel?", a: "On the monthly plan, yes, any month. If you take a discounted term, you commit for that term in exchange for the lower rate." },
    { q: "What does it cost to start?", a: "Nothing. Your first local item runs free for a week. No setup fee either way." },
];
