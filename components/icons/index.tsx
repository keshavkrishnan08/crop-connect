import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Fully custom icon set for CropConnect. Single visual language:
 * 24px grid · 1.6 stroke · round caps/joins · currentColor.
 * No third-party icon library is used anywhere in the product.
 */

export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    strokeWidth?: number;
}

function Base({ size = 22, strokeWidth = 1.6, className, children, ...props }: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("shrink-0", className)}
            aria-hidden="true"
            {...props}
        >
            {children}
        </svg>
    );
}

export const Sprout = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 20v-7" />
        <path d="M12 13c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6Z" />
        <path d="M12 11c0-2.8 2.2-5 5-5 0 2.8-2.2 5-5 5Z" />
        <path d="M8 20h8" />
    </Base>
);

export const Leaf = (p: IconProps) => (
    <Base {...p}>
        <path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13Z" />
        <path d="M5 19c3-5 6-7 10-9" />
    </Base>
);

export const Wheat = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 21V8" />
        <path d="M12 8c-1.6-.7-2.6-2.3-2.6-4 1.6.7 2.6 2.3 2.6 4Z" />
        <path d="M12 8c1.6-.7 2.6-2.3 2.6-4-1.6.7-2.6 2.3-2.6 4Z" />
        <path d="M12 13c-1.6-.7-2.6-2.3-2.6-4 1.6.7 2.6 2.3 2.6 4Z" />
        <path d="M12 13c1.6-.7 2.6-2.3 2.6-4-1.6.7-2.6 2.3-2.6 4Z" />
        <path d="M12 18c-1.6-.7-2.6-2.3-2.6-4 1.6.7 2.6 2.3 2.6 4Z" />
        <path d="M12 18c1.6-.7 2.6-2.3 2.6-4-1.6.7-2.6 2.3-2.6 4Z" />
    </Base>
);

// Brand mark — a sprout fused with a signature stroke (grow + agree)
export const Mark = (p: IconProps) => (
    <Base {...p} strokeWidth={p.strokeWidth ?? 1.7}>
        <path d="M12 21v-8" />
        <path d="M12 13c0-3.6-2.9-6.5-6.5-6.5C5.5 10.1 8.4 13 12 13Z" />
        <path d="M12 11.5c0-3 2.4-5.5 5.5-5.5 0 3-2.4 5.5-5.5 5.5Z" />
        <path d="M6.5 20.5c2.2-1.6 8.8-1.6 11 0" />
    </Base>
);

export const Contract = (p: IconProps) => (
    <Base {...p}>
        <path d="M7 3h7l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v4h4" />
        <path d="M8.5 12.5c.7-.9 1.6-.9 2.3 0s1.6.9 2.3 0 1.6-.9 2.3 0" />
        <path d="M8.5 16h5" />
    </Base>
);

export const Handshake = (p: IconProps) => (
    <Base {...p}>
        <path d="m3 11 3-3 4 1 2-1.5 2 1.5 4-1 3 3" />
        <path d="M8 9.5 5.5 12a1.6 1.6 0 0 0 2.3 2.2l.7-.7.9.9a1.5 1.5 0 0 0 2.2-2" />
        <path d="m11 14 1.4 1.4a1.5 1.5 0 0 0 2.2-2l-.6-.6" />
        <path d="M13 12.4 14.5 14a1.5 1.5 0 0 0 2.2-2.1L15 10" />
    </Base>
);

export const Compass = (p: IconProps) => (
    <Base {...p}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m14.8 9.2-1.5 4.1-4.1 1.5 1.5-4.1 4.1-1.5Z" />
    </Base>
);

export const Nodes = (p: IconProps) => (
    <Base {...p}>
        <rect x="3" y="9" width="5" height="6" rx="1.4" />
        <rect x="16" y="4" width="5" height="6" rx="1.4" />
        <rect x="16" y="14" width="5" height="6" rx="1.4" />
        <path d="M8 12h4a2 2 0 0 0 2-2V7M8 12h4a2 2 0 0 1 2 2v3" />
    </Base>
);

export const Scale = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 4v16M7 20h10" />
        <path d="M12 6 5 8m7-2 7 2" />
        <path d="M5 8 3 13a3 3 0 0 0 4 0L5 8Zm14 0-2 5a3 3 0 0 0 4 0l-2-5Z" />
    </Base>
);

export const Pulse = (p: IconProps) => (
    <Base {...p}>
        <path d="M3 12h4l2-6 3 12 2.5-7 1.5 3H21" />
    </Base>
);

export const Calendar = (p: IconProps) => (
    <Base {...p}>
        <rect x="3.5" y="5" width="17" height="16" rx="2.4" />
        <path d="M3.5 9.5h17M8 3v4M16 3v4" />
        <circle cx="8.5" cy="14" r=".6" fill="currentColor" stroke="none" />
        <circle cx="12" cy="14" r=".6" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="14" r=".6" fill="currentColor" stroke="none" />
    </Base>
);

export const Truck = (p: IconProps) => (
    <Base {...p}>
        <path d="M3 6h10v9H3z" />
        <path d="M13 9h4l3 3v3h-7z" />
        <circle cx="7" cy="17.5" r="1.8" />
        <circle cx="17" cy="17.5" r="1.8" />
    </Base>
);

export const Crate = (p: IconProps) => (
    <Base {...p}>
        <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" />
        <path d="M4 7.5v9l8 3.5 8-3.5v-9" />
        <path d="M12 11v9M8 9l8 3.5" />
    </Base>
);

export const Snowflake = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 3v18M3.6 7.5l16.8 9M20.4 7.5l-16.8 9" />
        <path d="M9.5 4.6 12 6l2.5-1.4M9.5 19.4 12 18l2.5 1.4M4.8 9.4 5.7 12l-.9 2.6M19.2 9.4l-.9 2.6.9 2.6" />
    </Base>
);

export const Route = (p: IconProps) => (
    <Base {...p}>
        <circle cx="6" cy="18" r="2.2" />
        <circle cx="18" cy="6" r="2.2" />
        <path d="M8 17h6a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h3" />
    </Base>
);

export const MapPin = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 21c4-4.5 6.5-7.7 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 13.3 8 16.5 12 21Z" />
        <circle cx="12" cy="10.5" r="2.3" />
    </Base>
);

export const Sparkle = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 3c.6 3.6 1.8 4.8 5.4 5.4-3.6.6-4.8 1.8-5.4 5.4-.6-3.6-1.8-4.8-5.4-5.4C10.2 7.8 11.4 6.6 12 3Z" />
        <path d="M18.5 14c.3 1.7.9 2.3 2.6 2.6-1.7.3-2.3.9-2.6 2.6-.3-1.7-.9-2.3-2.6-2.6 1.7-.3 2.3-.9 2.6-2.6Z" />
    </Base>
);

export const Pen = (p: IconProps) => (
    <Base {...p}>
        <path d="M15.5 5.5 18.5 8.5 8 19l-4 1 1-4 10.5-10.5Z" />
        <path d="M14 7 17 10" />
    </Base>
);

export const Check = (p: IconProps) => (
    <Base {...p}>
        <path d="m5 12.5 4.5 4.5L19 7" />
    </Base>
);

export const X = (p: IconProps) => (
    <Base {...p}>
        <path d="M6 6 18 18M18 6 6 18" />
    </Base>
);

export const Plus = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 5v14M5 12h14" />
    </Base>
);

export const ArrowRight = (p: IconProps) => (
    <Base {...p}>
        <path d="M4 12h15M13 6l6 6-6 6" />
    </Base>
);

export const ChevronRight = (p: IconProps) => (
    <Base {...p}>
        <path d="m9 6 6 6-6 6" />
    </Base>
);

export const Search = (p: IconProps) => (
    <Base {...p}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
    </Base>
);

export const Bell = (p: IconProps) => (
    <Base {...p}>
        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5h-15L6 16Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
    </Base>
);

export const Clock = (p: IconProps) => (
    <Base {...p}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
    </Base>
);

export const Barn = (p: IconProps) => (
    <Base {...p}>
        <path d="M4 10 12 4l8 6v10H4V10Z" />
        <path d="M9 20v-6h6v6" />
        <path d="M4 13h16" />
    </Base>
);

export const Storefront = (p: IconProps) => (
    <Base {...p}>
        <path d="M4 9 5 4h14l1 5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-4 0Z" />
        <path d="M5 11v9h14v-9" />
        <path d="M10 20v-5h4v5" />
    </Base>
);

export const User = (p: IconProps) => (
    <Base {...p}>
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5 20c1-3.6 4-5.5 7-5.5s6 1.9 7 5.5" />
    </Base>
);

export const Logout = (p: IconProps) => (
    <Base {...p}>
        <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
        <path d="M10 12h9M16 8l3 4-3 4" />
    </Base>
);

export const Settings = (p: IconProps) => (
    <Base {...p}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2.5M12 18.5V21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M3 12h2.5M18.5 12H21M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </Base>
);

export const Menu = (p: IconProps) => (
    <Base {...p}>
        <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
);

export const Dashboard = (p: IconProps) => (
    <Base {...p}>
        <rect x="3.5" y="3.5" width="7" height="9" rx="1.6" />
        <rect x="3.5" y="15" width="7" height="5.5" rx="1.6" />
        <rect x="13.5" y="3.5" width="7" height="5.5" rx="1.6" />
        <rect x="13.5" y="11.5" width="7" height="9" rx="1.6" />
    </Base>
);

export const Inbox = (p: IconProps) => (
    <Base {...p}>
        <path d="M3.5 13 6 5.5A2 2 0 0 1 8 4h8a2 2 0 0 1 2 1.5L20.5 13v5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-5Z" />
        <path d="M3.5 13H9l1 2h4l1-2h5.5" />
    </Base>
);

export const Dot = (p: IconProps) => (
    <Base {...p}>
        <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
    </Base>
);

export const Shield = (p: IconProps) => (
    <Base {...p}>
        <path d="M12 3.5 19 6v5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6l7-2.5Z" />
        <path d="m9 12 2 2 4-4" />
    </Base>
);

export const Repeat = (p: IconProps) => (
    <Base {...p}>
        <path d="M4 9a5 5 0 0 1 5-5h7l-2.5-2.5M20 15a5 5 0 0 1-5 5H8l2.5 2.5" />
        <path d="M16 4l2.5 2.5L16 9M8 20l-2.5-2.5L8 15" />
    </Base>
);
