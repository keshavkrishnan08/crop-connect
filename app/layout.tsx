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
    metadataBase: new URL("https://cropconnect.app"),
    title: {
        default: "CropConnect — Make your menu more profitable, one local dish at a time",
        template: "%s · CropConnect",
    },
    description:
        "CropConnect makes farm-to-table effortless and profitable for restaurants. We source and deliver local produce, then hand you the story to charge more — pricing power, not cost-cutting.",
    keywords: ["farm to table", "restaurant sourcing", "local produce", "menu margin", "restaurant software"],
    openGraph: {
        title: "CropConnect — Make your menu more profitable",
        description: "Source local without it becoming a second job — and charge more, credibly.",
        siteName: "CropConnect",
        type: "website",
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
            <body>
                <ToastProvider>{children}</ToastProvider>
            </body>
        </html>
    );
}
