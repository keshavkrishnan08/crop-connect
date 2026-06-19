"use client";

import * as React from "react";
import { type Contract } from "@/lib/types";
import { startStripeConnect } from "@/lib/payments";
import { GlassCard, Button } from "@/components/ui/kit";
import { useToast } from "@/components/ui/Toast";
import { Shield, Check, Scale } from "@/components/icons";

/** Escrow setup + status. Farms connect a payout account; buyers fund deliveries. */
export function PaymentsPanel({ contract, isFarm }: { contract: Contract; isFarm: boolean }) {
    const toast = useToast();
    const [loading, setLoading] = React.useState(false);
    const farmReady = !!contract.farm?.stripe_payouts_enabled;

    const connect = async () => {
        setLoading(true);
        try {
            const res = await startStripeConnect();
            if (res.url) { window.location.href = res.url; return; }
            toast.error(res.error === "Payments not configured" ? "Payments aren't enabled on this deployment yet" : "Couldn't start setup");
        } finally { setLoading(false); }
    };

    return (
        <GlassCard className="p-5">
            <div className="mb-3 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-50 text-forest-600"><Scale size={18} /></span>
                <div>
                    <h3 className="font-display text-lg leading-none text-ink">Payments</h3>
                    <p className="mt-0.5 text-[13px] text-ink-muted">Escrow — paid on confirmed delivery</p>
                </div>
            </div>

            {isFarm ? (
                farmReady ? (
                    <p className="inline-flex items-center gap-1.5 rounded-xl bg-forest-50 px-3 py-2 text-[13px] font-medium text-forest-600">
                        <Check size={15} /> Payouts active — you'll be paid when deliveries are confirmed.
                    </p>
                ) : (
                    <>
                        <p className="mb-3 text-[13px] leading-relaxed text-ink-muted">
                            Connect a bank account so buyers can pay you through CropConnect. Money is held in escrow and released to you the moment a delivery is confirmed — no more chasing invoices.
                        </p>
                        <Button className="w-full" onClick={connect} loading={loading}><Shield size={16} /> Connect payouts</Button>
                    </>
                )
            ) : farmReady ? (
                <p className="text-[13px] leading-relaxed text-ink-muted">
                    You fund each delivery into escrow up front; the farm is paid automatically when you confirm receipt. CropConnect holds a 5% fee on release.
                </p>
            ) : (
                <p className="rounded-xl bg-paper-warm px-3 py-2.5 text-[13px] text-ink-muted">
                    This farm hasn't set up payouts yet, so payments stay off-platform for now.
                </p>
            )}
        </GlassCard>
    );
}
