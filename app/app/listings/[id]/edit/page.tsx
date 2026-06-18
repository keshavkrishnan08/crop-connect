"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getListing, updateListing } from "@/lib/queries";
import { type Listing, type Terms } from "@/lib/types";
import { PageHeader } from "@/components/app/PageHeader";
import { TermsForm } from "@/components/contract/TermsForm";
import { Button, GlassCard, Field, FieldGroup, Spinner, EmptyState } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { ArrowRight, Wheat } from "@/components/icons";

export default function EditListingPage({ params }: { params: { id: string } }) {
    const { profile } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [listing, setListing] = React.useState<Listing | null>(null);
    const [notFound, setNotFound] = React.useState(false);
    const [terms, setTerms] = React.useState<Terms | null>(null);
    const [title, setTitle] = React.useState("");
    const [ceiling, setCeiling] = React.useState<number | null>(null);
    const [location, setLocation] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        getListing(params.id).then((l) => {
            if (!l) { setNotFound(true); return; }
            setListing(l);
            setTerms(l.terms);
            setTitle(l.title);
            setCeiling(l.price_ceiling_cents);
            setLocation(l.location_label ?? "");
        });
    }, [params.id]);

    if (notFound) {
        return <EmptyState icon={<Wheat size={24} />} title="Listing not found" description="It may have been removed." />;
    }
    if (!listing || !terms || !profile) {
        return <div className="grid h-[50vh] place-items-center"><Spinner size={24} className="text-forest-500" /></div>;
    }
    if (listing.owner_id !== profile.id) {
        return <EmptyState icon={<Wheat size={24} />} title="You can't edit this listing" description="Only the owner can make changes." />;
    }

    const isNeed = listing.type === "need";

    const save = async () => {
        if (!terms.crop || terms.quantity <= 0 || terms.unit_price_cents <= 0) {
            toast.error("Add a crop, quantity and price first");
            return;
        }
        setSaving(true);
        try {
            await updateListing(listing.id, {
                title: title || terms.crop,
                terms,
                price_ceiling_cents: isNeed ? ceiling : null,
                location_label: location || null,
            });
            toast.success("Listing updated");
            router.push("/app/listings");
        } catch {
            toast.error("Couldn't save", "Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="Edit posting" title={isNeed ? "Edit buyer need" : "Edit supply offer"} />
            <GlassCard className="max-w-2xl p-6">
                <FieldGroup label="Title" className="mb-5">
                    <Field value={title} onChange={(e) => setTitle(e.target.value)} placeholder={terms.crop || "Listing title"} />
                </FieldGroup>
                <TermsForm value={terms} onChange={setTerms} showCeiling={isNeed} ceilingCents={ceiling} onCeilingChange={setCeiling} />
                <FieldGroup label="Location" className="mt-5">
                    <Field value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Sonoma County, CA" />
                </FieldGroup>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => router.push("/app/listings")}>Cancel</Button>
                    <Button onClick={save} loading={saving}>Save changes <ArrowRight size={16} /></Button>
                </div>
            </GlassCard>
        </div>
    );
}
