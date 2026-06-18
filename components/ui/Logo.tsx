import Link from "next/link";
import { Mark } from "@/components/icons";
import { cn } from "@/lib/utils";

export function Logo({
    href = "/",
    className,
    mono = false,
    size = "md",
}: {
    href?: string | null;
    className?: string;
    mono?: boolean;
    size?: "sm" | "md" | "lg";
}) {
    const dims = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
    const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
    const inner = (
        <span className={cn("inline-flex items-center gap-2.5", className)}>
            <span
                className={cn(
                    "relative grid place-items-center rounded-2xl text-white overflow-hidden",
                    dims,
                    mono ? "bg-ink" : "bg-forest-600",
                )}
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 8px 20px -8px rgba(30,142,90,.6)" }}
            >
                <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <Mark size={size === "lg" ? 26 : 22} strokeWidth={1.8} className="relative" />
            </span>
            <span className={cn("font-display tracking-tight leading-none", text)}>
                Crop<span className="text-forest-600">Connect</span>
            </span>
        </span>
    );
    if (href === null) return inner;
    return <Link href={href} className="focus-ring rounded-2xl">{inner}</Link>;
}
