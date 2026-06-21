"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { actions, useStore } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, Button, Field, Select, FieldGroup } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { ArrowRight, Leaf } from "@/components/icons";

const UNITS = ["lb", "case", "bunch", "flat", "dozen", "each"];
const CROPS = ["heirloom tomato", "salad greens", "summer squash", "specialty mushroom", "beets", "sweet corn", "peppers", "culinary herbs", "stone fruit", "berries"];

export default function NewNeedPage() {
    const router = useRouter();
    const toast = useToast();
    const dishes = useStore((s) => s.dishes);

    const [crop, setCrop] = React.useState("");
    const [dishName, setDishName] = React.useState("");
    const [qty, setQty] = React.useState(30);
    const [unit, setUnit] = React.useState("lb");
    const [ceiling, setCeiling] = React.useState(4);
    const [season, setSeason] = React.useState("Seasonal");
    const [saving, setSaving] = React.useState(false);

    const valid = crop.trim() && qty > 0;

    const submit = () => {
        if (!valid) { toast.error("Add a crop and a weekly quantity"); return; }
        setSaving(true);
        const id = actions.createNeed({ crop: crop.trim(), unit, qtyPerWeek: qty, priceCeiling: ceiling, dishName: dishName || `${crop} dish`, harvestWindow: season });
        toast.success("Request created", "We're matching local farms now.");
        router.push(`/app/sourcing/${id}`);
    };

    return (
        <div className="animate-fade-up">
            <PageHeader eyebrow="New request" title="Source an ingredient" subtitle="Tell us one thing you'd like to bring local. We'll match nearby farms and run the contract, deliveries, and story from there." />
            <Card className="max-w-2xl p-6">
                <div className="grid gap-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FieldGroup label="Ingredient">
                            <Field list="crops" placeholder="e.g. heirloom tomato" value={crop} onChange={(e) => setCrop(e.target.value)} />
                            <datalist id="crops">{CROPS.map((c) => <option key={c} value={c} />)}</datalist>
                        </FieldGroup>
                        <FieldGroup label="For which dish (optional)">
                            <Field list="dishes" placeholder="e.g. Heirloom tomato salad" value={dishName} onChange={(e) => setDishName(e.target.value)} />
                            <datalist id="dishes">{dishes.map((d) => <option key={d.id} value={d.name} />)}</datalist>
                        </FieldGroup>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <FieldGroup label="Quantity / week"><Field type="number" min={1} value={qty || ""} onChange={(e) => setQty(Number(e.target.value))} /></FieldGroup>
                        <FieldGroup label="Unit"><Select value={unit} onChange={(e) => setUnit(e.target.value)}>{UNITS.map((u) => <option key={u} value={u}>{u}</option>)}</Select></FieldGroup>
                        <FieldGroup label="Price ceiling / unit">
                            <div className="relative"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">$</span><Field type="number" min={0} step="0.25" className="pl-7" value={ceiling || ""} onChange={(e) => setCeiling(Number(e.target.value))} /></div>
                        </FieldGroup>
                    </div>

                    <FieldGroup label="Season / availability" hint="When you need it. We'll plan deliveries around the harvest window.">
                        <Field placeholder="e.g. Jun–Sep" value={season} onChange={(e) => setSeason(e.target.value)} />
                    </FieldGroup>

                    <div className="flex items-center justify-between rounded-xl bg-brand-50/60 px-4 py-3">
                        <span className="flex items-center gap-2 text-[13px] font-medium text-brand-700"><Leaf size={16} /> No commitment yet — you'll pick the farm and confirm terms next.</span>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={submit} loading={saving} disabled={!valid}>Find local farms <ArrowRight size={16} /></Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
