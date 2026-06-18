import { reliability, type Profile } from "@/lib/types";
import { Shield, Sprout } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Fulfillment reliability — the trust primitive you can see BEFORE committing.
 * Derived from real confirmed-vs-missed delivery history on the profile.
 */
export function ReliabilityBadge({
    profile, size = "sm", className,
}: {
    profile: Pick<Profile, "deliveries_confirmed" | "deliveries_missed">;
    size?: "sm" | "lg";
    className?: string;
}) {
    const { rate, total } = reliability(profile);

    if (rate === null) {
        return (
            <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-2xs font-semibold text-ink-muted", className)}>
                <Sprout size={13} /> New to CropConnect
            </span>
        );
    }

    const tone = rate >= 95 ? "forest" : rate >= 80 ? "amber" : "berry";
    const toneCls =
        tone === "forest" ? "bg-forest-50 text-forest-600"
            : tone === "amber" ? "bg-harvest-400/12 text-harvest-500"
                : "bg-berry/8 text-berry";

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
            <Shield size={13} /> {rate}% reliable
            <span className="opacity-60">· {total}</span>
        </span>
    );
}
