"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { upsertProfile } from "@/lib/queries";
import { useToast } from "@/components/ui/Toast";
import { Button, Field, Textarea, FieldGroup, GlassCard, Eyebrow, Spinner } from "@/components/ui/kit";
import { Barn, Storefront, Plus, ArrowRight, Check } from "@/components/icons";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRESETS = [
    "Heirloom tomatoes", "Mixed greens", "Strawberries", "Sweet corn", "Carrots", "Kale",
    "Bell peppers", "Berries", "Herbs", "Squash", "Apples", "Microgreens",
];

export default function OnboardingPage() {
    const router = useRouter();
    const toast = useToast();
    const { session, profile, loading, refreshProfile } = useAuth();

    const [role, setRole] = useState<Role>("farm");
    const [fullName, setFullName] = useState("");
    const [orgName, setOrgName] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [custom, setCustom] = useState("");
    const [saving, setSaving] = useState(false);
    const [touched, setTouched] = useState(false);

    // redirect unauthenticated users
    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    // prefill from profile once it arrives
    useEffect(() => {
        if (!profile) return;
        setFullName((v) => v || profile.full_name || "");
        setOrgName((v) => v || profile.org_name || "");
        setLocation((v) => v || profile.location_label || "");
        setBio((v) => v || profile.bio || "");
        setRole(profile.role ?? "farm");
        setTags((v) => (v.length ? v : (profile.role === "buyer" ? profile.needs : profile.crops) ?? []));
    }, [profile]);

    function toggleTag(t: string) {
        setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    }

    function addCustom() {
        const v = custom.trim();
        if (!v) return;
        if (!tags.includes(v)) setTags((prev) => [...prev, v]);
        setCustom("");
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setTouched(true);
        if (!fullName.trim()) {
            toast.error("Add your name", "We need a name to put on your contracts.");
            return;
        }
        if (!session) return;
        setSaving(true);
        try {
            await upsertProfile({
                id: session.user.id,
                full_name: fullName.trim(),
                org_name: orgName.trim() || null,
                email: session.user.email ?? null,
                location_label: location.trim() || null,
                bio: bio.trim() || null,
                role,
                ...(role === "farm" ? { crops: tags } : { needs: tags }),
            });
            await refreshProfile();
            toast.success("You're all set");
            router.push("/app");
        } catch (err) {
            toast.error("Couldn't save", err instanceof Error ? err.message : "Try again.");
            setSaving(false);
        }
    }

    if (loading || !session) {
        return (
            <div className="grid min-h-screen place-items-center bg-paper bg-aurora">
                <Spinner size={26} className="text-forest-500" />
            </div>
        );
    }

    const isFarm = role === "farm";
    const RoleIcon = isFarm ? Barn : Storefront;
    const nameInvalid = touched && !fullName.trim();

    return (
        <div className="min-h-screen bg-paper bg-aurora px-5 py-14 sm:py-20">
            <GlassCard className="mx-auto w-full max-w-2xl animate-fade-up p-7 sm:p-10">
                <Eyebrow>Set up your profile</Eyebrow>
                <h1 className="mt-3 text-[2rem] leading-tight text-ink">
                    {profile?.full_name ? `Welcome, ${profile.full_name.split(" ")[0]}` : "Welcome to CropConnect"}
                </h1>
                <p className="mt-1.5 text-sm text-ink-muted">
                    A few details so partners know who they're contracting with.
                </p>

                <form onSubmit={onSubmit} className="mt-8 space-y-6">
                    {/* role */}
                    <div className="animate-fade-up animate-delay-100">
                        <label className="label">You are a</label>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-forest-50 px-3 py-2 text-sm font-medium text-forest-700">
                                <RoleIcon size={18} />
                                {isFarm ? "Farm" : "Buyer"}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setRole(isFarm ? "buyer" : "farm");
                                    setTags([]);
                                }}
                                className="focus-ring rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink-muted hover:text-forest-600"
                            >
                                Switch to {isFarm ? "buyer" : "farm"}
                            </button>
                        </div>
                    </div>

                    {/* names */}
                    <FieldGroup label="Full name" className="animate-fade-up animate-delay-100">
                        <Field
                            type="text"
                            placeholder="Maria Okafor"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={cn(nameInvalid && "border-berry/60 focus:border-berry")}
                            aria-invalid={nameInvalid}
                            required
                        />
                        {nameInvalid && <p className="mt-1.5 text-[12.5px] text-berry">A name is required.</p>}
                    </FieldGroup>

                    <FieldGroup
                        label={isFarm ? "Farm name" : "Organization"}
                        hint="Optional — shown on your listings."
                        className="animate-fade-up animate-delay-200"
                    >
                        <Field
                            type="text"
                            placeholder={isFarm ? "Okafor Family Farm" : "Blue Plate Kitchens"}
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                        />
                    </FieldGroup>

                    <FieldGroup label="Location" className="animate-fade-up animate-delay-200">
                        <Field
                            type="text"
                            placeholder="Sonoma County, CA"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </FieldGroup>

                    <FieldGroup label="About" className="animate-fade-up animate-delay-300">
                        <Textarea
                            rows={3}
                            placeholder={
                                isFarm
                                    ? "Third-generation organic growers focused on heirloom varieties…"
                                    : "Farm-to-table restaurant group sourcing seasonal produce weekly…"
                            }
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </FieldGroup>

                    {/* tags */}
                    <div className="animate-fade-up animate-delay-300">
                        <label className="label">{isFarm ? "What do you grow?" : "What do you typically need?"}</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {Array.from(new Set([...PRESETS, ...tags])).map((t) => {
                                const active = tags.includes(t);
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => toggleTag(t)}
                                        className={cn(active ? "chip-active" : "chip")}
                                        aria-pressed={active}
                                    >
                                        {active && <Check size={13} />}
                                        {t}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-3 flex gap-2">
                            <Field
                                type="text"
                                placeholder="Add your own…"
                                value={custom}
                                onChange={(e) => setCustom(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addCustom();
                                    }
                                }}
                            />
                            <Button type="button" variant="soft" onClick={addCustom} aria-label="Add">
                                <Plus size={18} />
                                Add
                            </Button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        loading={saving}
                        size="lg"
                        className="w-full animate-fade-up animate-delay-300"
                    >
                        Finish setup
                        {!saving && <ArrowRight size={18} />}
                    </Button>
                </form>
            </GlassCard>
        </div>
    );
}
