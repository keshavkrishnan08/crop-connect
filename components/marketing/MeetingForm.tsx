"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "@/components/icons";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";
const FALLBACK_INBOX = "keshavkrishnanbusiness@gmail.com";

const ROLES = ["Owner", "General manager", "Executive chef", "Buyer or purchasing", "Other"];
const LOCATIONS = ["1 location", "2 to 5 locations", "6 to 20 locations", "21+ locations"];

type Status = "idle" | "sending" | "done" | "error";

export function MeetingForm() {
    const [first, setFirst] = React.useState("");
    const [last, setLast] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [company, setCompany] = React.useState("");
    const [role, setRole] = React.useState("");
    const [locations, setLocations] = React.useState("");
    const [city, setCity] = React.useState("");
    const [topic, setTopic] = React.useState("");
    const [status, setStatus] = React.useState<Status>("idle");

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!first.trim() || !last.trim() || !email.trim() || !company.trim()) return;
        setStatus("sending");
        const fields = {
            Name: `${first} ${last}`.trim(),
            Email: email,
            Phone: phone || "not given",
            Restaurant: company,
            Role: role || "not given",
            Locations: locations || "not given",
            City: city || "not given",
            "What they want to discuss": topic || "not given",
        };
        const subject = `CropConnect meeting request: ${company}`;
        try {
            const res = WEB3FORMS_KEY
                ? await fetch("https://api.web3forms.com/submit", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Accept: "application/json" },
                      body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, from_name: "CropConnect website", replyto: email, ...fields }),
                  })
                : await fetch(`https://formsubmit.co/ajax/${FALLBACK_INBOX}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Accept: "application/json" },
                      body: JSON.stringify({ _subject: subject, _template: "table", _captcha: "false", _replyto: email, ...fields }),
                  });
            const ok = res.ok && Boolean((await res.json().catch(() => ({}))).success);
            setStatus(ok ? "done" : "error");
            if (ok && typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setStatus("error");
        }
    }

    if (status === "done") {
        return (
            <section className="mx-auto max-w-md px-5 py-24 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-white"><Check size={24} /></span>
                <h1 className="mt-5 font-display text-3xl leading-tight text-ink">Thanks, {first}. We will be in touch.</h1>
                <p className="mt-3 text-ink-muted">We will email {email} within one business day to find a time that works for you.</p>
                <Link href="/" className="btn-ghost mt-7 inline-flex">Back to site</Link>
            </section>
        );
    }

    const inputCls = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink shadow-sm outline-none transition placeholder:text-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
    const labelCls = "mb-1.5 block text-[13px] font-semibold text-ink-soft";
    const optional = <span className="font-normal text-ink-faint">(optional)</span>;

    return (
        <section className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
                <div className="lg:pt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Talk to us</p>
                    <h1 className="mt-3 font-display text-4xl leading-[1.04] text-ink sm:text-[3.1rem]">Book a meeting with CropConnect.</h1>
                    <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-muted">Tell us a little about your kitchen. We will reply within one business day to set up a short call and walk through how local sourcing would work for you.</p>

                    <p className="mt-10 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-faint">On the call</p>
                    <ol className="mt-4 space-y-5">
                        {([
                            ["Your menu and your margins", "Which dishes could carry a local ingredient, and what that is worth to you."],
                            ["The farms near you", "Who grows what you need, how reliable they are, and how delivery would run."],
                            ["How we run it", "Contracts, weekly deliveries, and everything your team never has to handle."],
                        ] as const).map(([t, s], i) => (
                            <li key={t} className="flex gap-3.5">
                                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-50 font-mono text-xs font-bold text-brand-600">{i + 1}</span>
                                <div>
                                    <p className="text-[15px] font-semibold text-ink">{t}</p>
                                    <p className="text-[13.5px] leading-relaxed text-ink-muted">{s}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                <form onSubmit={submit} className="self-start rounded-[1.75rem] border border-line bg-canvas-soft p-6 shadow-card sm:p-8">
                    <h2 className="font-display text-xl text-ink">Request a meeting</h2>
                    <p className="mt-1 text-[13px] text-ink-muted">Takes about a minute.</p>

                    <div className="mt-6 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="m-first" className={labelCls}>First name</label>
                                <input id="m-first" className={inputCls} value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" required />
                            </div>
                            <div>
                                <label htmlFor="m-last" className={labelCls}>Last name</label>
                                <input id="m-last" className={inputCls} value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" required />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="m-email" className={labelCls}>Work email</label>
                            <input id="m-email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@restaurant.com" autoComplete="email" required />
                        </div>
                        <div>
                            <label htmlFor="m-phone" className={labelCls}>Phone {optional}</label>
                            <input id="m-phone" type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                        </div>
                        <div>
                            <label htmlFor="m-company" className={labelCls}>Restaurant or group</label>
                            <input id="m-company" className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" required />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="m-role" className={labelCls}>Your role</label>
                                <select id="m-role" className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="">Select</option>
                                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="m-locations" className={labelCls}>Locations</label>
                                <select id="m-locations" className={inputCls} value={locations} onChange={(e) => setLocations(e.target.value)}>
                                    <option value="">Select</option>
                                    {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="m-city" className={labelCls}>City {optional}</label>
                            <input id="m-city" className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
                        </div>
                        <div>
                            <label htmlFor="m-topic" className={labelCls}>What would you like to talk about? {optional}</label>
                            <textarea id="m-topic" className={`${inputCls} h-24 resize-none`} value={topic} onChange={(e) => setTopic(e.target.value)} />
                        </div>
                    </div>

                    <button type="submit" disabled={status === "sending"} className="btn-primary mt-6 w-full justify-center disabled:opacity-60">
                        {status === "sending" ? "Sending..." : <>Request a meeting <ArrowRight size={18} /></>}
                    </button>
                    {status === "error" && (
                        <p className="mt-3 text-center text-[13px] font-medium text-red-600">That did not go through. Email {FALLBACK_INBOX} and we will set up a time.</p>
                    )}
                    <p className="mt-3 text-center text-2xs text-ink-faint">We reply within one business day and only use these details to set up your meeting.</p>
                </form>
            </div>
        </section>
    );
}
