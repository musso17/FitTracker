import React, { useState } from 'react';
import {
    IconTarget, IconCalendar, IconTrophy,
    IconEdit, IconTrash, IconDumbbell, IconX, IconChevronRight, IconActivity, IconInfoCircle
} from '../constants';
import type { TrainingLog } from '../types';
import { ANALYTICS_DOCS, predictGoalDate } from './Common';
import Sparkline from './Sparkline';

interface DashboardProps {
    dashboardStats: any;
    logs: TrainingLog[];
    handleEditLog: (log: any) => void;
    handleDeleteLog: (id: number) => void;
    intel: any;
    setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    dashboardStats,
    logs,
    handleEditLog,
    handleDeleteLog,
    intel,
    setActiveTab
}) => {
    const [dashTab, setDashTab] = useState<'stats' | 'strength' | 'patrones' | 'logs'>('stats');
    const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});
    const [expandedMetrics, setExpandedMetrics] = useState<Record<string, boolean>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [helpKey, setHelpKey] = useState<keyof typeof ANALYTICS_DOCS | null>(null);

    const unlockedCount = dashboardStats.achievements?.filter((a: any) => a.unlocked).length || 0;

    return (
        <div className="space-y-6 animate-in pt-6 pb-24">
            {helpKey && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in" onClick={() => setHelpKey(null)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                {ANALYTICS_DOCS[helpKey].icon}
                            </div>
                            <button onClick={() => setHelpKey(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                                <IconX size={24} />
                            </button>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">{ANALYTICS_DOCS[helpKey].title}</h3>
                        <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{ANALYTICS_DOCS[helpKey].desc}</p>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 mb-2">Rangos y Guía</h4>
                            {ANALYTICS_DOCS[helpKey].ranges.map((r, i) => (
                                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{r.status}</span>
                                        <span className="text-[10px] font-bold text-slate-400 italic tabular-nums">{r.label}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium">{r.advice}</p>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => setHelpKey(null)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-lg shadow-slate-200">
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            <header className="px-1 pt-safe mt-4 flex items-center justify-between overflow-x-auto hide-scrollbar">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Progreso</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
                        <span className="w-1 h-1 bg-slate-300 rounded-full" /> Advanced Analytics
                    </p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner shrink-0 ml-4">
                    <button onClick={() => setDashTab('stats')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Stats</button>
                    <button onClick={() => setDashTab('patrones')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashTab === 'patrones' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Patrones</button>
                    <button onClick={() => setDashTab('logs')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dashTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Logs</button>
                </div>
            </header>

            {dashTab === 'stats' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
                    <section className="grid grid-cols-2 gap-4">
                        {/* Weekly Consistency Card */}
                        <div className="bg-slate-900 p-5 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden group flex flex-col justify-between min-h-[160px]">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <IconTarget className="text-slate-400" size={20} />
                                    <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Hábito</span>
                                </div>
                                <div className="flex gap-1.5 mb-2">
                                    {(() => {
                                        const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
                                        const today = new Date();
                                        const currentDay = today.getDay(); // 0 is Sun
                                        const adjustedToday = currentDay === 0 ? 6 : currentDay - 1; // 0-6 (Mon-Sun)
                                        
                                        // Simple check: did they train in the last 7 days?
                                        // For a real weekly grid, we'd need exact dates for Mon-Sun of current week.
                                        const startOfWeek = new Date(today);
                                        startOfWeek.setDate(today.getDate() - adjustedToday);
                                        startOfWeek.setHours(0,0,0,0);

                                        return days.map((d, i) => {
                                            const checkDate = new Date(startOfWeek);
                                            checkDate.setDate(startOfWeek.getDate() + i);
                                            const dateStr = checkDate.toISOString().split('T')[0];
                                            const hasTrained = logs.some(l => l.date === dateStr);
                                            const isFuture = i > adjustedToday;

                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1.5">
                                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${hasTrained ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] scale-110' : isFuture ? 'bg-slate-800' : 'bg-slate-700'}`} />
                                                    <span className={`text-[7px] font-black uppercase ${hasTrained ? 'text-cyan-400' : 'text-slate-500'}`}>{d}</span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                            
                            {dashboardStats.workoutsThisWeek === 0 ? (
                                <button 
                                    onClick={() => setActiveTab('home')}
                                    className="w-full bg-white text-slate-900 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-bounce mt-2 group-active:scale-95 transition-transform"
                                >
                                    ¡Empezar Semana!
                                </button>
                            ) : (
                                <div>
                                    <span className="text-xl font-black block leading-none">{dashboardStats.workoutsThisWeek} Sesiones</span>
                                    <span className="text-[8px] uppercase font-black tracking-widest text-slate-400 mt-1 block">Consistencia Semanal</span>
                                </div>
                            )}
                        </div>

                        {/* Achievements/Goals Card */}
                        <div className="bg-white p-5 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group cursor-pointer active:scale-95 transition-all hover:border-amber-100" onClick={() => setShowAchievements(true)}>
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                                            <IconTrophy size={18} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.15em]">Metas</span>
                                    </div>
                                    <span className="text-3xl font-black block leading-none text-slate-800">{unlockedCount}</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1 block">Logros y Medallas</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[14px] font-black text-amber-500 tabular-nums bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                        {dashboardStats.logros}
                                    </span>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 text-slate-900">
                                <IconTrophy size={120} />
                            </div>
                        </div>
                    </section>

                    {/* Fusión: Métricas de Fuerza debajo de las tarjetas */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Progreso por Ejercicio</h3>
                        <div className="space-y-4">
                            {dashboardStats.strengthMetrics?.filter((m: any) => m.history.length > 0).map((metric: any) => {
                                const isExpanded = expandedMetrics[metric.id];
                                const lastDone = metric.history?.[metric.history.length - 1];
                                const historyWeights = metric.history.map((h: any) => h.weight);

                                return (
                                    <div key={metric.id} className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-indigo-100 shadow-xl shadow-indigo-50/50' : 'border-slate-100 shadow-sm'}`}>
                                        <div className="p-5 flex items-center justify-between cursor-pointer group" onClick={() => setExpandedMetrics(prev => ({ ...prev, [metric.id]: !isExpanded }))}>
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                    <IconDumbbell size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-[14px] text-slate-800 leading-tight">{metric.name}</h4>
                                                        <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                            Objetivo: {metric.goal}kg
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-sm font-black text-slate-900">{lastDone?.weight}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">kg</span>
                                                        </div>
                                                        <div className="w-px h-2 bg-slate-200" />
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-[10px] font-black text-slate-500">{lastDone?.reps}</span>
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">reps</span>
                                                        </div>
                                                        {lastDone?.volume && (
                                                            <>
                                                                <div className="w-px h-2 bg-slate-200" />
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-[10px] font-black text-emerald-500">{Math.round(lastDone.volume)}</span>
                                                                    <span className="text-[8px] font-black text-emerald-400 uppercase">Vol</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Mini Sparkline in Header */}
                                            {!isExpanded && historyWeights.length > 1 && (
                                                <div className="px-4 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <Sparkline data={historyWeights.slice(-5)} width={60} height={20} color="#cbd5e1" />
                                                </div>
                                            )}

                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-50 text-indigo-500 rotate-90' : 'text-slate-300'}`}>
                                                <IconChevronRight size={16} />
                                            </div>
                                        </div>

                                        {/* Slim Progress Bar at the edge */}
                                        <div className="h-1 w-full bg-slate-50 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 transition-all duration-1000"
                                                style={{ width: `${Math.min(metric.progress || 0, 100)}%` }}
                                            />
                                        </div>

                                        {isExpanded && (
                                            <div className="p-6 pt-2 space-y-6 animate-in slide-in-from-top-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tendencia de Carga</h5>
                                                        <p className="text-[11px] text-slate-800 font-bold">Últimas {historyWeights.length} sesiones</p>
                                                    </div>
                                                    <Sparkline data={historyWeights} width={120} height={40} color="#6366f1" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Volumen Total</span>
                                                        <span className="text-xl font-black text-slate-800">{Math.round(lastDone?.volume || 0)} <span className="text-[10px] text-slate-400">kg</span></span>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Predicción Meta</span>
                                                        <span className="text-xs font-black text-indigo-600">
                                                            {predictGoalDate(metric.history, lastDone?.weight, metric.goal) || 'En progreso'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Historial de Récords - Horizontal Carousel */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between px-1">
                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evolución de Carga</h5>
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Desliza <IconChevronRight size={8} /></span>
                                                    </div>
                                                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar snap-x">
                                                        {metric.history.slice(-8).reverse().map((record: any, idx: number) => (
                                                            <div key={idx} className="shrink-0 w-28 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm snap-start">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase block mb-2">
                                                                    {new Date(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                                                </span>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-sm font-black text-slate-800">{record.weight}</span>
                                                                    <span className="text-[9px] font-bold text-slate-400">kg</span>
                                                                </div>
                                                                <div className="text-[9px] font-bold text-slate-400 mt-1">
                                                                    × {record.reps} reps
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {showAchievements && (
                        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-md animate-in fade-in flex items-center justify-center p-4" onClick={() => setShowAchievements(false)}>
                            <div className="bg-[#f8fafc] w-full max-w-sm rounded-[3rem] shadow-2xl p-8 animate-in zoom-in-95 overflow-y-auto max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
                                <header className="mb-6 flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-800 leading-none">Tus Logros</h2>
                                        <div className="mt-2 flex items-center gap-2 text-emerald-600">
                                            <IconTrophy size={16} />
                                            <span className="text-xs font-black uppercase tracking-tight">¡Llevas {unlockedCount} medallas!</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAchievements(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><IconX size={18} /></button>
                                </header>

                                <div className="grid grid-cols-2 gap-4">
                                    {dashboardStats.achievements?.map((ach: any) => (
                                        <div key={ach.id} className={`p-5 rounded-[2rem] border-2 transition-all relative overflow-hidden flex flex-col justify-between h-44 ${ach.unlocked ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200' : 'bg-white border-slate-50 opacity-60'}`}>
                                            <div className="relative z-10">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner ${ach.unlocked ? 'bg-white/10' : 'bg-slate-100'}`}>
                                                    {ach.icon}
                                                </div>
                                                <h4 className={`font-black text-sm mt-4 leading-tight ${ach.unlocked ? 'text-white' : 'text-slate-400'}`}>{ach.title}</h4>
                                                <p className={`text-[10px] mt-1 font-medium leading-snug ${ach.unlocked ? 'text-white/60' : 'text-slate-300'}`}>{ach.desc}</p>
                                            </div>
                                            {!ach.unlocked && (
                                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-end justify-center p-4">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Bloqueado</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {dashTab === 'patrones' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
                    <section className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <IconCalendar className="text-indigo-400 mb-3" size={20} />
                            <span className="text-3xl font-black block leading-none text-slate-800">
                                {intel.bestDay || '--'}
                            </span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1 block">Mejor día de entreno</span>
                        </div>
                        <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <IconActivity className="text-emerald-400 mb-3" size={20} />
                            <span className="text-3xl font-black block leading-none text-slate-800">
                                {intel.metadata.sessionCount >= 8 ? `${intel.consistency.score}%` : '--'}
                            </span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1 block">Índice consistencia</span>
                        </div>
                    </section>

                    {intel.placeholders.consistency && (
                        <div className="bg-slate-100/50 border border-dashed border-slate-200 p-6 rounded-[2.5rem] text-center">
                            <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">
                                {intel.placeholders.consistency}
                            </p>
                        </div>
                    )}

                    {(() => {
                        const balance = intel.muscleBalance;
                        const maxVol = Math.max(balance.volume.push, balance.volume.pull, balance.volume.legs, balance.volume.core, 1);
                        return (
                            <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                                        <span className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                                        Balance Muscular (Sets/Semana)
                                    </h3>
                                    <button onClick={() => setHelpKey('balance')} className="text-slate-300 active:text-indigo-500 transition-colors">
                                        <IconInfoCircle size={18} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Push (Empuje)', val: balance.volume.push, color: 'bg-rose-400' },
                                        { label: 'Pull (Tracción)', val: balance.volume.pull, color: 'bg-cyan-400' },
                                        { label: 'Legs (Pierna)', val: balance.volume.legs, color: 'bg-emerald-400' },
                                        { label: 'Core', val: balance.volume.core, color: 'bg-amber-400' }
                                    ].map(g => (
                                        <div key={g.label} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                                                <span className="text-slate-500">{g.label}</span>
                                                <span className="text-slate-800">{g.val} sets</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <div className={`h-full ${g.color} transition-all duration-1000`} style={{ width: `${(g.val / maxVol) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${balance.pullPushRatio < 0.8 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                            <IconActivity size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-800">Ratio Pull:Push</h4>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {balance.pullPushRatio < 0.8
                                                    ? 'Entrenas demasiado empuje. Riesgo de hombros.'
                                                    : 'Balance saludable para tus hombros.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        );
                    })()}
                </div>
            )}

            {dashTab === 'logs' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
                    {logs.map((log) => {
                        const isExpanded = expandedLogs[log.id];
                        return (
                            <div key={log.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedLogs(prev => ({ ...prev, [log.id]: !isExpanded }))}>
                                    <div className="flex flex-col items-center justify-center bg-slate-50 min-w-[54px] h-[54px] rounded-2xl border border-slate-100">
                                        <span className="text-[8px] uppercase font-black text-slate-400 leading-none mb-1">{new Date(log.date).toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                        <span className="text-base font-black text-slate-800 leading-none">{new Date(log.date).getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-slate-800 text-[13px] truncate uppercase tracking-tight">{log.blockId}</h4>
                                    </div>
                                    <IconChevronRight size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                                {isExpanded && (
                                    <div className="px-4 pb-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                        {/* Actividades Especiales */}
                                        {(log.surfData || log.muayThaiData || log.activityData) && (
                                            <div className="flex flex-wrap gap-2">
                                                {log.surfData && <span className="bg-cyan-50 text-cyan-600 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-cyan-100">🏄 Surf {log.surfData.duration}min</span>}
                                                {log.muayThaiData && <span className="bg-rose-50 text-rose-600 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-rose-100">🥊 Muay Thai {log.muayThaiData.duration}min</span>}
                                                {log.activityData && <span className="bg-slate-50 text-slate-600 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-slate-100">🏋️ {log.activityData.duration}min</span>}
                                            </div>
                                        )}

                                        {/* Ejercicios de Gimnasio */}
                                        {log.gymData?.progress && (
                                            <div className="space-y-3">
                                                {Object.entries(log.gymData.progress).map(([exId, sets]: [string, any]) => {
                                                    const exName = log.gymData?.exercises?.find((e: any) => e.id === exId)?.name || 'Ejercicio';
                                                    const completedSets = Array.isArray(sets) ? sets.filter((s: any) => s.completed) : [];
                                                    if (completedSets.length === 0) return null;

                                                    return (
                                                        <div key={exId} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50">
                                                            <div className="flex justify-between items-baseline mb-2">
                                                                <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">{exName}</h5>
                                                                <span className="text-[10px] font-bold text-slate-400">{completedSets.length} sets</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {completedSets.map((s: any, i: number) => (
                                                                    <div key={i} className="bg-white border border-slate-100 px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                                                                        {log.gymData?.exercises?.find((e: any) => e.id === exId)?.type === 'time' ? (
                                                                            <span className="text-[11px] font-black text-slate-800">{s.reps} min</span>
                                                                        ) : (
                                                                            <>
                                                                                <span className="text-[11px] font-black text-slate-800">{s.weight}kg</span>
                                                                                <span className="text-[9px] font-bold text-slate-400">×</span>
                                                                                <span className="text-[11px] font-black text-slate-800">{s.reps}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div className="pt-2 flex justify-end gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleEditLog(log); }} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 px-3 py-1.5 bg-slate-50 rounded-lg transition-colors flex items-center gap-1">
                                                <IconEdit size={12} /> Editar
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteLog(log.id); }} className="text-[10px] font-black uppercase text-rose-300 hover:text-rose-500 px-3 py-1.5 bg-rose-50/50 rounded-lg transition-colors flex items-center gap-1">
                                                <IconTrash size={12} /> Borrar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
