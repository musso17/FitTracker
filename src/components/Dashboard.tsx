import React, { useState } from 'react';
import { 
    IconTarget, IconCalendar, IconTrophy, 
    IconEdit, IconTrash, IconDumbbell, IconX, IconChevronRight, IconActivity, IconFlame, IconInfoCircle
} from '../constants';
import type { TrainingBlock, TrainingLog } from '../types';
import { detectBestDay, calculateConsistency, calculateMuscleBalance, ANALYTICS_DOCS, predictGoalDate } from './Common';

interface DashboardProps {
    dashboardStats: any;
    dashboardInsights: any[];
    coachInsights: any[];
    logs: TrainingLog[];
    PLAN_BLOCKS: TrainingBlock[];
    ANA_PLAN: TrainingBlock[];
    MARCELO_PLAN: TrainingBlock[];
    handleEditLog: (log: any) => void;
    handleDeleteLog: (id: number) => void;
    selectedExerciseId: string | null;
    setSelectedExerciseId: (id: string | null) => void;
    intel: any;
}

const Dashboard: React.FC<DashboardProps> = ({
    dashboardStats,
    dashboardInsights,
    coachInsights,
    logs,
    PLAN_BLOCKS,
    ANA_PLAN,
    MARCELO_PLAN,
    handleEditLog,
    handleDeleteLog,
    selectedExerciseId,
    setSelectedExerciseId,
    intel
}) => {
    const [dashTab, setDashTab] = useState<'stats' | 'strength' | 'patrones' | 'logs'>('stats');
    const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});
    const [expandedMetrics, setExpandedMetrics] = useState<Record<string, boolean>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [helpKey, setHelpKey] = useState<keyof typeof ANALYTICS_DOCS | null>(null);

    const unlockedCount = dashboardStats.achievements?.filter((a: any) => a.unlocked).length || 0;
    const totalBadges = dashboardStats.achievements?.length || 0;

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
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner shrink-0 ml-4">
                    <button onClick={() => setDashTab('stats')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${dashTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Stats & Fuerza</button>
                    <button onClick={() => setDashTab('patrones')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${dashTab === 'patrones' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Patrones</button>
                    <button onClick={() => setDashTab('logs')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${dashTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Logs</button>
                </div>
            </header>

            {dashTab === 'stats' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
                    <section className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-5 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
                            <IconTarget className="text-slate-400 mb-3" size={20} />
                            <span className="text-3xl font-black block leading-none">{dashboardStats.workoutsThisWeek}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1 block">Sesiones esta semana</span>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full mt-5 overflow-hidden">
                                <div className="h-full bg-cyan-400 transition-all duration-1000" style={{ width: `${Math.min((dashboardStats.workoutsThisWeek / 4) * 100, 100)}%` }} />
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group cursor-pointer active:scale-95 transition-all" onClick={() => setShowAchievements(true)}>
                            <div className="flex items-start justify-between">
                                <IconTrophy className="text-amber-400 mb-3" size={20} />
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block leading-none mb-1">Metas</span>
                                    <span className="text-[12px] font-black text-slate-800 tabular-nums">{dashboardStats.logros}</span>
                                </div>
                            </div>
                            <span className="text-3xl font-black block leading-none text-slate-800 mt-2">{unlockedCount}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1 block">Logros y Medallas</span>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                                <IconTrophy size={100} />
                            </div>
                        </div>
                    </section>

                    {/* Fusión: Métricas de Fuerza debajo de las tarjetas */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Progreso por Ejercicio</h3>
                        <div className="space-y-3">
                            {dashboardStats.strengthMetrics?.filter((m: any) => m.history.length > 0).map((metric: any) => {
                                const isExpanded = expandedMetrics[metric.id];
                                const lastDone = metric.history?.[metric.history.length - 1];
                                return (
                                    <div key={metric.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedMetrics(prev => ({ ...prev, [metric.id]: !isExpanded }))}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                    <IconDumbbell size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-[13px] text-slate-800 leading-tight">{metric.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lastDone?.weight}kg × {lastDone?.reps}</span>
                                                        {(() => {
                                                            const pred = predictGoalDate(metric.history, lastDone?.weight, metric.goal);
                                                            if (!pred) return null;
                                                            return (
                                                                <span className="text-[9px] font-black bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                    {pred}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                            <IconChevronRight size={14} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </div>
                                        {isExpanded && (
                                            <div className="mt-6 pt-6 border-t border-slate-50 space-y-6 animate-in slide-in-from-top-2">
                                                {/* Meta de Fuerza */}
                                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximo Objetivo</h5>
                                                        <span className="text-xs font-black text-slate-900">{metric.goal}kg</span>
                                                    </div>
                                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                        <div 
                                                            className="h-full bg-indigo-500 transition-all duration-1000" 
                                                            style={{ width: `${Math.min(metric.progress || 0, 100)}%` }} 
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium italic">
                                                        Estás al {Math.round(metric.progress || 0)}% de tu meta sugerida.
                                                    </p>
                                                </div>

                                                {/* Historial de Récords */}
                                                <div className="space-y-3">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Historial de Récords</h5>
                                                    <div className="space-y-2">
                                                        {metric.history.slice(-5).reverse().map((record: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between bg-white border border-slate-50 p-3 rounded-xl">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400">
                                                                        {new Date(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-800">{record.weight}kg</span>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-400">× {record.reps} reps</span>
                                                            </div>
                                                        )) || <p className="text-[10px] text-slate-400 italic">No hay historial aún</p>}
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
                                                    const exName = log.gymData.exercises?.find((e: any) => e.id === exId)?.name || 'Ejercicio';
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
                                                                        <span className="text-[11px] font-black text-slate-800">{s.weight}kg</span>
                                                                        <span className="text-[9px] font-bold text-slate-400">×</span>
                                                                        <span className="text-[11px] font-black text-slate-800">{s.reps}</span>
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
