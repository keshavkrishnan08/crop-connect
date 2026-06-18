import { reliability, type Profile } from "@/lib/types";
import { Shield, Sprout, Handshake } from "@/components/icons";
import { cn } from "@/lib/utils";

type ReliabilityProfile = Pick<
    Profile,
    "role" | "deliveries_confirmed" | "deliveries_missed" | "completed_contracts" | "renewed_contracts"
>;

/**
 * The trust primitive you can see BEFORE committing — and it's two-sided:
 *   • Farms show fulfillment reliability (confirmed vs missed deliveries).
 *   • Buyers show how many contracts they've honored (completed + renewed) —
 *     the farm's answer to "will they actually pay and stay?"
 * New users read as "New", never a discouraging 0%.
 */
export function ReliabilityBadge({
    profile, size = "sm", className,
}: {
    profile: ReliabilityProfile;
    size?: "sm" | "lg";
    className?: string;
}) {
    return profile.role === "buyer"
        ? <BuyerTrust profile={profile} size={size} className={className} />
        : <FarmReliability profile={profile} size={size} className={className} />;
}

function FarmReliability({ profile, size, className }: { profile: ReliabilityProfile; size: "sm" | "lg"; className?: string }) {
    const { rate, total } = reliability(profile);
    if (rate === null) return <NewBadge size={size} className={className} />;

    const toneCls = rate >= 95 ? "bg-forest-50 text-forest-600" : rate >= 80 ? "bg-harvest-400/12 text-harvest-500" : "bg-berry/8 text-berry";

    if (size === "lg") {
        return (
            <div className={cn("flex items-center gap-3 rounded-2xl glass-tint p-3.5", className)}>
                <span className={cn("grid h-11 w-11 place-items-center rounded-xl", toneCls)}><Shield size={22} /></span>
                <div>
                    <p className="font-display text-2xl leading-none text-ink">{rate}%</p>
                    <p className="text-[12.5px] text-ink-muted">reliable · {total} {total === 1 ? "delivery" : "deliveries"}</p>
                </div>
            </div>
        );
    }
    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold", toneCls, className)}>
            <Shield size={13} /> {rate}% reliable <span className="opacity-60">· {total}</span>
        </span>
    );
}

function BuyerTrust({ profile, size, className }: { profile: ReliabilityProfile; size: "sm" | "lg"; className?: string }) {
    const honored = (profile.completed_contracts ?? 0) + (profile.renewed_contracts ?? 0);
    if (honored === 0) return <NewBadge size={size} className={className} />;

    const toneCls = "bg-forest-50 text-forest-600";

    if (size === "lg") {
        return (
            <div className={cn("flex items-center gap-3 rounded-2xl glass-tint p-3.5", className)}>
                <span className={cn("grid h-11 w-11 place-items-center rounded-xl", toneCls)}><Handshake size={22} /></span>
                <div>
                    <p className="font-display text-2xl leading-none text-ink">{honored}</p>
                    <p className="text-[12.5px] text-ink-muted">contracts honored{profile.renewed_contracts ? ` · ${profile.renewed_contracts} renewed` : ""}</p>
                </div>
            </div>
        );
    }
    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold", toneCls, className)}>
            <Handshake size={13} /> {honored} honored
            {profile.renewed_contracts ? <span className="opacity-60">· {profile.renewed_contracts} renewed</span> : null}
        </span>
    );
}

function NewBadge({ size, className }: { size: "sm" | "lg"; className?: string }) {
    if (size === "lg") {
        return (
            <div className={cn("flex items-center gap-3 rounded-2xl glass-tint p-3.5", className)}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/5 text-ink-muted"><Sprout size={22} /></span>
                <div>
                    <p className="font-display text-lg leading-none text-ink">New here</p>
                    <p className="text-[12.5px] text-ink-muted">building a track record</p>
                </div>
            </div>
        );
    }
    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-2xs font-semibold text-ink-muted", className)}>
            <Sprout size={13} /> New to CropConnect
        </span>
    );
}
