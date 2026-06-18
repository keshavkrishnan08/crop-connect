"use client";

import * as React from "react";
import Link from "next/link";
import {
    LinkButton, Avatar, Badge, Spinner, EmptyState, Eyebrow, GlassCard,
} from "@/components/ui/kit";
import {
    Barn, Storefront, MapPin, Check, Repeat, Wheat, ArrowRight, Leaf, Handshake,
} from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { getPublicProfile } from "@/lib/queries";
import { contractValueCents, cadenceSummary } from "@/lib/contract";
import { type Profile, type Listing } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

// ---------------- Reputation stat ----------------
function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
    return (
        <div className="glass-tint flex items-center gap-4 rounded-2xl px-5 py-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-forest-500 shadow-glass">
                {icon}
            </span>
            <div>
                <div className="font-display text-2xl leading-none text-ink">{value ?? 0}</div>
                <div className="mt-1 text-[12.5px] text-ink-muted">{label}</div>
            </div>
        </div>
    );
}

// ---------------- Active listing card ----------------
function ListingCard({ listing, index }: { listing: Listing; index: number }) {
    const t = listing.terms;
    const isSupply = listing.type === "supply";
    return (
        <Link
            href="/app/discover"
            className="group block animate-fade-up"
            style={{ animationDelay: `${120 + index * 60}ms` }}
        >
            <GlassCard hover className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h4 className="truncate font-display text-lg text-ink">{listing.title}</h4>
                        <p className="mt-0.5 text-[13px] text-ink-muted">{cadenceSummary(t)}</p>
                    </div>
                    <Badge tone={isSupply ? "forest" : "sky"} className="shrink-0">
                        {isSupply ? "Supplying" : "Seeking"}
                    </Badge>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
                    <div>
                        <div className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                            Committed value
                        </div>
                        <div className="mt-1 font-display text-xl text-forest-600">
                            {formatMoney(contractValueCents(t))}
                        </div>
                    </div>
                    <span className="flex items-center gap-1 text-[13px] font-medium text-forest-500 transition-transform group-hover:translate-x-0.5">
                        Propose <ArrowRight size={15} />
                    </span>
                </div>
            </GlassCard>
        </Link>
    );
}

// ---------------- Page ----------------
export default function Page({ params }: { params: { id: string } }) {
    const { profile: me } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [listings, setListings] = React.useState<Listing[]>([]);

    React.useEffect(() => {
        let active = true;
        setLoading(true);
        getPublicProfile(params.id)
            .then((res) => {
                if (!active) return;
                setProfile(res.profile);
                setListings(res.listings);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [params.id]);

    if (loading) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Spinner size={28} className="text-forest-500" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16">
                <EmptyState
                    icon={<Leaf size={26} />}
                    title="Profile not found"
                    description="This grower or buyer may have moved on, or the link is no longer valid."
                    action={
                        <LinkButton href="/app/discover" variant="soft" size="sm">
                            Back to discover
                        </LinkButton>
                    }
                />
            </div>
        );
    }

    const isFarm = profile.role === "farm";
    const isSelf = me?.id === profile.id;
    const tags = (isFarm ? profile.crops : profile.needs) ?? [];

    return (
        <div className="bg-aurora mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6">
            {/* Back link */}
            <Link
                href="/app/discover"
                className="group mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-forest-600"
            >
                <ArrowRight size={15} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
                Back to discover
            </Link>

            {/* Hero */}
            <GlassCard className="animate-fade-up overflow-hidden p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <Avatar
                        name={profile.full_name}
                        src={profile.avatar_url}
                        size={88}
                        className="shadow-glass"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="font-display text-3xl text-ink sm:text-4xl">
                                {profile.full_name || "Unnamed"}
                            </h1>
                            <Badge tone={isFarm ? "forest" : "sky"} className="gap-1.5">
                                {isFarm ? <Barn size={14} /> : <Storefront size={14} />}
                                {isFarm ? "Farm" : "Buyer"}
                            </Badge>
                        </div>

                        {profile.org_name && (
                            <p className="mt-1 text-[15px] font-medium text-ink-soft">{profile.org_name}</p>
                        )}

                        {profile.location_label && (
                            <p className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] text-ink-muted">
                                <MapPin size={15} className="text-forest-500" />
                                {profile.location_label}
                            </p>
                        )}

                        {profile.bio && (
                            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
                                {profile.bio}
                            </p>
                        )}

                        {isSelf && (
                            <div className="mt-5">
                                <LinkButton href="/app/profile" variant="soft" size="sm">
                                    Edit profile
                                </LinkButton>
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* Reputation */}
            <section
                className="animate-fade-up mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
                style={{ animationDelay: "80ms" }}
            >
                <Stat
                    icon={<Check size={20} />}
                    value={profile.completed_contracts}
                    label="Contracts completed"
                />
                <Stat
                    icon={<Repeat size={20} />}
                    value={profile.renewed_contracts}
                    label="Renewed"
                />
            </section>

            {/* Crops / needs */}
            {tags.length > 0 && (
                <section
                    className="animate-fade-up mt-10"
                    style={{ animationDelay: "120ms" }}
                >
                    <Eyebrow>
                        <Wheat size={14} />
                        {isFarm ? "Grows" : "Looking for"}
                    </Eyebrow>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span key={tag} className="chip">
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Active listings */}
            <section
                className="animate-fade-up mt-10"
                style={{ animationDelay: "160ms" }}
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <Eyebrow>
                        <Handshake size={14} />
                        Active listings
                    </Eyebrow>
                    {listings.length > 0 && (
                        <span className="text-[12.5px] text-ink-faint">
                            {listings.length} open
                        </span>
                    )}
                </div>

                {listings.length === 0 ? (
                    <EmptyState
                        icon={<Wheat size={24} />}
                        title="No active listings"
                        description={
                            isSelf
                                ? "You don't have any open listings right now."
                                : `${profile.full_name || "This partner"} has no open listings at the moment.`
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {listings.map((listing, i) => (
                            <ListingCard key={listing.id} listing={listing} index={i} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
