import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { LinkButton, Card, Badge, Eyebrow } from "@/components/ui/kit";
import { Reveal } from "@/components/ui/Reveal";
import { usd } from "@/lib/utils";
import {
    Plate,
    Search,
    Handshake,
    Truck,
    MarginUp,
    Check,
    ArrowRight,
    MapPin,
    Calendar,
    Shield,
    Repeat,
} from "@/components/icons";

export const metadata = {
    title: "How it works · CropConnect",
    description: "The full local sourcing service, step by step. You say what you want. We do the rest.",
};

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <MarketingNav />
            <main>
                <Hero />
                <Step1 />
                <Step2 />
                <Step3 />
                <Step4 />
                <Step5 />
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
                        Here is exactly how it works.
                    </h1>
                </Reveal>
                <Reveal delay={0.1}>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                        Five steps. You handle two of them. We handle the rest. No calls to farms. No invoices to chase. No coolers full of surprises.
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
            title="You tell us what you want."
            body={[
                "Name the ingredient. Set the amount. Say which dish it goes on.",
                "That is the whole ask. One line in a form takes about a minute.",
                "You stay the chef. We never touch the menu.",
            ]}
            visual={
                <RequestVisual />
            }
        />
    );
}

function Step2() {
    return (
        <StepSection
            n={2}
            owner="us"
            flip
            title="We find and vet the farm."
            body={[
                "We rank nearby farms by distance, reliability, and price.",
                "We check the grower. We taste the product. We confirm they can hit your volume every week.",
                "You see the top match and approve it. One tap.",
            ]}
            visual={
                <FarmRankVisual />
            }
        />
    );
}

function Step3() {
    return (
        <StepSection
            n={3}
            owner="us"
            title="We lock the contract."
            body={[
                "One clear standing agreement. A set price for the season.",
                "No weekly haggling. No surprise line items. It renews each season on its own.",
                "We carry the paperwork and the terms. You just say yes.",
            ]}
            visual={
                <ContractVisual />
            }
        />
    );
}

function Step4() {
    return (
        <StepSection
            n={4}
            owner="us"
            flip
            title="We deliver it every week."
            body={[
                "We run the route. We schedule the drop. We pack the cooler.",
                "It arrives at your door on the same day each week. If a crop fails, a backup farm fills the gap.",
                "You build a menu you can plan around.",
            ]}
            visual={
                <DeliveryVisual />
            }
        />
    );
}

function Step5() {
    return (
        <StepSection
            n={5}
            owner="you"
            title="It goes live and you watch the margin."
            body={[
                "You put it on the menu with the farm name and the miles.",
                "The story lets you charge a little more for the same plate.",
                "We track the uplift per cover so you see what each dish earns.",
            ]}
            visual={
                <MarginVisual />
            }
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
    owner: "you" | "us";
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

function OwnerTag({ owner }: { owner: "you" | "us" }) {
    if (owner === "you") {
        return <Badge tone="harvest">Your job</Badge>;
    }
    return <Badge tone="brand">We handle this</Badge>;
}

function IconBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            {children}
        </span>
    );
}

/* --------------------------------------------------------------- Visuals */

function VisualCard({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Card className="p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
                <span className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">{label}</span>
            </div>
            {children}
        </Card>
    );
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex items-center justify-between rounded-xl border border-line bg-canvas px-4 py-3 ${className ?? ""}`}>
            {children}
        </div>
    );
}

function RequestVisual() {
    return (
        <VisualCard label="The request">
            <div className="space-y-3">
                <div className="rounded-xl border border-line bg-canvas px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Ingredient</p>
                    <p className="mt-0.5 flex items-center gap-2 text-[15px] font-medium text-ink">
                        <Plate size={17} className="text-brand-500" /> Heirloom tomatoes
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-line bg-canvas px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Amount</p>
                        <p className="mt-0.5 font-mono text-[15px] text-ink tnum">40 lb / week</p>
                    </div>
                    <div className="rounded-xl border border-line bg-canvas px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">For the dish</p>
                        <p className="mt-0.5 text-[15px] text-ink">Summer salad</p>
                    </div>
                </div>
            </div>
            <p className="mt-4 text-center text-xs text-ink-faint">This is the whole form.</p>
        </VisualCard>
    );
}

function FarmRankVisual() {
    const farms = [
        { name: "Teter Farm", miles: 12, score: "98", top: true },
        { name: "Pinetree Gardens", miles: 18, score: "94", top: false },
        { name: "Hollow Creek", miles: 24, score: "91", top: false },
    ];
    return (
        <VisualCard label="Ranked matches">
            <div className="space-y-2.5">
                {farms.map((f) => (
                    <Row key={f.name} className={f.top ? "border-brand-200 bg-brand-50/50" : ""}>
                        <div className="flex items-center gap-3">
                            <span className={`grid h-8 w-8 place-items-center rounded-lg ${f.top ? "bg-brand-500 text-white" : "bg-canvas-sunk text-ink-muted"}`}>
                                <MapPin size={15} />
                            </span>
                            <div>
                                <p className="text-[14px] font-medium text-ink">{f.name}</p>
                                <p className="font-mono text-xs text-ink-faint tnum">{f.miles} miles</p>
                            </div>
                        </div>
                        {f.top ? (
                            <Badge tone="brand">Top match</Badge>
                        ) : (
                            <span className="font-mono text-sm text-ink-muted tnum">{f.score}</span>
                        )}
                    </Row>
                ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
                <Search size={16} /> Vetted on quality, reliability, and price.
            </div>
        </VisualCard>
    );
}

function ContractVisual() {
    const terms = [
        ["Item", "Heirloom tomatoes"],
        ["Volume", "40 lb each week"],
        ["Price", `${usd(2.4)} / lb, fixed`],
        ["Term", "Through October"],
    ] as const;
    return (
        <VisualCard label="Standing agreement">
            <div className="overflow-hidden rounded-xl border border-line">
                {terms.map(([k, v], i) => (
                    <div
                        key={k}
                        className={`flex items-center justify-between px-4 py-3 ${i === 0 ? "" : "border-t border-line"}`}
                    >
                        <span className="text-[13px] text-ink-muted">{k}</span>
                        <span className="font-mono text-[14px] text-ink tnum">{v}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-[13px] text-brand-700">
                    <Handshake size={16} /> No haggling
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-[13px] text-brand-700">
                    <Repeat size={16} /> Auto renews
                </div>
            </div>
        </VisualCard>
    );
}

function DeliveryVisual() {
    const weeks = ["Wed Jun 24", "Wed Jul 1", "Wed Jul 8", "Wed Jul 15"];
    return (
        <VisualCard label="Weekly schedule">
            <div className="space-y-2.5">
                {weeks.map((w, i) => (
                    <Row key={w}>
                        <div className="flex items-center gap-3">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                                <Truck size={16} />
                            </span>
                            <p className="text-[14px] font-medium text-ink">{w}</p>
                        </div>
                        {i === 0 ? (
                            <Badge tone="harvest" dot>
                                This week
                            </Badge>
                        ) : (
                            <span className="flex items-center gap-1.5 text-[13px] text-ink-muted">
                                <Calendar size={14} /> Scheduled
                            </span>
                        )}
                    </Row>
                ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-canvas-soft px-4 py-2.5 text-sm text-ink-muted">
                <Shield size={16} className="text-brand-500" /> A backup farm covers any crop that fails.
            </div>
        </VisualCard>
    );
}

function MarginVisual() {
    return (
        <VisualCard label="Margin tracker">
            <div className="space-y-3">
                <Row>
                    <span className="text-[14px] text-ink-muted">Menu price before</span>
                    <span className="font-mono text-[15px] text-ink tnum">{usd(16)}</span>
                </Row>
                <Row className="border-brand-200 bg-brand-50/50">
                    <span className="text-[14px] font-medium text-ink">Menu price after</span>
                    <span className="font-mono text-[15px] text-ink tnum">{usd(19)}</span>
                </Row>
            </div>
            <Card className="mt-4 flex items-center justify-between p-5">
                <div>
                    <p className="text-sm text-ink-muted">Per plate</p>
                    <p className="font-display text-lg text-ink">Same food cost</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-ink-muted">Margin added</p>
                    <p className="font-mono text-2xl text-harvest-500 tnum">+{usd(3)}</p>
                </div>
            </Card>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
                <MarginUp size={18} /> Across 25 plates a night that is +{usd(75)}.
            </div>
        </VisualCard>
    );
}

/* ------------------------------------------------------------ Close band */

function CloseBand() {
    return (
        <section className="relative overflow-hidden border-b border-line">
            <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
            <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
                <Reveal>
                    <Eyebrow className="justify-center">Your part is small</Eyebrow>
                    <h2 className="mt-6 text-balance text-3xl sm:text-4xl">Your job is two things.</h2>
                    <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
                        <Card className="flex items-center gap-3 p-5 text-left">
                            <IconBadge>
                                <Plate size={20} />
                            </IconBadge>
                            <p className="text-[15px] font-medium text-ink">Say what you want.</p>
                        </Card>
                        <Card className="flex items-center gap-3 p-5 text-left">
                            <IconBadge>
                                <Check size={20} />
                            </IconBadge>
                            <p className="text-[15px] font-medium text-ink">Put it on the menu.</p>
                        </Card>
                    </div>
                    <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-ink-muted">
                        We do everything in between. The sourcing, the contract, the delivery, the story.
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
