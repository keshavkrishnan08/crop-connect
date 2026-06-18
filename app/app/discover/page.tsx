"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import {
    Button, LinkButton, Field, Select, FieldGroup, Badge, Avatar, Spinner,
    EmptyState, Eyebrow, GlassCard, Textarea,
} from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { TermsForm } from "@/components/contract/TermsForm";
import {
    Compass, Search, MapPin, Sparkle, Wheat, Storefront, ArrowRight, X, Handshake,
} from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { getMyListings, getOpenListings, proposeContract } from "@/lib/queries";
import { rankMatches, applyFilters, type DiscoverFilters } from "@/lib/match";
import { contractValueCents, cadenceSummary } from "@/lib/contract";
import {
    type Listing, type Terms, type MatchResult, type ListingType, CADENCE_LABEL, type Cadence,
} from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

// ---------------- Match score ring ----------------
function MatchRing({ score }: { score: number }) {
    const r = 18;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, score)) / 100;
    const tone = score >= 75 ? "text-forest-500" : score >= 50 ? "text-harvest-500" : "text-ink-faint";
    return (
        <div className="relative grid h-12 w-12 shrink-0 place-items-center">
            <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
                <circle cx="22" cy="22" r={r} fill="none" strokeWidth="3.5" className="stroke-ink/[0.07]" />
                <circle
                    cx="22" cy="22" r={r} fill="none" strokeWidth="3.5" strokeLinecap="round"
                    className={cn("transition-[stroke-dashoffset] duration-700 ease-spring", tone)}
                    stroke="currentColor"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - pct)}
                />
            </svg>
            <span className="absolute text-[13px] font-bold text-ink tabular-nums">{score}</span>
        </div>
    );
}

// ---------------- Reference selector ----------------
function ReferencePicker({
    listings, value, onChange,
}: { listings: Listing[]; value: string; onChange: (id: string) => void }) {
    if (listings.length <= 1) return null;
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="label mb-0 mr-1">Match against</span>
            {listings.map((l) => (
                <button
                    key={l.id}
                    type="button"
                    onClick={() => onChange(l.id)}
                    className={cn("chip", l.id === value && "chip-active")}
                >
                    {l.terms.crop || l.title}
                </button>
            ))}
        </div>
    );
}

export default function DiscoverPage() {
    const { profile } = useAuth();
    const { success, error: toastError } = useToast();
    const router = useRouter();

    const meRole = profile?.role ?? "buyer";
    const opposite: ListingType = meRole === "farm" ? "need" : "supply";

    const [loading, setLoading] = React.useState(true);
    const [myListings, setMyListings] = React.useState<Listing[]>([]);
    const [pool, setPool] = React.useState<Listing[]>([]);
    const [refId, setRefId] = React.useState<string>("");

    // filters
    const [q, setQ] = React.useState("");
    const [crop, setCrop] = React.useState("");
    const [cadence, setCadence] = React.useState<string>("");
    const [maxPrice, setMaxPrice] = React.useState(""); // dollars input

    // propose modal
    const [target, setTarget] = React.useState<Listing | null>(null);
    const [terms, setTerms] = React.useState<Terms | null>(null);
    const [note, setNote] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (!profile) return;
        let active = true;
        setLoading(true);
        Promise.all([getMyListings(profile.id), getOpenListings(opposite)])
            .then(([mine, open]) => {
                if (!active) return;
                setMyListings(mine);
                setPool(open);
                if (mine.length) setRefId(mine[0].id);
            })
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [profile, opposite]);

    const reference = React.useMemo(
        () => myListings.find((l) => l.id === refId) ?? null,
        [myListings, refId],
    );

    const filters: DiscoverFilters = React.useMemo(() => ({
        q: q.trim() || undefined,
        crop: crop.trim() || undefined,
        cadence: cadence || undefined,
        maxPriceCents: maxPrice ? Math.round(Number(maxPrice) * 100) : null,
    }), [q, crop, cadence, maxPrice]);

    const filtered = React.useMemo(() => applyFilters(pool, filters), [pool, filters]);

    // ranked when a reference exists; otherwise recency-sorted (already from query)
    const results: MatchResult[] = React.useMemo(() => {
        if (reference) return rankMatches(reference, filtered);
        return filtered.map((listing) => ({ listing, score: 0, reasons: [], distanceKm: null }));
    }, [reference, filtered]);

    const ranked = Boolean(reference);
    const hasFilters = Boolean(filters.q || filters.crop || filters.cadence || filters.maxPriceCents);

    function openPropose(listing: Listing) {
        setTarget(listing);
        setTerms({ ...listing.terms, notes: listing.terms.notes });
        setNote("");
    }

    function closePropose() {
        setTarget(null);
        setTerms(null);
        setSubmitting(false);
    }

    async function confirmPropose() {
        if (!profile || !target || !terms) return;
        setSubmitting(true);
        try {
            const c = await proposeContract({
                listing: target, meId: profile.id, meRole: profile.role, terms, note: note.trim() || undefined,
            });
            success("Proposal sent", `Your contract draft for ${terms.crop} is ready.`);
            router.push("/app/contracts/" + c.id);
        } catch (e) {
            setSubmitting(false);
            toastError("Couldn't send proposal", e instanceof Error ? e.message : "Please try again.");
        }
    }

    function resetFilters() {
        setQ(""); setCrop(""); setCadence(""); setMaxPrice("");
    }

    return (
        <div className="animate-fade-up">
            <PageHeader
                eyebrow="Discover"
                title={meRole === "farm" ? "Find buyers for your harvest" : "Source from local farms"}
                subtitle={
                    meRole === "farm"
                        ? "Open buyer needs, ranked against what you grow. Propose a contract in two taps."
                        : "Open farm supply, ranked against what you're sourcing. Propose a contract in two taps."
                }
                actions={
                    <LinkButton href="/app/listings/new" variant="soft" size="sm">
                        <Wheat size={16} /> Post a listing
                    </LinkButton>
                }
            />

            {/* no-listing banner */}
            {!loading && myListings.length === 0 && (
                <GlassCard className="mb-5 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between bg-aurora">
                    <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl glass-tint text-forest-600">
                            <Compass size={20} />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-ink">Post a listing to unlock AI matching</p>
                            <p className="mt-0.5 text-[13px] text-ink-muted">
                                We rank every match against your own crop, season, and price. Browsing works too.
                            </p>
                        </div>
                    </div>
                    <LinkButton href="/app/listings/new" size="sm" className="shrink-0">
                        Create listing <ArrowRight size={15} />
                    </LinkButton>
                </GlassCard>
            )}

            {/* search + filters */}
            <div className="glass-panel sticky top-3 z-30 mb-6 p-3.5">
                <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_0.9fr_0.8fr]">
                    <FieldGroup label="Search">
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
                                <Search size={16} />
                            </span>
                            <Field
                                className="pl-10"
                                placeholder="Crop, grower, region…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>
                    </FieldGroup>
                    <FieldGroup label="Crop">
                        <Field placeholder="e.g. Strawberries" value={crop} onChange={(e) => setCrop(e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label="Cadence">
                        <Select value={cadence} onChange={(e) => setCadence(e.target.value)}>
                            <option value="">All cadences</option>
                            {(Object.keys(CADENCE_LABEL) as Cadence[]).map((c) => (
                                <option key={c} value={c}>{CADENCE_LABEL[c]}</option>
                            ))}
                        </Select>
                    </FieldGroup>
                    <FieldGroup label="Max price">
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">$</span>
                            <Field
                                className="pl-7" type="number" min={0} step="0.01" placeholder="Any"
                                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </FieldGroup>
                </div>
                {hasFilters && (
                    <div className="mt-2.5 flex items-center justify-between px-0.5">
                        <span className="text-[13px] text-ink-muted">
                            {results.length} {results.length === 1 ? "match" : "matches"}
                        </span>
                        <button onClick={resetFilters} className="text-[13px] font-medium text-forest-600 hover:text-forest-700">
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* reference picker */}
            {!loading && myListings.length > 1 && (
                <div className="mb-5">
                    <ReferencePicker listings={myListings} value={refId} onChange={setRefId} />
                </div>
            )}

            {/* results header */}
            {!loading && results.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                    {ranked ? (
                        <>
                            <span className="text-gradient inline-flex items-center gap-1.5">
                                <Sparkle size={16} className="text-harvest-500" />
                                <Eyebrow>AI-ranked matches</Eyebrow>
                            </span>
                            {reference && (
                                <span className="text-[13px] text-ink-faint">
                                    for {reference.terms.crop || reference.title}
                                </span>
                            )}
                        </>
                    ) : (
                        <Eyebrow>Latest open {opposite === "need" ? "needs" : "supply"}</Eyebrow>
                    )}
                </div>
            )}

            {/* body */}
            {loading ? (
                <div className="grid place-items-center py-24">
                    <Spinner size={28} />
                </div>
            ) : results.length === 0 ? (
                <EmptyState
                    icon={<Compass size={26} />}
                    title="No matches just yet"
                    description={
                        hasFilters
                            ? "Nothing fits these filters. Try loosening the crop or price."
                            : "There's no open " + (opposite === "need" ? "buyer demand" : "farm supply") + " right now. Check back soon."
                    }
                    action={hasFilters ? <Button variant="soft" size="sm" onClick={resetFilters}>Clear filters</Button> : undefined}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {results.map((m, i) => (
                        <MatchCard
                            key={m.listing.id}
                            match={m}
                            ranked={ranked}
                            index={i}
                            onPropose={() => openPropose(m.listing)}
                        />
                    ))}
                </div>
            )}

            {/* propose modal */}
            {target && terms && (
                <ProposeModal
                    listing={target}
                    terms={terms}
                    setTerms={setTerms}
                    note={note}
                    setNote={setNote}
                    submitting={submitting}
                    onClose={closePropose}
                    onConfirm={confirmPropose}
                />
            )}
        </div>
    );
}

// ---------------- Match card ----------------
function MatchCard({
    match, ranked, index, onPropose,
}: { match: MatchResult; ranked: boolean; index: number; onPropose: () => void }) {
    const { listing, score, reasons, distanceKm } = match;
    const owner = listing.owner;
    const orgName = owner?.org_name || owner?.full_name || "Independent grower";
    const place = listing.location_label || owner?.location_label;
    const TypeIcon = listing.type === "need" ? Storefront : Wheat;

    return (
        <GlassCard
            hover
            className="flex flex-col gap-4 p-5 animate-fade-up"
            style={{ animationDelay: `${Math.min(index, 9) * 45}ms` }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={orgName} src={owner?.avatar_url} size={40} />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{orgName}</p>
                        <p className="flex items-center gap-1 text-[12.5px] text-ink-muted">
                            <MapPin size={13} className="text-ink-faint" />
                            <span className="truncate">{place || "Location not set"}</span>
                            {distanceKm != null && (
                                <span className="shrink-0 text-ink-faint">· {distanceKm} km</span>
                            )}
                        </p>
                    </div>
                </div>
                {ranked && <MatchRing score={score} />}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-forest-600">
                    <TypeIcon size={13} />
                    {listing.type === "need" ? "Buyer need" : "Farm supply"}
                </div>
                <h3 className="font-display text-[1.35rem] leading-tight text-ink">
                    {listing.terms.crop || listing.title}
                </h3>
                <p className="text-[13px] text-ink-muted capitalize">{cadenceSummary(listing.terms)}</p>
            </div>

            {ranked && reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {reasons.slice(0, 3).map((r, idx) => (
                        <Badge key={idx} tone="forest" className="font-normal">{r}</Badge>
                    ))}
                </div>
            )}

            <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Committed value</p>
                    <p className="font-display text-xl text-ink">{formatMoney(contractValueCents(listing.terms))}</p>
                </div>
                <Button size="sm" onClick={onPropose}>
                    <Handshake size={16} /> Propose
                </Button>
            </div>
        </GlassCard>
    );
}

// ---------------- Propose modal ----------------
function ProposeModal({
    listing, terms, setTerms, note, setNote, submitting, onClose, onConfirm,
}: {
    listing: Listing;
    terms: Terms;
    setTerms: (t: Terms) => void;
    note: string;
    setNote: (s: string) => void;
    submitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    const owner = listing.owner;
    const orgName = owner?.org_name || owner?.full_name || "this grower";

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] grid place-items-start overflow-y-auto bg-ink/30 p-4 backdrop-blur-sm sm:place-items-center"
            onClick={onClose}
        >
            <GlassCard
                className="relative my-auto w-full max-w-2xl p-6 animate-scale-in sm:p-7"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <div className="mb-5 pr-8">
                    <div className="mb-1.5"><Eyebrow>Propose a contract</Eyebrow></div>
                    <h2 className="font-display text-2xl leading-tight text-ink">To {orgName}</h2>
                    <p className="mt-1 text-[13px] text-ink-muted">
                        Terms are pre-filled from their {listing.type === "need" ? "need" : "offer"}. Adjust anything before sending.
                    </p>
                </div>

                <TermsForm value={terms} onChange={setTerms} />

                <FieldGroup label="Note to counterparty (optional)" className="mt-5">
                    <Textarea
                        rows={3}
                        placeholder="Add a quick intro or anything they should know."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </FieldGroup>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                    <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button onClick={onConfirm} loading={submitting} disabled={!terms.crop.trim()}>
                        Send proposal <ArrowRight size={16} />
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
}
