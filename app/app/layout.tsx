import { AppShell } from "@/components/app/AppShell";
import { SupabaseSync } from "@/components/app/SupabaseSync";
import { ChatAgent } from "@/components/app/ChatAgent";
import { NotificationBell } from "@/components/app/NotificationBell";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SupabaseSync />
            <AppShell>{children}</AppShell>
            <NotificationBell />
            <ChatAgent />
        </>
    );
}
