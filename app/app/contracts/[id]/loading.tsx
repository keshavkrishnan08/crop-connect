import { Skeleton } from "@/components/ui/kit";

export default function Loading() {
    return (
        <div className="animate-fade-up space-y-6">
            {/* Header card */}
            <div className="glass-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="mt-3 h-8 w-72 max-w-full" />
                        <Skeleton className="mt-3 h-4 w-56" />
                    </div>
                    <Skeleton className="h-9 w-28 rounded-full" />
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-28 rounded-full" />
                ))}
            </div>

            {/* Two-column layout */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Main board area */}
                <div className="glass-card p-6">
                    <Skeleton className="h-5 w-40" />
                    <div className="mt-5 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-2xl" />
                                <div className="flex-1 space-y-2.5">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-3.5 w-full" />
                                    <Skeleton className="h-3.5 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="mt-4 h-3.5 w-full" />
                        <Skeleton className="mt-2.5 h-3.5 w-5/6" />
                        <Skeleton className="mt-2.5 h-3.5 w-2/3" />
                    </div>
                    <div className="glass-card p-5">
                        <Skeleton className="h-4 w-24" />
                        <div className="mt-4 flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3.5 w-20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
