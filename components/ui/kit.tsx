import * as React from "react";
import Link from "next/link";
import { cn, initials, hashHue } from "@/lib/utils";

// ---------------- Button ----------------
type ButtonVariant = "primary" | "ghost" | "soft" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    ghost: "btn-ghost",
    soft: "btn-soft",
    danger: "btn bg-berry text-white px-5 h-11 hover:brightness-95",
};
const SIZE: Record<ButtonSize, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
    return cn(VARIANT[variant], SIZE[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={buttonClass(variant, size, className)}
            {...props}
        >
            {loading && <Spinner size={16} className={variant === "primary" || variant === "danger" ? "text-white" : ""} />}
            {children}
        </button>
    ),
);
Button.displayName = "Button";

export function LinkButton({
    href, variant = "primary", size = "md", className, children, ...props
}: { href: string; variant?: ButtonVariant; size?: ButtonSize } & React.ComponentProps<typeof Link>) {
    return (
        <Link href={href} className={buttonClass(variant, size, className)} {...props}>
            {children}
        </Link>
    );
}

// ---------------- GlassCard ----------------
export function GlassCard({
    className, children, hover = false, as: As = "div", ...props
}: { className?: string; children: React.ReactNode; hover?: boolean; as?: React.ElementType } & React.HTMLAttributes<HTMLElement>) {
    return (
        <As
            className={cn(
                "glass-card",
                hover && "transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-glass-lg",
                className,
            )}
            {...props}
        >
            {children}
        </As>
    );
}

// ---------------- Field / Textarea / Select ----------------
export const Field = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => <input ref={ref} className={cn("field", className)} {...props} />,
);
Field.displayName = "Field";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, rows = 4, ...props }, ref) => <textarea ref={ref} rows={rows} className={cn("field", className)} {...props} />,
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className, children, ...props }, ref) => (
        <select ref={ref} className={cn("select", className)} {...props}>{children}</select>
    ),
);
Select.displayName = "Select";

export function FieldGroup({ label, hint, children, className }: { label?: string; hint?: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            {label && <label className="label">{label}</label>}
            {children}
            {hint && <p className="mt-1.5 text-[12.5px] text-ink-faint">{hint}</p>}
        </div>
    );
}

// ---------------- Badge ----------------
type Tone = "neutral" | "amber" | "forest" | "sky" | "muted" | "berry";
const TONE: Record<Tone, string> = {
    neutral: "bg-ink/5 text-ink-soft",
    muted: "bg-ink/[0.04] text-ink-faint",
    amber: "bg-harvest-400/12 text-harvest-500",
    forest: "bg-forest-50 text-forest-600",
    sky: "bg-sky/10 text-sky",
    berry: "bg-berry/8 text-berry",
};
export function Badge({ tone = "neutral", className, children, dot }: { tone?: Tone; className?: string; children: React.ReactNode; dot?: boolean }) {
    return (
        <span className={cn("badge", TONE[tone], className)}>
            {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {children}
        </span>
    );
}

// ---------------- Avatar ----------------
export function Avatar({ name, src, size = 40, className }: { name?: string | null; src?: string | null; size?: number; className?: string }) {
    const hue = hashHue(name ?? "x");
    if (src) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={name ?? ""} width={size} height={size} className={cn("rounded-full object-cover ring-1 ring-line", className)} style={{ width: size, height: size }} />;
    }
    return (
        <span
            className={cn("grid place-items-center rounded-full font-semibold text-white ring-1 ring-white/40", className)}
            style={{
                width: size, height: size, fontSize: size * 0.36,
                background: `linear-gradient(140deg, hsl(${hue} 45% 42%), hsl(${(hue + 30) % 360} 50% 32%))`,
            }}
        >
            {initials(name)}
        </span>
    );
}

// ---------------- Spinner ----------------
export function Spinner({ size = 18, className }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={cn("animate-spin", className)} aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

// ---------------- Skeleton ----------------
export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("rounded-xl shimmer-line", className)} />;
}

// ---------------- SectionLabel ----------------
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={cn("inline-flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.16em] text-forest-600", className)}>
            <span className="h-px w-5 bg-forest-400/60" />
            {children}
        </span>
    );
}

// ---------------- EmptyState ----------------
export function EmptyState({ icon, title, description, action, className }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-col items-center justify-center rounded-3xl border border-dashed border-line-strong bg-paper-warm/60 px-6 py-14 text-center", className)}>
            {icon && <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-forest-500 shadow-glass">{icon}</div>}
            <h3 className="font-display text-xl text-ink">{title}</h3>
            {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
