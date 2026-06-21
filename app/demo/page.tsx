"use client";

import * as React from "react";
import { Button, Card, Field, Select, FieldGroup, Badge, Textarea } from "@/components/ui/kit";
import { CountUp } from "@/components/ui/CountUp";
import { Logo } from "@/components/ui/Logo";
import {
    ChevronRight, Check, Plus, Minus, Sparkle, MenuCard, MarginUp,
    TrendUp, Upload, MapPin, Pen, Copy, ArrowRight,
} from "@/components/icons";
import { usd, pct, clamp } from "@/lib/utils";
import {
    type Dish, type Restaurant, type Levers, DEFAULT_LEVERS,
    parseMenu, SAMPLES, CATEGORY_LABEL, FOOD_COST_BENCHMARK,
    dishCurrent, dishModeled, computeUplift,
} from "@/lib/margin";

// ============================================================================
//  MARGIN-ANALYSIS DEMO — a stepped, clickable proof for restaurant owners.
//  Self-contained, local state only. No backend. The "wow" is step 5:
//  their current blended margin lifting to a modeled one, in their numbers.
// ============================================================================

const STEPS = [
    { n: 1, label: "Restaurant" },
    { n: 2, label: "Menu" },
    { n: 3, label: "Read" },
    { n: 4, label: "Margins" },
    { n: 5, label: "Upside" },
    { n: 6, label: "Plan" },
] as const;

const CUISINES = ["New American", "Italian", "French", "Farm-to-table", "Californian", "Mediterranean", "Steakhouse", "Seafood", "Other"];
const DISTRIBUTORS = ["Sysco", "US Foods", "Performance Food Group", "Gordon Food Service", "Local / direct", "Other"];

const EMPTY_RESTAURANT: Restaurant = { name: "", cuisine: "New American", location: "", coversPerWeek: 600, distributor: "Sysco" };

export default function DemoPage() {
    const [step, setStep] = React.useState(1);
    const [restaurant, setRestaurant] = React.useState<Restaurant>(EMPTY_RESTAURANT);
    const [menuText, setMenuText] = React.useState("");
    const [dishes, setDishes] = React.useState<Dish[]>([]);
    const [levers, setLevers] = React.useState<Levers>(DEFAULT_LEVERS);
    const [copied, setCopied] = React.useState(false);

    const go = (n: number) => { setStep(clamp(n, 1, 6)); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };

    // Parse on entering step 3 from step 2.
    function continueFromMenu() {
        const parsed = parseMenu(menuText);
        if (parsed.length) setDishes(parsed);
        go(3);
    }

    function loadSample(i: number) {
        setRestaurant(SAMPLES[i].restaurant);
        setMenuText(SAMPLES[i].menu);
    }

    const canStep1 = restaurant.name.trim().length > 0 && restaurant.coversPerWeek > 0;
    const canStep2 = menuText.trim().length > 0;
    const featuredCount = dishes.filter((d) => d.featured).length;

    return (
        <main className="relative min-h-screen bg-canvas">
            <div className="bg-aura pointer-events-none absolute inset-0" aria-hidden />

            {/* Top bar */}
            <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
                <Logo href="/" />
                <Badge tone="brand" dot>Live margin demo</Badge>
            </header>

            {/* Progress */}
            <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
                <Progress step={step} onJump={(n) => n < step && go(n)} />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-5 pb-28 pt-8 sm:px-8">
                {step === 1 && <Step1 restaurant={restaurant} setRestaurant={setRestaurant} />}
                {step === 2 && <Step2 menuText={menuText} setMenuText={setMenuText} onSample={loadSample} />}
                {step === 3 && <Step3 dishes={dishes} setDishes={setDishes} />}
                {step === 4 && <Step4 dishes={dishes} />}
                {step === 5 && <Step5 dishes={dishes} restaurant={restaurant} levers={levers} setLevers={setLevers} setRestaurant={setRestaurant} />}
                {step === 6 && <Step6 dishes={dishes} restaurant={restaurant} levers={levers} copied={copied} setCopied={setCopied} />}
            </div>

            {/* Sticky footer nav */}
            <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
                    <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 1}>Back</Button>
                    <span className="hidden text-[12.5px] text-ink-faint sm:block">
                        Step {step} of 6 · {STEPS[step - 1].label}
                    </span>
                    {step < 6 ? (
                        <Button
                            variant="primary"
                            onClick={() => (step === 2 ? continueFromMenu() : go(step + 1))}
                            disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2) || (step === 3 && (dishes.length === 0 || featuredCount === 0))}
                        >
                            Continue <ChevronRight size={17} />
                        </Button>
                    ) : (
                        <a href="/app" className="btn-primary">Start free <ArrowRight size={17} /></a>
                    )}
                </div>
            </footer>
        </main>
    );
}

// ---------------------------------------------------------------------------
//  Progress indicator
// ---------------------------------------------------------------------------
function Progress({ step, onJump }: { step: number; onJump: (n: number) => void }) {
    return (
        <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => {
                const done = s.n < step;
                const active = s.n === step;
                return (
                    <React.Fragment key={s.n}>
                        <button
                            type="button"
                            onClick={() => onJump(s.n)}
                            disabled={s.n >= step}
                            className="group flex items-center gap-2"
                            title={s.label}
                        >
                            <span className={[
                                "grid h-7 w-7 place-items-center rounded-full border text-[12px] font-semibold transition-colors tnum",
                                done ? "border-brand-500 bg-brand-500 text-white"
                                    : active ? "border-brand-500 text-brand-600"
                                        : "border-line text-ink-faint",
                            ].join(" ")}>
                                {done ? <Check size={14} /> : s.n}
                            </span>
                            <span className={["hidden text-[12.5px] font-medium sm:block", active ? "text-ink" : "text-ink-faint"].join(" ")}>{s.label}</span>
                        </button>
                        {i < STEPS.length - 1 && <span className={["h-px flex-1 transition-colors", done ? "bg-brand-400" : "bg-line"].join(" ")} />}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// Shared step header
function StepHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
    return (
        <div className="animate-fade-up mb-7">
            <span className="eyebrow"><span className="h-px w-5 bg-brand-400/60" />{eyebrow}</span>
            <h1 className="mt-3 font-display text-[30px] leading-tight tracking-tight text-ink sm:text-[34px]">{title}</h1>
            {sub && <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-muted">{sub}</p>}
        </div>
    );
}

// ---------------------------------------------------------------------------
//  STEP 1 — Your restaurant
// ---------------------------------------------------------------------------
function Step1({ restaurant, setRestaurant }: { restaurant: Restaurant; setRestaurant: (r: Restaurant) => void }) {
    const set = <K extends keyof Restaurant>(k: K, v: Restaurant[K]) => setRestaurant({ ...restaurant, [k]: v });
    return (
        <div className="animate-fade-up">
            <StepHead eyebrow="Your restaurant" title="Let's start with the basics" sub="Four quick fields. We use them to size the math against your real volume — nothing leaves your browser." />
            <Card className="max-w-2xl p-6 sm:p-7">
                <FieldGroup label="Restaurant name">
                    <Field value={restaurant.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Rosewood" autoFocus />
                </FieldGroup>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <FieldGroup label="Cuisine">
                        <Select value={restaurant.cuisine} onChange={(e) => set("cuisine", e.target.value)}>
                            {CUISINES.map((c) => <option key={c}>{c}</option>)}
                        </Select>
                    </FieldGroup>
                    <FieldGroup label="Location">
                        <Field value={restaurant.location} onChange={(e) => set("location", e.target.value)} placeholder="City, State" />
                    </FieldGroup>
                    <FieldGroup label="Covers per week" hint="Total guests served weekly.">
                        <Field type="number" min={1} value={restaurant.coversPerWeek || ""} onChange={(e) => set("coversPerWeek", Math.max(0, Number(e.target.value)))} className="font-mono tnum" />
                    </FieldGroup>
                    <FieldGroup label="Current distributor">
                        <Select value={restaurant.distributor} onChange={(e) => set("distributor", e.target.value)}>
                            {DISTRIBUTORS.map((d) => <option key={d}>{d}</option>)}
                        </Select>
                    </FieldGroup>
                </div>
            </Card>
        </div>
    );
}

// ---------------------------------------------------------------------------
//  STEP 2 — Add your menu
// ---------------------------------------------------------------------------
function Step2({ menuText, setMenuText, onSample }: { menuText: string; setMenuText: (s: string) => void; onSample: (i: number) => void }) {
    return (
        <div className="animate-fade-up">
            <StepHead eyebrow="Add your menu" title="Paste your menu" sub="One dish per line, ending in a price. We read it locally and find the dishes a local story would lift the most." />
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <Card className="p-6 sm:p-7">
                    <div className="mb-3 flex items-center gap-2 text-ink-soft">
                        <MenuCard size={18} className="text-brand-500" />
                        <span className="text-sm font-medium">Menu text</span>
                    </div>
                    <Textarea
                        rows={12}
                        value={menuText}
                        onChange={(e) => setMenuText(e.target.value)}
                        placeholder={"Heirloom tomato salad, basil  16\nWood-grilled chicken, seasonal vegetables  29\nHand-cut fries  8"}
                        className="font-mono text-[13.5px] leading-relaxed"
                    />
                    <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-ink-faint">
                        <Upload size={14} /> Lines without a trailing price are skipped automatically.
                    </p>
                </Card>

                <div>
                    <p className="label mb-2">Or use a sample</p>
                    <div className="space-y-3">
                        {SAMPLES.map((s, i) => (
                            <button key={s.restaurant.name} type="button" onClick={() => onSample(i)} className="card w-full p-4 text-left transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift">
                                <div className="flex items-center justify-between">
                                    <span className="font-display text-lg text-ink">{s.restaurant.name}</span>
                                    <Sparkle size={16} className="text-harvest-500" />
                                </div>
                                <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                                    <MapPin size={13} /> {s.restaurant.cuisine} · {s.restaurant.location}
                                </p>
                                <p className="mt-2 text-[12px] text-ink-faint">{s.menu.split("\n").length} dishes · {s.restaurant.coversPerWeek} covers/wk</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
//  STEP 3 — We read your menu (editable rows)
// ---------------------------------------------------------------------------
function Step3({ dishes, setDishes }: { dishes: Dish[]; setDishes: (d: Dish[]) => void }) {
    const update = (id: string, patch: Partial<Dish>) => setDishes(dishes.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    const remove = (id: string) => setDishes(dishes.filter((d) => d.id !== id));
    const featuredCount = dishes.filter((d) => d.featured).length;

    function toggleFeatured(d: Dish) {
        // keep at least one featured
        if (d.featured && featuredCount <= 1) return;
        update(d.id, { featured: !d.featured });
    }
    function addDish() {
        setDishes([...dishes, { id: `d_new_${Date.now()}`, name: "New dish", price: 18, category: "main", produceDriven: true, foodCostPct: FOOD_COST_BENCHMARK.main, featured: false }]);
    }

    return (
        <div className="animate-fade-up">
            <StepHead eyebrow="We read your menu" title="Here's what we found" sub="Tweak anything we got wrong. Mark which dishes lean on produce, and choose what to feature with a local story." />

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-canvas-soft px-4 py-3 text-[13px] text-ink-muted">
                <Pen size={15} className="text-brand-500" />
                Low confidence on a row? Just fix it. These are first-pass estimates, fully editable — nothing here is locked.
            </div>

            <Card className="overflow-hidden p-0">
                {/* header */}
                <div className="hidden grid-cols-[1fr_90px_88px_92px_92px_40px] gap-3 border-b border-line bg-canvas-soft px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint sm:grid">
                    <span>Dish</span><span>Price</span><span>Food cost</span><span>Produce</span><span>Feature</span><span />
                </div>
                <div className="divide-y divide-line">
                    {dishes.map((d) => (
                        <div key={d.id} className="grid grid-cols-2 gap-3 px-5 py-3.5 sm:grid-cols-[1fr_90px_88px_92px_92px_40px] sm:items-center">
                            <div className="col-span-2 sm:col-span-1">
                                <input
                                    value={d.name}
                                    onChange={(e) => update(d.id, { name: e.target.value })}
                                    className="w-full bg-transparent text-[14.5px] font-medium text-ink outline-none focus:text-brand-700"
                                />
                                <span className="text-[11.5px] text-ink-faint">{CATEGORY_LABEL[d.category]}</span>
                            </div>
                            <label className="flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1.5">
                                <span className="text-ink-faint">$</span>
                                <input type="number" min={0} step={0.5} value={d.price} onChange={(e) => update(d.id, { price: Math.max(0, Number(e.target.value)) })}
                                    className="w-full bg-transparent font-mono text-[13.5px] tnum outline-none" />
                            </label>
                            <label className="flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1.5">
                                <input type="number" min={0} max={100} value={Math.round(d.foodCostPct * 100)} onChange={(e) => update(d.id, { foodCostPct: clamp(Number(e.target.value), 0, 100) / 100 })}
                                    className="w-full bg-transparent font-mono text-[13.5px] tnum outline-none" />
                                <span className="text-ink-faint">%</span>
                            </label>
                            <TogglePill on={d.produceDriven} onClick={() => update(d.id, { produceDriven: !d.produceDriven })} label="Produce" />
                            <TogglePill on={d.featured} onClick={() => toggleFeatured(d)} label="Feature" tone="harvest" />
                            <button type="button" onClick={() => remove(d.id)} className="justify-self-end text-ink-faint transition-colors hover:text-danger" title="Remove">
                                <Minus size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="border-t border-line px-5 py-3">
                    <button type="button" onClick={addDish} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-600 hover:text-brand-700">
                        <Plus size={15} /> Add a dish
                    </button>
                </div>
            </Card>

            <p className="mt-3 text-[12.5px] text-ink-faint">
                {dishes.length} dishes · <span className="font-medium text-harvest-500">{featuredCount} featured</span>. Keep at least one featured to continue.
            </p>
        </div>
    );
}

function TogglePill({ on, onClick, label, tone = "brand" }: { on: boolean; onClick: () => void; label: string; tone?: "brand" | "harvest" }) {
    const active = tone === "harvest" ? "border-harvest-400 bg-harvest-300/30 text-harvest-500" : "border-brand-400 bg-brand-50 text-brand-700";
    return (
        <button type="button" onClick={onClick}
            className={["inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[12.5px] font-medium transition-colors",
                on ? active : "border-line bg-white text-ink-faint hover:text-ink-soft"].join(" ")}>
            {on && <Check size={13} />}{label}
        </button>
    );
}

// ---------------------------------------------------------------------------
//  STEP 4 — Your current margins (estimate)
// ---------------------------------------------------------------------------
function Step4({ dishes }: { dishes: Dish[] }) {
    const rows = dishes.map((d) => ({ d, ...dishCurrent(d) }));
    const blended = rows.length ? rows.reduce((s, r) => s + r.marginPct, 0) / rows.length : 0;
    const upside = [...rows].filter((r) => r.d.produceDriven).sort((a, b) => a.marginPct - b.marginPct).slice(0, 3);

    return (
        <div className="animate-fade-up">
            <StepHead eyebrow="Your current margins" title="Where you stand today" sub="Estimated from category benchmarks and the food-cost numbers you set. Editable on the previous step." />

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                <div className="space-y-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <span className="label">Blended margin</span>
                            <Badge tone="ink">Estimate</Badge>
                        </div>
                        <p className="mt-3 font-mono text-5xl font-medium tnum text-ink">
                            <CountUp to={blended} format={(n) => `${n.toFixed(1)}%`} />
                        </p>
                        <p className="mt-2 text-[13px] text-ink-muted">Average gross margin across {rows.length} dishes.</p>
                    </Card>
                    <Card className="p-5">
                        <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-ink-soft"><MarginUp size={16} className="text-harvest-500" /> Most upside</p>
                        <p className="mb-3 text-[12.5px] text-ink-faint">Produce-driven dishes with the thinnest margins — the best candidates for a local lift.</p>
                        <div className="space-y-2">
                            {upside.map((r) => (
                                <div key={r.d.id} className="flex items-center justify-between text-[13px]">
                                    <span className="truncate pr-2 text-ink">{r.d.name}</span>
                                    <span className="font-mono tnum text-ink-muted">{pct(r.marginPct, 0)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <Card className="overflow-hidden p-0">
                    <div className="grid grid-cols-[1fr_72px_72px_72px] gap-3 border-b border-line bg-canvas-soft px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
                        <span>Dish</span><span className="text-right">Price</span><span className="text-right">GP</span><span className="text-right">Margin</span>
                    </div>
                    <div className="divide-y divide-line">
                        {rows.map((r) => (
                            <div key={r.d.id} className={["grid grid-cols-[1fr_72px_72px_72px] gap-3 px-5 py-3 text-[13.5px]", r.d.featured ? "bg-harvest-300/10" : ""].join(" ")}>
                                <span className="flex items-center gap-2 truncate text-ink">
                                    {r.d.featured && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-harvest-500" />}
                                    {r.d.name}
                                </span>
                                <span className="text-right font-mono tnum text-ink-soft">{usd(r.d.price)}</span>
                                <span className="text-right font-mono tnum text-ink-soft">{usd(r.gp)}</span>
                                <span className="text-right font-mono tnum text-ink">{pct(r.marginPct, 0)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
//  STEP 5 — What we could get you (THE PEAK)
// ---------------------------------------------------------------------------
function Step5({ dishes, restaurant, levers, setLevers, setRestaurant }: {
    dishes: Dish[]; restaurant: Restaurant; levers: Levers;
    setLevers: (l: Levers) => void; setRestaurant: (r: Restaurant) => void;
}) {
    const up = computeUplift(dishes, restaurant, levers);
    const marginDelta = up.blendedMarginModeled - up.blendedMarginNow;

    return (
        <div className="animate-fade-up">
            <StepHead eyebrow="What we could get you" title="Your upside, in your numbers" sub="We raise prices on featured dishes behind a credible local story — we don't cut your costs. Drag the levers; the math is live." />

            {/* HERO */}
            <Card className="relative overflow-hidden p-7 sm:p-9">
                <div className="bg-aura pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                    <div>
                        <p className="label">Projected monthly uplift</p>
                        <p className="mt-1 font-mono text-6xl font-medium tnum text-harvest-500 sm:text-7xl">
                            <CountUp to={up.monthlyExpected} format={(n) => usd(n)} />
                        </p>
                        <p className="mt-3 text-[14px] text-ink-muted">
                            Range <span className="font-mono tnum text-ink">{usd(up.monthlyConservative)}</span>–<span className="font-mono tnum text-ink">{usd(up.monthlyExpected)}</span> / month.
                            That's <span className="font-mono tnum text-harvest-500">{usd(up.annualConservative)}</span>–<span className="font-mono tnum text-harvest-500">{usd(up.annualExpected)}</span> a year.
                        </p>
                        <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-ink-faint">
                            A range, not a promise. Built from your covers, the attach rate, and the price lift below — all editable.
                        </p>
                    </div>

                    {/* current → modeled margin reveal */}
                    <div className="rounded-2xl border border-line bg-white/70 p-6 backdrop-blur-xl">
                        <p className="label mb-4">Blended margin</p>
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-center">
                                <p className="text-[11.5px] uppercase tracking-wide text-ink-faint">Now</p>
                                <p className="mt-1 font-mono text-3xl font-medium tnum text-ink-soft">{pct(up.blendedMarginNow, 1)}</p>
                            </div>
                            <div className="flex flex-1 items-center justify-center gap-2 text-harvest-500">
                                <span className="h-px flex-1 bg-harvest-400/50" />
                                <TrendUp size={22} />
                                <span className="h-px flex-1 bg-harvest-400/50" />
                            </div>
                            <div className="text-center">
                                <p className="text-[11.5px] uppercase tracking-wide text-ink-faint">Modeled</p>
                                <p className="mt-1 font-mono text-3xl font-medium tnum text-harvest-500">
                                    <CountUp to={up.blendedMarginModeled} format={(n) => `${n.toFixed(1)}%`} />
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-center">
                            <Badge tone="harvest">+{marginDelta.toFixed(1)} pts blended margin</Badge>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Levers */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <p className="mb-1 flex items-center gap-2 font-display text-lg text-ink"><Sparkle size={17} className="text-harvest-500" /> The levers</p>
                    <p className="mb-5 text-[12.5px] text-ink-faint">Every assumption is visible and yours to set.</p>

                    <Lever label="Price lift per featured dish" value={levers.priceLift} min={0} max={8} step={0.5} fmt={(v) => usd(v)}
                        onChange={(v) => setLevers({ ...levers, priceLift: v })} />
                    <Lever label="Added produce cost per dish" value={levers.produceCostDelta} min={0} max={4} step={0.25} fmt={(v) => usd(v)}
                        onChange={(v) => setLevers({ ...levers, produceCostDelta: v })} />
                    <Lever label="Attach rate (share of covers)" value={levers.attachRate * 100} min={2} max={40} step={1} fmt={(v) => pct(v, 0)}
                        onChange={(v) => setLevers({ ...levers, attachRate: clamp(v, 0, 100) / 100 })} />
                    <Lever label="Covers per week" value={restaurant.coversPerWeek} min={50} max={3000} step={10} fmt={(v) => v.toLocaleString()}
                        onChange={(v) => setRestaurant({ ...restaurant, coversPerWeek: Math.round(v) })} />

                    <p className="mt-5 rounded-lg bg-canvas-soft px-3 py-2.5 text-[12px] leading-relaxed text-ink-muted">
                        Incremental margin per order = price lift − added cost = <span className="font-mono tnum text-ink">{usd(Math.max(0, levers.priceLift - levers.produceCostDelta))}</span>.
                        Conservative figure applies a 0.6× haircut.
                    </p>
                </Card>

                <Card className="overflow-hidden p-0">
                    <div className="border-b border-line bg-canvas-soft px-5 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
                        Per featured dish · monthly
                    </div>
                    <div className="divide-y divide-line">
                        {up.perDishMonthly.map((p) => (
                            <div key={p.dish.id} className="px-5 py-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="truncate pr-2 text-[14px] font-medium text-ink">{p.dish.name}</span>
                                    <span className="font-mono text-[15px] font-medium tnum text-harvest-500">{usd(p.monthly)}</span>
                                </div>
                                <p className="mt-0.5 font-mono text-[11.5px] tnum text-ink-faint">
                                    {usd(p.incrementalGp)} margin × {Math.round(p.ordersPerMonth)} orders/mo
                                </p>
                            </div>
                        ))}
                        {up.perDishMonthly.length === 0 && (
                            <p className="px-5 py-6 text-center text-[13px] text-ink-faint">No featured dishes — go back and feature at least one.</p>
                        )}
                    </div>
                    <div className="flex items-center justify-between border-t border-line bg-canvas-soft px-5 py-3.5">
                        <span className="text-[13px] font-medium text-ink">Total monthly</span>
                        <span className="font-mono text-[16px] font-medium tnum text-harvest-500">{usd(up.monthlyExpected)}</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function Lever({ label, value, min, max, step, fmt, onChange }: {
    label: string; value: number; min: number; max: number; step: number;
    fmt: (v: number) => string; onChange: (v: number) => void;
}) {
    return (
        <div className="mb-5 last:mb-0">
            <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink-soft">{label}</span>
                <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => onChange(clamp(value - step, min, max))} className="grid h-6 w-6 place-items-center rounded-md border border-line text-ink-faint hover:text-ink"><Minus size={13} /></button>
                    <span className="w-16 text-center font-mono text-[13.5px] font-medium tnum text-ink">{fmt(value)}</span>
                    <button type="button" onClick={() => onChange(clamp(value + step, min, max))} className="grid h-6 w-6 place-items-center rounded-md border border-line text-ink-faint hover:text-ink"><Plus size={13} /></button>
                </div>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-brand-500" />
        </div>
    );
}

// ---------------------------------------------------------------------------
//  STEP 6 — Your plan
// ---------------------------------------------------------------------------
function Step6({ dishes, restaurant, levers, copied, setCopied }: {
    dishes: Dish[]; restaurant: Restaurant; levers: Levers; copied: boolean; setCopied: (b: boolean) => void;
}) {
    const up = computeUplift(dishes, restaurant, levers);
    const farms = ["Teter Family Farm (12 mi)", "Riverbend Greens (8 mi)"];

    function summary(): string {
        const lines = [
            `CropConnect — margin plan for ${restaurant.name || "your restaurant"}`,
            `${restaurant.cuisine} · ${restaurant.location || "—"} · ${restaurant.coversPerWeek} covers/week`,
            ``,
            `Featured dishes:`,
            ...up.featured.map((d) => `  • ${d.name} — ${usd(d.price)} → ${usd(dishModeled(d, levers).newPrice)}`),
            ``,
            `Sourcing from: ${farms.join(", ")}`,
            ``,
            `Projected uplift: ${usd(up.monthlyConservative)}–${usd(up.monthlyExpected)} / month`,
            `                  ${usd(up.annualConservative)}–${usd(up.annualExpected)} / year`,
            `Blended margin: ${pct(up.blendedMarginNow, 1)} → ${pct(up.blendedMarginModeled, 1)}`,
            ``,
            `Assumptions: +${usd(levers.priceLift)} price lift, +${usd(levers.produceCostDelta)} produce cost, ${pct(levers.attachRate * 100, 0)} attach rate.`,
            `A range, not a promise — every input editable at cropconnect.app`,
        ];
        return lines.join("\n");
    }

    async function copy() {
        try {
            await navigator.clipboard.writeText(summary());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard unavailable */ }
    }

    return (
        <div className="animate-fade-up">
            <StepHead eyebrow="Your plan" title="Start with one item, one week" sub="No rip-and-replace. We bring a single local item online behind a featured dish, and you watch the margin move." />

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <Card className="p-6">
                        <p className="label mb-3">Dishes to feature</p>
                        <div className="space-y-2.5">
                            {up.featured.map((d) => {
                                const m = dishModeled(d, levers);
                                return (
                                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
                                        <span className="text-[14.5px] font-medium text-ink">{d.name}</span>
                                        <span className="font-mono text-[13.5px] tnum text-ink-muted">
                                            {usd(d.price)} <ArrowRight size={12} className="inline" /> <span className="text-harvest-500">{usd(m.newPrice)}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <p className="label mb-3">Farms we'd source from</p>
                        <div className="space-y-2.5">
                            {farms.map((f) => (
                                <div key={f} className="flex items-center gap-2.5 rounded-xl border border-line bg-canvas-soft px-4 py-3 text-[14px] text-ink">
                                    <MapPin size={16} className="text-brand-500" /> {f}
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-[12px] text-ink-faint">Real farm matches appear once you connect — these are representative for the demo.</p>
                    </Card>
                </div>

                {/* Sidebar: the number + CTA */}
                <div className="space-y-4">
                    <Card className="relative overflow-hidden p-6">
                        <div className="bg-aura pointer-events-none absolute inset-0" aria-hidden />
                        <div className="relative">
                            <p className="label">Projected monthly uplift</p>
                            <p className="mt-1 font-mono text-4xl font-medium tnum text-harvest-500">{usd(up.monthlyConservative)}–{usd(up.monthlyExpected)}</p>
                            <p className="mt-2 text-[12.5px] text-ink-muted">{pct(up.blendedMarginNow, 1)} → <span className="font-medium text-harvest-500">{pct(up.blendedMarginModeled, 1)}</span> blended margin</p>
                        </div>
                    </Card>

                    <a href="/app" className="btn-primary w-full justify-center btn-lg">
                        Start — source one item, one week, free
                    </a>
                    <Button variant="soft" className="w-full justify-center" onClick={copy}>
                        {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy summary</>}
                    </Button>
                    <p className="px-1 text-center text-[12px] leading-relaxed text-ink-faint">
                        No card, no contract. Cancel the item anytime — the math stays a range, not a promise.
                    </p>
                </div>
            </div>
        </div>
    );
}
