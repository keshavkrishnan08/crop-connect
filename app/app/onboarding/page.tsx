"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore, actions, getState, computeDeals, farmById } from "@/lib/store";
import { parseMenu } from "@/lib/margin";
import { AgentAvatar, AGENT_NAME } from "@/components/app/AgentDock";
import { Button } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { Leaf, MapPin, ArrowRight, Check, MenuCard, Plate, Sparkle, MarginUp } from "@/components/icons";
import { cn, usd } from "@/lib/utils";

const SAMPLE_MENU = "Heirloom tomato salad ... 16\nGarden greens, sherry vinaigrette ... 14\nGrilled local squash ... 15\nRoasted beets and citrus ... 13\nSeared trout, herbs ... 28";

export default function OnboardingPage() {
    const router = useRouter();
    const toast = useToast();
    const restaurant = useStore((s) => s.restaurant);
    const [step, setStep] = React.useState(0);

    const [name, setName] = React.useState(restaurant.name || "");
    const [cuisine, setCuisine] = React.useState(restaurant.cuisine || "");
    const [location, setLocation] = React.useState(restaurant.location || "");
    const [menu, setMenu] = React.useState("");
    const [covers, setCovers] = React.useState(restaurant.coversPerWeek || 1200);

    const dishes = React.useMemo(() => parseMenu(menu || SAMPLE_MENU), [menu]);
    const suggestion = computeDeals(getState()).find((d) => !d.sourced);
    const suggFarm = suggestion ? farmById(suggestion.farmId) : undefined;

    const STEPS = ["Your kitchen", "Your menu", "Your volume", "Where to start"];

    function next() { setStep((s) => Math.min(STEPS.length - 1, s + 1)); }
    function back() { setStep((s) => Math.max(0, s - 1)); }

    function finish(sourceFirst: boolean) {
        actions.completeOnboarding({ ...restaurant, name: name || restaurant.name, cuisine, location, coversPerWeek: covers }, dishes);
        toast.success("You're set up", `${AGENT_NAME} has your kitchen.`);
        if (sourceFirst && suggestion) router.push(`/app/sourcing/new?crop=${encodeURIComponent(suggestion.crop)}&unit=${suggestion.unit}&price=${suggestion.price}`);
        else router.push("/app");
    }

    const canNext = step === 0 ? !!name.trim() : true;

    return (
        <div className="grid h-full grid-cols-1 lg:grid-cols-2">
            {/* left: the question */}
            <div className="flex flex-col justify-between overflow-y-auto px-6 py-8 sm:px-12 lg:px-16">
                <div className="flex items-center gap-2.5"><AgentAvatar size={34} /><span className="font-mono text-sm font-semibold text-ink">Set up with {AGENT_NAME}</span></div>

                <div className="mx-auto w-full max-w-md py-8">
                    <p className="font-mono text-2xs font-semibold uppercase tracking-widest text-brand-600">Step {step + 1} of {STEPS.length}</p>

                    {step === 0 && (
                        <div className="animate-fade-up">
                            <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-ink">Tell us about your kitchen.</h1>
                            <div className="mt-7 space-y-4">
                                <Field label="Restaurant name"><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rosewood" autoFocus /></Field>
                                <Field label="Cuisine"><input className="field" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="New American" /></Field>
                                <Field label="City"><input className="field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Indianapolis, IN" /></Field>
                            </div>
                        </div>
                    )}
                    {step === 1 && (
                        <div className="animate-fade-up">
                            <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-ink">Add your menu.</h1>
                            <p className="mt-2 text-[14px] text-ink-muted">Paste it, or use a sample. We read it to find what to bring local.</p>
                            <textarea className="field mt-5 h-44 resize-none font-mono text-[13px]" value={menu} onChange={(e) => setMenu(e.target.value)} placeholder={SAMPLE_MENU} />
                            <button onClick={() => setMenu(SAMPLE_MENU)} className="mt-2 text-[13px] font-semibold text-brand-600 hover:underline">Use a sample menu</button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="animate-fade-up">
                            <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-ink">How busy are you?</h1>
                            <p className="mt-2 text-[14px] text-ink-muted">Roughly how many covers a week. It sizes the volume we source.</p>
                            <div className="mt-8 text-center">
                                <p className="font-display text-6xl text-ink tnum">{covers.toLocaleString()}</p>
                                <p className="text-2xs uppercase tracking-wide text-ink-faint">covers / week</p>
                                <input type="range" min={200} max={4000} step={100} value={covers} onChange={(e) => setCovers(Number(e.target.value))} className="mt-6 w-full accent-brand-500" />
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="animate-fade-up">
                            <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-ink">Start with one dish.</h1>
                            <p className="mt-2 text-[14px] text-ink-muted">{AGENT_NAME} looked at your menu and the farms near you. Here is the easiest first win.</p>
                            {suggestion ? (
                                <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
                                    <p className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-brand-600"><Sparkle size={12} /> Suggested test product</p>
                                    <p className="mt-2 font-display text-2xl capitalize text-ink">{suggestion.crop}</p>
                                    <p className="mt-0.5 flex items-center gap-1 text-[13px] text-ink-muted"><MapPin size={12} className="text-brand-500" /> {suggFarm?.name} · {usd(suggestion.price)}/{suggestion.unit}</p>
                                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{suggestion.blurb}</p>
                                </div>
                            ) : <p className="mt-6 text-sm text-ink-muted">Name any ingredient and we will source it.</p>}
                        </div>
                    )}
                </div>

                <div className="mx-auto flex w-full max-w-md items-center justify-between">
                    {step > 0 ? <button onClick={back} className="text-sm font-semibold text-ink-muted hover:text-ink">Back</button> : <span />}
                    {step < STEPS.length - 1
                        ? <Button onClick={next} disabled={!canNext}>Continue <ArrowRight size={16} /></Button>
                        : <div className="flex gap-2.5"><button onClick={() => finish(false)} className="btn-ghost btn-sm">Skip for now</button><Button onClick={() => finish(true)}>Source it <ArrowRight size={16} /></Button></div>}
                </div>
            </div>

            {/* right: live context */}
            <div className="relative hidden overflow-hidden border-l border-line bg-gradient-to-br from-brand-50/60 via-canvas-soft to-canvas-soft lg:block">
                <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]" />
                <div className="relative grid h-full place-items-center p-12">
                    {step === 0 && <Preview title={name || "Your restaurant"} sub={[cuisine, location].filter(Boolean).join(" · ") || "Where you cook"} icon={<Plate size={26} />} />}
                    {step === 1 && (
                        <div className="w-full max-w-sm rounded-3xl border border-line bg-white p-5 shadow-card">
                            <p className="mb-3 flex items-center gap-2 font-mono text-sm font-semibold text-ink"><MenuCard size={16} className="text-brand-600" /> Menu read</p>
                            <div className="space-y-2">
                                {dishes.slice(0, 6).map((d) => (
                                    <div key={d.id} className="flex items-center justify-between border-b border-line/60 pb-2 text-[14px] last:border-0">
                                        <span className="capitalize text-ink">{d.name}</span><span className="font-mono text-ink-muted tnum">{usd(d.price)}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-2xs text-ink-faint">{dishes.length} dishes found · we will price the ones that can go local.</p>
                        </div>
                    )}
                    {step === 2 && <Preview title={`${covers.toLocaleString()} covers`} sub="We size the weekly volume to match" icon={<MarginUp size={26} />} />}
                    {step === 3 && suggestion && (
                        <div className="w-full max-w-sm rounded-3xl border border-line bg-white p-6 shadow-card text-center">
                            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white"><Leaf size={22} /></span>
                            <p className="mt-4 font-display text-2xl capitalize text-ink">{suggestion.crop}</p>
                            <p className="mt-1 text-[13px] text-ink-muted">from {suggFarm?.name}</p>
                            <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600"><Check size={15} /> Vetted and close to you</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="block"><span className="label">{label}</span>{children}</label>;
}

function Preview({ title, sub, icon }: { title: string; sub: string; icon: React.ReactNode }) {
    return (
        <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand-600 text-white shadow-brand">{icon}</span>
            <p className="mt-5 font-display text-3xl text-ink">{title}</p>
            <p className="mt-1.5 text-[14px] text-ink-muted">{sub}</p>
        </div>
    );
}
