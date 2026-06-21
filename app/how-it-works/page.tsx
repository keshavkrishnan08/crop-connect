import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { LinkButton, Card, Badge, Eyebrow } from "@/components/ui/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import {
    SageFlow,
    TypingRequest,
    FarmMatchScan,
    AgreementDraft,
    WeekRhythm,
    ProvenanceMargin,
} from "@/components/marketing/HowItWorksFlow";
import {
    Plate,
    Search,
    Handshake,
    Truck,
    StoryTag,
    Check,
    ArrowRight,
    Sparkle,
    Pen,
} from "@/components/icons";

export const metadata = {
    title: "How it works · CropConnect",
    description: "Sage runs your local sourcing end to end. You say what you want and put it on the menu. Here is every step.",
};

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <main>
                <Hero />
                <MeetSage />
                <Step1 />
                <Step2 />
                <Step3 />
                <Step4 />
                <Step5 />
                <Recap />
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
                    <Eyebrow>How it works</Eyebrow>
                </Reveal>
                <Reveal delay={0.05}>
                    <h1 className="mt-5 max-w-2xl text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
                        Sage does the sourcing. You run the kitchen.
                    </h1>
                </Reveal>
                <Reveal delay={0.1}>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                        Sage is the agent that runs your local supply. It matches and vets farms, drafts the agreement, schedules every delivery, and prepares the provenance. You do two things. Say what you want, and put it on the menu.
                    </p>
                </Reveal>
                <Reveal delay={0.15}>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                            See your numbers
                            <ArrowRight size={18} />
                        </LinkButton>
                        <LinkButton href="/what-we-handle" variant="ghost" size="lg">
                            What we handle
                        </LinkButton>
                    </div>
                </Reveal>
                <Reveal delay={0.22}>
                    <div className="mt-12">
                        <SageFlow />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* --------------------------------------------------------------- Meet Sage */

function MeetSage() {
    const facts = [
        { icon: <Search size={18} />, t: "Knows the local bench", d: "Sage already tracks the farms near you, ranked and vetted." },
        { icon: <Handshake size={18} />, t: "Writes the deals", d: "It drafts a fixed-price seasonal agreement and holds the terms." },
        { icon: <Truck size={18} />, t: "Runs the logistics", d: "It books the route, packs the cold chain, and covers shortfalls." },
        { icon: <StoryTag size={18} />, t: "Hands you the proof", d: "Farm names and miles, ready for the plate and the margin tracker." },
    ];
    return (
        <section className="border-b border-line bg-canvas-soft">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                <Reveal>
                    <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white shadow-brand">
                            <Sparkle size={20} />
                        </span>
                        <Eyebrow>Meet Sage</Eyebrow>
                    </div>
                    <h2 className="mt-5 max-w-2xl text-3xl sm:text-4xl">An agent that owns the whole supply chain.</h2>
                    <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                        Sage works the way a great sourcing manager would, without the salary or the slow weeks. It runs in the background and only asks you the two questions that matter.
                    </p>
                </Reveal>
                <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {facts.map((f) => (
                        <StaggerItem key={f.t}>
                            <Card className="h-full p-6">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                                    {f.icon}
                                </span>
                                <h3 className="mt-4 text-[16px] font-semibold text-ink">{f.t}</h3>
                                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{f.d}</p>
                            </Card>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Steps */

function Step1() {
    return (
        <StepSection
            n={1}
            owner="you"
            title="You tell Sage what you want."
            body={[
                "Name the ingredient. Set the amount. Say which dish it goes on.",
                "That is the whole ask. One line in a form takes about a minute.",
                "You stay the chef. Sage never touches the menu.",
            ]}
            visual={<TypingRequest />}
        />
    );
}

function Step2() {
    return (
        <StepSection
            n={2}
            owner="sage"
            flip
            title="Sage matches and vets the farm."
            body={[
                "Sage ranks nearby farms by distance, reliability, and price.",
                "It checks the grower, confirms the practices, and makes sure they can hit your volume every week.",
                "You see the top match and approve it. One tap.",
            ]}
            visual={<FarmMatchScan />}
        />
    );
}

function Step3() {
    return (
        <StepSection
            n={3}
            owner="sage"
            title="Sage drafts the agreement."
            body={[
                "One clear standing agreement at a set price for the season.",
                "No weekly haggling. No surprise line items. It renews each season on its own.",
                "Sage writes it and holds the terms. You just say yes.",
            ]}
            visual={<AgreementDraft />}
        />
    );
}

function Step4() {
    return (
        <StepSection
            n={4}
            owner="sage"
            flip
            title="Sage schedules weekly delivery."
            body={[
                "Sage runs the route, books the courier, and packs the cold chain.",
                "It arrives at your door on the same day each week. If a crop fails, a backup farm fills the gap.",
                "You build a menu you can plan around.",
            ]}
            visual={<WeekRhythm />}
        />
    );
}

function Step5() {
    return (
        <StepSection
            n={5}
            owner="you"
            title="Sage prepares the provenance. You serve it."
            body={[
                "Sage hands you the farm name and the miles, ready for the plate.",
                "You put it on the menu and charge a little more for the same dish.",
                "Sage tracks the uplift per cover so you see what each dish earns.",
            ]}
            visual={<ProvenanceMargin />}
        />
    );
}

/* ------------------------------------------------------------ Step layout */

function StepSection({
    n,
    owner,
    title,
    body,
    visual,
    flip,
}: {
    n: number;
    owner: "you" | "sage";
    title: string;
    body: string[];
    visual: React.ReactNode;
    flip?: boolean;
}) {
    return (
        <section className={`border-b border-line ${n % 2 === 0 ? "bg-canvas-soft" : ""}`}>
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                <div className={`grid items-center gap-12 lg:grid-cols-2 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
                    <Reveal>
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-5xl text-line-strong tnum">{String(n).padStart(2, "0")}</span>
                            <OwnerTag owner={owner} />
                        </div>
                        <h2 className="mt-5 max-w-md text-3xl sm:text-4xl">{title}</h2>
                        <div className="mt-5 max-w-md space-y-3">
                            {body.map((line) => (
                                <p key={line} className="text-[15px] leading-relaxed text-ink-muted">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </Reveal>
                    <Reveal delay={0.08}>{visual}</Reveal>
                </div>
            </div>
        </section>
    );
}

function OwnerTag({ owner }: { owner: "you" | "sage" }) {
    if (owner === "you") {
        return <Badge tone="harvest">Your job</Badge>;
    }
    return <Badge tone="brand"><Sparkle size={12} /> Sage handles this</Badge>;
}

/* ------------------------------------------------------------------ Recap */

function Recap() {
    return (
        <section className="border-b border-line">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                <Reveal>
                    <div className="flex justify-center"><Eyebrow>Start to finish</Eyebrow></div>
                    <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl sm:text-4xl">From a one-line request to a plate that earns more.</h2>
                    <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-ink-muted">
                        Setup takes about ten minutes. Your first local item runs free for a week, with no commitment. After that Sage just keeps it running.
                    </p>
                </Reveal>
                <Stagger className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
                    {[
                        { m: "~1 min", t: "You ask", d: "Name the ingredient and the dish." },
                        { m: "Same week", t: "Sage sources", d: "Match, vet, draft, schedule, prove." },
                        { m: "Free trial", t: "You serve", d: "First item free for a week." },
                    ].map((s) => (
                        <StaggerItem key={s.t}>
                            <Card className="h-full p-7">
                                <span className="rounded-full bg-harvest-400/15 px-2.5 py-1 font-mono text-2xs font-semibold text-harvest-500 tnum">{s.m}</span>
                                <p className="mt-4 font-display text-xl text-ink">{s.t}</p>
                                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{s.d}</p>
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
                    <Eyebrow className="justify-center">Your part is small</Eyebrow>
                    <h2 className="mt-6 text-balance text-3xl sm:text-4xl">Your job is two things.</h2>
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
                        Sage does everything in between. The matching, the vetting, the contract, the delivery, the proof.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                            See your numbers
                            <ArrowRight size={18} />
                        </LinkButton>
                        <LinkButton href="/pricing" variant="ghost" size="lg">
                            See pricing
                        </LinkButton>
                    </div>
                    <p className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-ink-muted">
                        {["Set up in 10 minutes", "First item free for a week", "Cancel anytime"].map((t) => (
                            <span key={t} className="inline-flex items-center gap-1.5"><Check size={14} className="text-brand-500" /> {t}</span>
                        ))}
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
