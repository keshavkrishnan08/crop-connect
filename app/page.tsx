// Landing — landing-page-guide-v2 framework (all 11 elements), standard reasoning arc:
// Hook -> Problem -> Promise/Result -> How it works -> The service -> Proof it's real ->
// Recap -> Pricing -> Social proof -> Objections -> Close.
// Aesthetic: refined B2B-premium. Fraunces + Hanken + JetBrains mono. Garden green + honey.
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { ServiceFlow } from "@/components/marketing/ServiceFlow";
import { MarginSliver, FarmVetCard, DeliverySchedule, MoneyFlow } from "@/components/marketing/demos";
import { MenuRepricing } from "@/components/marketing/MenuRepricing";
import { LocalEdge } from "@/components/marketing/LocalEdge";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Faq } from "@/components/marketing/Faq";
import { ProduceGallery } from "@/components/marketing/ProduceGallery";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { LinkButton, Card, Eyebrow } from "@/components/ui/kit";
import { ArrowRight, Check, Leaf, MarginUp, Farm, Truck } from "@/components/icons";

export default function Landing() {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <main>
                <Hero />
                <Problem />
                <Result />
                <Edge />
                <HowItWorks />
                <Sourcing />
                <Delivery />
                <Produce />
                <FullService />
                <BusinessModel />
                <Voices />
                <Questions />
                <Setup />
                <FinalCta />
            </main>
            <MarketingFooter />
        </div>
    );
}

/* ---------- 1. Hook ---------- */
function Hero() {
    return (
        <section className="relative overflow-hidden bg-aura">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.5] [mask-image:radial-gradient(60%_55%_at_50%_16%,black,transparent)]" />
            <div className="relative mx-auto max-w-4xl px-5 pb-12 pt-24 text-center lg:pt-36">
                <Reveal><span className="badge-brand"><Leaf size={13} /> Local sourcing, done for you</span></Reveal>
                <h1 className="mt-7 font-display text-[3.1rem] leading-[0.93] tracking-tight sm:text-[5.2rem]">
                    <Word delay={0.04}>Make</Word> <Word delay={0.1}>your</Word> <Word delay={0.16}>menu</Word>{" "}
                    <Word delay={0.24} className="ink-grad">more</Word> <Word delay={0.3} className="ink-grad">profitable.</Word>
                </h1>
                <Reveal delay={0.42}><p className="mx-auto mt-7 max-w-xl text-xl leading-relaxed text-ink-muted">You run the kitchen. We run the supply. Local ingredients let you raise prices and stand out, but sourcing them is a job most kitchens never have time for. We do the whole thing for you.</p></Reveal>
                <Reveal delay={0.5}>
                    <div className="mt-9 flex flex-wrap justify-center gap-3">
                        <LinkButton href="/demo" size="lg">See your numbers <ArrowRight size={17} /></LinkButton>
                        <LinkButton href="/how-it-works" variant="ghost" size="lg">How it works</LinkButton>
                    </div>
                </Reveal>
                <Reveal delay={0.58}>
                    <div className="mt-9 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-ink-muted">
                        {["Set up in 10 minutes", "Your first dish free", "Cancel anytime"].map((t) => (
                            <span key={t} className="inline-flex items-center gap-1.5"><Check size={14} className="text-brand-500" /> {t}</span>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
function Word({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
    return <span className={`inline-block animate-fade-up opacity-0 ${className ?? ""}`} style={{ animationDelay: `${delay}s` }}>{children}</span>;
}

/* ---------- 2. Problem ---------- */
function Problem() {
    return (
        <Section tint>
            <Head eyebrow="The problem" title="You cannot cut your way to better margins."
                body="Independent kitchens keep three to five cents on every dollar. You have already called every supplier and trimmed every cost. There is almost nothing left to cut. The only real way to make more is to charge more for what is already on the plate. Local food is how you do that. Sourcing it yourself means calling farms, chasing trucks, and hoping someone shows up." />
            <Reveal delay={0.1} y={22}><div className="mx-auto mt-14 max-w-2xl"><MarginSliver /></div></Reveal>
        </Section>
    );
}

/* ---------- 3. Promise / result — the menu reprices ---------- */
function Result() {
    return (
        <Section>
            <Split reverse
                text={<Benefit icon={<MarginUp size={22} />} eyebrow="The result" title="Local food lets you charge more."
                    body="When a dish comes from a named farm down the road, guests will pay more for it and feel good doing it. Your food cost barely moves. The menu price does. On a business this thin, that gap is almost pure profit."
                    href="/demo" cta="See it on your menu" />}
                visual={<MenuRepricing />}
            />
        </Section>
    );
}

/* ---------- 3b. Competitive edge — local wins customers ---------- */
function Edge() {
    return (
        <Section tint>
            <Head eyebrow="The edge" title="Local is a competitive advantage."
                body="It is not only the price. Sourcing local pulls people through the door and brings them back. It is the reason a guest picks your place over the chain down the street." />
            <Reveal delay={0.1}><div className="mx-auto mt-14 max-w-4xl"><LocalEdge /></div></Reveal>
        </Section>
    );
}

/* ---------- 4. How it works ---------- */
function HowItWorks() {
    return (
        <Section tint className="pt-24">
            <div className="mx-auto max-w-2xl text-center">
                <Reveal><div className="flex justify-center"><Eyebrow>How it works</Eyebrow></div><h2 className="mt-4 font-display text-4xl leading-tight sm:text-[3.4rem]">We handle every step for you.</h2></Reveal>
                <Reveal delay={0.06}><p className="mt-5 text-lg leading-relaxed text-ink-muted">Tell us one ingredient you want on the menu. From there it is on us. We find the farm, sign the deal, deliver it every week, and hand you the proof of where it came from. Here is the whole loop.</p></Reveal>
            </div>
            <Reveal delay={0.1} y={28}><div className="mx-auto mt-14 max-w-3xl"><ServiceFlow /></div></Reveal>
        </Section>
    );
}

/* ---------- 5a. Sourcing ---------- */
function Sourcing() {
    return (
        <Section>
            <Split
                text={<Benefit icon={<Farm size={22} />} eyebrow="Sourcing" title="We find and vet the farms."
                    body="We already know the growers near you. We rank them by distance, track record, and price, and we check each one before we ever put them in front of you. You see a short list and pick the one you like. No cold calls. No tasting through ten vendors. No guessing who will actually show up." />}
                visual={<FarmVetCard />}
            />
        </Section>
    );
}

/* ---------- 5b. Delivery ---------- */
function Delivery() {
    return (
        <Section tint>
            <Split reverse
                text={<Benefit icon={<Truck size={22} />} eyebrow="Delivery" title="We deliver it every week."
                    body="This is the part every chef dreads, so we own it end to end. We schedule the farm, book the courier, and confirm each drop before it lands. If a crop comes up short one week, a backup farm fills in without you lifting a finger. It simply arrives, on the same rhythm, every week." />}
                visual={<DeliverySchedule />}
            />
        </Section>
    );
}

/* ---------- 6. Proof it's real — photos ---------- */
function Produce() {
    return (
        <Section>
            <Head eyebrow="Fresh produce" title="Produce from farms near you."
                body="Real food from farms near you, picked this week and brought to your door. Tomatoes that taste like tomatoes. Greens cut a few days ago. The kind of produce a guest notices on the first bite." />
            <Reveal delay={0.1} y={24}><div className="mx-auto mt-14 max-w-4xl"><ProduceGallery /></div></Reveal>
        </Section>
    );
}

/* ---------- 7. Recap ---------- */
function FullService() {
    return (
        <Section tint>
            <Head eyebrow="Full service" title="We do everything but the cooking."
                body="We take the entire job off your plate. You say what you want, and you put it on the menu. Everything in between is ours." />
            <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-[1.5fr_1fr]">
                <Reveal>
                    <Card className="h-full p-8">
                        <p className="mb-5 text-2xs font-semibold uppercase tracking-wide text-brand-600">We handle</p>
                        <Stagger className="grid gap-3.5 sm:grid-cols-2">
                            {["Find the farms", "Vet and negotiate", "Hold the contract", "Deliver every week", "Cover shortfalls", "Hand you the proof"].map((w) => (
                                <StaggerItem key={w}><div className="flex items-center gap-2.5 text-[15px] text-ink-soft"><Check size={17} className="shrink-0 text-brand-500" /> {w}</div></StaggerItem>
                            ))}
                        </Stagger>
                    </Card>
                </Reveal>
                <Reveal delay={0.08}>
                    <Card className="flex h-full flex-col justify-center gap-4 p-8">
                        <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">You handle</p>
                        {["Say what you want", "Put it on the menu"].map((y) => <div key={y} className="flex items-center gap-2.5 text-lg font-medium text-ink"><Leaf size={17} className="shrink-0 text-brand-600" /> {y}</div>)}
                    </Card>
                </Reveal>
            </div>
        </Section>
    );
}

/* ---------- 8. Pricing ---------- */
function BusinessModel() {
    return (
        <Section>
            <Head eyebrow="Pricing" title="One flat fee with no markups."
                body="We are not a distributor, so we make nothing on your food. We never touch your sales. You pay one flat monthly fee for the service, and you keep every extra dollar your menu earns. Our incentive is simple. The more you make, the longer you stay." />
            <Reveal delay={0.1}><div className="mt-14"><MoneyFlow /></div></Reveal>
            <Reveal delay={0.14}><div className="mt-10 text-center"><LinkButton href="/pricing" variant="ghost">See pricing <ArrowRight size={16} /></LinkButton></div></Reveal>
        </Section>
    );
}

/* ---------- 9. Social proof ---------- */
function Voices() {
    return (
        <Section tint>
            <Head eyebrow="Early partners" title="What early restaurants tell us."
                body="We are building this with a small group of restaurants in one metro. These are their words, in their roles." />
            <div className="mt-12"><Testimonials /></div>
            <Reveal delay={0.1}><p className="mt-7 text-center text-[12.5px] text-ink-faint">Real names go up here as each partner goes live.</p></Reveal>
        </Section>
    );
}

/* ---------- 10. Objections ---------- */
function Questions() {
    return (
        <Section>
            <Head eyebrow="Questions" title="Straight answers before you start."
                body="The things every owner asks us before they start. Short version: no markups, no hidden cuts, no lock-in." />
            <Reveal delay={0.1}><div className="mt-12"><Faq /></div></Reveal>
        </Section>
    );
}

/* ---------- Getting started fast ---------- */
function Setup() {
    const steps = [
        { n: 1, m: "2 min", t: "Share your menu", d: "Paste a link or upload it. We read it for you." },
        { n: 2, m: "3 min", t: "Pick one ingredient", d: "We show the local farms that fit. You choose." },
        { n: 3, m: "Done", t: "We take it from here", d: "Sourcing, the contract, delivery, the proof." },
    ];
    return (
        <Section tint>
            <Head eyebrow="Getting started" title="Up and running in ten minutes."
                body="No installs. No integrations. No training your staff. You answer a few questions and we start sourcing this week." />
            <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
                {steps.map((s, i) => (
                    <Reveal key={s.n} delay={i * 0.08}>
                        <Card className="h-full p-7">
                            <div className="flex items-center justify-between">
                                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-mono text-sm font-medium text-white tnum">{s.n}</span>
                                <span className="rounded-full bg-harvest-400/15 px-2.5 py-1 font-mono text-2xs font-semibold text-harvest-500 tnum">{s.m}</span>
                            </div>
                            <p className="mt-4 font-display text-xl text-ink">{s.t}</p>
                            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{s.d}</p>
                        </Card>
                    </Reveal>
                ))}
            </div>
        </Section>
    );
}

/* ---------- 11. Close ---------- */
function FinalCta() {
    return (
        <Section>
            <Reveal>
                <div className="relative mx-auto max-w-4xl overflow-hidden rounded-4xl border border-brand-800 bg-gradient-to-br from-brand-700 to-brand-900 p-14 text-center text-white sm:p-20">
                    <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]" />
                    <div className="relative">
                        <h2 className="font-display text-4xl leading-[1.02] sm:text-6xl">Start with one dish.</h2>
                        <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-white/75">See your own margin number in two minutes. Then let us source one ingredient for one week, free. If it does not earn its keep, you walk away.</p>
                        <div className="mt-10 flex flex-wrap justify-center gap-3">
                            <LinkButton href="/demo" size="lg" className="bg-white !text-brand-700 hover:bg-canvas">See your numbers <ArrowRight size={17} /></LinkButton>
                            <LinkButton href="/how-it-works" size="lg" variant="ghost" className="border-white/25 bg-white/10 text-white hover:bg-white/20">How it works</LinkButton>
                        </div>
                    </div>
                </div>
            </Reveal>
        </Section>
    );
}

/* ---------- layout primitives ---------- */
function Section({ children, tint, className }: { children: React.ReactNode; tint?: boolean; className?: string }) {
    return <section className={`${tint ? "bg-canvas-soft" : ""} border-t border-line/60 py-28 sm:py-36 ${className ?? ""}`}><div className="mx-auto max-w-6xl px-5 lg:px-8">{children}</div></section>;
}
function Head({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
    return <div className="mx-auto max-w-2xl text-center"><Reveal><div className="flex justify-center"><Eyebrow>{eyebrow}</Eyebrow></div><h2 className="mt-4 font-display text-4xl leading-tight sm:text-[3.4rem]">{title}</h2>{body && <p className="mt-5 text-lg leading-relaxed text-ink-muted">{body}</p>}</Reveal></div>;
}
function Benefit({ icon, eyebrow, title, body, href, cta }: { icon: React.ReactNode; eyebrow: string; title: string; body: string; href?: string; cta?: string }) {
    return (
        <>
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-[3.2rem]">{title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">{body}</p>
            {href && cta && <div className="mt-8"><LinkButton href={href}>{cta} <ArrowRight size={16} /></LinkButton></div>}
        </>
    );
}
function Split({ text, visual, reverse }: { text: React.ReactNode; visual: React.ReactNode; reverse?: boolean }) {
    return <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"><Reveal className={reverse ? "lg:order-2" : ""}>{text}</Reveal><Reveal delay={0.1} className={reverse ? "lg:order-1" : ""}>{visual}</Reveal></div>;
}
