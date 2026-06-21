import Link from "next/link";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { ServiceFlow } from "@/components/marketing/ServiceFlow";
import { MarginSliver, ResultMeter, FarmVetCard, DeliverySchedule, MoneyFlow } from "@/components/marketing/demos";
import { LivingMenuLine } from "@/components/marketing/LivingMenuLine";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { LinkButton, Card, Eyebrow } from "@/components/ui/kit";
import { ArrowRight, Check, Leaf } from "@/components/icons";

export default function Landing() {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <Hero />
            <FlowSection />
            <Problem />
            <Result />
            <Sourcing />
            <Delivery />
            <ChargeMore />
            <BusinessModel />
            <FullService />
            <Close />
            <MarketingFooter />
        </div>
    );
}

function Hero() {
    return (
        <section className="relative overflow-hidden bg-aura">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.5] [mask-image:radial-gradient(60%_55%_at_50%_25%,black,transparent)]" />
            <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-20 text-center lg:pt-28">
                <Reveal><span className="badge-brand"><Leaf size={13} /> Local sourcing, handled for you</span></Reveal>
                <Reveal delay={0.05}>
                    <h1 className="mt-6 font-display text-[3rem] leading-[0.98] tracking-tight text-ink sm:text-[4.2rem]">Make your menu more profitable.</h1>
                </Reveal>
                <Reveal delay={0.12}>
                    <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-ink-muted">Local food makes diners pay more. We do all the work to get it on your plate. You just put it on the menu.</p>
                </Reveal>
                <Reveal delay={0.18}>
                    <div className="mt-9 flex flex-wrap justify-center gap-3">
                        <LinkButton href="/demo" size="lg">See your numbers <ArrowRight size={17} /></LinkButton>
                        <LinkButton href="/how-it-works" variant="ghost" size="lg">How it works</LinkButton>
                    </div>
                </Reveal>
                <Reveal delay={0.24}><p className="mt-6 text-[13px] text-ink-faint">Now onboarding a first group of restaurants. No setup. No commitment.</p></Reveal>
            </div>
        </section>
    );
}

function FlowSection() {
    return (
        <Section className="pt-8">
            <div className="mx-auto max-w-2xl text-center">
                <Reveal><h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">You ask. We do the rest.</h2></Reveal>
                <Reveal delay={0.06}><p className="mt-4 text-lg text-ink-muted">Watch the whole thing. From your request to a more profitable plate.</p></Reveal>
            </div>
            <Reveal delay={0.1} y={26}><div className="mx-auto mt-10 max-w-3xl"><ServiceFlow /></div></Reveal>
        </Section>
    );
}

function Problem() {
    return (
        <Section tint>
            <Split
                left={<Reveal><Tag>The problem</Tag><h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">Cutting costs is a dead end.</h2>
                    <p className="mt-5 text-lg leading-relaxed text-ink-muted">You have already squeezed every supplier. The margin is gone before the night begins. Sourcing local could help you charge more. But it means calling farms, chasing deliveries, and hoping someone shows up. So most kitchens never do it.</p></Reveal>}
                right={<Reveal delay={0.1}><MarginSliver /></Reveal>}
            />
        </Section>
    );
}

function Result() {
    return (
        <Section>
            <Split
                reverse
                left={<Reveal><Tag>The result</Tag><h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">Here is what changes.</h2>
                    <p className="mt-5 text-lg leading-relaxed text-ink-muted">A handful of dishes priced for what they really are. The food cost barely moves. The price does. On a thin-margin business that difference is almost pure profit.</p>
                    <div className="mt-7"><LinkButton href="/demo">See it on your own menu <ArrowRight size={16} /></LinkButton></div></Reveal>}
                right={<Reveal delay={0.1}><ResultMeter /></Reveal>}
            />
        </Section>
    );
}

function Sourcing() {
    return (
        <Section tint>
            <Split
                left={<Reveal><Tag>Sourcing</Tag><h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">We find the farms.</h2>
                    <p className="mt-5 text-lg leading-relaxed text-ink-muted">We rank the farms near you by distance, reliability, and price. We check their record before we ever bring them to you. You approve the one you like in a tap. No cold calls. No guesswork.</p></Reveal>}
                right={<Reveal delay={0.1}><FarmVetCard /></Reveal>}
            />
        </Section>
    );
}

function Delivery() {
    return (
        <Section>
            <Split
                reverse
                left={<Reveal><Tag>Delivery</Tag><h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">We bring it to your door.</h2>
                    <p className="mt-5 text-lg leading-relaxed text-ink-muted">This is the part everyone hates. We handle it. We schedule the farm, arrange the courier, and confirm every drop. If a crop falls short one week, a backup farm covers you. You never leave the kitchen.</p></Reveal>}
                right={<Reveal delay={0.1}><DeliverySchedule /></Reveal>}
            />
        </Section>
    );
}

function ChargeMore() {
    return (
        <Section tint>
            <Split
                left={<Reveal><Tag>Pricing power</Tag><h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">You charge more for it.</h2>
                    <p className="mt-5 text-lg leading-relaxed text-ink-muted">We give you the proof of where every ingredient came from. The farm, the distance, the day it was picked. That is what lets you raise a price and have diners thank you for it.</p>
                    <p className="mt-3 text-[14px] text-ink-faint">Tap the row to see it change.</p></Reveal>}
                right={<Reveal delay={0.1}><LivingMenuLine /></Reveal>}
            />
        </Section>
    );
}

function BusinessModel() {
    return (
        <Section>
            <div className="mx-auto max-w-2xl text-center">
                <Reveal><Tag center>The business model</Tag><h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">One flat fee.</h2></Reveal>
                <Reveal delay={0.06}><p className="mt-4 text-lg text-ink-muted">We are not a distributor. We do not mark up your food and we do not take a cut of your sales. We charge a flat monthly fee for the service. Every dollar of new margin is yours.</p></Reveal>
            </div>
            <Reveal delay={0.1}><div className="mt-12"><MoneyFlow /></div></Reveal>
            <Reveal delay={0.14}><div className="mt-8 text-center"><LinkButton href="/pricing" variant="ghost">See full pricing <ArrowRight size={16} /></LinkButton></div></Reveal>
        </Section>
    );
}

function FullService() {
    const we = ["Find and vet local farms", "Negotiate the price", "Write and hold the contract", "Schedule weekly delivery", "Arrange the courier", "Cover shortfalls with a backup farm", "Give you the provenance", "Track your margin"];
    const you = ["Tell us what you want", "Put it on the menu"];
    return (
        <Section tint>
            <div className="mx-auto max-w-2xl text-center">
                <Reveal><Tag center>Full service</Tag><h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">Your job is two things.</h2></Reveal>
                <Reveal delay={0.06}><p className="mt-4 text-lg text-ink-muted">We take the entire job off your plate. Here is the split.</p></Reveal>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-[1.4fr_1fr]">
                <Reveal>
                    <Card className="h-full p-6">
                        <p className="mb-4 text-2xs font-semibold uppercase tracking-wide text-brand-600">What we handle</p>
                        <Stagger className="grid gap-2.5 sm:grid-cols-2">
                            {we.map((w) => <StaggerItem key={w}><div className="flex items-start gap-2.5 text-[15px] text-ink-soft"><Check size={17} className="mt-0.5 shrink-0 text-brand-500" /> {w}</div></StaggerItem>)}
                        </Stagger>
                    </Card>
                </Reveal>
                <Reveal delay={0.08}>
                    <Card className="flex h-full flex-col p-6">
                        <p className="mb-4 text-2xs font-semibold uppercase tracking-wide text-ink-faint">What you handle</p>
                        <div className="space-y-2.5">
                            {you.map((y) => <div key={y} className="flex items-start gap-2.5 text-[15px] font-medium text-ink"><div className="mt-0.5 grid h-[17px] w-[17px] shrink-0 place-items-center rounded bg-ink/[0.06]"><Leaf size={12} className="text-brand-600" /></div> {y}</div>)}
                        </div>
                        <Link href="/what-we-handle" className="mt-auto pt-5 text-sm font-semibold text-brand-600 hover:underline">See everything we handle →</Link>
                    </Card>
                </Reveal>
            </div>
        </Section>
    );
}

function Close() {
    return (
        <Section>
            <Reveal>
                <div className="mx-auto max-w-3xl rounded-4xl border border-brand-800 bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-center text-white sm:p-14">
                    <h2 className="font-display text-4xl leading-tight sm:text-5xl">Start with one dish.</h2>
                    <p className="mx-auto mt-4 max-w-md text-lg text-white/75">See your own margin number in two minutes. Then let us source one ingredient for one week, free.</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <LinkButton href="/demo" size="lg" className="bg-white !text-brand-700 hover:bg-canvas">See your numbers <ArrowRight size={17} /></LinkButton>
                        <LinkButton href="/how-it-works" size="lg" variant="ghost" className="border-white/25 bg-white/10 text-white hover:bg-white/20">How it works</LinkButton>
                    </div>
                </div>
            </Reveal>
        </Section>
    );
}

function Section({ children, tint, className }: { children: React.ReactNode; tint?: boolean; className?: string }) {
    return <section className={`${tint ? "bg-canvas-soft" : ""} border-t border-line/60 py-20 sm:py-24 ${className ?? ""}`}><div className="mx-auto max-w-6xl px-5 lg:px-8">{children}</div></section>;
}
function Split({ left, right, reverse }: { left: React.ReactNode; right: React.ReactNode; reverse?: boolean }) {
    return <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}><div>{left}</div><div>{right}</div></div>;
}
function Tag({ children, center }: { children: React.ReactNode; center?: boolean }) {
    return <div className={center ? "flex justify-center" : ""}><Eyebrow>{children}</Eyebrow></div>;
}
