"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getInvite, claimInvite, type InviteView } from "@/lib/queries";
import { contractValueCents, cadenceSummary } from "@/lib/contract";
import { formatMoney, formatDate } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { Button, LinkButton, Spinner } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { Handshake, Check, Wheat, ArrowRight, Shield, Scale, Truck } from "@/components/icons";

export default function InvitePage({ params }: { params: { token: string } }) {
    const router = useRouter();
    const toast = useToast();
    const [invite, setInvite] = React.useState<InviteView | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [authed, setAuthed] = React.useState(false);
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        try { localStorage.setItem("cc:pending-invite", params.token); } catch { /* noop */ }
        Promise.all([getInvite(params.token), supabase.auth.getSession()]).then(([inv, s]) => {
            setInvite(inv);
            setAuthed(!!s.data.session);
            setLoading(false);
        });
    }, [params.token]);

    const accept = async () => {
        setBusy(true);
        try {
            const contractId = await claimInvite(params.token);
            try { localStorage.removeItem("cc:pending-invite"); } catch { /* noop */ }
            toast.success("Contract created", "Review and confirm the terms.");
            router.push(`/app/contracts/${contractId}`);
        } catch (e) {
            toast.error("Couldn't accept", e instanceof Error ? e.message : "The invite may already be used.");
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-paper bg-aurora">
            <div className="mx-auto flex max-w-lg flex-col px-5 py-8">
                <Logo href="/" className="mb-8" />

                {loading ? (
                    <div className="grid h-[50vh] place-items-center"><Spinner size={26} className="text-forest-500" /></div>
                ) : !invite ? (
                    <div className="glass-card p-8 text-center">
                        <h1 className="font-display text-2xl text-ink">This invite isn't valid</h1>
                        <p className="mt-2 text-sm text-ink-muted">The link may be mistyped or expired.</p>
                        <LinkButton href="/" variant="ghost" className="mt-5">Go to CropConnect</LinkButton>
                    </div>
                ) : invite.status === "claimed" ? (
                    <div className="glass-card p-8 text-center">
                        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-forest-50 text-forest-500"><Check size={28} /></div>
                        <h1 className="font-display text-2xl text-ink">Already accepted</h1>
                        <p className="mt-2 text-sm text-ink-muted">This contract has been created.</p>
                        <LinkButton href={authed ? `/app/contracts/${invite.contract_id}` : "/login"} className="mt-5">Open it <ArrowRight size={16} /></LinkButton>
                    </div>
                ) : (
                    <div className="glass-card animate-fade-up p-7">
                        <div className="flex items-center gap-3">
                            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-50 text-forest-600"><Handshake size={24} /></span>
                            <div>
                                <p className="text-2xs font-semibold uppercase tracking-wide text-forest-600">Supply contract invite</p>
                                <h1 className="font-display text-2xl leading-tight text-ink">{invite.inviter_org || invite.inviter_name} wants to make it official</h1>
                            </div>
                        </div>

                        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                            They'd like to put your existing arrangement on a clear, flexible contract — with guaranteed payment, written terms, and delivery handled.
                        </p>

                        {/* terms summary */}
                        <div className="mt-5 rounded-2xl border border-line bg-paper-warm/60 p-4">
                            <div className="flex items-center gap-2.5">
                                <Wheat size={18} className="text-forest-600" />
                                <p className="font-display text-xl text-ink">{invite.terms.crop || "Produce"}</p>
                            </div>
                            <p className="mt-1 text-sm text-ink-muted">{cadenceSummary(invite.terms)}</p>
                            <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
                                <div>
                                    <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">Committed value</p>
                                    <p className="font-display text-2xl text-forest-600">{formatMoney(contractValueCents(invite.terms))}</p>
                                </div>
                                <p className="text-right text-[13px] text-ink-muted">{formatDate(invite.terms.term_start)}–{formatDate(invite.terms.term_end)}</p>
                            </div>
                        </div>
                        {invite.note && <p className="mt-3 rounded-xl bg-white/70 px-3.5 py-2.5 text-[13px] text-ink-soft">“{invite.note}”</p>}

                        <div className="mt-5 grid grid-cols-3 gap-2">
                            {[{ i: <Scale size={14} />, t: "Guaranteed pay" }, { i: <Shield size={14} />, t: "Written terms" }, { i: <Truck size={14} />, t: "Delivery handled" }].map((x) => (
                                <div key={x.t} className="flex items-center gap-1.5 rounded-xl bg-forest-50/60 px-2.5 py-2 text-[12px] font-medium text-forest-700">
                                    <span>{x.i}</span> {x.t}
                                </div>
                            ))}
                        </div>

                        {authed ? (
                            <Button className="mt-6 w-full" onClick={accept} loading={busy}><Check size={18} /> Accept & create contract</Button>
                        ) : (
                            <div className="mt-6 space-y-2">
                                <LinkButton href="/signup" className="w-full">Create a free account to accept <ArrowRight size={16} /></LinkButton>
                                <p className="text-center text-[12.5px] text-ink-muted">Already have one? <Link href="/login" className="font-semibold text-forest-600 hover:underline">Sign in</Link>, then reopen this link.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
