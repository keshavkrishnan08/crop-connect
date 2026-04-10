"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
    toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "success") => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onRemove={onRemove} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icon = toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info";
    const colors =
        toast.type === "success"
            ? "bg-green-600 text-white"
            : toast.type === "error"
            ? "bg-red-600 text-white"
            : "bg-gray-800 text-white";

    return (
        <div className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl ${colors} animate-fade-in min-w-[280px] max-w-[420px]`}>
            <span className="material-symbols-outlined !text-[20px] shrink-0">{icon}</span>
            <p className="text-sm font-semibold flex-1">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
                <span className="material-symbols-outlined !text-[18px]">close</span>
            </button>
        </div>
    );
}
