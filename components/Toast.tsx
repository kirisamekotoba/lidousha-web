'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ToastContextType {
    showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

    const showToast = useCallback((message: string, duration = 3000) => {
        setToast({ message, visible: true });
        setTimeout(() => {
            setToast(prev => (prev?.message === message ? { ...prev, visible: false } : prev));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div
                    className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                >
                    <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
                        <span>{toast.message}</span>
                        <button
                            onClick={() => setToast(prev => prev ? { ...prev, visible: false } : null)}
                            className="hover:bg-gray-700 rounded-full p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
