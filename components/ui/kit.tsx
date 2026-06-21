import * as React from "react";
import Link from "next/link";
import { cn, initials } from "@/lib/utils";

type Variant = "primary" | "dark" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg";
const VAR: Record<Variant, string> = { primary: "btn-primary", dark: "btn-dark", ghost: "btn-ghost", soft: "btn-soft", danger: "btn bg-danger text-white px-5 h-11 hover:brightness-95" };
const SZ: Record<Size, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };
export function buttonClass(v: Variant = "primary", s: Size = "md", className?: string) { return cn(VAR[v], SZ[s], className); }

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean; }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "primary", size = "md", loading, className, children, disabled, ...p }, ref) => (
    <button ref={ref} disabled={disabled || loading} className={buttonClass(variant, size, className)} {...p}>
        {loading && <Spinner size={16} className={variant === "primary" || variant === "dark" || variant === "danger" ? "text-white" : ""} />}{children}
    </button>
));
Button.displayName = "Button";

export function LinkButton({ href, variant = "primary", size = "md", className, children, ...p }: { href: string; variant?: Variant; size?: Size } & React.ComponentProps<typeof Link>) {
    return <Link href={href} className={buttonClass(variant, size, className)} {...p}>{children}</Link>;
}

export function Card({ className, children, hover, as: As = "div", ...p }: { className?: string; children: React.ReactNode; hover?: boolean; as?: React.ElementType } & React.HTMLAttributes<HTMLElement>) {
    return <As className={cn("card", hover && "transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift", className)} {...p}>{children}</As>;
}
export function Glass({ className, children, ...p }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("glass", className)} {...p}>{children}</div>;
}

export const Field = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => <input ref={ref} className={cn("field", className)} {...p} />);
Field.displayName = "Field";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, rows = 4, ...p }, ref) => <textarea ref={ref} rows={rows} className={cn("field", className)} {...p} />);
Textarea.displayName = "Textarea";
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => <select ref={ref} className={cn("select", className)} {...p}>{children}</select>);
Select.displayName = "Select";

export function FieldGroup({ label, hint, children, className }: { label?: string; hint?: string; children: React.ReactNode; className?: string }) {
    return <div className={className}>{label && <label className="label">{label}</label>}{children}{hint && <p className="mt-1.5 text-[12.5px] text-ink-faint">{hint}</p>}</div>;
}

type Tone = "brand" | "harvest" | "ink" | "danger";
export function Badge({ tone = "ink", className, children, dot }: { tone?: Tone; className?: string; children: React.ReactNode; dot?: boolean }) {
    const t = tone === "brand" ? "badge-brand" : tone === "harvest" ? "badge-harvest" : tone === "danger" ? "badge bg-danger/8 text-danger" : "badge-ink";
    return <span className={cn(t, className)}>{dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}</span>;
}

export function Avatar({ name, src, size = 40, className }: { name?: string | null; src?: string | null; size?: number; className?: string }) {
    if (src) { /* eslint-disable-next-line @next/next/no-img-element */ return <img src={src} alt={name ?? ""} width={size} height={size} className={cn("rounded-full object-cover ring-1 ring-line", className)} style={{ width: size, height: size }} />; }
    return <span className={cn("grid place-items-center rounded-full bg-brand-600 font-semibold text-white ring-1 ring-white/30", className)} style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials(name)}</span>;
}

export function Spinner({ size = 18, className }: { size?: number; className?: string }) {
    return (<svg width={size} height={size} viewBox="0 0 24 24" className={cn("animate-spin", className)} aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" /><path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>);
}
export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("rounded-lg bg-ink/[0.05]", className)} style={{ background: "linear-gradient(90deg, rgba(22,36,28,0.04), rgba(22,36,28,0.08), rgba(22,36,28,0.04))", backgroundSize: "200% 100%" }} />;
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
    return <span className={cn("eyebrow", className)}><span className="h-px w-5 bg-brand-400/60" />{children}</span>;
}

export function EmptyState({ icon, title, description, action, className }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-canvas px-6 py-14 text-center", className)}>
            {icon && <div className="mb-4 grid h-13 w-13 place-items-center rounded-xl bg-white text-brand-500 shadow-card" style={{ width: 52, height: 52 }}>{icon}</div>}
            <h3 className="font-display text-xl text-ink">{title}</h3>
            {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
