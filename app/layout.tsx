import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ComfortProvider } from "@/components/a11y/ComfortMode";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const display = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-display",
    display: "swap",
});

const mono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://cropconnect.app"),
    title: {
        default: "CropConnect — Committed local supply, on contract",
        template: "%s · CropConnect",
    },
    description:
        "CropConnect turns informal, handshake supply relationships into structured, renewable contracts between farms and wholesale buyers. Predictable supply. Provable provenance.",
    keywords: [
        "supply contracts",
        "local food",
        "farm to table",
        "wholesale produce",
        "committed supply",
        "agriculture",
    ],
    openGraph: {
        title: "CropConnect — Committed local supply, on contract",
        description:
            "Structured, renewable supply contracts between farms and wholesale buyers.",
        siteName: "CropConnect",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
            <body>
                <ComfortProvider>
                    <ToastProvider>{children}</ToastProvider>
                </ComfortProvider>
            </body>
        </html>
    );
}
