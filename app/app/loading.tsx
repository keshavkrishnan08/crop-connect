import { Skeleton } from "@/components/ui/kit";

export default function Loading() {
    return (
        <div className="animate-fade-up space-y-7">
            {/* Header block */}
            <div className="glass-card p-6">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="mt-3 h-8 w-64" />
                <Skeleton className="mt-3 h-4 w-80 max-w-full" />
            </div>

            {/* Stat-card row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="glass-card p-5">
                        <Skeleton className="h-9 w-9 rounded-2xl" />
                        <Skeleton className="mt-5 h-7 w-20" />
                        <Skeleton className="mt-2 h-3.5 w-24" />
                    </div>
                ))}
            </div>

            {/* Card grid */}
            <div className="grid gap-5 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="glass-card p-5">
                        <Skeleton className="h-40 w-full rounded-2xl" />
                        <Skeleton className="mt-4 h-5 w-3/5" />
                        <Skeleton className="mt-2.5 h-3.5 w-full" />
                        <Skeleton className="mt-2 h-3.5 w-4/5" />
                        <div className="mt-5 flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
