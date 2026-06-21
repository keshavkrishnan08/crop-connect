import { AppShell } from "@/components/app/AppShell";
import { SupabaseSync } from "@/components/app/SupabaseSync";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SupabaseSync />
            <AppShell>{children}</AppShell>
        </>
    );
}
