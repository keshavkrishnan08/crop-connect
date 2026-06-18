import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import {
    Wheat, Compass, Handshake, Pen, Truck, Repeat, Sparkle, Nodes, Shield, Scale,
    Barn, Storefront, ArrowRight, Check, Pulse, Crate, MapPin,
} from "@/components/icons";

export default function Landing() {
    return (
        <div className="min-h-screen bg-paper text-ink">
            <Nav />
            <Hero />
            <LogoBand />
            <ContractLoop />
            <Features />
            <Audience />
            <AiSection />
            <Positioning />
            <CTA />
            <Footer />
        </div>
    );
}

function Nav() {
    return (
        <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 lg:px-8">
                <Logo />
                <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
                    <a href="#loop" className="transition hover:text-ink">How it works</a>
                    <a href="#features" className="transition hover:text-ink">Product</a>
                    <a href="#who" className="transition hover:text-ink">Who it's for</a>
                </nav>
                <div className="flex items-center gap-2.5">
                    <Link href="/login" className="hidden text-sm font-semibold text-ink-soft transition hover:text-ink sm:block">Sign in</Link>
                    <LinkButton href="/signup" size="sm">Get started <ArrowRight size={15} /></LinkButton>
                </div>
            </div>
        </header>
    );
}

function Hero() {
    return (
        <section className="relative overflow-hidden bg-aurora">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4] [mask-image:radial-gradient(60%_50%_at_50%_30%,black,transparent)]" />
            <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8 lg:py-24">
                <div>
                    <Reveal>
                        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-forest-600 backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-forest-500 animate-pulse-ring" /> Committed-supply contracts
                        </span>
                    </Reveal>
                    <Reveal delay={0.05}>
                        <h1 className="mt-6 font-display text-[2.9rem] leading-[0.98] tracking-tight text-ink sm:text-6xl">
                            Turn handshake supply into <span className="text-gradient italic">renewable contracts</span>.
                        </h1>
                    </Reveal>
                    <Reveal delay={0.12}>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                            CropConnect binds farms and wholesale buyers to defined quantities, prices, and delivery cadences — then drafts the agreement and tracks every delivery. Predictable supply. Provable provenance.
                        </p>
                    </Reveal>
                    <Reveal delay={0.18}>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <LinkButton href="/signup" size="lg">Start a contract <ArrowRight size={17} /></LinkButton>
                            <a href="#loop" className="btn-ghost btn-lg">See how it works</a>
                        </div>
                    </Reveal>
                    <Reveal delay={0.24}>
                        <div className="mt-9 flex items-center gap-6 text-sm text-ink-muted">
                            <span className="inline-flex items-center gap-2"><Check size={16} className="text-forest-500" /> No payments to set up</span>
                            <span className="inline-flex items-center gap-2"><Check size={16} className="text-forest-500" /> Live in one metro</span>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={0.15} y={28}>
                    <HeroVisual />
                </Reveal>
            </div>
        </section>
    );
}

/** Custom 2.5D glass composition — a contract + its supply chain, floating. */
function HeroVisual() {
    return (
        <div className="perspective relative mx-auto h-[420px] w-full max-w-md">
            {/* glow */}
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest-300/30 blur-3xl" />

            {/* main contract card */}
            <div className="absolute left-1/2 top-6 w-[300px] -translate-x-1/2 preserve-3d animate-float-slow" style={{ transform: "rotateX(8deg) rotateY(-12deg)" }}>
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-50 text-forest-600"><Wheat size={22} /></span>
                        <span className="badge bg-forest-50 text-forest-600"><span className="h-1.5 w-1.5 rounded-full bg-current" /> Active</span>
                    </div>
                    <h3 className="mt-3 font-display text-2xl text-ink">Heirloom tomatoes</h3>
                    <p className="text-sm text-ink-muted">40 lb · weekly · Jun–Sep</p>
                    <div className="my-4 divider" />
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">Committed value</p>
                            <p className="font-display text-2xl text-forest-600">$5,200</p>
                        </div>
                        <div className="flex -space-x-2">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-forest-600 text-2xs font-bold text-white ring-2 ring-white">RF</span>
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-harvest-400 text-2xs font-bold text-white ring-2 ring-white">OK</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* floating supply-chain mini board */}
            <div className="absolute -left-2 bottom-2 w-[260px] animate-float" style={{ animationDelay: "0.8s" }}>
                <div className="glass-panel p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-faint"><Nodes size={13} /> Supply chain</p>
                    <div className="flex items-center justify-between">
                        {[
                            { Icon: Wheat, on: true },
                            { Icon: Crate, on: true },
                            { Icon: Truck, on: false },
                            { Icon: MapPin, on: false },
                        ].map(({ Icon, on }, i, arr) => (
                            <div key={i} className="flex items-center">
                                <span className={`grid h-9 w-9 place-items-center rounded-xl ${on ? "bg-forest-500 text-white shadow-forest-glow" : "bg-paper-sunk text-ink-faint"}`}>
                                    <Icon size={16} />
                                </span>
                                {i < arr.length - 1 && <span className={`mx-1 h-0.5 w-4 rounded-full ${arr[i + 1].on ? "bg-forest-400" : "bg-line-strong"}`} />}
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-2xs font-medium text-forest-600">● Product is in cold storage</p>
                </div>
            </div>

            {/* AI draft chip */}
            <div className="absolute -right-1 top-2 animate-float" style={{ animationDelay: "0.4s" }}>
                <div className="glass-card flex items-center gap-2 px-3.5 py-2.5">
                    <Sparkle size={16} className="text-harvest-500" />
                    <span className="text-sm font-semibold text-ink">Agreement drafted</span>
                </div>
            </div>
        </div>
    );
}

function LogoBand() {
    return (
        <div className="border-y border-line bg-white/40">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-center text-sm text-ink-faint lg:px-8">
                <span className="font-medium">What we sell is predictability and provability —</span>
                <span className="font-display text-lg italic text-ink-soft">not cheaper food.</span>
            </div>
        </div>
    );
}

const LOOP = [
    { Icon: Wheat, title: "List", body: "A farm posts a supply offer, or a buyer posts a need — crop, volume, cadence, price, season." },
    { Icon: Compass, title: "Match", body: "AI surfaces compatible counterparties ranked by crop, season, location, volume and price fit." },
    { Icon: Handshake, title: "Negotiate", body: "Accept, counter, or decline on any term. Every version is kept for clarity." },
    { Icon: Pen, title: "Contract", body: "On agreement, AI drafts a clean, plain-language supply agreement. Both parties confirm." },
    { Icon: Truck, title: "Fulfill", body: "Track deliveries against the contract on a live supply-chain board." },
    { Icon: Repeat, title: "Renew", body: "At term end, both sides are prompted to renew or revise. Renewal is the proof." },
];

function ContractLoop() {
    return (
        <section id="loop" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
            <Reveal>
                <p className="text-center"><span className="inline-flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.16em] text-forest-600"><span className="h-px w-5 bg-forest-400/60" /> The contract loop</span></p>
                <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-4xl leading-tight text-ink sm:text-5xl">One repeating loop. Everything exists to make it fast.</h2>
            </Reveal>
            <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {LOOP.map((s, i) => (
                    <StaggerItem key={s.title}>
                        <div className="group glass-card h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg">
                            <div className="flex items-center justify-between">
                                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-50 text-forest-600 transition group-hover:bg-forest-500 group-hover:text-white"><s.Icon size={24} /></span>
                                <span className="font-display text-3xl text-line-strong">0{i + 1}</span>
                            </div>
                            <h3 className="mt-4 font-display text-2xl text-ink">{s.title}</h3>
                            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
                        </div>
                    </StaggerItem>
                ))}
            </Stagger>
        </section>
    );
}

const FEATURES = [
    { Icon: Nodes, title: "A living supply-chain board", body: "Map every step from harvest to drop-off on an editable, Miro-style canvas. Highlight exactly where the product is right now. Both parties keep it current until the contract closes." },
    { Icon: Pen, title: "Instant agreement drafting", body: "Turn agreed terms into a clear, plain-language supply agreement in one click — no lawyer needed to start. The single biggest friction in committed local supply, gone." },
    { Icon: Scale, title: "Value you can see", body: "Quantity × price × cadence becomes a committed value that accrues across the term. Negotiate with the numbers in front of you." },
    { Icon: Shield, title: "Provable, renewable relationships", body: "Lightweight reputation tracks who fulfills and who renews. A renewed contract — not a one-off match — is the real proof of demand." },
];

function Features() {
    return (
        <section id="features" className="bg-paper-warm/60 py-20">
            <div className="mx-auto max-w-6xl px-5 lg:px-8">
                <Reveal>
                    <h2 className="max-w-2xl font-display text-4xl leading-tight text-ink sm:text-5xl">The visual tools that make committing easy.</h2>
                    <p className="mt-4 max-w-xl text-lg text-ink-muted">Negotiation is hard when it's all text and phone calls. CropConnect makes every important part of a contract something you can see and agree on.</p>
                </Reveal>
                <div className="mt-12 grid gap-5 md:grid-cols-2">
                    {FEATURES.map((f, i) => (
                        <Reveal key={f.title} delay={i * 0.06}>
                            <div className="glass-card h-full p-7">
                                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700 text-white shadow-forest-glow"><f.Icon size={26} /></span>
                                <h3 className="mt-5 font-display text-2xl text-ink">{f.title}</h3>
                                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{f.body}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Audience() {
    return (
        <section id="who" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2">
                <Reveal>
                    <div className="glass-card h-full overflow-hidden p-8">
                        <span className="grid h-14 w-14 place-items-center rounded-3xl bg-forest-50 text-forest-600"><Barn size={28} /></span>
                        <h3 className="mt-5 font-display text-3xl text-ink">For farms</h3>
                        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">A dependable, recurring sales channel. Lock in demand before the season, cut waste, and stop absorbing all the price uncertainty.</p>
                        <ul className="mt-5 space-y-2.5">
                            {["Predictable, committed revenue", "Less surplus and over-planting", "A direct channel you control"].map((x) => (
                                <li key={x} className="flex items-center gap-2.5 text-[15px] text-ink-soft"><Check size={17} className="text-forest-500" /> {x}</li>
                            ))}
                        </ul>
                    </div>
                </Reveal>
                <Reveal delay={0.08}>
                    <div className="glass-card h-full overflow-hidden p-8">
                        <span className="grid h-14 w-14 place-items-center rounded-3xl bg-sky/10 text-sky"><Storefront size={28} /></span>
                        <h3 className="mt-5 font-display text-3xl text-ink">For buyers</h3>
                        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">Reliable local supply on standing terms — plus the provenance and story to market farm-to-table with confidence.</p>
                        <ul className="mt-5 space-y-2.5">
                            {["Consistent inputs to plan menus around", "Local sourcing you can prove", "Standing terms, not weekly scrambles"].map((x) => (
                                <li key={x} className="flex items-center gap-2.5 text-[15px] text-ink-soft"><Check size={17} className="text-sky" /> {x}</li>
                            ))}
                        </ul>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

function AiSection() {
    return (
        <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
            <Reveal>
                <div className="overflow-hidden rounded-4xl border border-forest-800 bg-gradient-to-br from-forest-700 to-forest-900 p-9 text-white sm:p-12">
                    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-harvest-300"><Sparkle size={14} /> Where AI fits</span>
                            <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">We turn messy, informal supply into structured contracts — automatically.</h2>
                            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/75">AI is the enabler, not a veneer. It drafts the agreement from your agreed terms and ranks the counterparties most worth your time. Lead with the job done, not the model.</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { Icon: Pen, t: "Contract generation", b: "Agreed terms → a clean supply agreement, instantly." },
                                { Icon: Compass, t: "Matching & recommendations", b: "The right farms and buyers, ranked by real fit." },
                                { Icon: Pulse, t: "Built to learn", b: "Rule-based today; sharper as transactions accumulate." },
                            ].map((x) => (
                                <div key={x.t} className="flex items-start gap-3.5 rounded-2xl bg-white/8 p-4 backdrop-blur">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/12 text-harvest-300"><x.Icon size={20} /></span>
                                    <div>
                                        <p className="font-semibold">{x.t}</p>
                                        <p className="text-sm text-white/70">{x.b}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}

function Positioning() {
    const stats = [
        { v: "6 steps", l: "From listing to renewal" },
        { v: "1 metro", l: "Deliberately narrow to start" },
        { v: "0", l: "Fabricated testimonials" },
    ];
    return (
        <section className="border-y border-line bg-white/50 py-12">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-5 sm:grid-cols-3 lg:px-8">
                {stats.map((s) => (
                    <Reveal key={s.l}>
                        <div className="text-center">
                            <p className="font-display text-4xl text-forest-600 sm:text-5xl">{s.v}</p>
                            <p className="mt-1.5 text-sm text-ink-muted">{s.l}</p>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

function CTA() {
    return (
        <section className="mx-auto max-w-6xl px-5 py-24 text-center lg:px-8">
            <Reveal>
                <h2 className="mx-auto max-w-3xl font-display text-5xl leading-[1.04] text-ink sm:text-6xl">Sign it. Fulfill it. <span className="text-gradient italic">Renew it.</span></h2>
                <p className="mx-auto mt-5 max-w-xl text-lg text-ink-muted">Start with a single committed contract. That's the smallest thing worth proving — and the beginning of a relationship the platform comes to own.</p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                    <LinkButton href="/signup" size="lg">Get started <ArrowRight size={17} /></LinkButton>
                    <LinkButton href="/login" variant="ghost" size="lg">Sign in</LinkButton>
                </div>
            </Reveal>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-line bg-paper-warm/60">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-9 text-sm text-ink-muted sm:flex-row lg:px-8">
                <Logo />
                <p className="text-center text-[13px] text-ink-faint">Committed supply + provability. Not legal or financial advice — have any contract reviewed by a qualified attorney.</p>
                <p className="text-[13px]">© {new Date().getFullYear()} CropConnect</p>
            </div>
        </footer>
    );
}
