import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnatomyMap from './AnatomyMap';
import {
    IconTarget, IconCalendar, IconTrophy,
    IconEdit, IconTrash, IconDumbbell, IconX, IconChevronRight, IconActivity,
    ACHIEVEMENT_CATEGORIES, ICON_MAP, IconMedal, IconTrendingUp,
    IconMoreVertical
} from '../constants';
import type { TrainingLog } from '../types';
import { ANALYTICS_DOCS, parseSafeDate } from './Common';

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
    const [activeLogMenu, setActiveLogMenu] = useState<number | null>(null);
    const [helpKey, setHelpKey] = useState<keyof typeof ANALYTICS_DOCS | null>(null);
    const [highlightedGroup, setHighlightedGroup] = useState<string | null>(null);

    const handleStatClick = (group: string) => {
        setHighlightedGroup(group);
        const mapSection = document.getElementById('fatigue-map');
        if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Auto-clear highlight after 3 seconds
        setTimeout(() => setHighlightedGroup(null), 3000);
    };

    if (!dashboardStats) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-300">Sincronizando Bitácora...</p>
            </div>
        );
    }

    const unlockedCount = dashboardStats?.achievements?.filter((a: any) => a.unlocked).length || 0;

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

            <header className="px-1 pt-safe mt-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Progreso</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
                            <span className="w-1 h-1 bg-slate-300 rounded-full" /> Advanced Analytics
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] mb-10 shadow-inner">
                    <button 
                        onClick={() => setDashTab('stats')} 
                        className={`flex-1 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashTab === 'stats' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        Resumen
                    </button>
                    <button 
                        onClick={() => setDashTab('patrones')} 
                        className={`flex-1 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashTab === 'patrones' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        Patrones
                    </button>
                    <button 
                        onClick={() => setDashTab('logs')} 
                        className={`flex-1 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashTab === 'logs' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        Logs
                    </button>
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

                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Progreso por Ejercicio</h3>
                        <div className="space-y-4">
                            {dashboardStats.strengthMetrics?.filter((m: any) => m.history.length > 0).map((metric: any) => {
                                const isExpanded = expandedMetrics[metric.id];
                                const history = metric.history || [];
                                const lastDone = history[history.length - 1];
                                const prevDone = history[history.length - 2];
                                
                                const volChange = prevDone ? ((lastDone.volume - prevDone.volume) / prevDone.volume) * 100 : 0;

                                return (
                                    <div key={metric.id} className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-indigo-100 shadow-xl shadow-indigo-50/50' : 'border-slate-100 shadow-sm'}`}>
                                        <div className="p-6 flex flex-col cursor-pointer group" onClick={() => setExpandedMetrics(prev => ({ ...prev, [metric.id]: !isExpanded }))}>
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                                                        <IconDumbbell size={22} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-xl text-slate-900 leading-none mb-2">{metric.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                                                <IconTarget size={10} className="text-indigo-600" />
                                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">Meta: {metric.goal}kg</span>
                                                            </div>
                                                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Math.round(metric.progress)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-50 text-indigo-500 rotate-90' : 'bg-slate-50 text-slate-300'}`}>
                                                    <IconChevronRight size={18} />
                                                </div>
                                            </div>

                                            {/* Performance Actual */}
                                            <div className="flex items-baseline gap-4 mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hoy</span>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{lastDone?.weight}kg</span>
                                                        <span className="text-sm font-bold text-slate-400">× {lastDone?.reps} reps</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1 flex flex-col items-end text-right">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Evolución</span>
                                                    <div className={`flex items-center gap-1.5 font-black text-sm ${volChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {volChange >= 0 ? <IconTrendingUp size={14} /> : <IconActivity size={14} className="rotate-180" />}
                                                        {volChange > 0 ? '+' : ''}{Math.round(volChange)}% <span className="text-[10px] opacity-60">vs previo</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-1.5 w-full bg-slate-50 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${metric.progress >= 100 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-indigo-500'}`}
                                                style={{ width: `${Math.min(metric.progress || 0, 100)}%` }}
                                            />
                                        </div>

                                        {isExpanded && (
                                            <div className="p-6 pt-8 space-y-8 animate-in slide-in-from-top-2">
                                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Volumen Total</span>
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-2xl font-black text-slate-900">{Math.round(lastDone?.volume || 0)}</span>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">kg</span>
                                                        </div>
                                                        <div className={`text-[10px] font-bold mt-1 ${volChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {volChange > 0 ? '+' : ''}{Math.round(volChange)}% vs sesión anterior
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Mini Sparkline */}
                                                    <div className="flex items-end gap-1 h-8 opacity-40 group-hover:opacity-100 transition-opacity">
                                                        {history.slice(-6).map((h: any, i: number) => {
                                                            const max = Math.max(...history.slice(-6).map((x: any) => x.volume), 1);
                                                            const height = (h.volume / max) * 100;
                                                            return (
                                                                <div 
                                                                    key={i} 
                                                                    className={`w-1.5 rounded-full transition-all duration-500 ${i === history.slice(-6).length - 1 ? 'bg-indigo-500' : 'bg-slate-300'}`} 
                                                                    style={{ height: `${Math.max(10, height)}%` }} 
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Resumen de Hitos</h5>
                                                    <div className="space-y-3">
                                                        {metric.history.slice(-5).reverse().map((record: any, idx: number) => {
                                                            const prevRecord = metric.history[metric.history.length - 2 - idx];
                                                            let milestone = '';
                                                            if (prevRecord) {
                                                                if (record.weight > prevRecord.weight) milestone = `+${record.weight - prevRecord.weight}kg respecto a la anterior`;
                                                                else if (record.reps > prevRecord.reps) milestone = `+${record.reps - prevRecord.reps} reps con el mismo peso`;
                                                                else if (record.weight === prevRecord.weight && record.reps === prevRecord.reps) milestone = "Consolidando carga";
                                                            } else {
                                                                milestone = "Punto de partida";
                                                            }

                                                            return (
                                                                <div key={idx} className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 uppercase leading-none text-center p-1">
                                                                        {parseSafeDate(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-black text-slate-800">{record.weight}kg x {record.reps}</span>
                                                                            {record.weight >= metric.goal && <IconTrophy size={12} className="text-amber-500" />}
                                                                        </div>
                                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{milestone}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
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
                        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in flex items-center justify-center p-6" onClick={() => setShowAchievements(false)}>
                            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 overflow-y-auto max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
                                <header className="mb-8 flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 leading-none tracking-tight">Hitos y Logros</h2>
                                        <div className="mt-2.5 flex items-center gap-2">
                                            <div className="flex -space-x-1">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                                        <IconTrophy size={10} className="text-white" />
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">¡{unlockedCount} medallas ganadas!</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAchievements(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                                        <IconX size={20} />
                                    </button>
                                </header>

                                <div className="space-y-10">
                                    {Object.entries(ACHIEVEMENT_CATEGORIES).map(([catId, catInfo]) => {
                                        const catAchievements = dashboardStats.achievements?.filter((a: any) => a.category === catId);
                                        if (!catAchievements?.length) return null;

                                        return (
                                            <div key={catId} className="space-y-4">
                                                <div className="flex items-center gap-2 px-1">
                                                    <catInfo.icon size={14} className={catInfo.color === 'slate' ? 'text-slate-900' : `text-${catInfo.color}-500`} />
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{catInfo.label}</h3>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    {catAchievements.map((ach: any) => {
                                                        const IconComponent = ICON_MAP[ach.icon] || IconMedal;
                                                        const isLocked = !ach.unlocked;

                                                        return (
                                                            <div 
                                                                key={ach.id} 
                                                                onClick={() => {
                                                                    if (isLocked && ach.action) {
                                                                        setShowAchievements(false);
                                                                        if (ach.action === 'striking') {
                                                                            setActiveTab('home');
                                                                        } else if (ach.action === 'gym') {
                                                                            setActiveTab('home');
                                                                        }
                                                                    }
                                                                }}
                                                                className={`group relative p-5 rounded-3xl border-2 transition-all duration-300 active:scale-[0.98] ${ach.unlocked ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-100'}`}
                                                            >
                                                                <div className="flex items-start gap-4">
                                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${ach.unlocked ? 'bg-white/10' : 'bg-slate-50'}`}>
                                                                        <IconComponent size={28} className={isLocked ? 'text-slate-300 grayscale' : 'text-white'} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex justify-between items-start mb-0.5">
                                                                            <h4 className={`font-black text-[15px] leading-tight ${isLocked ? 'text-slate-800' : 'text-white'}`}>{ach.title}</h4>
                                                                            {ach.unlockedAt && (
                                                                                <span className="text-[8px] font-black uppercase opacity-40 whitespace-nowrap">
                                                                                    {parseSafeDate(ach.unlockedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className={`text-[11px] leading-snug font-medium mb-3 ${isLocked ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                            {ach.desc}
                                                                        </p>

                                                                        {isLocked && ach.progress !== undefined && (
                                                                            <div className="space-y-1.5">
                                                                                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-400 px-0.5">
                                                                                    <span>Progreso</span>
                                                                                    <span className="text-slate-900">{Math.round(ach.progress)}%</span>
                                                                                </div>
                                                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                                    <div 
                                                                                        className={`h-full transition-all duration-1000 ease-out ${catInfo.bg}`}
                                                                                        style={{ width: `${ach.progress}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {isLocked && !ach.progress && ach.action && (
                                                                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-indigo-500 group-hover:translate-x-1 transition-transform">
                                                                                Ver Rutina <IconChevronRight size={10} />
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button onClick={() => setShowAchievements(false)} className="w-full mt-10 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 active:scale-95 transition-transform">
                                    Seguir Entrenando
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {dashTab === 'patrones' && (
                <div className="max-w-md mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-700 pb-20 px-4">
                    {/* Header Editorial */}
                    <header className="text-center pt-8">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">Análisis de Patrones</h3>
                        <div className="w-8 h-0.5 bg-slate-900 mx-auto rounded-full" />
                    </header>

                    {/* Fatigue Map Section */}
                    <div id="fatigue-map" className="space-y-6 scroll-mt-24">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Anatomía de Fatiga (7D)</h4>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Análisis Biomecánico</span>
                        </div>
                        
                        <div className="relative min-h-[360px] flex items-center justify-center">
                            <AnatomyMap 
                                volume={intel.muscleBalance.volume} 
                                highlightedGroup={highlightedGroup}
                            />
                        </div>
                    </div>

                    {/* Strongest Muscles Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Músculos más Fuertes</h4>
                            <IconTrophy size={16} className="text-amber-500" />
                        </div>

                        <div className="space-y-6">
                            {Object.entries(intel.muscleBalance.volume)
                                .filter(([key]) => ['push', 'pull', 'legs', 'core'].includes(key))
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .map(([muscle, vol], index) => {
                                    const maxVol = Math.max(...Object.values(intel.muscleBalance.volume).filter((_, i) => [0,1,2,3].includes(i)) as number[], 1);
                                    const percentage = ((vol as number) / maxVol) * 100;
                                    const labels: Record<string, string> = { push: 'Empuje (Pecho/Hombro)', pull: 'Tracción (Espalda)', legs: 'Tren Inferior', core: 'Core' };
                                    
                                    return (
                                        <div 
                                            key={muscle} 
                                            className="space-y-2 cursor-pointer group"
                                            onClick={() => handleStatClick(muscle)}
                                        >
                                            <div className="flex justify-between items-end px-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black ${index === 0 ? 'text-slate-900' : 'text-slate-400'} uppercase tracking-widest group-hover:text-amber-500 transition-colors`}>
                                                        {labels[muscle]}
                                                    </span>
                                                    {index === 0 && <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Dominante</span>}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-800 tabular-nums">{Math.round((vol as number) * 10) / 10} Sets</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden relative">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1.2, delay: index * 0.1, ease: "easeOut" }}
                                                    className={`h-full ${index === 0 ? 'bg-slate-900' : 'bg-slate-200'} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Gemini AI Insight Box */}
                    <div className="bg-white border-l-4 border-indigo-500 p-8 rounded-r-[2.5rem] shadow-sm relative overflow-hidden group">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
                                {intel.isLoadingAi ? (
                                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                                ) : (
                                    <span className="text-xl">✨</span>
                                )}
                            </div>
                            <div className="space-y-4 w-full">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        IA Coach
                                        {intel.isLoadingAi && <span className="normal-case tracking-normal text-[9px] opacity-70">Analizando...</span>}
                                    </p>
                                    <p className="text-[14px] text-slate-600 font-bold leading-[1.7] tracking-tight mt-1">
                                        {intel.isLoadingAi 
                                            ? "Procesando tus últimos entrenamientos con Gemini..." 
                                            : (intel.aiSummary || "Completa más sesiones para recibir un análisis avanzado.")}
                                    </p>
                                </div>
                                
                                {!intel.isLoadingAi && intel.insights?.length > 0 && (
                                    <div className="space-y-3 pt-2">
                                        {intel.insights.map((insight: any, i: number) => (
                                            <div key={i} className={`p-3 rounded-xl flex gap-3 items-start ${insight.type === 'success' ? 'bg-emerald-50' : insight.type === 'warning' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                                                <span className="text-lg leading-none">{insight.icon}</span>
                                                <div>
                                                    <h5 className={`text-[10px] font-black uppercase tracking-widest ${insight.type === 'success' ? 'text-emerald-600' : insight.type === 'warning' ? 'text-amber-600' : 'text-slate-600'}`}>
                                                        {insight.title}
                                                    </h5>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{insight.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Legend minimal */}
                    <div className="flex justify-center gap-6 pt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Fuerza</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Surf</span>
                        </div>
                    </div>
                </div>
            )}

            {dashTab === 'logs' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-500 pb-20" onClick={() => setActiveLogMenu(null)}>
                    {logs.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                            <IconCalendar size={40} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin sesiones registradas</p>
                        </div>
                    ) : (
                        logs.map((log: any) => {
                            const isExpanded = expandedLogs[log.id];
                            const dateObj = parseSafeDate(log.date);
                            const dayNum = dateObj.getDate();
                            const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
                            
                            return (
                                <div key={log.id} className={`bg-white rounded-[2.5rem] border transition-all duration-300 ${isExpanded ? 'border-slate-200 shadow-xl' : 'border-slate-100 shadow-sm'}`}>
                                    <div className="p-4 flex items-center gap-4 cursor-pointer relative" onClick={() => setExpandedLogs(prev => ({ ...prev, [log.id]: !isExpanded }))}>
                                        {/* Date Block */}
                                        <div className="flex flex-col items-center justify-center bg-slate-50 min-w-[56px] h-[56px] rounded-2xl border border-slate-100">
                                            <span className="text-[10px] font-black text-slate-300 leading-none mb-0.5 tracking-tighter">{dayName}</span>
                                            <span className="text-2xl font-black text-slate-900 leading-none tracking-tighter">{dayNum}</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-[15px] font-black text-slate-800 leading-none tracking-tight truncate">
                                                    {log.routineTitle || log.blockId}
                                                </h4>
                                                {log.hasPR && (
                                                    <div className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm shadow-amber-100">
                                                        <IconTrophy size={10} />
                                                        <span className="text-[8px] font-black uppercase tracking-tight">PR</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                {(log.surfData || log.muayThaiData || log.activityData) && (
                                                    <div className="flex items-center gap-1 bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">
                                                        <IconActivity size={10} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Actividad</span>
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {Object.keys(log.gymData?.progress || {}).length} Ejercicios
                                                </p>
                                            </div>
                                        </div>

                                        {/* More Menu */}
                                        <div className="relative" onClick={e => e.stopPropagation()}>
                                            <button 
                                                onClick={() => setActiveLogMenu(activeLogMenu === log.id ? null : log.id)}
                                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors"
                                            >
                                                <IconMoreVertical size={18} />
                                            </button>
                                            
                                            {activeLogMenu === log.id && (
                                                <div className="absolute right-0 top-12 w-32 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in zoom-in-95">
                                                    <button 
                                                        onClick={() => { handleEditLog(log); setActiveLogMenu(null); }}
                                                        className="w-full px-4 py-2 text-left text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <IconEdit size={14} /> Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => { if(window.confirm('¿Borrar esta sesión?')) handleDeleteLog(log.id); setActiveLogMenu(null); }}
                                                        className="w-full px-4 py-2 text-left text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                                                    >
                                                        <IconTrash size={14} /> Borrar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-5 pb-6 pt-2 border-t border-slate-50 space-y-5">
                                            {log.gymData?.exercises?.map((ex: any) => {
                                                const sets = log.gymData.progress?.[ex.id] || [];
                                                const completedSets = Array.isArray(sets) ? sets.filter((s: any) => s.completed) : [];
                                                if (completedSets.length === 0) return null;
                                                
                                                return (
                                                    <div key={ex.id} className="space-y-2">
                                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                            <span className="w-1 h-2 bg-slate-300 rounded-full" />
                                                            {ex.name}
                                                        </h5>
                                                        <div className="bg-slate-50/50 rounded-2xl p-3">
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {completedSets.map((s: any, idx: number) => (
                                                                    <div key={idx} className="text-center p-2 rounded-xl border bg-white border-slate-100">
                                                                        <div className="text-[8px] font-black text-slate-300 uppercase mb-0.5">S{idx+1}</div>
                                                                        <div className="text-[11px] font-black text-slate-800">
                                                                            {ex.type === 'time' ? `${s.reps}m` : (ex.type === 'check' ? 'OK' : `${s.weight}x${s.reps}`)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {(log.surfData || log.muayThaiData || log.activityData) && (
                                                <div className="pt-4 border-t border-slate-50">
                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
                                                        <IconActivity size={12} /> Impacto Metabólico
                                                    </h5>
                                                    <div className="bg-indigo-50/30 p-4 rounded-3xl grid grid-cols-2 gap-4">
                                                        {log.surfData && (
                                                            <div className="col-span-2 sm:col-span-1">
                                                                <span className="text-[8px] font-black uppercase text-indigo-300 block mb-1">Surf</span>
                                                                <span className="text-sm font-black text-indigo-600">{log.surfData.duration}min · {log.surfData.feeling}</span>
                                                            </div>
                                                        )}
                                                        {log.muayThaiData && (
                                                            <div className="col-span-2 sm:col-span-1">
                                                                <span className="text-[8px] font-black uppercase text-indigo-300 block mb-1">Muay Thai</span>
                                                                <span className="text-sm font-black text-indigo-600">{log.muayThaiData.duration}min · {log.muayThaiData.intensity}</span>
                                                            </div>
                                                        )}
                                                        {log.activityData && (
                                                            <div className="col-span-2 sm:col-span-1">
                                                                <span className="text-[8px] font-black uppercase text-indigo-300 block mb-1">Actividad Extra</span>
                                                                <span className="text-sm font-black text-indigo-600">{log.activityData.duration}min</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
