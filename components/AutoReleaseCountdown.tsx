"use client";

import { useState, useEffect } from 'react';

interface AutoReleaseCountdownProps {
    autoReleaseAt: string;
    compact?: boolean;
}

export default function AutoReleaseCountdown({ autoReleaseAt, compact = false }: AutoReleaseCountdownProps) {
    const [remaining, setRemaining] = useState('');
    const [urgency, setUrgency] = useState<'green' | 'yellow' | 'red'>('green');

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const target = new Date(autoReleaseAt).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setRemaining('Auto-releasing...');
                setUrgency('red');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 3) {
                setUrgency('green');
                setRemaining(`${days}d ${hours}h`);
            } else if (days >= 1) {
                setUrgency('yellow');
                setRemaining(`${days}d ${hours}h`);
            } else {
                setUrgency('red');
                setRemaining(`${hours}h ${minutes}m`);
            }
        };

        update();
        const interval = setInterval(update, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [autoReleaseAt]);

    const colorMap = {
        green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        yellow: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    };

    const iconMap = {
        green: 'timer',
        yellow: 'timer',
        red: 'alarm',
    };

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorMap[urgency]}`}>
                <span className="material-symbols-outlined !text-[12px]">{iconMap[urgency]}</span>
                {remaining}
            </span>
        );
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${colorMap[urgency]}`}>
            <span className="material-symbols-outlined !text-[18px]">{iconMap[urgency]}</span>
            <div>
                <span className="font-bold">Auto-release: </span>
                <span>{remaining}</span>
            </div>
        </div>
    );
}
