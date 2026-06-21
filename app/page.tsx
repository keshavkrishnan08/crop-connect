// Landing — built to the landing-page-guide-v2 framework (all 11 essential elements).
// Aesthetic: refined B2B-premium. Display: Fraunces (serif, distinctive). Body: Hanken Grotesk.
// Mono: JetBrains for figures. Palette: garden green (brand) + honey (harvest) on warm canvas.
// No Inter/Roboto. No purple-on-white. Varied layouts. Big custom animations, short copy.
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { ServiceFlow } from "@/components/marketing/ServiceFlow";
import { MarginSliver, ResultMeter, FarmVetCard, DeliverySchedule, MoneyFlow } from "@/components/marketing/demos";
import { SocialProof } from "@/components/marketing/SocialProof";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Faq } from "@/components/marketing/Faq";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { LinkButton, Card, Eyebrow } from "@/components/ui/kit";
import { ArrowRight, Check, Leaf, MarginUp, Farm, Truck } from "@/components/icons";

export default function Landing() {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <MarketingNav />                {/* Element 2: logo + nav */}
            <main>
                <Hero />                    {/* Elements 3, 4, 5 */}
                <Media />                   {/* Element 6 */}
                <Problem />
                <Benefits />                {/* Element 7 */}
                <BusinessModel />
                <Voices />                  {/* Element 8 */}
                <Questions />               {/* Element 9 */}
                <FinalCta />                {/* Element 10 */}
            </main>
            <MarketingFooter />             {/* Element 11 */}
        </div>
    );
}

/* ---------- Hero: massive title, CTA, social proof ---------- */
function Hero() {
    return (
        <section className="relative overflow-hidden bg-aura">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.5] [mask-image:radial-gradient(60%_55%_at_50%_18%,black,transparent)]" />
            <div className="relative mx-auto max-w-4xl px-5 pt-20 text-center lg:pt-28">
                <Reveal><span className="badge-brand"><Leaf size={13} /> Local sourcing, done for you</span></Reveal>
                <h1 className="mt-6 font-display text-[3.1rem] leading-[0.93] tracking-tight sm:text-[5rem]">
                    <Word delay={0.04}>Make</Word> <Word delay={0.1}>your</Word> <Word delay={0.16}>menu</Word>{" "}
                    <span className="ink-grad"><Word delay={0.24}>more</Word> <Word delay={0.3}>profitable.</Word></span>
                </h1>
                <Reveal delay={0.42}><p className="mx-auto mt-6 max-w-md text-xl text-ink-muted">You run the kitchen. We run the supply.</p></Reveal>
                <Reveal delay={0.5}>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <LinkButton href="/demo" size="lg">See your numbers <ArrowRight size={17} /></LinkButton>
                        <LinkButton href="/how-it-works" variant="ghost" size="lg">How it works</LinkButton>
                    </div>
                </Reveal>
                <Reveal delay={0.58}><div className="mx-auto mt-12 max-w-2xl"><SocialProof /></div></Reveal>
                <Reveal delay={0.64}><p className="mt-4 text-[13px] text-ink-faint">Now onboarding our first restaurants. No setup. No commitment.</p></Reveal>
            </div>
        </section>
    );
}
function Word({ children, delay }: { children: React.ReactNode; delay: number }) {
    return <span className="inline-block animate-fade-up opacity-0" style={{ animationDelay: `${delay}s` }}>{children}</span>;
}

/* ---------- Element 6: media — the product, in motion ---------- */
function Media() {
    return (
        <Section className="pt-16">
            <div className="mx-auto max-w-2xl text-center">
                <Reveal><h2 className="font-display text-4xl leading-tight sm:text-5xl">You ask. We do the rest.</h2></Reveal>
            </div>
            <Reveal delay={0.1} y={28}><div className="mx-auto mt-10 max-w-3xl"><ServiceFlow /></div></Reveal>
        </Section>
    );
}

/* centered, the visual carries it */
function Problem() {
    return (
        <Section tint>
            <Head eyebrow="The problem" title="Margins are brutal." line="You cannot cut your way out." />
            <Reveal delay={0.1} y={22}><div className="mx-auto mt-12 max-w-2xl"><MarginSliver /></div></Reveal>
        </Section>
    );
}

/* ---------- Element 7: benefits — 4 advantages, custom icons, alternating ---------- */
function Benefits() {
    return (
        <>
            <Section>
                <Split reverse
                    text={<Benefit icon={<MarginUp size={22} />} eyebrow="The result" title="Charge more." line="Same plate. Better price." href="/demo" cta="See it on your menu" />}
                    visual={<ResultMeter />}
                />
            </Section>
            <Section tint>
                <Split
                    text={<Benefit icon={<Farm size={22} />} eyebrow="Sourcing" title="We find the farms." line="Vetted. Close. Ready when you are." />}
                    visual={<FarmVetCard />}
                />
            </Section>
            <Section>
                <Split reverse
                    text={<Benefit icon={<Truck size={22} />} eyebrow="Delivery" title="We bring it." line="It just shows up. You stay in the kitchen." />}
                    visual={<DeliverySchedule />}
                />
            </Section>
            <Section tint>
                <Head eyebrow="Full service" title="You do two things." />
                <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-[1.5fr_1fr]">
                    <Reveal>
                        <Card className="h-full p-7">
                            <p className="mb-4 text-2xs font-semibold uppercase tracking-wide text-brand-600">We handle</p>
                            <Stagger className="grid gap-3 sm:grid-cols-2">
                                {["Find the farms", "Vet and negotiate", "Hold the contract", "Deliver every week", "Cover shortfalls", "Hand you the proof"].map((w) => (
                                    <StaggerItem key={w}><div className="flex items-center gap-2.5 text-[15px] text-ink-soft"><Check size={17} className="shrink-0 text-brand-500" /> {w}</div></StaggerItem>
                                ))}
                            </Stagger>
                        </Card>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <Card className="flex h-full flex-col justify-center gap-4 p-7">
                            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">You handle</p>
                            {["Say what you want", "Put it on the menu"].map((y) => <div key={y} className="flex items-center gap-2.5 text-lg font-medium text-ink"><Leaf size={17} className="shrink-0 text-brand-600" /> {y}</div>)}
                        </Card>
                    </Reveal>
                </div>
            </Section>
        </>
    );
}
function Benefit({ icon, eyebrow, title, line, href, cta }: { icon: React.ReactNode; eyebrow: string; title: string; line: string; href?: string; cta?: string }) {
    return (
        <>
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{title}</h2>
            <p className="mt-4 text-lg text-ink-muted">{line}</p>
            {href && cta && <div className="mt-7"><LinkButton href={href}>{cta} <ArrowRight size={16} /></LinkButton></div>}
        </>
    );
}

/* centered, the diagram carries it */
function BusinessModel() {
    return (
        <Section>
            <Head eyebrow="Pricing" title="One flat fee." line="Keep what you earn." />
            <Reveal delay={0.1}><div className="mt-12"><MoneyFlow /></div></Reveal>
            <Reveal delay={0.14}><div className="mt-9 text-center"><LinkButton href="/pricing" variant="ghost">See pricing <ArrowRight size={16} /></LinkButton></div></Reveal>
        </Section>
    );
}

/* ---------- Element 8: testimonials (honest, early partners) ---------- */
function Voices() {
    return (
        <Section tint>
            <Head eyebrow="Early partners" title="What they tell us." />
            <div className="mt-10"><Testimonials /></div>
            <Reveal delay={0.1}><p className="mt-6 text-center text-[12.5px] text-ink-faint">Voices from the restaurants we are building with. Real names go up as they go live.</p></Reveal>
        </Section>
    );
}

/* ---------- Element 9: FAQ ---------- */
function Questions() {
    return (
        <Section>
            <Head eyebrow="Questions" title="The honest answers." />
            <Reveal delay={0.1}><div className="mt-10"><Faq /></div></Reveal>
        </Section>
    );
}

/* ---------- Element 10: final CTA ---------- */
function FinalCta() {
    return (
        <Section>
            <Reveal>
                <div className="relative mx-auto max-w-4xl overflow-hidden rounded-4xl border border-brand-800 bg-gradient-to-br from-brand-700 to-brand-900 p-12 text-center text-white sm:p-16">
                    <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]" />
                    <div className="relative">
                        <h2 className="font-display text-4xl leading-[1.02] sm:text-6xl">Start with one dish.</h2>
                        <p className="mx-auto mt-4 max-w-sm text-lg text-white/75">See your numbers in two minutes. Then let us source it for you, free.</p>
                        <div className="mt-9 flex flex-wrap justify-center gap-3">
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
    return <section className={`${tint ? "bg-canvas-soft" : ""} border-t border-line/60 py-24 ${className ?? ""}`}><div className="mx-auto max-w-6xl px-5 lg:px-8">{children}</div></section>;
}
function Head({ eyebrow, title, line }: { eyebrow: string; title: string; line?: string }) {
    return <div className="mx-auto max-w-2xl text-center"><Reveal><div className="flex justify-center"><Eyebrow>{eyebrow}</Eyebrow></div><h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{title}</h2>{line && <p className="mt-4 text-lg text-ink-muted">{line}</p>}</Reveal></div>;
}
function Split({ text, visual, reverse }: { text: React.ReactNode; visual: React.ReactNode; reverse?: boolean }) {
    return <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"><Reveal className={reverse ? "lg:order-2" : ""}>{text}</Reveal><Reveal delay={0.1} className={reverse ? "lg:order-1" : ""}>{visual}</Reveal></div>;
}
