"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge, Button, LinkButton, EmptyState, Spinner } from "@/components/ui/kit";
import { Wheat, Storefront, Plus, ArrowRight, Clock, Check, Pen } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { getMyListings, setListingStatus } from "@/lib/queries";
import { contractValueCents, cadenceSummary } from "@/lib/contract";
import { type Listing, type ListingStatus } from "@/lib/types";
import { cn, formatMoney, formatDate } from "@/lib/utils";

const STATUS_META: Record<ListingStatus, { label: string; tone: "forest" | "amber" | "sky" | "muted" }> = {
    active: { label: "Active", tone: "forest" },
    paused: { label: "Paused", tone: "amber" },
    matched: { label: "Matched", tone: "sky" },
    archived: { label: "Archived", tone: "muted" },
};

export default function MyListingsPage() {
    const { profile, loading } = useAuth();
    const [listings, setListings] = useState<Listing[] | null>(null);

    useEffect(() => {
        if (!profile) return;
        let active = true;
        getMyListings(profile.id).then((rows) => {
            if (active) setListings(rows);
        });
        return () => {
            active = false;
        };
    }, [profile]);

    const busy = loading || listings === null;

    return (
        <div className="animate-fade-up">
            <PageHeader
                eyebrow="Your postings"
                title="My Listings"
                subtitle="Every supply offer and buyer need you've published. Pause anything you're not actively pursuing, or open it to see fresh matches."
                actions={
                    <LinkButton href="/app/listings/new">
                        <Plus size={17} /> New listing
                    </LinkButton>
                }
            />

            {busy ? (
                <div className="grid place-items-center py-24 text-forest-500">
                    <Spinner size={26} />
                </div>
            ) : listings.length === 0 ? (
                <EmptyState
                    icon={<Wheat size={24} />}
                    title="No listings yet"
                    description="Post a supply offer to let buyers find what you grow, or a buyer need to source produce from local farms."
                    action={
                        <LinkButton href="/app/listings/new">
                            <Plus size={17} /> New listing
                        </LinkButton>
                    }
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {listings.map((l, i) => (
                        <ListingCard
                            key={l.id}
                            listing={l}
                            index={i}
                            onStatus={(next) =>
                                setListings((prev) =>
                                    prev ? prev.map((x) => (x.id === l.id ? { ...x, status: next } : x)) : prev,
                                )
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ListingCard({
    listing,
    index,
    onStatus,
}: {
    listing: Listing;
    index: number;
    onStatus: (next: ListingStatus) => void;
}) {
    const [saving, setSaving] = useState(false);
    const isSupply = listing.type === "supply";
    const status = STATUS_META[listing.status];
    const value = contractValueCents(listing.terms);
    const togglable = listing.status === "active" || listing.status === "paused";

    async function toggle() {
        const next: ListingStatus = listing.status === "active" ? "paused" : "active";
        setSaving(true);
        const prev = listing.status;
        onStatus(next);
        try {
            await setListingStatus(listing.id, next);
        } catch {
            onStatus(prev);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="glass-card flex flex-col p-5 transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-glass-lg animate-fade-up"
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
        >
            <div className="flex items-start justify-between gap-3">
                <Badge tone={isSupply ? "forest" : "sky"}>
                    {isSupply ? <Wheat size={13} /> : <Storefront size={13} />}
                    {isSupply ? "Supply offer" : "Buyer need"}
                </Badge>
                <Badge tone={status.tone} dot>
                    {status.label}
                </Badge>
            </div>

            <h3 className="mt-4 font-display text-xl leading-snug text-ink">
                {listing.title || listing.terms.crop}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
                {listing.terms.crop}
                {listing.terms.crop && " · "}
                {cadenceSummary(listing.terms)}
            </p>

            <div className="divider my-4" />

            <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <dt className="text-2xs font-semibold uppercase tracking-wide text-forest-600">
                        Committed value
                    </dt>
                    <dd className="mt-0.5 font-display text-lg text-ink">{formatMoney(value)}</dd>
                </div>
                <div>
                    <dt className="text-2xs font-semibold uppercase tracking-wide text-forest-600">Term</dt>
                    <dd className="mt-0.5 text-ink-soft">
                        {formatDate(listing.terms.term_start)} – {formatDate(listing.terms.term_end)}
                    </dd>
                </div>
            </dl>

            <div className="mt-5 flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                    <LinkButton href="/app/discover" variant="ghost" size="sm">
                        Matches <ArrowRight size={15} />
                    </LinkButton>
                    {togglable && (
                        <LinkButton href={`/app/listings/${listing.id}/edit`} variant="ghost" size="sm" aria-label="Edit listing">
                            <Pen size={15} />
                        </LinkButton>
                    )}
                </div>

                {togglable ? (
                    <Button variant="soft" size="sm" loading={saving} onClick={toggle}>
                        {listing.status === "active" ? (
                            <>
                                <Clock size={15} /> Pause
                            </>
                        ) : (
                            <>
                                <Check size={15} /> Activate
                            </>
                        )}
                    </Button>
                ) : (
                    <span className={cn("text-[13px] font-medium text-ink-faint")}>
                        {listing.status === "matched" ? "Matched" : "Archived"}
                    </span>
                )}
            </div>
        </div>
    );
}
