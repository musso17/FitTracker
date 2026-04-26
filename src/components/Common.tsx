import React from 'react';

// Re-export logic from analytics.ts
export * from '../utils/analytics';

// --- TOAST COMPONENT ---
interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type }) => (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className={`px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 ${
            type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
            type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' :
            'bg-slate-800 border-slate-700 text-white'
        }`}>
            <div className={`w-2 h-2 rounded-full ${
                type === 'success' ? 'bg-emerald-400' :
                type === 'error' ? 'bg-rose-400' :
                'bg-cyan-400'
            } animate-pulse`} />
            <span className="text-xs font-bold">{message}</span>
        </div>
    </div>
);
