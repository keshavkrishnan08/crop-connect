import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { MeetingForm } from "@/components/marketing/MeetingForm";

export const metadata: Metadata = {
    title: "Book a meeting",
    description: "Tell us about your kitchen and we will set up a short call to walk through local sourcing for your menu.",
};

export default function ContactPage() {
    return (
        <div className="relative min-h-screen bg-canvas bg-aura text-ink">
            <MarketingNav />
            <main>
                <MeetingForm />
            </main>
            <MarketingFooter />
        </div>
    );
}
