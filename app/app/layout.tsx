import { AppShell } from "@/components/app/AppShell";
import { SupabaseSync } from "@/components/app/SupabaseSync";
import { ChatAgent } from "@/components/app/ChatAgent";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SupabaseSync />
            <AppShell>{children}</AppShell>
            <ChatAgent />
        </>
    );
}
