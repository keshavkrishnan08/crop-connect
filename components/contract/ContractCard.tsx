import Link from "next/link";
import { Avatar } from "@/components/ui/kit";
import { StatusBadge } from "@/components/contract/StatusBadge";
import { Wheat, ArrowRight, Calendar, Repeat } from "@/components/icons";
import { type Contract } from "@/lib/types";
import { contractValueCents } from "@/lib/contract";
import { formatMoney, formatDate, cadenceLabelShort } from "@/lib/display";

export function ContractCard({ contract, viewerId }: { contract: Contract; viewerId: string }) {
    const t = contract.terms;
    const other = contract.farm_id === viewerId ? contract.buyer : contract.farm;
    const otherRole = contract.farm_id === viewerId ? "Buyer" : "Farm";
    const nextDelivery = contract.deliveries?.find((d) => d.status === "scheduled");

    return (
        <Link
            href={`/app/contracts/${contract.id}`}
            className="group glass-card block p-5 transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-glass-lg"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-50 text-forest-600">
                        <Wheat size={22} />
                    </span>
                    <div>
                        <h3 className="font-display text-xl leading-tight text-ink">{t.crop || "Untitled"}</h3>
                        <p className="text-[13px] text-ink-muted">{cadenceLabelShort(t)}</p>
                    </div>
                </div>
                <StatusBadge status={contract.status} />
            </div>

            <div className="my-4 divider" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Avatar name={other?.full_name} src={other?.avatar_url} size={30} />
                    <div className="leading-tight">
                        <p className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">{otherRole}</p>
                        <p className="text-sm font-semibold text-ink">{other?.org_name || other?.full_name || "—"}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-display text-xl text-forest-600">{formatMoney(contractValueCents(t))}</p>
                    <p className="text-2xs font-medium uppercase tracking-wide text-ink-faint">committed</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[13px] text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                    {contract.status === "renewed" ? <Repeat size={15} /> : <Calendar size={15} />}
                    {nextDelivery ? `Next ${formatDate(nextDelivery.scheduled_date)}` : `${formatDate(t.term_start)}–${formatDate(t.term_end)}`}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-forest-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Open <ArrowRight size={15} />
                </span>
            </div>
        </Link>
    );
}
