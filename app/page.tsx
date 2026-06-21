import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LinkButton, Card, Glass, Badge, Eyebrow } from "@/components/ui/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { LivingMenuLine } from "@/components/marketing/LivingMenuLine";
import { usd } from "@/lib/utils";
import {
    Mark,
    Leaf,
    Farm,
    Route,
    StoryTag,
    MarginUp,
    TrendUp,
    Plate,
    Truck,
    Check,
    ArrowRight,
    ArrowUpRight,
    Shield,
    Sparkle,
    MapPin,
} from "@/components/icons";

/* The single CTA verb, repeated. */
const CTA = "See your margin gain";

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-canvas text-ink">
            {/* ---------------------------------------------------------------- Nav */}
            <header className="sticky top-0 z-50">
                <div className="glass border-b border-line">
                    <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
                        <Logo />
                        <div className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
                            <Link href="#how" className="transition-colors hover:text-ink">How it works</Link>
                            <Link href="#product" className="transition-colors hover:text-ink">Product</Link>
                            <Link href="#farms" className="transition-colors hover:text-ink">For farms</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/app" className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:inline">Sign in</Link>
                            <LinkButton href="/demo" variant="primary" className="gap-2">
                                {CTA}
                                <ArrowRight size={16} />
                            </LinkButton>
                        </div>
                    </nav>
                </div>
            </header>

            <main>
                {/* ------------------------------------------------------------ Hero */}
                <section className="relative overflow-hidden">
                    <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
                    <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
                    <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
                        <div>
                            <Reveal>
                                <Eyebrow>For independent restaurants</Eyebrow>
                            </Reveal>
                            <Reveal delay={0.05}>
                                <h1 className="mt-5 max-w-xl text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
                                    Make your menu more profitable, <span className="ink-grad">one local dish at a time.</span>
                                </h1>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted">
                                    Tell us what you want on the plate. We source it local and hand you the story that lets you charge a little more — so the same dish earns more.
                                </p>
                            </Reveal>
                            <Reveal delay={0.15}>
                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                    <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                                        {CTA}
                                        <ArrowRight size={18} />
                                    </LinkButton>
                                    <LinkButton href="#how" variant="ghost" size="lg">How it works</LinkButton>
                                </div>
                            </Reveal>
                            <Reveal delay={0.2}>
                                <p className="mt-7 flex items-center gap-2 text-sm text-ink-faint">
                                    <Sparkle size={15} className="text-brand-500" />
                                    Early access — onboarding a small group of design-partner kitchens this season.
                                </p>
                            </Reveal>
                        </div>

                        <Reveal delay={0.1} className="lg:pl-6">
                            <div className="relative">
                                <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-500/[0.04] blur-2xl" />
                                <Glass className="rounded-3xl p-6 shadow-lift">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Tonight&rsquo;s menu</span>
                                        <Badge tone="harvest" dot>Live</Badge>
                                    </div>
                                    <LivingMenuLine dish="Heirloom tomato salad" base={16} lift={3} farm="Teter Farm" miles={12} />
                                    <div className="mt-4 grid grid-cols-3 gap-3">
                                        <MiniStat label="Same plate cost" value="No change" />
                                        <MiniStat label="Menu price" value="+$3" accent />
                                        <MiniStat label="Per cover" value="Margin up" />
                                    </div>
                                    <p className="mt-4 text-center text-xs text-ink-faint">Tap the row to see the upgrade.</p>
                                </Glass>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* --------------------------------------------------------- Problem */}
                <section className="border-t border-line bg-canvas-soft">
                    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>The squeeze</Eyebrow>
                            <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Independent kitchens run on margins thinner than the steak.</h2>
                        </Reveal>
                        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
                            <StaggerItem>
                                <Card className="h-full p-7">
                                    <IconBadge><MarginUp size={20} /></IconBadge>
                                    <h3 className="mt-5 text-xl">Margins are razor-thin</h3>
                                    <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                                        Most independents net around 3&ndash;5%. A few dollars per cover is the difference between a good month and a bad one.
                                    </p>
                                </Card>
                            </StaggerItem>
                            <StaggerItem>
                                <Card className="h-full p-7">
                                    <IconBadge><Truck size={20} /></IconBadge>
                                    <h3 className="mt-5 text-xl">The distributor is reliable, but generic</h3>
                                    <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                                        The broadliner shows up every week. It also gives you nothing to put on the menu that a diner can&rsquo;t get down the street.
                                    </p>
                                </Card>
                            </StaggerItem>
                            <StaggerItem>
                                <Card className="h-full p-7">
                                    <IconBadge><Farm size={20} /></IconBadge>
                                    <h3 className="mt-5 text-xl">Local is desirable, but a hassle</h3>
                                    <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                                        Calling farms, chasing invoices, juggling drop-offs. The story sells — but sourcing it yourself eats the hours you don&rsquo;t have.
                                    </p>
                                </Card>
                            </StaggerItem>
                        </Stagger>
                    </div>
                </section>

                {/* ------------------------------------------------------- How it works */}
                <section id="how" className="border-t border-line scroll-mt-20">
                    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>How it works</Eyebrow>
                            <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Three steps. We carry the parts that cost you time.</h2>
                        </Reveal>
                        <Stagger className="mt-12 grid gap-6 lg:grid-cols-3">
                            <StaggerItem>
                                <Step n={1} icon={<Plate size={22} />} title="Tell us what you want">
                                    Pick the items you&rsquo;d love to feature — tomatoes, greens, a heritage pork. You set the dish; we read the spec.
                                </Step>
                            </StaggerItem>
                            <StaggerItem>
                                <Step n={2} icon={<Route size={22} />} title="We source & deliver local">
                                    We find the right nearby farm, handle the buy, and bring it to your door on a schedule you can plan a menu around.
                                </Step>
                            </StaggerItem>
                            <StaggerItem>
                                <Step n={3} icon={<StoryTag size={22} />} title="We hand you the story">
                                    Farm name, miles, the why — packaged for the menu and the server&rsquo;s mouth. That&rsquo;s what lets you charge more.
                                </Step>
                            </StaggerItem>
                        </Stagger>
                    </div>
                </section>

                {/* ------------------------------------------------------ Margin proof */}
                <section className="border-t border-line bg-canvas-soft">
                    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <Reveal>
                                <Eyebrow>The margin proof</Eyebrow>
                                <h2 className="mt-4 text-3xl sm:text-4xl">We raise your prices, not cut your costs.</h2>
                                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted">
                                    A credible local story gives the same plate room to move on price. Here&rsquo;s a worked example — a model with the numbers shown, not a guarantee.
                                </p>

                                <div className="mt-8 space-y-3">
                                    <ProofRow label="Menu price before" value={usd(16)} />
                                    <ProofRow label="Menu price after the local story" value={usd(19)} accent />
                                    <div className="divider" />
                                    <ProofRow label="Added margin per plate" value={`+${usd(3)}`} bold accent />
                                    <ProofRow label="Across 25 of these a night" value={`+${usd(75)}`} bold accent />
                                </div>

                                <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
                                    <Shield size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                                    Illustrative model. Assumes one featured item, ~$3 of pricing power from provenance, and 25 covers/night. Your real lift depends on your menu and your room.
                                </p>

                                <div className="mt-7">
                                    <LinkButton href="/demo" variant="primary" className="gap-2">
                                        See your full margin gain
                                        <ArrowRight size={16} />
                                    </LinkButton>
                                </div>
                            </Reveal>

                            <Reveal delay={0.08}>
                                <Glass className="rounded-3xl p-6 shadow-lift">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Worked example</span>
                                        <Badge tone="brand">Model</Badge>
                                    </div>
                                    <LivingMenuLine dish="Roasted beet & chèvre" base={16} lift={3} farm="Pinetree Gardens" miles={9} />
                                    <Card className="mt-4 flex items-center justify-between p-5">
                                        <div>
                                            <p className="text-sm text-ink-muted">Same food cost</p>
                                            <p className="font-display text-lg text-ink">Unchanged</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-ink-muted">Margin per plate</p>
                                            <p className="font-mono text-2xl text-harvest-500 tnum">+{usd(3)}</p>
                                        </div>
                                    </Card>
                                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
                                        <TrendUp size={18} />
                                        The cost line stays flat. The price line moves.
                                    </div>
                                </Glass>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ----------------------------------------------------- What you get */}
                <section id="product" className="border-t border-line scroll-mt-20">
                    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>What you get</Eyebrow>
                            <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Everything to source local — and get paid for it.</h2>
                        </Reveal>
                        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2">
                            <StaggerItem>
                                <Feature icon={<Route size={22} />} title="Sourcing">
                                    We match each item to the right nearby farm and run the buy, so you skip the phone tag and the invoices.
                                </Feature>
                            </StaggerItem>
                            <StaggerItem>
                                <Feature icon={<StoryTag size={22} />} title="Story Studio">
                                    Menu-ready provenance — farm, miles, the reason it&rsquo;s better — written so a server can sell it in one breath.
                                </Feature>
                            </StaggerItem>
                            <StaggerItem>
                                <Feature icon={<MarginUp size={22} />} title="Margin Studio">
                                    See the price you can defend on each dish and what it adds per cover, before you commit.
                                </Feature>
                            </StaggerItem>
                            <StaggerItem>
                                <Feature icon={<Truck size={22} />} title="Deliveries">
                                    One predictable drop on a schedule you can build a menu around. No coolers full of surprises.
                                </Feature>
                            </StaggerItem>
                        </Stagger>
                    </div>
                </section>

                {/* ------------------------------------------------------- Comparison */}
                <section className="border-t border-line bg-canvas-soft">
                    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
                        <Reveal>
                            <Eyebrow>Why CropConnect</Eyebrow>
                            <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Local on your own, the broadliner, or both done for you.</h2>
                        </Reveal>

                        <Reveal delay={0.06}>
                            <Card className="mt-10 overflow-hidden p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-line">
                                                <th className="px-6 py-5 font-medium text-ink-muted">&nbsp;</th>
                                                <th className="px-6 py-5 font-display text-base font-normal text-ink-soft">You, alone</th>
                                                <th className="px-6 py-5 font-display text-base font-normal text-ink-soft">A broadliner</th>
                                                <th className="bg-brand-50/60 px-6 py-5 font-display text-base font-normal text-brand-700">
                                                    <span className="inline-flex items-center gap-2"><Mark size={18} /> CropConnect</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <CompareRow
                                                label="Local sourcing effort"
                                                a="Hours of calls & invoices"
                                                b="None — but nothing local"
                                                c="We run it for you"
                                            />
                                            <CompareRow
                                                label="Pricing power / story"
                                                a="Strong, if you build it"
                                                b="None — generic supply"
                                                c="Menu-ready, every item"
                                            />
                                            <CompareRow
                                                label="Reliability"
                                                a="Depends on each farm"
                                                b="High, very predictable"
                                                c="Scheduled local drops"
                                            />
                                            <CompareRow
                                                label="Effect on margin"
                                                a="Upside, lots of work"
                                                b="Flat — you compete on price"
                                                c="Higher price, same cost"
                                                last
                                            />
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </Reveal>
                    </div>
                </section>

                {/* --------------------------------------------------------- For farms */}
                <section id="farms" className="border-t border-line scroll-mt-20">
                    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
                        <Reveal>
                            <div className="flex flex-col items-start gap-5 rounded-2xl border border-line bg-canvas-soft p-8 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <IconBadge><Leaf size={20} /></IconBadge>
                                    <div>
                                        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-brand-600">For farms</p>
                                        <h3 className="mt-1.5 text-xl">We bring you committed demand, not another spot listing.</h3>
                                        <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                                            Restaurants commit to what they&rsquo;ll feature, so you grow and harvest against real orders.
                                        </p>
                                    </div>
                                </div>
                                <Link href="/demo" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
                                    Grow for restaurants
                                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ------------------------------------------------------------- Close */}
                <section className="border-t border-line">
                    <div className="relative overflow-hidden">
                        <div className="bg-aura pointer-events-none absolute inset-0 -z-10" />
                        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
                            <Reveal>
                                <Badge tone="harvest" className="mx-auto">Free to start</Badge>
                                <h2 className="mt-6 text-balance text-4xl sm:text-5xl">Source one item, one week — free.</h2>
                                <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-ink-muted">
                                    Put one local dish on your menu and watch what it does to the check. No contract, no risk to your line.
                                </p>
                                <div className="mt-8 flex justify-center">
                                    <LinkButton href="/demo" variant="primary" size="lg" className="gap-2">
                                        {CTA}
                                        <ArrowUpRight size={18} />
                                    </LinkButton>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>
            </main>

            {/* ------------------------------------------------------------- Footer */}
            <footer className="border-t border-line bg-canvas-soft">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div className="flex items-center gap-3">
                        <Logo href={null} size="sm" />
                    </div>
                    <p className="max-w-md text-xs leading-relaxed text-ink-faint">
                        Margin figures are illustrative models with stated assumptions, not financial advice or a guarantee of results. Your outcome depends on your menu, market, and execution.
                    </p>
                </div>
                <div className="border-t border-line">
                    <div className="mx-auto max-w-6xl px-5 py-5 text-2xs text-ink-faint sm:px-8">
                        &copy; {new Date().getFullYear()} CropConnect &middot; Built for independent restaurants.
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ---------------------------------------------------------------- helpers */

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="rounded-xl border border-line bg-canvas px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
            <p className={`mt-0.5 text-sm font-medium ${accent ? "font-mono text-harvest-500 tnum" : "text-ink"}`}>{value}</p>
        </div>
    );
}

function IconBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            {children}
        </span>
    );
}

function Step({ n, icon, title, children }: { n: number; icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <Card hover className="h-full p-7">
            <div className="flex items-center justify-between">
                <IconBadge>{icon}</IconBadge>
                <span className="font-mono text-3xl text-line-strong tnum">{String(n).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-5 text-xl">{title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{children}</p>
        </Card>
    );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <Glass className="flex h-full gap-4 rounded-2xl p-6">
            <IconBadge>{icon}</IconBadge>
            <div>
                <h3 className="text-lg">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{children}</p>
            </div>
        </Glass>
    );
}

function ProofRow({ label, value, accent, bold }: { label: string; value: string; accent?: boolean; bold?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className={`text-[15px] ${bold ? "font-medium text-ink" : "text-ink-muted"}`}>{label}</span>
            <span className={`font-mono tnum ${bold ? "text-xl" : "text-lg"} ${accent ? "text-harvest-500" : "text-ink"}`}>{value}</span>
        </div>
    );
}

function CompareRow({ label, a, b, c, last }: { label: string; a: string; b: string; c: string; last?: boolean }) {
    return (
        <tr className={last ? "" : "border-b border-line"}>
            <td className="px-6 py-4 font-medium text-ink">{label}</td>
            <td className="px-6 py-4 text-ink-muted">{a}</td>
            <td className="px-6 py-4 text-ink-muted">{b}</td>
            <td className="bg-brand-50/60 px-6 py-4 font-medium text-brand-700">
                <span className="inline-flex items-center gap-2">
                    <Check size={15} className="shrink-0 text-brand-500" />
                    {c}
                </span>
            </td>
        </tr>
    );
}
