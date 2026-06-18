"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge, Button, LinkButton, EmptyState, Spinner } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { Wheat, Storefront, Plus, ArrowRight, Clock, Check, Pen, Copy, Repeat } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { getMyListings, setListingStatus, createListing } from "@/lib/queries";
import { contractValueCents, cadenceSummary } from "@/lib/contract";
import { type Listing, type ListingStatus } from "@/lib/types";
import { cn, formatMoney, formatDate } from "@/lib/utils";

type FilterKey = "all" | ListingStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "matched", label: "Matched" },
    { key: "archived", label: "Archived" },
];

const STATUS_META: Record<ListingStatus, { label: string; tone: "forest" | "amber" | "sky" | "muted" }> = {
    active: { label: "Active", tone: "forest" },
    paused: { label: "Paused", tone: "amber" },
    matched: { label: "Matched", tone: "sky" },
    archived: { label: "Archived", tone: "muted" },
};

export default function MyListingsPage() {
    const { profile, loading } = useAuth();
    const toast = useToast();
    const [listings, setListings] = useState<Listing[] | null>(null);
    const [filter, setFilter] = useState<FilterKey>("all");

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

    const counts = useMemo(() => {
        const base: Record<FilterKey, number> = { all: 0, active: 0, paused: 0, matched: 0, archived: 0 };
        if (!listings) return base;
        base.all = listings.length;
        for (const l of listings) base[l.status] += 1;
        return base;
    }, [listings]);

    const visible = useMemo(
        () => (listings ? (filter === "all" ? listings : listings.filter((l) => l.status === filter)) : []),
        [listings, filter],
    );

    function patchStatus(id: string, next: ListingStatus) {
        setListings((prev) => (prev ? prev.map((x) => (x.id === id ? { ...x, status: next } : x)) : prev));
    }

    async function duplicate(listing: Listing) {
        if (!profile) return;
        try {
            const copy = await createListing({
                owner_id: profile.id,
                type: listing.type,
                title: listing.title + " (copy)",
                terms: listing.terms,
                price_ceiling_cents: listing.price_ceiling_cents,
                location_label: listing.location_label,
            });
            setListings((prev) => (prev ? [copy, ...prev] : [copy]));
            toast.success("Listing duplicated", "A draft copy is ready to edit.");
        } catch (err) {
            toast.error("Couldn't duplicate", err instanceof Error ? err.message : "Try again in a moment.");
        }
    }

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

            {!busy && listings.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2 animate-fade-up">
                    {FILTERS.map((f) => {
                        const activeTab = filter === f.key;
                        return (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setFilter(f.key)}
                                className={cn(activeTab ? "chip-active" : "chip")}
                            >
                                {f.label}
                                <span className={cn(
                                    "ml-0.5 rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                                    activeTab ? "bg-white/25" : "bg-ink/5 text-ink-faint",
                                )}>
                                    {counts[f.key]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

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
            ) : visible.length === 0 ? (
                <EmptyState
                    icon={<Wheat size={24} />}
                    title={`No ${filter} listings`}
                    description="Nothing here right now. Switch tabs to see your other postings."
                    action={
                        <Button variant="soft" onClick={() => setFilter("all")}>
                            View all
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((l, i) => (
                        <ListingCard
                            key={l.id}
                            listing={l}
                            index={i}
                            onStatus={(next) => patchStatus(l.id, next)}
                            onDuplicate={() => duplicate(l)}
                            onArchive={async () => {
                                const prev = l.status;
                                patchStatus(l.id, "archived");
                                try {
                                    await setListingStatus(l.id, "archived");
                                    toast.success("Listing archived");
                                } catch (err) {
                                    patchStatus(l.id, prev);
                                    toast.error("Couldn't archive", err instanceof Error ? err.message : "Try again.");
                                }
                            }}
                            onUnarchive={async () => {
                                patchStatus(l.id, "active");
                                try {
                                    await setListingStatus(l.id, "active");
                                    toast.success("Listing reactivated");
                                } catch (err) {
                                    patchStatus(l.id, "archived");
                                    toast.error("Couldn't reactivate", err instanceof Error ? err.message : "Try again.");
                                }
                            }}
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
    onDuplicate,
    onArchive,
    onUnarchive,
}: {
    listing: Listing;
    index: number;
    onStatus: (next: ListingStatus) => void;
    onDuplicate: () => void | Promise<void>;
    onArchive: () => void | Promise<void>;
    onUnarchive: () => void | Promise<void>;
}) {
    const [saving, setSaving] = useState(false);
    const [duplicating, setDuplicating] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const isSupply = listing.type === "supply";
    const status = STATUS_META[listing.status];
    const value = contractValueCents(listing.terms);
    const togglable = listing.status === "active" || listing.status === "paused";
    const isArchived = listing.status === "archived";

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

    async function handleDuplicate() {
        setDuplicating(true);
        try {
            await onDuplicate();
        } finally {
            setDuplicating(false);
        }
    }

    async function handleArchive() {
        setArchiving(true);
        try {
            await onArchive();
        } finally {
            setArchiving(false);
        }
    }

    async function handleUnarchive() {
        setArchiving(true);
        try {
            await onUnarchive();
        } finally {
            setArchiving(false);
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

            {/* Overflow actions */}
            <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3">
                <Button variant="ghost" size="sm" loading={duplicating} onClick={handleDuplicate}>
                    <Copy size={15} /> Duplicate
                </Button>
                {togglable && (
                    <Button variant="ghost" size="sm" loading={archiving} onClick={handleArchive} className="text-ink-muted">
                        Archive
                    </Button>
                )}
                {isArchived && (
                    <Button variant="ghost" size="sm" loading={archiving} onClick={handleUnarchive}>
                        <Repeat size={15} /> Unarchive
                    </Button>
                )}
            </div>
        </div>
    );
}
