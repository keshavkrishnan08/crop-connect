import Link from "next/link";
import { Mark } from "@/components/icons";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className, size = "md", invert = false }: { href?: string | null; className?: string; size?: "sm" | "md" | "lg"; invert?: boolean }) {
    const dims = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
    const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
    const inner = (
        <span className={cn("inline-flex items-center gap-2.5", className)}>
            <span className={cn("relative grid place-items-center rounded-xl text-white overflow-hidden", dims, invert ? "bg-white text-brand-700" : "bg-brand-600")}
                style={{ boxShadow: invert ? undefined : "inset 0 1px 0 rgba(255,255,255,.2), 0 8px 18px -10px rgba(35,92,58,.6)" }}>
                <Mark size={size === "lg" ? 25 : 21} strokeWidth={1.8} />
            </span>
            <span className={cn("font-display tracking-tight leading-none", text, invert && "text-white")}>
                Crop<span className={invert ? "text-brand-200" : "text-brand-600"}>Connect</span>
            </span>
        </span>
    );
    if (href === null) return inner;
    return <Link href={href} className="focus-ring rounded-xl">{inner}</Link>;
}
