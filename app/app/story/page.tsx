"use client";

import * as React from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button, LinkButton, Card, Badge, Avatar, EmptyState, Eyebrow } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { StoryTag, Shield, Qr, MapPin, Leaf, Copy, Check, ArrowRight, MarginUp, Farm, Sparkle, Plate } from "@/components/icons";
import { usd, pct, cn } from "@/lib/utils";
import { useStore, farmById, type SourcingItem, type Farm as FarmModel } from "@/lib/store";

// ---------------------------------------------------------------------------
// Menu-copy generation — pure templating, no LLM. We pull a single clean clause
// from the farm's narrative fields and stitch a chef-ready provenance sentence.
// ---------------------------------------------------------------------------

function leadClause(farm: FarmModel): string {
    // Prefer a tight clause from the farm's story; fall back to its first practice.
    const sentence = (farm.story || "").split(/[.;—]/)[0].trim();
    if (sentence) {
        // Lowercase the lead so it reads as a continuation of our sentence.
        return sentence.charAt(0).toLowerCase() + sentence.slice(1);
    }
    const practice = farm.practices[0];
    return practice ? `grown ${practice.toLowerCase()}` : "grown just up the road";
}

function menuCopy(item: SourcingItem, farm: FarmModel): string {
    const crop = item.crop.charAt(0).toUpperCase() + item.crop.slice(1);
    return `${crop} from ${farm.name}, ${farm.distanceMi} miles up the road — ${leadClause(farm)}.`;
}

// ---------------------------------------------------------------------------

function StoryCard({ item, farm }: { item: SourcingItem; farm: FarmModel }) {
    const toast = useToast();
    const [copied, setCopied] = React.useState(false);
    const levers = useStore((s) => s.levers);
    const copy = menuCopy(item, farm);
    const pureMargin = Math.max(0, item.lift - levers.produceCostDelta);

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(copy);
            setCopied(true);
            toast.success("Menu copy copied", "Paste it straight onto the menu.");
            setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error("Couldn't copy", "Select the text and copy it manually.");
        }
    };

    return (
        <Card className="animate-fade-up p-6 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                {/* main column — the story */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                        <Badge tone="brand"><Shield size={13} />Verified Local</Badge>
                        {item.stage === "live" && <Badge tone="harvest" dot>Live on menu</Badge>}
                    </div>

                    <h3 className="mt-4 font-display text-[1.45rem] leading-tight text-ink">{item.dishName}</h3>

                    <div className="mt-2 flex items-center gap-1.5 text-[13.5px] text-ink-muted">
                        <MapPin size={15} className="text-brand-500" />
                        <span>
                            {farm.name} · <span className="tnum">{farm.distanceMi} mi</span> · {item.harvestWindow}
                        </span>
                    </div>

                    {/* auto-generated menu copy */}
                    <figure className="mt-5 rounded-xl border-l-2 border-brand-400 bg-canvas-soft px-5 py-4">
                        <div className="mb-2 flex items-center gap-1.5">
                            <Sparkle size={13} className="text-harvest-500" />
                            <Eyebrow>Menu copy</Eyebrow>
                        </div>
                        <blockquote className="font-display text-[1.05rem] italic leading-snug text-ink-soft">
                            &ldquo;{copy}&rdquo;
                        </blockquote>
                        <div className="mt-4">
                            <Button variant="soft" size="sm" onClick={onCopy}>
                                {copied ? <Check size={15} className="text-brand-600" /> : <Copy size={15} />}
                                {copied ? "Copied" : "Copy to menu"}
                            </Button>
                        </div>
                    </figure>

                    {/* premium-pricing helper */}
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-white px-5 py-4">
                        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-harvest-400/12 text-harvest-500">
                            <MarginUp size={18} />
                        </span>
                        <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-ink">Premium-pricing helper</div>
                            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">
                                <span className="value-pos">+{usd(item.lift)}</span> menu price ·{" "}
                                <span className="font-mono font-medium text-ink tnum">~{usd(pureMargin)}</span> of it is pure margin
                            </p>
                        </div>
                    </div>
                </div>

                {/* side column — diner QR */}
                <div className="lg:w-[180px] lg:shrink-0">
                    <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-canvas px-5 py-6 text-center">
                        <div className="grid h-28 w-28 place-items-center rounded-lg border border-line bg-white text-ink-faint shadow-card">
                            <Qr size={64} />
                        </div>
                        <div className="mt-3 text-[12.5px] font-semibold text-ink">Scan to meet the farm</div>
                        <p className="mt-1 text-[11.5px] leading-snug text-ink-faint">
                            Links to a public provenance page for {farm.name}.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function FarmProfile({ farm }: { farm: FarmModel }) {
    return (
        <div className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center gap-3">
                <Avatar name={farm.name} size={38} />
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{farm.name}</div>
                    <div className="truncate text-[12.5px] text-ink-muted">{farm.farmer}</div>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                <MapPin size={13} className="text-brand-500" />
                <span className="truncate">
                    {farm.location} · <span className="tnum">{farm.distanceMi} mi</span>
                </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {farm.practices.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11.5px] font-medium text-brand-600">
                        <Leaf size={11} />
                        {p}
                    </span>
                ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[12px] text-ink-faint">Reliability</span>
                <span className="font-mono text-[12.5px] font-medium text-ink tnum">{pct(farm.reliability)}</span>
            </div>
        </div>
    );
}

export default function StoryStudioPage() {
    const items = useStore((s) => s.items);

    const storyItems = React.useMemo(
        () => items.filter((i) => (i.stage === "live" || i.stage === "delivering") && i.farmId),
        [items],
    );

    // Unique farms in use, preserving first-seen order.
    const farms = React.useMemo(() => {
        const seen = new Set<string>();
        const out: FarmModel[] = [];
        for (const item of storyItems) {
            const f = farmById(item.farmId);
            if (f && !seen.has(f.id)) {
                seen.add(f.id);
                out.push(f);
            }
        }
        return out;
    }, [storyItems]);

    return (
        <div className="bg-aura">
            <PageHeader
                eyebrow="Story Studio"
                title="Your local story, ready to use"
                subtitle="Every locally-sourced ingredient becomes provenance you can put to work — menu copy, pricing math, and a diner-facing page that lets you charge for the source, not just the dish."
                actions={
                    storyItems.length > 0 ? (
                        <LinkButton href="/app/sourcing" variant="ghost" size="sm">
                            Sourcing board
                            <ArrowRight size={15} />
                        </LinkButton>
                    ) : undefined
                }
            />

            {storyItems.length === 0 ? (
                <EmptyState
                    icon={<StoryTag size={24} />}
                    title="No stories to tell yet"
                    description="Once an ingredient is delivering or live on your menu, its farm story shows up here — ready to copy onto the menu and price up."
                    action={
                        <LinkButton href="/app/sourcing" variant="primary" size="sm">
                            Go to sourcing
                            <ArrowRight size={15} />
                        </LinkButton>
                    }
                />
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    {/* stories */}
                    <div className="flex flex-col gap-5">
                        {storyItems.map((item) => {
                            const farm = farmById(item.farmId);
                            if (!farm) return null;
                            return <StoryCard key={item.id} item={item} farm={farm} />;
                        })}
                    </div>

                    {/* farm profiles */}
                    <aside className="lg:sticky lg:top-6 lg:self-start">
                        <div className="card p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                                    <Farm size={17} />
                                </span>
                                <div>
                                    <div className="text-sm font-semibold text-ink">Farms in your story</div>
                                    <div className="text-[12px] text-ink-faint">
                                        <span className="tnum">{farms.length}</span> partner{farms.length === 1 ? "" : "s"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                {farms.map((f) => (
                                    <FarmProfile key={f.id} farm={f} />
                                ))}
                            </div>
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-canvas-soft px-3.5 py-3 text-[12px] leading-snug text-ink-muted">
                                <Plate size={15} className="mt-px shrink-0 text-brand-500" />
                                <span>Diners who can name the farm pay more for the plate. That&rsquo;s the whole point.</span>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
