"use client";

import * as React from "react";
import { useStore, menuScarcity, type ScarcityDish } from "@/lib/store";
import { parseMenu } from "@/lib/margin";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, EmptyState, LinkButton } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { usd, cn } from "@/lib/utils";
import { MenuCard, Sparkle, Leaf, Plus, Copy, MapPin } from "@/components/icons";

export default function MenuPage() {
    const items = useStore((s) => s.items);
    const dishes = useStore((s) => s.dishes);
    const farms = useStore((s) => s.farms);
    const toast = useToast();
    const [menuText, setMenuText] = React.useState("");

    const activeDishes = React.useMemo(() => (menuText.trim() ? parseMenu(menuText) : dishes), [menuText, dishes]);
    const scarce = React.useMemo(() => menuScarcity(items, activeDishes, farms), [items, activeDishes, farms]);

    const totalServings = scarce.reduce((s, d) => s + d.servings, 0);
    const monthly = scarce.reduce((s, d) => s + d.monthlyUplift, 0);
    const annual = monthly * 12;
    const avgPlate = scarce.length ? scarce.reduce((s, d) => s + (d.freshLift + d.scarcity), 0) / scarce.length : 0;

    const copyMenu = () => {
        const text = scarce.map((d) => `${d.dish.name} — ${usd(d.newPrice)}\n  Limited: ${d.farm} ${d.crop}, only ${d.servings}/week`).join("\n\n");
        navigator.clipboard?.writeText(text);
        toast.success("Menu copied", "Paste it straight onto your menu.");
    };

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Menu" title="Scarcity menu"
                subtitle="Limited farm supply becomes limited-edition pricing. Farm-fresh, plus what scarcity is worth."
                actions={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>} />

            {scarce.length === 0 ? (
                <EmptyState icon={<MenuCard size={24} />} title="Nothing scarce yet"
                    description="Source an ingredient and the dishes that use it become limited-edition, priced for farm-fresh and scarcity."
                    action={<LinkButton href="/app/sourcing/new"><Plus size={18} /> Source an ingredient</LinkButton>} />
            ) : (
                <>
                    {/* hero number */}
                    <Card className="mb-6 overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50/80 via-canvas-soft to-canvas-soft p-7 text-center sm:p-9">
                        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600"><Sparkle size={13} /> Limited-edition upside</p>
                        <p className="mt-3 font-display text-5xl text-ink tnum sm:text-6xl"><span className="text-gradient">{usd(monthly, { compact: monthly > 9999 })}</span><span className="text-2xl text-ink-muted">/mo</span></p>
                        <p className="mx-auto mt-3 max-w-lg text-[15px] text-ink-muted">From <b className="text-ink">{scarce.length}</b> limited dishes across <b className="text-ink">{totalServings}</b> servings a week, that is about <b className="text-ink">{usd(annual, { compact: true })}/year</b> on top of your current menu.</p>
                    </Card>

                    {/* big numbers */}
                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <Big label="Limited dishes" value={String(scarce.length)} tone="brand" />
                        <Big label="Servings / week" value={String(totalServings)} sub="capped by supply" tone="sky" />
                        <Big label="Added / plate" value={usd(avgPlate)} sub="fresh + scarcity" tone="violet" />
                        <Big label="Run-rate / year" value={usd(annual, { compact: annual > 9999 })} tone="harvest" />
                    </div>

                    {/* the scarce menu */}
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-ink-soft">Your limited-edition menu</h2>
                        <button onClick={copyMenu} className="inline-flex items-center gap-1.5 text-2xs font-semibold text-brand-600 hover:underline"><Copy size={13} /> Copy menu</button>
                    </div>
                    <div className="mb-8 grid gap-3 lg:grid-cols-2">
                        {scarce.map((d) => <ScarceCard key={d.dish.id} d={d} />)}
                    </div>

                    {/* economics table */}
                    <h2 className="mb-3 text-sm font-medium text-ink-soft">The math, per dish</h2>
                    <Card className="overflow-x-auto p-0">
                        <table className="w-full min-w-[640px] text-[13px]">
                            <thead>
                                <tr className="border-b border-line bg-canvas-sunk text-2xs font-semibold uppercase tracking-wide text-ink-faint">
                                    <th className="px-4 py-2.5 text-left">Dish</th>
                                    <th className="px-4 py-2.5 text-right">Servings/wk</th>
                                    <th className="px-4 py-2.5 text-right">Was</th>
                                    <th className="px-4 py-2.5 text-right">Farm-fresh</th>
                                    <th className="px-4 py-2.5 text-right">Scarcity</th>
                                    <th className="px-4 py-2.5 text-right">New price</th>
                                    <th className="px-4 py-2.5 text-right">Added/mo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line font-mono tnum">
                                {scarce.map((d) => (
                                    <tr key={d.dish.id}>
                                        <td className="px-4 py-2.5 font-sans font-medium text-ink">{d.dish.name}</td>
                                        <td className="px-4 py-2.5 text-right text-ink">{d.servings}</td>
                                        <td className="px-4 py-2.5 text-right text-ink-muted">{usd(d.oldPrice)}</td>
                                        <td className="px-4 py-2.5 text-right text-brand-600">+{usd(d.freshLift)}</td>
                                        <td className="px-4 py-2.5 text-right text-harvest-600">+{usd(d.scarcity)}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold text-ink">{usd(d.newPrice)}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold text-brand-600">{usd(d.monthlyUplift, { compact: d.monthlyUplift > 9999 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-line bg-brand-50/40 font-mono text-[13px] font-semibold tnum">
                                    <td className="px-4 py-2.5 font-sans text-ink">Total</td>
                                    <td className="px-4 py-2.5 text-right text-ink">{totalServings}</td>
                                    <td colSpan={3} />
                                    <td className="px-4 py-2.5 text-right text-ink-faint">per week</td>
                                    <td className="px-4 py-2.5 text-right text-brand-700">{usd(monthly, { compact: monthly > 9999 })}/mo</td>
                                </tr>
                            </tfoot>
                        </table>
                    </Card>

                    {/* menu input */}
                    <h2 className="mb-2 mt-8 text-sm font-medium text-ink-soft">Use a different menu</h2>
                    <Card className="p-5">
                        <p className="mb-3 text-[13px] text-ink-muted">We are using your saved menu. Paste another to preview its scarcity pricing. We match dishes to what you source fresh, by ingredient.</p>
                        <textarea className="field h-32 resize-none font-mono text-[13px]" value={menuText} onChange={(e) => setMenuText(e.target.value)} placeholder={"Heirloom tomato salad  16\nGarden greens, sherry vinaigrette  14\nGrilled local squash  15"} />
                    </Card>
                </>
            )}
        </div>
    );
}

function ScarceCard({ d }: { d: ScarceDish }) {
    return (
        <Card className="flex items-center gap-4 p-5 transition-shadow duration-200 hover:shadow-lift">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Leaf size={18} /></span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-ink">{d.dish.name}</p>
                <p className="flex items-center gap-1 text-2xs text-ink-faint"><MapPin size={11} className="text-brand-500" /> {d.farm} {d.crop}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-harvest-400/15 px-2.5 py-0.5 text-2xs font-semibold text-harvest-600">Limited: {d.servings}/wk</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-2xs font-semibold text-brand-600">Farm-fresh</span>
                </div>
            </div>
            <div className="shrink-0 text-right">
                <p className="font-mono text-2xs text-ink-faint line-through tnum">{usd(d.oldPrice)}</p>
                <p className="font-display text-2xl text-ink tnum">{usd(d.newPrice)}</p>
                <p className="font-mono text-2xs text-brand-600 tnum">+{usd(d.monthlyUplift, { compact: d.monthlyUplift > 9999 })}/mo</p>
            </div>
        </Card>
    );
}

type ScarceDish = ScarcityDish;

function Big({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "brand" | "sky" | "violet" | "harvest" }) {
    const t = tone === "harvest" ? "text-harvest-600" : tone === "sky" ? "text-sky-600" : tone === "violet" ? "text-violet-600" : "text-brand-600";
    return (
        <Card className="p-4">
            <p className="text-2xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
            <p className={cn("mt-1.5 font-mono text-3xl leading-none tnum", t)}>{value}</p>
            {sub && <p className="mt-1 text-2xs text-ink-faint">{sub}</p>}
        </Card>
    );
}
