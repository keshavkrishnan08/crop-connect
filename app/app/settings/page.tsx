"use client";

import * as React from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button, Card, Field, Select, FieldGroup, Badge, Avatar } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { Settings, User, Receipt, MarginUp, Shield, Check, MapPin, Repeat } from "@/components/icons";
import { usd, pct, cn } from "@/lib/utils";
import { useStore, actions, getState } from "@/lib/store";

const SERVICE_FEE = 499; // $/mo flat service subscription

const CUISINES = [
    "American", "Italian", "French", "Californian", "Mediterranean",
    "Mexican", "Japanese", "Farm-to-table", "Seafood", "Steakhouse", "Other",
];

function SectionHead({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
    return (
        <div className="mb-5 flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                {icon}
            </span>
            <div>
                <h2 className="font-display text-[1.15rem] leading-tight text-ink">{title}</h2>
                {hint && <p className="mt-0.5 text-[13px] text-ink-muted">{hint}</p>}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const toast = useToast();
    const restaurant = useStore((s) => s.restaurant);
    const levers = useStore((s) => s.levers);

    // ---- Restaurant profile (local draft, committed on Save) ----
    const [name, setName] = React.useState(restaurant.name);
    const [cuisine, setCuisine] = React.useState(restaurant.cuisine);
    const [location, setLocation] = React.useState(restaurant.location);
    const [covers, setCovers] = React.useState(String(restaurant.coversPerWeek));
    const [distributor, setDistributor] = React.useState(restaurant.distributor);

    // Re-seed local draft if the store restaurant changes underneath us (e.g. reset).
    React.useEffect(() => {
        setName(restaurant.name);
        setCuisine(restaurant.cuisine);
        setLocation(restaurant.location);
        setCovers(String(restaurant.coversPerWeek));
        setDistributor(restaurant.distributor);
    }, [restaurant]);

    const profileDirty =
        name !== restaurant.name ||
        cuisine !== restaurant.cuisine ||
        location !== restaurant.location ||
        Number(covers) !== restaurant.coversPerWeek ||
        distributor !== restaurant.distributor;

    function saveProfile() {
        const coversNum = Math.max(0, Math.round(Number(covers) || 0));
        actions.completeOnboarding(
            {
                name: name.trim() || restaurant.name,
                cuisine,
                location: location.trim(),
                coversPerWeek: coversNum,
                distributor: distributor.trim(),
            },
            getState().dishes,
        );
        toast.success("Profile saved", "Your restaurant details are up to date.");
    }

    // ---- Margin assumptions (committed live to the store via setLevers) ----
    const setPriceLift = (v: number) => actions.setLevers({ priceLift: Math.max(0, v) });
    const setProduceCost = (v: number) => actions.setLevers({ produceCostDelta: Math.max(0, v) });
    const setAttach = (pctValue: number) =>
        actions.setLevers({ attachRate: Math.min(1, Math.max(0, pctValue / 100)) });

    const incrementalGp = Math.max(0, levers.priceLift - levers.produceCostDelta);

    return (
        <div className="mx-auto max-w-3xl animate-fade-up">
            <PageHeader eyebrow="Account" title="Settings" />

            <div className="flex flex-col gap-6">
                {/* 1. Restaurant profile */}
                <Card className="p-6 sm:p-7">
                    <SectionHead
                        icon={<User size={18} />}
                        title="Restaurant profile"
                        hint="How your kitchen shows up across CropConnect."
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FieldGroup label="Restaurant name" className="sm:col-span-2">
                            <Field value={name} onChange={(e) => setName(e.target.value)} placeholder="The Greenhouse" />
                        </FieldGroup>

                        <FieldGroup label="Cuisine">
                            <Select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                                {!CUISINES.includes(cuisine) && cuisine && <option value={cuisine}>{cuisine}</option>}
                                {CUISINES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </Select>
                        </FieldGroup>

                        <FieldGroup label="Covers per week" hint="Average guests served weekly.">
                            <Field
                                type="number"
                                min={0}
                                inputMode="numeric"
                                className="tnum"
                                value={covers}
                                onChange={(e) => setCovers(e.target.value)}
                            />
                        </FieldGroup>

                        <FieldGroup label="Location" className="sm:col-span-2">
                            <div className="relative">
                                <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                                <Field
                                    className="pl-10"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Sebastopol, CA"
                                />
                            </div>
                        </FieldGroup>

                        <FieldGroup label="Current distributor" hint="Who you buy through today." className="sm:col-span-2">
                            <Field
                                value={distributor}
                                onChange={(e) => setDistributor(e.target.value)}
                                placeholder="Sysco, US Foods…"
                            />
                        </FieldGroup>
                    </div>

                    <div className="divider my-6" />
                    <div className="flex items-center justify-end gap-3">
                        {profileDirty && <span className="text-[12.5px] text-ink-faint">Unsaved changes</span>}
                        <Button variant="primary" size="sm" onClick={saveProfile} disabled={!profileDirty}>
                            <Check size={15} />
                            Save profile
                        </Button>
                    </div>
                </Card>

                {/* 2. Margin assumptions */}
                <Card className="p-6 sm:p-7">
                    <SectionHead
                        icon={<MarginUp size={18} />}
                        title="Margin assumptions"
                        hint="The default levers behind every estimate in the app."
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <FieldGroup label="Price lift" hint="$ added per featured dish.">
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-ink-faint">$</span>
                                <Field
                                    type="number"
                                    min={0}
                                    step={0.25}
                                    inputMode="decimal"
                                    className="tnum pl-7"
                                    value={String(levers.priceLift)}
                                    onChange={(e) => setPriceLift(Number(e.target.value))}
                                />
                            </div>
                        </FieldGroup>

                        <FieldGroup label="Produce cost" hint="$ added cost per dish.">
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-ink-faint">$</span>
                                <Field
                                    type="number"
                                    min={0}
                                    step={0.25}
                                    inputMode="decimal"
                                    className="tnum pl-7"
                                    value={String(levers.produceCostDelta)}
                                    onChange={(e) => setProduceCost(Number(e.target.value))}
                                />
                            </div>
                        </FieldGroup>

                        <FieldGroup label="Attach rate" hint="Share of covers that order it.">
                            <div className="relative">
                                <Field
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={1}
                                    inputMode="decimal"
                                    className="tnum pr-8"
                                    value={String(Math.round(levers.attachRate * 100))}
                                    onChange={(e) => setAttach(Number(e.target.value))}
                                />
                                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] text-ink-faint">%</span>
                            </div>
                        </FieldGroup>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-xl bg-canvas-sunk px-4 py-3">
                        <Badge tone="brand">+{usd(incrementalGp)} / order</Badge>
                        <span className="text-[13px] text-ink-muted">
                            Incremental gross profit at {pct(levers.attachRate * 100)} attach.
                        </span>
                    </div>

                    <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
                        These power the margin estimates. Conservative defaults; everything is a range.
                    </p>
                </Card>

                {/* 3. Plan & billing (read-only) */}
                <Card className="p-6 sm:p-7">
                    <SectionHead
                        icon={<Receipt size={18} />}
                        title="Plan & billing"
                        hint="Simple and honest. We charge for the service, not your food."
                    />

                    <div className="rounded-2xl border border-line bg-canvas-soft p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <span className="font-display text-[1.6rem] leading-none text-ink tnum">{usd(SERVICE_FEE)}</span>
                                    <span className="text-[14px] text-ink-muted">/ month</span>
                                </div>
                                <p className="mt-1.5 text-[13.5px] text-ink-soft">
                                    Flat service fee. not a markup on your food, not a cut of GMV.
                                </p>
                            </div>
                            <Badge tone="brand" dot>Active</Badge>
                        </div>

                        <div className="divider my-5" />

                        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            {[
                                "Farm sourcing & matching",
                                "Provenance & menu story",
                                "Delivery orchestration",
                            ].map((f) => (
                                <li key={f} className="flex items-start gap-2 text-[13.5px] text-ink-soft">
                                    <Check size={15} className="mt-0.5 shrink-0 text-brand-500" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[12.5px] text-ink-faint">Billing handled securely by our payment processor.</span>
                        <Button variant="ghost" size="sm" disabled>Manage billing</Button>
                    </div>
                </Card>

                {/* 4. Team */}
                <Card className="p-6 sm:p-7">
                    <SectionHead
                        icon={<Shield size={18} />}
                        title="Team"
                        hint="Who can act on behalf of the kitchen."
                    />

                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-canvas-sunk px-4 py-3.5">
                        <div className="flex items-center gap-3">
                            <Avatar name={restaurant.name} size={40} />
                            <div>
                                <div className="text-[14.5px] font-semibold text-ink">{restaurant.name}</div>
                                <div className="text-[12.5px] text-ink-faint">{restaurant.location}</div>
                            </div>
                        </div>
                        <Badge tone="ink">Owner</Badge>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.success("Invites coming soon", "Teammate access is on the way.")}
                        >
                            <User size={15} />
                            Invite teammate
                        </Button>
                    </div>
                </Card>

                {/* 5. Danger zone */}
                <Card className={cn("p-6 sm:p-7", "border-danger/15")}>
                    <SectionHead
                        icon={<Repeat size={18} />}
                        title="Danger zone"
                        hint="Irreversible. start over with fresh sample data."
                    />

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="max-w-md text-[13.5px] text-ink-muted">
                            Reset clears your edits and restores the demo restaurant, farms, and sourcing flow.
                        </p>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                                actions.reset();
                                toast.success("Demo data reset", "Everything is back to the starting point.");
                            }}
                        >
                            <Settings size={15} />
                            Reset demo data
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
