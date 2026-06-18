"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import {
    Button, Field, Textarea, FieldGroup, Avatar, Spinner, GlassCard,
} from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";
import { upsertProfile } from "@/lib/queries";
import { cn, formatNumber } from "@/lib/utils";
import { Barn, Storefront, Check, Repeat, Plus, Pen } from "@/components/icons";
import type { Role } from "@/lib/types";

const PRESETS = [
    "Heirloom tomatoes", "Mixed greens", "Strawberries", "Sweet corn",
    "Carrots", "Kale", "Bell peppers", "Berries", "Herbs", "Squash",
    "Apples", "Microgreens",
];

export default function ProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const toast = useToast();

    if (!profile) {
        return (
            <div className="grid place-items-center py-32 text-forest-500">
                <Spinner size={26} />
            </div>
        );
    }

    return <ProfileForm key={profile.id} profile={profile} refreshProfile={refreshProfile} toastSuccess={toast.success} toastError={toast.error} />;
}

function ProfileForm({
    profile, refreshProfile, toastSuccess, toastError,
}: {
    profile: NonNullable<ReturnType<typeof useAuth>["profile"]>;
    refreshProfile: () => Promise<void>;
    toastSuccess: (t: string, d?: string) => void;
    toastError: (t: string, d?: string) => void;
}) {
    const role: Role = profile.role;
    const isFarm = role === "farm";

    const [fullName, setFullName] = useState(profile.full_name ?? "");
    const [orgName, setOrgName] = useState(profile.org_name ?? "");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
    const [location, setLocation] = useState(profile.location_label ?? "");
    const [bio, setBio] = useState(profile.bio ?? "");
    const [tags, setTags] = useState<string[]>(
        (isFarm ? profile.crops : profile.needs) ?? [],
    );
    const [custom, setCustom] = useState("");
    const [saving, setSaving] = useState(false);

    const tagKey = isFarm ? "crops" : "needs";
    const tagLabel = isFarm ? "What you grow" : "What you need";

    const options = useMemo(() => {
        const extra = tags.filter((t) => !PRESETS.includes(t));
        return [...PRESETS, ...extra];
    }, [tags]);

    function toggle(tag: string) {
        setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    }

    function addCustom() {
        const v = custom.trim();
        if (!v) return;
        if (!tags.includes(v)) setTags((prev) => [...prev, v]);
        setCustom("");
    }

    async function save() {
        setSaving(true);
        try {
            await upsertProfile({
                id: profile.id,
                full_name: fullName.trim(),
                org_name: orgName.trim() || null,
                avatar_url: avatarUrl.trim() || null,
                location_label: location.trim() || null,
                bio: bio.trim() || null,
                [tagKey]: tags,
            });
            await refreshProfile();
            toastSuccess("Profile saved", "Your details are up to date.");
        } catch (err) {
            toastError("Couldn't save", err instanceof Error ? err.message : "Try again in a moment.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl">
            <PageHeader eyebrow="Account" title="Your profile" subtitle="How counterparties see you across the marketplace." />

            {/* Reputation panel */}
            <div className="mb-6 grid grid-cols-1 gap-3 animate-fade-up sm:grid-cols-3">
                <Stat
                    icon={<Check size={18} />}
                    value={formatNumber(profile.completed_contracts)}
                    label="Contracts completed"
                />
                <Stat
                    icon={<Repeat size={18} />}
                    value={formatNumber(profile.renewed_contracts)}
                    label="Renewed"
                />
                <div className="glass-tint flex items-center gap-3 rounded-2xl p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-50 text-forest-600">
                        {isFarm ? <Barn size={18} /> : <Storefront size={18} />}
                    </span>
                    <div className="leading-tight">
                        <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">Role</p>
                        <p className="text-sm font-semibold text-ink">{isFarm ? "Farm" : "Buyer"}</p>
                    </div>
                </div>
            </div>

            <GlassCard className="space-y-6 p-6 animate-fade-up sm:p-8" style={{ animationDelay: "60ms" }}>
                {/* Avatar */}
                <div className="flex items-center gap-5">
                    <Avatar name={fullName || profile.full_name} src={avatarUrl || null} size={72} />
                    <div className="min-w-0 flex-1">
                        <FieldGroup label="Avatar URL" hint="Paste a link to a square image.">
                            <Field
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://…"
                                inputMode="url"
                            />
                        </FieldGroup>
                    </div>
                </div>

                <div className="divider" />

                <div className="grid gap-5 sm:grid-cols-2">
                    <FieldGroup label="Full name">
                        <Field value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Grower" />
                    </FieldGroup>
                    <FieldGroup label={isFarm ? "Farm name" : "Organization"}>
                        <Field value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder={isFarm ? "Sunrise Acres" : "Fresh Market Co."} />
                    </FieldGroup>
                </div>

                <FieldGroup label="Location">
                    <Field value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Sonoma County, CA" />
                </FieldGroup>

                <FieldGroup label="Bio" hint="A short line on who you are and what you're after.">
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="We grow certified-organic row crops on 40 acres…" />
                </FieldGroup>

                <div className="divider" />

                {/* Tag multiselect */}
                <div>
                    <label className="label">{tagLabel}</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {options.map((tag) => {
                            const active = tags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggle(tag)}
                                    className={cn(active ? "chip-active" : "chip")}
                                >
                                    {active && <Check size={13} />}
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Field
                            value={custom}
                            onChange={(e) => setCustom(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); addCustom(); }
                            }}
                            placeholder="Add your own…"
                        />
                        <Button type="button" variant="soft" onClick={addCustom}>
                            <Plus size={16} /> Add
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end pt-1">
                    <Button onClick={save} loading={saving}>
                        <Pen size={16} /> Save profile
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <div className="glass-tint flex items-center gap-3 rounded-2xl p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-50 text-forest-600">{icon}</span>
            <div className="leading-tight">
                <p className="font-display text-2xl text-ink">{value}</p>
                <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
            </div>
        </div>
    );
}
