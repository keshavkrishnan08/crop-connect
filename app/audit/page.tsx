"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { parseMenu, SAMPLES, DEFAULT_LEVERS } from "@/lib/margin";
import { SEED_FARMS, rankFarms } from "@/lib/store";
import { usd } from "@/lib/utils";
import { ArrowRight, Leaf, MapPin, Check, Sparkle, MarginUp } from "@/components/icons";

const WEEKS = 4.345;
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";

type Report = ReturnType<typeof buildReport>;

export default function AuditPage() {
    const [name, setName] = React.useState("");
    const [city, setCity] = React.useState("Indianapolis, IN");
    const [covers, setCovers] = React.useState(800);
    const [menu, setMenu] = React.useState("");
    const [report, setReport] = React.useState<null | Report>(null);
    const [lead, setLead] = React.useState(false);

    function run() {
        setReport(buildReport(name.trim() || "Your restaurant", city, covers, menu || SAMPLES[0].menu));
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function startOnboarding() {
        setLead(true);
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <main className="min-h-screen bg-canvas bg-aura">
            <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
                <Logo href="/" />
                <Link href="/" className="text-sm font-semibold text-ink-soft hover:text-ink">Back to site</Link>
            </header>

            {lead && report ? (
                <Onboarding r={report} onBack={() => setLead(false)} />
            ) : !report ? (
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
            ) : <Report r={report} onReset={() => setReport(null)} onStart={startOnboarding} />}
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

function Report({ r, onReset, onStart }: { r: Report; onReset: () => void; onStart: () => void }) {
    return (
        <section className="mx-auto max-w-3xl px-5 pb-20">
            <div className="rounded-[2rem] border border-brand-200 bg-gradient-to-br from-brand-50/70 to-canvas-soft p-7 text-center shadow-card sm:p-10">
                <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600"><Sparkle size={13} /> Audit for {r.name}</p>
                <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-[2.7rem]">You are leaving about <span className="text-gradient">{usd(r.monthly, { compact: r.monthly > 9999 })}</span> a month on the table.</h1>
                <p className="mt-3 text-lg text-ink-muted">That is <b className="text-ink">{usd(r.annual, { compact: true })}/year</b> in extra margin from {r.rows.length} dishes you could bring local in {r.city.split(",")[0]}.</p>
                <button onClick={onStart} className="btn-primary mt-6 inline-flex">Start free, we set it up this week <ArrowRight size={18} /></button>
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
                <button onClick={onStart} className="btn-primary inline-flex"><MarginUp size={18} /> Claim {usd(r.annual, { compact: true })}/year, start free</button>
                <button onClick={onReset} className="text-sm font-medium text-ink-muted hover:text-ink">Run another audit</button>
            </div>
        </section>
    );
}

function Onboarding({ r, onBack }: { r: Report; onBack: () => void }) {
    const prefill = r.name === "Your restaurant" ? "" : r.name;
    const [restaurant, setRestaurant] = React.useState(prefill);
    const [contact, setContact] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [role, setRole] = React.useState("");
    const [city, setCity] = React.useState(r.city);
    const [note, setNote] = React.useState("");
    const [status, setStatus] = React.useState<"idle" | "sending" | "done" | "error">("idle");

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!contact.trim() || !email.trim()) return;
        setStatus("sending");
        const fields = {
            "Contact name": contact,
            Email: email,
            Role: role || "not given",
            Restaurant: restaurant || r.name,
            City: city || r.city,
            "Covers per week": r.covers.toLocaleString(),
            "Monthly opportunity": usd(r.monthly),
            "Annual opportunity": usd(r.annual),
            "Dishes to localize": r.rows.map((x) => x.dish.name).join(", ") || "n/a",
            Notes: note || "none",
        };
        const subject = `New CropConnect lead: ${restaurant || contact}`;
        try {
            const req = WEB3FORMS_KEY
                ? fetch("https://api.web3forms.com/submit", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Accept: "application/json" },
                      body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, from_name: "CropConnect onboarding", ...fields }),
                  })
                : fetch("https://formsubmit.co/ajax/keshavkrishnanbusiness@gmail.com", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Accept: "application/json" },
                      body: JSON.stringify({ _subject: subject, _template: "table", _captcha: "false", ...fields }),
                  });
            const res = await req;
            const ok = res.ok && Boolean((await res.json().catch(() => ({}))).success);
            setStatus(ok ? "done" : "error");
            if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setStatus("error");
        }
    }

    if (status === "done") {
        return (
            <section className="mx-auto max-w-md px-5 py-20 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-white"><Check size={24} /></span>
                <h1 className="mt-5 font-display text-3xl leading-tight text-ink">Request received{restaurant ? `, ${restaurant}` : ""}.</h1>
                <p className="mt-3 text-ink-muted">We will email {email || "you"} within one business day with your first farm match and a sourcing plan. No card, nothing to install.</p>
                <div className="mx-auto mt-7 flex max-w-xs items-center justify-between rounded-2xl border border-line bg-canvas-soft px-5 py-4 text-left">
                    <span className="text-[13px] text-ink-muted">On the table</span>
                    <span className="font-display text-xl text-ink">{usd(r.annual, { compact: true })}/yr</span>
                </div>
                <Link href="/" className="btn-ghost mt-7 inline-flex">Back to site</Link>
            </section>
        );
    }

    const inputCls = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink shadow-sm outline-none transition placeholder:text-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
    const labelCls = "mb-1.5 block text-[13px] font-semibold text-ink-soft";

    return (
        <section className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
            <button onClick={onBack} className="text-sm font-medium text-ink-muted hover:text-ink">&larr; Back to your audit</button>

            <div className="mt-6 grid gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-16">
                <div className="lg:pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Get started</p>
                    <h1 className="mt-3 font-display text-4xl leading-[1.04] text-ink sm:text-[3rem]">Set up your first local dish this week.</h1>
                    <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-muted">Tell us about your kitchen. You will get a farm match and a sourcing plan back within one business day. Your first ingredient is on us.</p>

                    <div className="mt-8 rounded-3xl border border-line bg-canvas-soft p-6 shadow-card">
                        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Your opportunity</p>
                        <p className="mt-1.5 font-display text-[2.6rem] leading-none text-ink">{usd(r.annual, { compact: true })}<span className="ml-1 text-xl font-normal text-ink-muted">/year</span></p>
                        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
                            {([[usd(r.monthly, { compact: r.monthly > 9999 }), "per month"], [String(r.rows.length), r.rows.length === 1 ? "local dish" : "local dishes"], [String(r.farms.length), `farms near ${r.city.split(",")[0]}`]] as const).map(([n, l]) => (
                                <div key={l}><p className="font-mono text-[17px] font-semibold text-ink tnum">{n}</p><p className="mt-0.5 text-2xs leading-tight text-ink-faint">{l}</p></div>
                            ))}
                        </div>
                    </div>

                    <ol className="mt-8 space-y-4">
                        {([["We match the farms", "Vetted growers near you, matched dish by dish"], ["We contract and deliver", "Negotiated, signed, and dropped off every week"], ["You cook", "Same plates, a story your guests pay more for"]] as const).map(([t, s], i) => (
                            <li key={i} className="flex gap-3.5">
                                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-50 font-mono text-xs font-bold text-brand-600">{i + 1}</span>
                                <div><p className="text-[15px] font-semibold text-ink">{t}</p><p className="text-[13px] text-ink-muted">{s}</p></div>
                            </li>
                        ))}
                    </ol>
                </div>

                <form onSubmit={submit} className="self-start rounded-[1.75rem] border border-line bg-canvas-soft p-6 shadow-card sm:p-8 lg:sticky lg:top-8">
                    <h2 className="font-display text-xl text-ink">Request your setup</h2>
                    <p className="mt-1 text-[13px] text-ink-muted">Takes a minute. No card, no commitment.</p>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="o-name" className={labelCls}>Full name</label>
                            <input id="o-name" className={inputCls} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Alex Rivera" autoComplete="name" required />
                        </div>
                        <div>
                            <label htmlFor="o-email" className={labelCls}>Work email</label>
                            <input id="o-email" className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@rosewood.com" autoComplete="email" required />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="o-rest" className={labelCls}>Restaurant</label>
                                <input id="o-rest" className={inputCls} value={restaurant} onChange={(e) => setRestaurant(e.target.value)} placeholder="Rosewood" />
                            </div>
                            <div>
                                <label htmlFor="o-role" className={labelCls}>Your role</label>
                                <select id="o-role" className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="">Select</option>
                                    <option>Owner</option>
                                    <option>General manager</option>
                                    <option>Executive chef</option>
                                    <option>Buyer or purchasing</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="o-city" className={labelCls}>City</label>
                                <input id="o-city" className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Indianapolis, IN" />
                            </div>
                            <div>
                                <label htmlFor="o-covers" className={labelCls}>Covers per week</label>
                                <input id="o-covers" className={`${inputCls} bg-canvas text-ink-muted`} value={r.covers.toLocaleString()} readOnly />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="o-note" className={labelCls}>Anything we should know <span className="font-normal text-ink-faint">(optional)</span></label>
                            <textarea id="o-note" className={`${inputCls} h-20 resize-none`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="We change our menu seasonally and want to lead with local." />
                        </div>
                    </div>

                    <button type="submit" disabled={status === "sending"} className="btn-primary mt-6 w-full justify-center disabled:opacity-60">
                        {status === "sending" ? "Sending..." : <>Request my setup <ArrowRight size={18} /></>}
                    </button>
                    {status === "error" && <p className="mt-3 text-center text-[13px] font-medium text-red-600">That did not go through. Email keshavkrishnanbusiness@gmail.com and we will set you up.</p>}
                    <p className="mt-3 text-center text-2xs text-ink-faint">We reply within one business day, and only use this to reach out about your sourcing.</p>
                </form>
            </div>
        </section>
    );
}
