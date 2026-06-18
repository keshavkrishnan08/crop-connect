import { AuthProvider } from "@/lib/auth";
import { AppShell } from "@/components/app/AppShell";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AppShell>{children}</AppShell>
        </AuthProvider>
    );
}
