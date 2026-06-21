import Link from "next/link";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { ServiceFlow } from "@/components/marketing/ServiceFlow";
import { MarginSliver, ResultMeter, FarmVetCard, DeliverySchedule, MoneyFlow } from "@/components/marketing/demos";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { LinkButton, Card, Eyebrow } from "@/components/ui/kit";
import { ArrowRight, Check, Leaf } from "@/components/icons";

export default function Landing() {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <Hero />
            <Problem />
            <Result />
            <Sourcing />
            <Delivery />
            <FullService />
            <BusinessModel />
            <Close />
            <MarketingFooter />
        </div>
    );
}

function Hero() {
    return (
        <section className="relative overflow-hidden bg-aura">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.5] [mask-image:radial-gradient(60%_55%_at_50%_20%,black,transparent)]" />
            <div className="relative mx-auto max-w-5xl px-5 pt-20 lg:pt-28">
                <div className="mx-auto max-w-2xl text-center">
                    <Reveal><span className="badge-brand"><Leaf size={13} /> Local sourcing, done for you</span></Reveal>
                    <Reveal delay={0.05}><h1 className="mt-6 font-display text-[3rem] leading-[0.95] tracking-tight sm:text-[4.5rem]">Make your menu more profitable.</h1></Reveal>
                    <Reveal delay={0.12}><p className="mx-auto mt-5 max-w-md text-xl text-ink-muted">You run the kitchen. We run the supply.</p></Reveal>
                    <Reveal delay={0.18}>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <LinkButton href="/demo" size="lg">See your numbers <ArrowRight size={17} /></LinkButton>
                            <LinkButton href="/how-it-works" variant="ghost" size="lg">How it works</LinkButton>
                        </div>
                    </Reveal>
                </div>
                <Reveal delay={0.22} y={28}><div className="mt-14 pb-4"><ServiceFlow /></div></Reveal>
            </div>
        </section>
    );
}

/* centered, the visual carries it */
function Problem() {
    return (
        <Big eyebrow="The problem" title="Margins are brutal." line="You cannot cut your way out.">
            <MarginSliver />
        </Big>
    );
}

/* alternating: visual left */
function Result() {
    return (
        <Section>
            <Split reverse
                text={<><Eyebrow>The result</Eyebrow><h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Charge more.</h2><p className="mt-4 text-lg text-ink-muted">Same plate. Better price.</p><div className="mt-7"><LinkButton href="/demo">See it on your menu <ArrowRight size={16} /></LinkButton></div></>}
                visual={<ResultMeter />}
            />
        </Section>
    );
}

/* alternating: visual right */
function Sourcing() {
    return (
        <Section tint>
            <Split
                text={<><Eyebrow>Sourcing</Eyebrow><h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">We find the farms.</h2><p className="mt-4 text-lg text-ink-muted">Vetted. Close. Ready when you are.</p></>}
                visual={<FarmVetCard />}
            />
        </Section>
    );
}

/* alternating: visual left */
function Delivery() {
    return (
        <Section>
            <Split reverse
                text={<><Eyebrow>Delivery</Eyebrow><h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">We bring it.</h2><p className="mt-4 text-lg text-ink-muted">It just shows up. You stay in the kitchen.</p></>}
                visual={<DeliverySchedule />}
            />
        </Section>
    );
}

/* centered grid */
function FullService() {
    const we = ["Find the farms", "Vet and negotiate", "Hold the contract", "Deliver every week", "Cover shortfalls", "Hand you the proof"];
    const you = ["Say what you want", "Put it on the menu"];
    return (
        <Section tint>
            <Head eyebrow="Full service" title="You do two things." />
            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-[1.5fr_1fr]">
                <Reveal>
                    <Card className="h-full p-7">
                        <p className="mb-4 text-2xs font-semibold uppercase tracking-wide text-brand-600">We handle</p>
                        <Stagger className="grid gap-3 sm:grid-cols-2">
                            {we.map((w) => <StaggerItem key={w}><div className="flex items-center gap-2.5 text-[15px] text-ink-soft"><Check size={17} className="shrink-0 text-brand-500" /> {w}</div></StaggerItem>)}
                        </Stagger>
                    </Card>
                </Reveal>
                <Reveal delay={0.08}>
                    <Card className="flex h-full flex-col justify-center gap-4 p-7">
                        <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">You handle</p>
                        {you.map((y) => <div key={y} className="flex items-center gap-2.5 text-lg font-medium text-ink"><Leaf size={17} className="shrink-0 text-brand-600" /> {y}</div>)}
                    </Card>
                </Reveal>
            </div>
        </Section>
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

function Close() {
    return (
        <Section>
            <Reveal>
                <div className="mx-auto max-w-3xl rounded-4xl border border-brand-800 bg-gradient-to-br from-brand-700 to-brand-900 p-12 text-center text-white sm:p-16">
                    <h2 className="font-display text-4xl leading-tight sm:text-6xl">Start with one dish.</h2>
                    <p className="mx-auto mt-4 max-w-sm text-lg text-white/75">See your numbers. Then let us source it for you.</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <LinkButton href="/demo" size="lg" className="bg-white !text-brand-700 hover:bg-canvas">See your numbers <ArrowRight size={17} /></LinkButton>
                    </div>
                </div>
            </Reveal>
        </Section>
    );
}

/* ---------- layout primitives (varied) ---------- */
function Section({ children, tint, className }: { children: React.ReactNode; tint?: boolean; className?: string }) {
    return <section className={`${tint ? "bg-canvas-soft" : ""} border-t border-line/60 py-24 ${className ?? ""}`}><div className="mx-auto max-w-6xl px-5 lg:px-8">{children}</div></section>;
}
function Head({ eyebrow, title, line }: { eyebrow: string; title: string; line?: string }) {
    return (
        <div className="mx-auto max-w-2xl text-center">
            <Reveal><div className="flex justify-center"><Eyebrow>{eyebrow}</Eyebrow></div><h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{title}</h2>{line && <p className="mt-4 text-lg text-ink-muted">{line}</p>}</Reveal>
        </div>
    );
}
/** Centered section where a big visual carries the message. */
function Big({ eyebrow, title, line, children }: { eyebrow: string; title: string; line: string; children: React.ReactNode }) {
    return (
        <Section tint>
            <Head eyebrow={eyebrow} title={title} line={line} />
            <Reveal delay={0.1} y={24}><div className="mx-auto mt-12 max-w-3xl">{children}</div></Reveal>
        </Section>
    );
}
function Split({ text, visual, reverse }: { text: React.ReactNode; visual: React.ReactNode; reverse?: boolean }) {
    return (
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className={reverse ? "lg:order-2" : ""}>{text}</Reveal>
            <Reveal delay={0.1} className={reverse ? "lg:order-1" : ""}>{visual}</Reveal>
        </div>
    );
}
