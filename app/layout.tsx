import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const display = Fraunces({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    style: ["normal", "italic"],
    variable: "--font-display",
    display: "swap",
});

const sans = Hanken_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
    display: "swap",
});

const mono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://cropconnect.dev"),
    title: {
        default: "CropConnect — Done-for-you local produce sourcing for restaurants",
        template: "%s · CropConnect",
    },
    description:
        "CropConnect is a done-for-you local sourcing service for restaurants. An AI agent named Sage finds nearby farms, negotiates and signs seasonal supply contracts, manages delivery and quality, and holds payment in escrow — so a kitchen can put local produce on the menu and charge more for it without the work.",
    keywords: [
        "how to source local produce for a restaurant", "local food sourcing for restaurants", "farm to table sourcing service",
        "restaurant produce supplier", "buy direct from local farms restaurant", "farm to restaurant platform",
        "local produce delivery for restaurants", "restaurant sourcing software", "menu margin", "Indianapolis local produce restaurants",
    ],
    alternates: { canonical: "/" },
    openGraph: {
        title: "CropConnect — Done-for-you local produce sourcing for restaurants",
        description: "An AI agent finds local farms, signs the supply contracts, and manages delivery and escrow — so your kitchen serves local and charges more, without the work.",
        url: "https://cropconnect.dev",
        siteName: "CropConnect",
        type: "website",
    },
    twitter: { card: "summary_large_image", title: "CropConnect — local sourcing for restaurants, done for you", description: "AI sources local farms, signs the contracts, runs delivery + escrow. Serve local, charge more." },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
};

const ORG_JSONLD = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization", "@id": "https://cropconnect.dev/#org", name: "CropConnect",
            url: "https://cropconnect.dev", description: "Done-for-you local produce sourcing service for restaurants.",
            areaServed: { "@type": "City", name: "Indianapolis" }, knowsAbout: ["local food sourcing", "farm to table", "restaurant supply chain", "produce contracts"],
        },
        {
            "@type": "WebSite", "@id": "https://cropconnect.dev/#site", url: "https://cropconnect.dev",
            name: "CropConnect", publisher: { "@id": "https://cropconnect.dev/#org" },
        },
        {
            "@type": "Service", "@id": "https://cropconnect.dev/#service", name: "CropConnect local sourcing service",
            serviceType: "Local produce sourcing and supply management for restaurants",
            provider: { "@id": "https://cropconnect.dev/#org" }, areaServed: { "@type": "City", name: "Indianapolis" },
            description: "CropConnect's AI agent finds nearby farms, negotiates and signs seasonal supply contracts, manages delivery and quality checks, and holds restaurant payments in escrow until produce is confirmed received.",
        },
    ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
            <head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
            </head>
            <body>
                <ToastProvider>{children}</ToastProvider>
            </body>
        </html>
    );
}
