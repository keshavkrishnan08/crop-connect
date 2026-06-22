"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { parseMenu, SAMPLES, DEFAULT_LEVERS } from "@/lib/margin";
import { SEED_FARMS, rankFarms } from "@/lib/store";
import { usd } from "@/lib/utils";
import { ArrowRight, Leaf, MapPin, Check, Sparkle, MarginUp } from "@/components/icons";

const WEEKS = 4.345;

export default function AuditPage() {
    const [name, setName] = React.useState("");
    const [city, setCity] = React.useState("Indianapolis, IN");
    const [covers, setCovers] = React.useState(800);
    const [menu, setMenu] = React.useState("");
    const [report, setReport] = React.useState<null | ReturnType<typeof buildReport>>(null);

    function run() {
        setReport(buildReport(name.trim() || "Your restaurant", city, covers, menu || SAMPLES[0].menu));
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <main className="min-h-screen bg-canvas bg-aura">
            <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
                <Logo href="/" />
                <Link href="/sign-in" className="text-sm font-semibold text-ink-soft hover:text-ink">Sign in</Link>
            </header>

            {!report ? (
                <section className="mx-auto max-w-xl px-5 py-10 sm:py-16">
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Free sourcing audit</p>
                    <h1 className="mt-3 text-center font-display text-4xl leading-[1.05] text-ink sm:text-5xl">See your money on the table in 60 seconds.</h1>
                    <p className="mt-4 text-center text-lg text-ink-muted">Paste your menu. We show you which dishes to bring local, the farms near you, and the margin you are leaving behind. No login.</p>

                    <div className="mt-8 rounded-3xl border border-line bg-canvas-soft p-6 shadow-card sm:p-7">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block"><span className="label">Restaurant</span><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rosewood" /></label>
                            <label className="block"><span className="label">City</span><input className="field" value={city} onChange={(e) => setCity(e.target.value)} /></label>
                        </div>
                        <label className="mt-4 block"><span className="label">Covers per week: <b className="font-mono text-ink">{covers.toLocaleString()}</b></span>
                            <input type="range" min={200} max={3000} step={50} value={covers} onChange={(e) => setCovers(Number(e.target.value))} className="mt-2 w-full accent-brand-500" /></label>
                        <label className="mt-4 block"><span className="label">Your menu</span>
                            <textarea className="field h-36 resize-none font-mono text-[13px]" value={menu} onChange={(e) => setMenu(e.target.value)} placeholder={SAMPLES[0].menu} /></label>
                        <button onClick={() => setMenu(SAMPLES[0].menu)} className="mt-2 text-[13px] font-semibold text-brand-600 hover:underline">Use a sample menu</button>
                        <button onClick={run} className="btn-primary mt-5 w-full">Run my free audit <ArrowRight size={18} /></button>
                        <p className="mt-3 text-center text-2xs text-ink-faint">No account, no card. Your menu is not stored.</p>
                    </div>
                </section>
            ) : <Report r={report} onReset={() => setReport(null)} />}
        </main>
    );
}

function buildReport(name: string, city: string, covers: number, menuText: string) {
    const dishes = parseMenu(menuText);
    const local = dishes.filter((d) => d.produceDriven).slice(0, 6);
    const perOrder = Math.max(0, DEFAULT_LEVERS.priceLift - DEFAULT_LEVERS.produceCostDelta);
    const ordersPerDishMonth = covers * DEFAULT_LEVERS.attachRate * WEEKS;
    const rows = local.map((d) => {
        const farm = rankFarms(SEED_FARMS, d.name, 0)[0]?.farm;
        return { dish: d, farm, monthly: Math.round(perOrder * ordersPerDishMonth) };
    });
    const monthly = rows.reduce((s, r) => s + r.monthly, 0);
    const farms = Array.from(new Map(rows.map((r) => [r.farm?.id, r.farm])).values()).filter(Boolean);
    return { name, city, covers, rows, monthly, annual: monthly * 12, farms, dishCount: dishes.length };
}

function Report({ r, onReset }: { r: ReturnType<typeof buildReport>; onReset: () => void }) {
    return (
        <section className="mx-auto max-w-3xl px-5 pb-20">
            <div className="rounded-[2rem] border border-brand-200 bg-gradient-to-br from-brand-50/70 to-canvas-soft p-7 text-center shadow-card sm:p-10">
                <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600"><Sparkle size={13} /> Audit for {r.name}</p>
                <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-[2.7rem]">You are leaving about <span className="text-gradient">{usd(r.monthly, { compact: r.monthly > 9999 })}</span> a month on the table.</h1>
                <p className="mt-3 text-lg text-ink-muted">That is <b className="text-ink">{usd(r.annual, { compact: true })}/year</b> in extra margin from {r.rows.length} dishes you could bring local in {r.city.split(",")[0]}.</p>
                <Link href="/sign-in" className="btn-primary mt-6 inline-flex">Start free, we set it up this week <ArrowRight size={18} /></Link>
                <p className="mt-2 text-2xs text-ink-faint">Your first ingredient is on us. No commitment.</p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_1fr]">
                <div className="rounded-3xl border border-line bg-canvas-soft p-6 shadow-card">
                    <h2 className="font-mono text-sm font-semibold tracking-tight text-ink">Dishes to bring local</h2>
                    <p className="mb-4 mt-1 text-[13px] text-ink-muted">Each one carries more margin and a story diners pay for.</p>
                    <div className="divide-y divide-line">
                        {r.rows.map((row, i) => (
                            <div key={i} className="flex items-center gap-3 py-3">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Leaf size={17} /></span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[14px] font-semibold text-ink">{row.dish.name}</p>
                                    <p className="truncate text-2xs text-ink-faint">{row.farm ? `${row.farm.name} · ${row.farm.distanceMi} mi` : "Local match"}</p>
                                </div>
                                <span className="shrink-0 font-mono text-sm font-semibold text-brand-600 tnum">+{usd(row.monthly, { compact: row.monthly > 9999 })}/mo</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-line bg-canvas-soft p-6 shadow-card">
                    <h2 className="font-mono text-sm font-semibold tracking-tight text-ink">Farms ready near you</h2>
                    <p className="mb-4 mt-1 text-[13px] text-ink-muted">Vetted growers around {r.city.split(",")[0]}.</p>
                    <div className="space-y-3">
                        {r.farms.map((f) => f && (
                            <div key={f.id} className="rounded-2xl border border-line bg-white p-3.5">
                                <p className="text-[14px] font-semibold text-ink">{f.name}</p>
                                <p className="flex items-center gap-1 text-2xs text-ink-faint"><MapPin size={11} className="text-brand-500" /> {f.location} · {f.distanceMi} mi</p>
                                <p className="mt-1.5 line-clamp-2 text-[12.5px] text-ink-muted">{f.story}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-3xl border border-line bg-canvas-soft p-6 shadow-card">
                <h2 className="mb-4 font-mono text-sm font-semibold tracking-tight text-ink">What we run for you</h2>
                <div className="grid gap-3 sm:grid-cols-4">
                    {[["Source", "match the farms"], ["Contract", "negotiate and sign"], ["Deliver", "weekly, on us"], ["Prove it", "menu provenance"]].map(([t, s], i) => (
                        <div key={i} className="rounded-2xl border border-line bg-white p-4">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 font-mono text-sm font-bold text-brand-600">{i + 1}</span>
                            <p className="mt-2 text-[14px] font-semibold text-ink">{t}</p>
                            <p className="text-2xs text-ink-faint">{s}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] text-ink-soft"><Check size={15} className="text-brand-500" /> Plus a free invoice audit: we typically find 2 to 5% your distributor is overcharging.</div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 text-center">
                <Link href="/sign-in" className="btn-primary inline-flex"><MarginUp size={18} /> Claim {usd(r.annual, { compact: true })}/year, start free</Link>
                <button onClick={onReset} className="text-sm font-medium text-ink-muted hover:text-ink">Run another audit</button>
            </div>
        </section>
    );
}
