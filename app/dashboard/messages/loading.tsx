export default function MessagesLoading() {
    return (
        <div className="flex-1 flex h-full animate-pulse">
            {/* Conversations sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-white/[0.06] p-4 space-y-3 hidden md:block">
                <div className="h-10 w-full bg-gray-200 dark:bg-white/10 rounded-xl mb-4" />
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                        <div className="size-10 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded" />
                            <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded" />
                        </div>
                        <div className="h-3 w-8 bg-gray-100 dark:bg-white/5 rounded" />
                    </div>
                ))}
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="h-16 border-b border-gray-200 dark:border-white/[0.06] px-4 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gray-200 dark:bg-white/10" />
                    <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded" />
                        <div className="h-3 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                            <div className={`h-12 rounded-2xl bg-gray-100 dark:bg-white/5 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="h-16 border-t border-gray-200 dark:border-white/[0.06] px-4 flex items-center">
                    <div className="h-10 w-full bg-gray-100 dark:bg-white/5 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
