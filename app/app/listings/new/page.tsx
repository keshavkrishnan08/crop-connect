"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { Button, Field, FieldGroup } from "@/components/ui/kit";
import { TermsForm } from "@/components/contract/TermsForm";
import { Wheat, Storefront, MapPin, ArrowRight } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";
import { createListing } from "@/lib/queries";
import { emptyTerms, contractValueCents, deliveryCount } from "@/lib/contract";
import { type Terms, type ListingType } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

export default function NewListingPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const [type, setType] = useState<ListingType>(profile?.role === "buyer" ? "need" : "supply");
    const [title, setTitle] = useState("");
    const [terms, setTerms] = useState<Terms>(() => emptyTerms());
    const [ceiling, setCeiling] = useState<number | null>(null);
    const [locationLabel, setLocationLabel] = useState(profile?.location_label ?? "");
    const [saving, setSaving] = useState(false);

    const value = useMemo(() => contractValueCents(terms), [terms]);
    const count = useMemo(() => deliveryCount(terms), [terms]);

    const valid = terms.crop.trim().length > 0 && terms.quantity > 0 && terms.unit_price_cents > 0;

    async function submit() {
        if (!profile) return;
        if (!valid) {
            toast.error("Missing details", "Add a crop, a quantity, and a price per unit before publishing.");
            return;
        }
        setSaving(true);
        try {
            await createListing({
                owner_id: profile.id,
                type,
                title: title.trim() || terms.crop,
                terms,
                price_ceiling_cents: type === "need" ? ceiling : null,
                location_label: locationLabel.trim() || null,
            });
            toast.success("Listing published", "It's now live and ready to match.");
            router.push("/app/listings");
        } catch {
            toast.error("Couldn't publish", "Something went wrong. Please try again.");
            setSaving(false);
        }
    }

    return (
        <div className="animate-fade-up">
            <PageHeader
                eyebrow="New posting"
                title={type === "supply" ? "List a supply offer" : "Post a buyer need"}
                subtitle={
                    type === "supply"
                        ? "Tell buyers what you grow and the terms you'd commit to."
                        : "Describe the produce you're sourcing and what you're willing to pay."
                }
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="glass-card max-w-2xl space-y-6 p-6 sm:p-7">
                    <div>
                        <span className="label">Posting type</span>
                        <div className="grid grid-cols-2 gap-3">
                            <TypeChip
                                active={type === "supply"}
                                onClick={() => setType("supply")}
                                icon={<Wheat size={18} />}
                                title="Supply offer"
                                blurb="I grow this"
                            />
                            <TypeChip
                                active={type === "need"}
                                onClick={() => setType("need")}
                                icon={<Storefront size={18} />}
                                title="Buyer need"
                                blurb="I'm sourcing this"
                            />
                        </div>
                    </div>

                    <FieldGroup label="Listing title (optional)" hint="Defaults to the crop name if left blank">
                        <Field
                            placeholder="e.g. Sun Gold cherry tomatoes, weekly"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </FieldGroup>

                    <TermsForm
                        value={terms}
                        onChange={setTerms}
                        showCeiling={type === "need"}
                        ceilingCents={ceiling}
                        onCeilingChange={setCeiling}
                    />

                    <FieldGroup label="Location" hint="Where the produce is grown or needed">
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
                                <MapPin size={16} />
                            </span>
                            <Field
                                className="pl-10"
                                placeholder="e.g. Sonoma County, CA"
                                value={locationLabel}
                                onChange={(e) => setLocationLabel(e.target.value)}
                            />
                        </div>
                    </FieldGroup>

                    <div className="flex items-center justify-end gap-3 pt-1">
                        <Button onClick={submit} loading={saving} disabled={!valid}>
                            Publish listing <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>

                <aside className="hidden lg:block">
                    <div className="glass-panel sticky top-6 space-y-5 p-5 animate-scale-in">
                        <div>
                            <p className="text-2xs font-semibold uppercase tracking-wide text-forest-600">
                                {type === "supply" ? "Supply offer" : "Buyer need"}
                            </p>
                            <p className="mt-1 font-display text-lg text-ink">
                                {title.trim() || terms.crop || "Untitled listing"}
                            </p>
                        </div>

                        <div className="divider" />

                        <div>
                            <p className="text-2xs font-semibold uppercase tracking-wide text-forest-600">
                                Est. committed value
                            </p>
                            <p className="mt-0.5 font-display text-3xl text-ink">{formatMoney(value)}</p>
                        </div>

                        <dl className="space-y-2 text-sm">
                            <Row label="Deliveries" value={`${count} ${count === 1 ? "delivery" : "deliveries"}`} />
                            <Row
                                label="Per delivery"
                                value={
                                    terms.quantity > 0 ? `${terms.quantity} ${terms.unit}` : "—"
                                }
                            />
                            <Row
                                label="Unit price"
                                value={terms.unit_price_cents > 0 ? `${formatMoney(terms.unit_price_cents)} / ${terms.unit}` : "—"}
                            />
                            {type === "need" && (
                                <Row label="Price ceiling" value={ceiling ? `${formatMoney(ceiling)} / ${terms.unit}` : "—"} />
                            )}
                        </dl>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function TypeChip({
    active,
    onClick,
    icon,
    title,
    blurb,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    blurb: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                active
                    ? "border-forest-400 bg-forest-50 shadow-glass"
                    : "border-line bg-white/60 hover:border-line-strong hover:bg-white",
            )}
        >
            <span
                className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                    active ? "bg-white text-forest-600" : "bg-paper-sunk text-ink-muted",
                )}
            >
                {icon}
            </span>
            <span className="min-w-0">
                <span className={cn("block text-sm font-semibold", active ? "text-forest-700" : "text-ink")}>
                    {title}
                </span>
                <span className="block text-[12.5px] text-ink-faint">{blurb}</span>
            </span>
        </button>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="font-medium text-ink-soft">{value}</dd>
        </div>
    );
}
