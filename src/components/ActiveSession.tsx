import React, { useState } from 'react';
import {
    IconArrowLeft, IconCheckCircle, IconMoreVertical, IconPlus, IconInfoCircle
} from '../constants';
import { suggestProgression, hapticFeedback } from './Common';

interface ActiveSessionProps {
    activeBlock: any;
    gymProgress: any;
    setGymProgress: any;
    skippedExercises: any;
    setSkippedExercises: any;
    surfForm: any;
    setSurfForm: any;
    muayThaiForm: any;
    setMuayThaiForm: any;
    activityForm: any;
    setActivityForm: any;
    sessionExercises: any[];
    setSessionExercises: any;
    editingLogId: string | null;
    setIsExerciseSelectorOpen: (open: boolean) => void;
    setReplacingExerciseId: (id: string | null) => void;
    
    PLAN_BLOCKS: any[];
    setActiveTab: (tab: string) => void;
    dashboardStats: any;
    logs: any[];
    activeMenuId: string | null;
    setActiveMenuId: (id: string | null) => void;
    startRestTimer: (tip?: string) => void;
    handleFinishSession: () => void;
    showToast: (msg: string, type: string) => void;
    restTimer: number;
}

const ActiveSession: React.FC<ActiveSessionProps> = ({
    activeBlock,
    gymProgress,
    setGymProgress,
    skippedExercises,
    setSkippedExercises,
    surfForm,
    setSurfForm,
    muayThaiForm,
    setMuayThaiForm,
    activityForm,
    setActivityForm,
    sessionExercises,
    editingLogId,
    setIsExerciseSelectorOpen,
    setReplacingExerciseId,
    setActiveTab,
    dashboardStats,
    logs,
    activeMenuId,
    setActiveMenuId,
    startRestTimer,
    handleFinishSession
}) => {
    const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});

    return (
        <div className="pb-32 bg-slate-50 min-h-screen animate-in fade-in duration-500">
            {/* Header Editorial */}
            <header className="bg-white border-b border-slate-100 px-5 pt-safe pb-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/90">
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('home')} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-transform">
                        <IconArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">{activeBlock.title}</h2>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-2 italic flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Sesión en Curso
                        </p>
                    </div>
                </div>
            </header>

            {/* Note Section */}
            {activeBlock.note && (
                <div className="mx-5 mt-6 mb-8 p-6 bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                            <IconInfoCircle className="text-white/60" size={20} />
                        </div>
                        <p className="text-xs font-bold text-white/90 leading-relaxed italic pr-2">“{activeBlock.note}”</p>
                    </div>
                </div>
            )}

            {/* Special Forms (Surf, MT) */}
            {(activeBlock.hasSurf || activeBlock.hasMuayThai) && (
                <div className="mx-5 mb-8 space-y-6">
                    {activeBlock.hasSurf && (
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">🏄‍♂️ Reporte Surf</h3>
                                <div className="text-lg font-black text-slate-400">{surfForm.duration}m</div>
                            </div>
                            <input 
                                type="range" min="10" max="180" step="5" 
                                value={surfForm.duration} 
                                onChange={(e) => setSurfForm({ ...surfForm, duration: parseInt(e.target.value) })}
                                className="w-full accent-cyan-500 mb-6"
                            />
                            <div className="flex gap-2">
                                {['struggle', 'good', 'awesome'].map((f: any) => (
                                    <button 
                                        key={f} 
                                        onClick={() => setSurfForm({ ...surfForm, feeling: f })}
                                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${surfForm.feeling === f ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        {f === 'struggle' ? 'Duro' : f === 'good' ? 'Bien' : 'Top'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeBlock.hasMuayThai && (
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">🥊 Muay Thai</h3>
                            <div className="space-y-4">
                                {['ligera', 'media', 'exigente'].map((i: any) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setMuayThaiForm({ ...muayThaiForm, intensity: i })}
                                        className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${muayThaiForm.intensity === i ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                                    >
                                        {i === 'ligera' ? '🍃 Ligera' : i === 'media' ? '⚡ Media' : '🔥 Exigente'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between items-center px-5 mt-8 mb-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                    Ejercicios
                </h3>
            </div>

            <div className="space-y-6 mx-4">
                {sessionExercises.map((exercise: any) => {
                    const isSkipped = skippedExercises[exercise.id];
                    const metric = dashboardStats.strengthMetrics?.find((m: any) => m.id === exercise.id);
                    const progress = gymProgress[exercise.id] || [];
                    const firstUncompletedIdx = progress.findIndex((s: any) => !s.completed);

                    return (
                        <div key={exercise.id} className={`bg-white rounded-[2.5rem] shadow-sm border transition-all ${isSkipped ? 'border-slate-100 opacity-40' : 'border-slate-100 shadow-slate-200/50'}`}>
                            <div className="p-5 pb-2">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-black text-base tracking-tight uppercase ${isSkipped ? 'text-slate-300 line-through' : 'text-slate-900'}`}>{exercise.name}</h4>
                                            {exercise.tip && (
                                                <button onClick={() => setExpandedTips(prev => ({ ...prev, [exercise.id]: !expandedTips[exercise.id] }))} className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center active:scale-90 transition-transform border border-slate-100">
                                                    <span className="text-[10px]">💡</span>
                                                </button>
                                            )}
                                        </div>
                                        {!isSkipped && (
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-slate-100">
                                                    {exercise.sets} x {exercise.target}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => setActiveMenuId(activeMenuId === exercise.id ? null : exercise.id)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 active:bg-slate-100">
                                        <IconMoreVertical size={14} />
                                    </button>
                                </div>
                                
                                {expandedTips[exercise.id] && exercise.tip && (
                                    <div className="bg-slate-900 p-4 rounded-2xl shadow-xl mb-3 animate-in fade-in zoom-in-95 duration-200 border border-white/10">
                                        <p className="text-[10px] font-bold text-white leading-relaxed italic pr-2">“{exercise.tip}”</p>
                                    </div>
                                )}
                            </div>

                            {!isSkipped && (
                                <div className="px-3 pb-5">
                                    <div className="space-y-2">
                                        {progress.map((set: any, idx: number) => {
                                            const prevLogsWithEx = logs.filter(l => l.id !== editingLogId && l.gymData?.progress?.[exercise.id]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                            const lastProgress = prevLogsWithEx[0]?.gymData?.progress?.[exercise.id];
                                            const ghostWeight = lastProgress?.[idx]?.completed ? lastProgress[idx].weight : '';
                                            const ghostReps = lastProgress?.[idx]?.completed ? lastProgress[idx].reps : '';

                                            const prog = suggestProgression(
                                                parseFloat(ghostWeight) || 0,
                                                parseInt(ghostReps) || 0,
                                                parseInt(exercise.target) || 8,
                                                exercise.visual || '',
                                                2, 
                                                metric?.isAssisted || false
                                            );

                                            const isCurrent = idx === firstUncompletedIdx;
                                            const isMeeting = parseFloat(set.weight) >= prog.suggestedWeight && prog.suggestedWeight > 0;

                                            if (!isCurrent) {
                                                return (
                                                    <button 
                                                        key={idx}
                                                        onClick={() => {
                                                            setGymProgress((p: any) => {
                                                                const o = [...p[exercise.id]];
                                                                o[idx] = { ...o[idx], completed: false };
                                                                return { ...p, [exercise.id]: o };
                                                            });
                                                        }}
                                                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${set.completed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-100/50 border-slate-200'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-[10px] font-black ${set.completed ? 'text-emerald-700' : 'text-slate-500'}`}>S{idx + 1}</span>
                                                            <span className={`text-xs font-black ${set.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                                                {set.completed ? `${set.weight}kg × ${set.reps}` : `Sug: ${prog.suggestedWeight}kg × ${exercise.target}`}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {set.completed && <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${parseInt(set.rir) <= 1 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}`}>RIR {set.rir}</span>}
                                                            <IconCheckCircle size={16} className={set.completed ? 'text-emerald-600' : 'text-slate-300'} />
                                                        </div>
                                                    </button>
                                                );
                                            }

                                            return (
                                                <div key={idx} className="bg-slate-900 rounded-[2.5rem] p-5 shadow-2xl shadow-slate-900/50 border border-white/10 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-3xl" />
                                                    
                                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black text-white">S{idx + 1}</span>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serie Activa</span>
                                                        </div>
                                                        {prog.suggestedWeight > 0 && (
                                                            <div className={`px-3 py-1 rounded-full border transition-all ${isMeeting ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-orange-500/10 border-orange-500/20'}`}>
                                                                <span className={`text-[9px] font-black uppercase tracking-tight ${isMeeting ? 'text-emerald-400' : 'text-orange-500'}`}>
                                                                    {isMeeting ? '✅ Logrado' : `🎯 Meta: ${prog.suggestedWeight}kg`}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                                                        <div className="bg-white/5 rounded-[2rem] p-4 border border-white/10 flex flex-col items-center">
                                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">KG</span>
                                                            <input 
                                                                type="text" 
                                                                inputMode="decimal"
                                                                value={set.weight} 
                                                                onChange={(e) => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], weight: e.target.value }; return { ...p, [exercise.id]: o }; })}
                                                                onFocus={(e) => e.target.select()}
                                                                className="w-full bg-transparent text-center text-4xl font-black text-white outline-none caret-emerald-500 p-0"
                                                                placeholder="0"
                                                            />
                                                            <div className="flex justify-center mt-3 gap-1">
                                                                <button onClick={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], weight: String(Math.max(0, (parseFloat(o[idx].weight) || 0) - 2.5)) }; return { ...p, [exercise.id]: o }; })} className="w-10 h-8 flex items-center justify-center bg-white/5 rounded-lg text-[10px] font-black text-slate-400 active:bg-white/10 transition-all">-2.5</button>
                                                                <button onClick={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], weight: String((parseFloat(o[idx].weight) || 0) + 2.5) }; return { ...p, [exercise.id]: o }; })} className="w-10 h-8 flex items-center justify-center bg-white/5 rounded-lg text-[10px] font-black text-slate-400 active:bg-white/10 transition-all">+2.5</button>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white/5 rounded-[2rem] p-4 border border-white/10 flex flex-col items-center">
                                                            <input 
                                                                type="text" 
                                                                inputMode="numeric"
                                                                value={set.reps} 
                                                                onChange={(e) => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], reps: e.target.value }; return { ...p, [exercise.id]: o }; })}
                                                                onFocus={(e) => e.target.select()}
                                                                className="w-full bg-transparent text-center text-4xl font-black text-white outline-none caret-emerald-500 p-0"
                                                                placeholder="0"
                                                            />
                                                            <div className="flex justify-center mt-3 gap-1">
                                                                <button onClick={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], reps: String(Math.max(0, (parseInt(o[idx].reps) || 0) - 1)) }; return { ...p, [exercise.id]: o }; })} className="w-10 h-8 flex items-center justify-center bg-white/5 rounded-lg text-[10px] font-black text-slate-400 active:bg-white/10 transition-all">-1</button>
                                                                <button onClick={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], reps: String((parseInt(o[idx].reps) || 0) + 1) }; return { ...p, [exercise.id]: o }; })} className="w-10 h-8 flex items-center justify-center bg-white/5 rounded-lg text-[10px] font-black text-slate-400 active:bg-white/10 transition-all">+1</button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4 relative z-10">
                                                        <div className="flex gap-2 justify-between">
                                                            {[
                                                                { v: 0, label: 'Fallo', color: 'bg-rose-600' },
                                                                { v: 1, label: 'Límite', color: 'bg-orange-500' },
                                                                { v: 2, label: 'Pesado', color: 'bg-amber-500' },
                                                                { v: 3, label: 'Sólido', color: 'bg-emerald-500' },
                                                                { v: 4, label: 'Ligero', color: 'bg-indigo-500' }
                                                            ].map(r => {
                                                                const isSelected = String(r.v) === (set.rir || '2');
                                                                return (
                                                                    <button 
                                                                        key={r.v}
                                                                        onClick={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], rir: String(r.v) }; return { ...p, [exercise.id]: o }; })}
                                                                        className={`flex-1 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${isSelected ? `${r.color} scale-105 shadow-lg` : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                                                    >
                                                                        <span className={`text-lg font-black ${isSelected ? 'text-white' : 'text-slate-400'}`}>{r.v}</span>
                                                                        <span className={`text-[7px] font-black uppercase mt-0.5 tracking-tighter ${isSelected ? 'text-white/80' : 'text-slate-600'}`}>{r.label}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            hapticFeedback('success');
                                                            setGymProgress((p: any) => {
                                                                const o = [...p[exercise.id]];
                                                                o[idx] = { ...o[idx], completed: true };
                                                                if (idx < o.length - 1) {
                                                                    const nextIdx = idx + 1;
                                                                    if (!o[nextIdx].completed) {
                                                                        const suggestion = suggestProgression(
                                                                            parseFloat(o[idx].weight) || 0,
                                                                            parseInt(o[idx].reps) || 0,
                                                                            parseInt(exercise.target) || 8,
                                                                            exercise.visual || '',
                                                                            parseInt(o[idx].rir) || 2,
                                                                            metric?.isAssisted || false
                                                                        );
                                                                        o[nextIdx] = { ...o[nextIdx], weight: String(suggestion.suggestedWeight), reps: o[nextIdx].reps || o[idx].reps };
                                                                    }
                                                                }
                                                                return { ...p, [exercise.id]: o };
                                                            });
                                                            startRestTimer(exercise.tip);
                                                        }}
                                                        className="w-full h-14 bg-emerald-500 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
                                                    >
                                                        <span className="text-white text-sm font-black uppercase tracking-widest">Siguiente Serie</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <button
                    onClick={() => { setReplacingExerciseId(null); setIsExerciseSelectorOpen(true); }}
                    className="w-full py-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 flex items-center justify-center gap-3 active:bg-slate-50 transition-colors group"
                >
                    <IconPlus size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Añadir otro ejercicio</span>
                </button>
            </div>

            <div className="px-5 mt-10">
                <button
                    onClick={handleFinishSession}
                    className="w-full h-18 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/40 text-sm active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                    Finalizar Sesión
                    <IconCheckCircle className="text-emerald-400" />
                </button>
            </div>
        </div>
    );
};

export default ActiveSession;
