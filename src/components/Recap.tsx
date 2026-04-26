import React from 'react';
import { IconFlame } from '../constants';

interface RecapProps {
    sessionRecap: any;
    currentStreak: number;
    setActiveTab: (tab: string) => void;
    setSessionRecap: (recap: any) => void;
}

const Recap: React.FC<RecapProps> = ({
    sessionRecap,
    currentStreak,
    setActiveTab,
    setSessionRecap
}) => {
    // Si no hay recap, mostrar un estado de carga o botón de retorno en lugar de blanco
    if (!sessionRecap) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium mb-6">Guardando tu progreso...</p>
                <button onClick={() => setActiveTab('home')} className="text-slate-900 font-black underline">Volver al inicio</button>
            </div>
        );
    }
    const tonFmt = sessionRecap.tonelaje >= 1000 ? `${(sessionRecap.tonelaje / 1000).toFixed(1)}t` : `${sessionRecap.tonelaje} kg`;

    return (
        <div className="min-h-screen flex flex-col items-center pt-safe pb-28 px-6 animate-in fade-in zoom-in-95 duration-700">
            <div className="mt-12 flex flex-col items-center w-full">
            {/* Celebration header */}
            <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>🎉</div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">¡Sesión Completa!</h1>
                <p className="text-slate-500 font-medium">{sessionRecap.blockTitle}</p>
            </div>

            {/* Metrics Grid */}
            <div className="w-full max-w-sm space-y-4 mb-8">
                {sessionRecap.tonelaje > 0 && (
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/30 animate-in slide-in-from-left duration-500">
                        <span className="text-3xl block mb-1">💪</span>
                        <span className="text-4xl font-black tracking-tight block">{tonFmt}</span>
                        <span className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Tonelaje Total</span>
                        <p className="text-xs text-indigo-300 mt-1">{sessionRecap.completedSets} series completadas</p>
                    </div>
                )}
                
                {sessionRecap.stamina > 0 && (
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/30 animate-in slide-in-from-right duration-500" style={{ animationDelay: '150ms' }}>
                        <span className="text-3xl block mb-1">🔋</span>
                        <span className="text-4xl font-black tracking-tight block">{sessionRecap.stamina} pts</span>
                        <span className="text-sm font-bold text-emerald-200 uppercase tracking-wider">Stamina Score</span>
                    </div>
                )}

                {/* Streak (Improved) */}
                {currentStreak > 0 && (
                    <div className="relative w-full animate-in zoom-in duration-700 delay-300">
                        <div className="relative bg-white rounded-3xl p-6 text-slate-800 shadow-lg border border-slate-100 overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-60" />
                            
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-2.5 py-1 rounded-full border border-orange-100 tracking-widest uppercase">Racha Activa</span>
                                    </div>
                                    
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black tracking-tighter text-slate-900 leading-none">{currentStreak}</span>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-orange-500 uppercase leading-none">Días</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Logrados</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-slate-500 text-[11px] font-medium pt-1 max-w-[180px] leading-tight">
                                        {currentStreak >= 30 ? '¡Eres una leyenda imparable!' : 
                                         currentStreak >= 7 ? '¡Nivel de disciplina: Experto!' : 
                                         '¡Vas por muy buen camino!'}
                                    </p>
                                </div>
                                
                                <div className="relative group">
                                    <div className="relative bg-gradient-to-br from-orange-400 to-rose-600 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl shadow-orange-500/10 transform rotate-3 border-4 border-white active:scale-110 transition-transform cursor-default">
                                        {currentStreak >= 30 ? '👑' : currentStreak >= 14 ? '⭐' : <IconFlame size={36} className="text-white" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="w-full max-w-sm space-y-3">
                <button onClick={() => { setSessionRecap(null); setActiveTab('dashboard'); window.scrollTo(0,0); }} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-transform">
                    Ver Metas
                </button>
                <button onClick={() => { setSessionRecap(null); setActiveTab('home'); window.scrollTo(0,0); }} className="w-full text-slate-500 py-3 font-bold text-sm">
                    Volver al Plan
                </button>
            </div>
            </div>
        </div>
    );
};

export default Recap;
