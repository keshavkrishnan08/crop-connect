import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "CropConnect — Farm-to-Table Marketplace",
        template: "%s | CropConnect",
    },
    description: "The premier agricultural marketplace connecting farmers directly to buyers. Fair pricing, transparent trade, thriving community.",
    keywords: ["agriculture", "marketplace", "farm to table", "farmers", "buyers", "organic", "produce", "direct trade"],
    openGraph: {
        title: "CropConnect — Farm-to-Table Marketplace",
        description: "The premier agricultural marketplace connecting farmers directly to buyers.",
        siteName: "CropConnect",
        type: "website",
    },
};

import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/Toast";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="light">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
                <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.className} bg-background-light dark:bg-background-dark text-[#131613] dark:text-gray-100 font-display transition-colors duration-200`}>
                <AuthProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
