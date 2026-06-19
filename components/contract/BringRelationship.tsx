"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { searchProfiles, createDirectContract, createInvite } from "@/lib/queries";
import { emptyTerms } from "@/lib/contract";
import { type Profile, type Terms, type Role } from "@/lib/types";
import { Button, Field, FieldGroup, Avatar, Spinner } from "@/components/ui/kit";
import { TermsForm } from "@/components/contract/TermsForm";
import { useToast } from "@/components/ui/Toast";
import { Handshake, X, Search, ArrowRight, Check, Copy, Shield, Truck, Scale, Plus } from "@/components/icons";
import { cn } from "@/lib/utils";

export function BringRelationshipButton({ className, label = "Bring a deal online", variant = "primary" }: { className?: string; label?: string; variant?: "primary" | "soft" | "ghost" }) {
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <Button variant={variant} className={className} onClick={() => setOpen(true)}><Handshake size={17} /> {label}</Button>
            {open && <BringRelationshipModal onClose={() => setOpen(false)} />}
        </>
    );
}

type Step = "who" | "terms" | "link";

function BringRelationshipModal({ onClose }: { onClose: () => void }) {
    const { profile } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const meRole: Role = profile?.role ?? "farm";
    const oppositeRole: Role = meRole === "farm" ? "buyer" : "farm";
    const counterWord = meRole === "farm" ? "buyer" : "supplier";

    const [step, setStep] = React.useState<Step>("who");
    const [mode, setMode] = React.useState<"existing" | "invite">("existing");
    const [q, setQ] = React.useState("");
    const [results, setResults] = React.useState<Profile[]>([]);
    const [searching, setSearching] = React.useState(false);
    const [selected, setSelected] = React.useState<Profile | null>(null);
    const [inviteName, setInviteName] = React.useState("");
    const [inviteEmail, setInviteEmail] = React.useState("");
    const [terms, setTerms] = React.useState<Terms>(() => emptyTerms());
    const [ceiling, setCeiling] = React.useState<number | null>(null);
    const [note, setNote] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [link, setLink] = React.useState("");
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    }, [onClose]);

    React.useEffect(() => {
        if (mode !== "existing" || q.trim().length < 2 || !profile) { setResults([]); return; }
        let active = true;
        setSearching(true);
        const t = setTimeout(() => {
            searchProfiles(q, profile.id, oppositeRole).then((r) => { if (active) { setResults(r); setSearching(false); } });
        }, 220);
        return () => { active = false; clearTimeout(t); };
    }, [q, mode, profile, oppositeRole]);

    const valid = terms.crop.trim() && terms.quantity > 0 && terms.unit_price_cents > 0;

    async function sendToExisting() {
        if (!profile || !selected || !valid) { toast.error("Add a crop, amount and price"); return; }
        setBusy(true);
        try {
            const c = await createDirectContract({ meId: profile.id, meRole, counterpartyId: selected.id, terms, note });
            toast.success("Sent", `${selected.org_name || selected.full_name} can review and confirm.`);
            onClose();
            router.push(`/app/contracts/${c.id}`);
        } catch { toast.error("Couldn't send", "Please try again."); setBusy(false); }
    }

    async function makeInvite() {
        if (!profile || !valid) { toast.error("Add a crop, amount and price"); return; }
        setBusy(true);
        try {
            const token = await createInvite({ meId: profile.id, meRole, email: inviteEmail || undefined, name: inviteName || undefined, terms, note });
            setLink(`${window.location.origin}/invite/${token}`);
            setStep("link");
        } catch { toast.error("Couldn't create invite"); }
        finally { setBusy(false); }
    }

    const copy = async () => {
        try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* noop */ }
    };

    return (
        <div className="fixed inset-0 z-[120] grid place-items-start justify-center overflow-y-auto p-4 sm:place-items-center">
            <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative z-10 my-auto w-full max-w-2xl glass-card p-6 animate-scale-in sm:p-7">
                <button onClick={onClose} className="absolute right-4 top-4 text-ink-faint hover:text-ink"><X size={18} /></button>

                {/* header */}
                <div className="mb-5 flex items-start gap-3 pr-8">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest-50 text-forest-600"><Handshake size={22} /></span>
                    <div>
                        <h2 className="font-display text-2xl leading-tight text-ink">Bring a relationship online</h2>
                        <p className="mt-1 text-[13px] text-ink-muted">Already work with a {counterWord}? Keep them — just add escrow, paperwork and drop-off. Two minutes.</p>
                    </div>
                </div>

                {/* value strip */}
                {step !== "link" && (
                    <div className="mb-5 grid grid-cols-3 gap-2">
                        {[{ i: <Scale size={14} />, t: "Guaranteed pay" }, { i: <Shield size={14} />, t: "Written terms" }, { i: <Truck size={14} />, t: "We do the driving" }].map((x) => (
                            <div key={x.t} className="flex items-center gap-1.5 rounded-xl bg-paper-warm/70 px-2.5 py-2 text-[12px] font-medium text-ink-soft">
                                <span className="text-forest-600">{x.i}</span> {x.t}
                            </div>
                        ))}
                    </div>
                )}

                {step === "who" && (
                    <div>
                        <div className="mb-3 flex gap-1.5">
                            <Tab active={mode === "existing"} onClick={() => setMode("existing")}>They're on CropConnect</Tab>
                            <Tab active={mode === "invite"} onClick={() => setMode("invite")}>Not yet — invite them</Tab>
                        </div>

                        {mode === "existing" ? (
                            <>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"><Search size={16} /></span>
                                    <Field className="pl-10" autoFocus placeholder={`Search your ${counterWord} by name, business or email`} value={q} onChange={(e) => setQ(e.target.value)} />
                                </div>
                                <div className="mt-2 max-h-56 overflow-y-auto">
                                    {searching && <div className="grid place-items-center py-6"><Spinner size={20} className="text-forest-500" /></div>}
                                    {!searching && q.trim().length >= 2 && results.length === 0 && (
                                        <p className="px-1 py-4 text-center text-sm text-ink-muted">No match. Try “Invite them” instead.</p>
                                    )}
                                    {results.map((p) => (
                                        <button key={p.id} onClick={() => { setSelected(p); setStep("terms"); }} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-paper-warm/70">
                                            <Avatar name={p.full_name} src={p.avatar_url} size={36} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-ink">{p.org_name || p.full_name}</p>
                                                <p className="truncate text-[12.5px] text-ink-muted">{p.location_label || p.email || (p.role === "farm" ? "Farm" : "Buyer")}</p>
                                            </div>
                                            <ArrowRight size={15} className="text-ink-faint" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <FieldGroup label={`Your ${counterWord}'s name / business`}>
                                    <Field autoFocus placeholder="e.g. Rosewood Bistro" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
                                </FieldGroup>
                                <FieldGroup label="Their email (optional)" hint="Just for your reference — you'll get a link to send them however you like.">
                                    <Field type="email" placeholder="name@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                                </FieldGroup>
                                <Button className="w-full" onClick={() => setStep("terms")}><Plus size={16} /> Set the terms</Button>
                            </div>
                        )}
                    </div>
                )}

                {step === "terms" && (
                    <div>
                        <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-forest-50/60 px-3.5 py-2.5">
                            {selected ? <Avatar name={selected.full_name} src={selected.avatar_url} size={28} /> : <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-forest-600"><Handshake size={15} /></span>}
                            <p className="text-[13px] font-medium text-ink">With {selected ? (selected.org_name || selected.full_name) : (inviteName || "your invite")}</p>
                            <button onClick={() => setStep("who")} className="ml-auto text-[12.5px] font-semibold text-forest-600 hover:underline">Change</button>
                        </div>

                        <TermsForm value={terms} onChange={setTerms} showCeiling={meRole === "buyer"} ceilingCents={ceiling} onCeilingChange={setCeiling} />
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="A note to confirm what you already agreed (optional)…" className="field mt-4 h-auto py-3" />

                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setStep("who")}>Back</Button>
                            {selected
                                ? <Button onClick={sendToExisting} loading={busy} disabled={!valid}>Send to {selected.org_name || selected.full_name?.split(" ")[0]} <ArrowRight size={16} /></Button>
                                : <Button onClick={makeInvite} loading={busy} disabled={!valid}>Create invite link <ArrowRight size={16} /></Button>}
                        </div>
                    </div>
                )}

                {step === "link" && (
                    <div className="text-center">
                        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-forest-50 text-forest-500"><Check size={28} /></div>
                        <h3 className="font-display text-2xl text-ink">Your invite is ready</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">Send this link to {inviteName || `your ${counterWord}`} however you usually reach them. When they open it and join, the contract is created for both of you.</p>
                        <div className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-xl border border-line bg-paper-warm/70 p-1.5 pl-3.5">
                            <span className="flex-1 truncate text-left text-[13px] text-ink-soft">{link}</span>
                            <Button size="sm" onClick={copy}>{copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}</Button>
                        </div>
                        <Button variant="ghost" className="mt-5" onClick={onClose}>Done</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={cn("flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition", active ? "bg-forest-500 text-white" : "bg-paper-sunk text-ink-soft hover:bg-paper-warm")}>
            {children}
        </button>
    );
}
