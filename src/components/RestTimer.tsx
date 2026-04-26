import React from 'react';
import { IconX } from '../constants';

interface RestTimerProps {
    restTimer: { active: boolean, seconds: number, total: number };
    setRestTimer: (timer: any) => void;
}

const RestTimer: React.FC<RestTimerProps> = ({ restTimer, setRestTimer }) => {
    if (!restTimer.active && restTimer.seconds <= 0) return null;
    const pct = restTimer.total > 0 ? (restTimer.seconds / restTimer.total) * 100 : 0;
    const mins = Math.floor(restTimer.seconds / 60);
    const secs = restTimer.seconds % 60;
    const isLow = restTimer.seconds <= 10;
    const isDone = restTimer.seconds <= 0;

    return (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[55] animate-in slide-in-from-bottom-5 duration-300 ${isDone ? 'animate-pulse' : ''}`}>
            <div className={`flex items-center gap-3 ${isDone ? 'bg-emerald-500' : isLow ? 'bg-amber-500' : 'bg-slate-900'} text-white px-5 py-3 rounded-2xl shadow-2xl shadow-slate-900/40 min-w-[220px]`}>
                <div className="relative w-10 h-10 shrink-0">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">⏱</span>
                </div>
                <div className="flex-1">
                    <span className="text-2xl font-black tracking-tight">{mins}:{String(secs).padStart(2, '0')}</span>
                    <span className="block text-[10px] font-bold text-white/60 uppercase tracking-wider">{isDone ? '¡A darle!' : 'Descanso'}</span>
                </div>
                <div className="flex gap-1.5">
                    <button onClick={() => setRestTimer((prev: any) => ({ ...prev, seconds: prev.seconds + 30 }))} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-xs font-black hover:bg-white/30 transition-colors">+30</button>
                    <button onClick={() => setRestTimer({ active: false, seconds: 0, total: 0 })} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"><IconX size={14} /></button>
                </div>
            </div>
        </div>
    );
};

export default RestTimer;
