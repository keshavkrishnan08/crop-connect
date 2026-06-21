import * as React from "react";
import { cn } from "@/lib/utils";

/** Custom icon set — 24px grid · 1.6 stroke · round caps · currentColor. No icon library. */
export interface IconProps extends React.SVGProps<SVGSVGElement> { size?: number; strokeWidth?: number; }

function Base({ size = 22, strokeWidth = 1.6, className, children, ...p }: IconProps & { children: React.ReactNode }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
            className={cn("shrink-0", className)} aria-hidden {...p}>
            {children}
        </svg>
    );
}

// Brand mark — sprout rising through a plate line (farm → plate)
export const Mark = (p: IconProps) => (
    <Base {...p} strokeWidth={p.strokeWidth ?? 1.7}>
        <path d="M12 21v-7" />
        <path d="M12 14c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6Z" />
        <path d="M12 12.5c0-2.8 2.2-5 5-5 0 2.8-2.2 5-5 5Z" />
        <path d="M4 21h16" />
    </Base>
);

export const Leaf = (p: IconProps) => (<Base {...p}><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13Z" /><path d="M5 19c3-5 6-7 10-9" /></Base>);
export const Sprout = (p: IconProps) => (<Base {...p}><path d="M12 20v-7" /><path d="M12 13c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6Z" /><path d="M12 11c0-2.8 2.2-5 5-5 0 2.8-2.2 5-5 5Z" /></Base>);
export const Farm = (p: IconProps) => (<Base {...p}><path d="M4 10 12 4l8 6v10H4V10Z" /><path d="M9 20v-6h6v6" /><path d="M4 13h16" /></Base>);

export const Route = (p: IconProps) => (<Base {...p}><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="6" r="2.2" /><path d="M8 17h6a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h3" /></Base>);

// menu card — a card with text lines + a price tick
export const MenuCard = (p: IconProps) => (<Base {...p}><rect x="4" y="3.5" width="16" height="17" rx="2.2" /><path d="M8 8h8M8 11.5h6M8 15h4" /><path d="M15.5 15h.5" /></Base>);

// story tag (provenance)
export const StoryTag = (p: IconProps) => (<Base {...p}><path d="M4 4h7l9 9-7 7-9-9V4Z" /><circle cx="8.5" cy="8.5" r="1.4" /></Base>);

// margin up — bar + rising arrow
export const MarginUp = (p: IconProps) => (<Base {...p}><path d="M4 20h16" /><path d="M7 20v-5M12 20v-9M17 20v-7" /><path d="M14 6l3-2 2 3" /><path d="M17 4c-2.5 2.5-5 3.5-9 4" /></Base>);
export const TrendUp = (p: IconProps) => (<Base {...p}><path d="M4 15l5-5 3 3 7-7" /><path d="M16 6h4v4" /></Base>);

export const Plate = (p: IconProps) => (<Base {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /></Base>);
export const Truck = (p: IconProps) => (<Base {...p}><path d="M3 6h10v9H3z" /><path d="M13 9h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></Base>);

export const Nodes = (p: IconProps) => (<Base {...p}><rect x="3" y="9" width="5" height="6" rx="1.4" /><rect x="16" y="4" width="5" height="6" rx="1.4" /><rect x="16" y="14" width="5" height="6" rx="1.4" /><path d="M8 12h4a2 2 0 0 0 2-2V7M8 12h4a2 2 0 0 1 2 2v3" /></Base>);
export const Receipt = (p: IconProps) => (<Base {...p}><path d="M6 3h12v18l-3-1.5L12 21l-3-1.5L6 21V3Z" /><path d="M9 8h6M9 12h6" /></Base>);
export const Dashboard = (p: IconProps) => (<Base {...p}><rect x="3.5" y="3.5" width="7" height="9" rx="1.6" /><rect x="3.5" y="15" width="7" height="5.5" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="5.5" rx="1.6" /><rect x="13.5" y="11.5" width="7" height="9" rx="1.6" /></Base>);

export const Search = (p: IconProps) => (<Base {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></Base>);
export const Sparkle = (p: IconProps) => (<Base {...p}><path d="M12 3c.6 3.6 1.8 4.8 5.4 5.4-3.6.6-4.8 1.8-5.4 5.4-.6-3.6-1.8-4.8-5.4-5.4C10.2 7.8 11.4 6.6 12 3Z" /><path d="M18.5 14c.3 1.7.9 2.3 2.6 2.6-1.7.3-2.3.9-2.6 2.6-.3-1.7-.9-2.3-2.6-2.6 1.7-.3 2.3-.9 2.6-2.6Z" /></Base>);
export const Pen = (p: IconProps) => (<Base {...p}><path d="M15.5 5.5 18.5 8.5 8 19l-4 1 1-4 10.5-10.5Z" /><path d="M14 7 17 10" /></Base>);
export const Check = (p: IconProps) => (<Base {...p}><path d="m5 12.5 4.5 4.5L19 7" /></Base>);
export const X = (p: IconProps) => (<Base {...p}><path d="M6 6 18 18M18 6 6 18" /></Base>);
export const Plus = (p: IconProps) => (<Base {...p}><path d="M12 5v14M5 12h14" /></Base>);
export const Minus = (p: IconProps) => (<Base {...p}><path d="M5 12h14" /></Base>);
export const ArrowRight = (p: IconProps) => (<Base {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Base>);
export const ArrowUpRight = (p: IconProps) => (<Base {...p}><path d="M7 17 17 7M8 7h9v9" /></Base>);
export const ChevronRight = (p: IconProps) => (<Base {...p}><path d="m9 6 6 6-6 6" /></Base>);
export const Calendar = (p: IconProps) => (<Base {...p}><rect x="3.5" y="5" width="17" height="16" rx="2.4" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></Base>);
export const Clock = (p: IconProps) => (<Base {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Base>);
export const MapPin = (p: IconProps) => (<Base {...p}><path d="M12 21c4-4.5 6.5-7.7 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 13.3 8 16.5 12 21Z" /><circle cx="12" cy="10.5" r="2.3" /></Base>);
export const Settings = (p: IconProps) => (<Base {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M3 12h2.5M18.5 12H21M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></Base>);
export const User = (p: IconProps) => (<Base {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1-3.6 4-5.5 7-5.5s6 1.9 7 5.5" /></Base>);
export const Shield = (p: IconProps) => (<Base {...p}><path d="M12 3.5 19 6v5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6l7-2.5Z" /><path d="m9 12 2 2 4-4" /></Base>);
export const Qr = (p: IconProps) => (<Base {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.2" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.2" /><path d="M14 14h3v3M20 14v.01M20 20v-3M14 20h3" /></Base>);
export const Star = ({ filled, ...p }: IconProps & { filled?: boolean }) => (<Base {...p} fill={filled ? "currentColor" : "none"}><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" /></Base>);
export const Bell = (p: IconProps) => (<Base {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5h-15L6 16Z" /><path d="M10 19a2 2 0 0 0 4 0" /></Base>);
export const Menu = (p: IconProps) => (<Base {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Base>);
export const Logout = (p: IconProps) => (<Base {...p}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M10 12h9M16 8l3 4-3 4" /></Base>);
export const Dot = (p: IconProps) => (<Base {...p}><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" /></Base>);
export const Upload = (p: IconProps) => (<Base {...p}><path d="M12 16V5M7.5 9 12 4.5 16.5 9" /><path d="M4.5 19.5h15" /></Base>);
export const Link = (p: IconProps) => (<Base {...p}><path d="M9 15l6-6" /><path d="M11 7l1-1a3.5 3.5 0 0 1 5 5l-1 1M13 17l-1 1a3.5 3.5 0 0 1-5-5l1-1" /></Base>);
export const Copy = (p: IconProps) => (<Base {...p}><rect x="9" y="9" width="11" height="11" rx="2.2" /><path d="M5 15a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2" /></Base>);
export const Repeat = (p: IconProps) => (<Base {...p}><path d="M4 9a5 5 0 0 1 5-5h7l-2.5-2.5M20 15a5 5 0 0 1-5 5H8l2.5 2.5" /><path d="M16 4l2.5 2.5L16 9M8 20l-2.5-2.5L8 15" /></Base>);
export const Handshake = (p: IconProps) => (<Base {...p}><path d="m3 11 3-3 4 1 2-1.5 2 1.5 4-1 3 3" /><path d="M8 9.5 5.5 12a1.6 1.6 0 0 0 2.3 2.2l.7-.7.9.9a1.5 1.5 0 0 0 2.2-2" /><path d="m11 14 1.4 1.4a1.5 1.5 0 0 0 2.2-2l-.6-.6" /><path d="M13 12.4 14.5 14a1.5 1.5 0 0 0 2.2-2.1L15 10" /></Base>);
