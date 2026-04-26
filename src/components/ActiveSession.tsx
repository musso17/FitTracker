import React, { useMemo, useState, useCallback, useRef } from 'react';
import { 
    IconX, IconWaves, IconFlame, IconActivity, IconCheckCircle, IconMoreVertical, IconSync, IconPlus, IconMinus, IconTarget,
    getColorClasses, ACTIVITY_TYPES, hapticFeedback
} from '../constants';
import { calculateStamina, calculate1RM, suggestProgression, predictPRProbability } from './Common';
import { supabase } from '../utils/supabase';

function useLongPress(callback: () => void, ms = 400, interval = 150) {
  const timerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const pressed = useRef(false);

  const start = useCallback((e: any) => {
    if (pressed.current) return;
    pressed.current = true;
    
    // Ejecutar inmediatamente para respuesta instantánea
    callback();
    
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(callback, interval);
    }, ms);
  }, [callback, ms, interval]);

  const stop = useCallback(() => {
    pressed.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return { 
    onMouseDown: (e: any) => { if (e.button === 0) start(e); }, 
    onMouseUp: stop, 
    onMouseLeave: stop, 
    onTouchStart: (e: any) => { 
        // Solo prevenir si no queremos que el navegador maneje el tap/scroll
        // Pero para botones de incremento, queremos respuesta inmediata
        if (e.cancelable) e.preventDefault(); 
        start(e); 
    }, 
    onTouchEnd: stop,
    onTouchMove: (e: any) => {
        // Si el usuario mueve el dedo (scroll), cancelamos el incremento
        stop();
    }
  };
}

interface PillStepperProps {
    value: string;
    onIncrement: () => void;
    onDecrement: () => void;
    onChange: (val: string) => void;
    width?: string;
    unit?: string;
    completed?: boolean;
    indicator?: React.ReactNode;
    className?: string;
}

const PillStepper: React.FC<PillStepperProps> = ({ value, onIncrement, onDecrement, onChange, width, unit, completed, indicator, className }) => {
    const longPressInc = useLongPress(onIncrement);
    const longPressDec = useLongPress(onDecrement);

    return (
        <div 
            className={`relative flex items-center bg-slate-100 rounded-2xl h-11 transition-all ${completed ? 'opacity-50 pointer-events-none' : 'active:bg-slate-200/50'} ${className || ''}`} 
            style={width ? { width } : { flex: 1 }}
        >
            <button 
                {...longPressDec}
                className="w-10 h-full flex items-center justify-center text-slate-600 active:scale-90 transition-transform touch-none"
                type="button"
            ><IconMinus size={14} /></button>
            
            <div className="flex-1 relative h-full flex items-center justify-center">
                <input 
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="w-full bg-transparent border-none text-center font-black text-sm text-slate-900 placeholder:text-slate-400 outline-none p-0"
                />
            </div>

            <button 
                {...longPressInc}
                className="w-10 h-full flex items-center justify-center text-slate-600 active:scale-90 transition-transform touch-none"
                type="button"
            ><IconPlus size={14} /></button>
            
            {indicator && (
                <div className="absolute -top-1 -right-1 z-10 animate-pulse">
                    {indicator}
                </div>
            )}
        </div>
    );
};
interface ActiveSessionProps {
    activeBlock: any;
    PLAN_BLOCKS: any[];
    setActiveBlock: (block: any) => void;
    editingLogId: number | null;
    setEditingLogId: (id: number | null) => void;
    isChangingBlock: boolean;
    setIsChangingBlock: (changing: boolean) => void;
    setActiveTab: (tab: string) => void;
    gymProgress: any;
    setGymProgress: any;
    skippedExercises: any;
    setSkippedExercises: any;
    surfForm: any;
    setSurfForm: (form: any) => void;
    muayThaiForm: any;
    setMuayThaiForm: (form: any) => void;
    activityForm: any;
    setActivityForm: any;
    sessionExercises: any[];
    setSessionExercises: (exs: any[]) => void;
    setIsExerciseSelectorOpen: (open: boolean) => void;
    setReplacingExerciseId: (id: string | null) => void;
    dashboardStats: any;
    logs: any[];
    activeMenuId: string | null;
    setActiveMenuId: (id: string | null) => void;
    startRestTimer: (tip?: string) => void;
    handleFinishSession: () => void;
    showToast: (msg: string, type: any) => void;
    restTimer: { active: boolean, seconds: number, total: number };
}

const ActiveSession: React.FC<ActiveSessionProps> = ({
    activeBlock,
    PLAN_BLOCKS,
    setActiveBlock,
    editingLogId,
    setEditingLogId,
    isChangingBlock,
    setIsChangingBlock,
    setActiveTab,
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
    setIsExerciseSelectorOpen,
    setReplacingExerciseId,
    dashboardStats,
    logs,
    activeMenuId,
    setActiveMenuId,
    startRestTimer,
    handleFinishSession,
    restTimer
}) => {
    const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});

    // Safety guard: Si no hay bloque activo, no renderizar nada para evitar crashes
    if (!activeBlock) return null;

    // Calcular progreso global
    const totals = useMemo(() => {
        let total = 0;
        let completed = 0;
        Object.values(gymProgress).forEach((sets: any) => {
            if (Array.isArray(sets)) {
                total += sets.length;
                completed += sets.filter((s: any) => s.completed).length;
            }
        });
        return { total, completed, percent: total > 0 ? (completed / total) * 100 : 0 };
    }, [gymProgress]);

    const onFinishClick = () => {
        if (totals.completed === 0) {
            if (confirm('No has completado ninguna serie todavía. ¿Quieres terminar la sesión de todas formas?')) {
                handleFinishSession();
            }
        } else {
            handleFinishSession();
        }
    };
    return (
        <div className="space-y-6 pb-4 animate-in slide-in-from-right">
            <header className="sticky top-[-1px] px-4 bg-[#f8fafc]/95 backdrop-blur-xl border-b border-slate-200 z-30 flex items-center justify-between" style={{ paddingTop: 'max(24px, calc(env(safe-area-inset-top) + 12px))', paddingBottom: '16px' }}>
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        {/* Ring Progress */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="20" cy="20" r="18" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 18}`} strokeDashoffset={`${2 * Math.PI * 18 * (1 - totals.percent / 100)}`} className={`${getColorClasses(activeBlock.color).split(' ')[1]} transition-all duration-500`} strokeLinecap="round" />
                        </svg>
                        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full`}>
                            {React.createElement(activeBlock.icon || IconActivity, { size: 16 })}
                        </div>
                    </div>
                    <div>
                        <h2 className="font-bold text-base text-slate-800 leading-tight">{activeBlock.title}</h2>
                        <div className="flex gap-2 items-center mt-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{totals.completed}/{totals.total} series</span>
                            {editingLogId && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Editando</span>}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {restTimer.active && (
                        <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full flex items-center gap-2 animate-in fade-in zoom-in duration-300 shadow-lg shadow-slate-900/30">
                            <span className="animate-pulse text-xs">⏱️</span>
                            <span className="text-xs font-black tabular-nums">{Math.floor(restTimer.seconds / 60)}:{String(restTimer.seconds % 60).padStart(2, '0')}</span>
                        </div>
                    )}
                    <button onClick={() => { setActiveBlock(null); setEditingLogId(null); setIsChangingBlock(false); setActiveTab('home'); }} className="w-10 h-10 flex items-center justify-center bg-slate-200 rounded-full text-slate-600 active:scale-90 transition-transform"><IconX size={18} /></button>
                </div>
            </header>

            {isChangingBlock && (
                <div className="mx-2 p-4 bg-white rounded-2xl border-2 border-amber-200 animate-in zoom-in-95 shadow-lg shadow-amber-100/50">
                    <h3 className="font-bold text-slate-700 text-sm mb-3">Selecciona el bloque correcto:</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {PLAN_BLOCKS.map((block) => (
                            <button 
                                key={block.id} 
                                onClick={() => {
                                    setActiveBlock(block);
                                    if (block.exercises.length > 0) {
                                        const initialProgress: any = {};
                                        block.exercises.forEach((ex: any) => initialProgress[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', completed: false })));
                                        setGymProgress(initialProgress);
                                    }
                                    setSkippedExercises({});
                                    setSurfForm({ duration: 60, feeling: 'good' });
                                    setMuayThaiForm({ duration: 80, intensity: 'media' });
                                    setIsChangingBlock(false);
                                }}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${activeBlock.id === block.id ? 'border-amber-500 bg-amber-50' : 'border-slate-100 bg-slate-50 opacity-70'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorClasses(block.color)}`}>
                                    {React.createElement(block.icon || IconActivity, { size: 14 })}
                                </div>
                                <span className="font-bold text-slate-800 text-xs">{block.title}</span>
                                {activeBlock.id === block.id && <IconCheckCircle size={14} className="ml-auto text-amber-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeBlock.note && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mx-2 flex gap-3 items-start shadow-sm shadow-amber-100/30">
                    <span className="text-amber-500 mt-0.5">💡</span>
                    <p className="text-sm text-amber-800 font-medium leading-snug">{activeBlock.note}</p>
                </div>
            )}

            {activeBlock.hasSurf && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-cyan-100 mx-2">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><IconWaves className="text-cyan-500" size={18} /> Reporte de Surf</h3>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tiempo en el agua</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="20" max="180" step="10" value={surfForm.duration} onChange={(e) => setSurfForm({ ...surfForm, duration: parseInt(e.target.value) })} className="w-full accent-cyan-500" />
                                <span className="font-bold text-cyan-600 text-lg w-16 text-right">{surfForm.duration}m</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">¿Cómo te sentiste?</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button onClick={() => setSurfForm({ ...surfForm, feeling: 'struggle' })} className={`py-3 px-4 rounded-xl text-left text-sm font-medium transition-colors ${surfForm.feeling === 'struggle' ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-500' : 'bg-slate-50 border-2 border-transparent text-slate-600'}`}>🚣‍♀️ Pura remada / Difícil</button>
                                <button onClick={() => setSurfForm({ ...surfForm, feeling: 'good' })} className={`py-3 px-4 rounded-xl text-left text-sm font-medium transition-colors ${surfForm.feeling === 'good' ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-500' : 'bg-slate-50 border-2 border-transparent text-slate-600'}`}>🌊 Agarré un par, bien</button>
                                <button onClick={() => setSurfForm({ ...surfForm, feeling: 'awesome' })} className={`py-3 px-4 rounded-xl text-left text-sm font-medium transition-colors ${surfForm.feeling === 'awesome' ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-500' : 'bg-slate-50 border-2 border-transparent text-slate-600'}`}>🤙 ¡Increíble! / Muy divertida</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeBlock.hasMuayThai && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 mx-2">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><IconFlame className="text-orange-500" size={18} /> Reporte de Muay Thai</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                            <div>
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Duración Fija</span>
                                <span className="text-lg font-bold text-slate-700">1h 20m (80 min)</span>
                            </div>
                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                <IconActivity size={20} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Nivel de exigencia</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button onClick={() => setMuayThaiForm({ ...muayThaiForm, intensity: 'ligera' })} className={`py-3 px-4 rounded-xl text-left text-sm font-medium transition-colors ${muayThaiForm.intensity === 'ligera' ? 'bg-orange-100 text-orange-800 border-2 border-orange-500' : 'bg-slate-50 border-2 border-transparent text-slate-600'}`}>🍃 Ligera</button>
                                <button onClick={() => setMuayThaiForm({ ...muayThaiForm, intensity: 'media' })} className={`py-3 px-4 rounded-xl text-left text-sm font-medium transition-colors ${muayThaiForm.intensity === 'media' ? 'bg-orange-100 text-orange-800 border-2 border-orange-500' : 'bg-slate-50 border-2 border-transparent text-slate-600'}`}>⚡ De mediana exigencia</button>
                                <button onClick={() => setMuayThaiForm({ ...muayThaiForm, intensity: 'exigente' })} className={`py-3 px-4 rounded-xl text-left text-sm font-medium transition-colors ${muayThaiForm.intensity === 'exigente' ? 'bg-orange-100 text-orange-800 border-2 border-orange-500' : 'bg-slate-50 border-2 border-transparent text-slate-600'}`}>🔥 Muy exigente</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeBlock.activityType && !activeBlock.hasSurf && !activeBlock.hasMuayThai && (() => {
                const actDef = ACTIVITY_TYPES.find(a => a.id === activeBlock.activityType);
                if (!actDef) return null;
                const colorMap: any = { cyan: 'border-cyan-100', orange: 'border-orange-100', teal: 'border-teal-100', purple: 'border-purple-100', rose: 'border-rose-100', slate: 'border-slate-200' };
                const accentMap: any = { cyan: 'accent-cyan-500', orange: 'accent-orange-500', teal: 'accent-teal-500', purple: 'accent-purple-500', rose: 'accent-rose-500', slate: 'accent-slate-500' };
                const btnActive: any = { cyan: 'bg-cyan-100 text-cyan-800 border-2 border-cyan-500', orange: 'bg-orange-100 text-orange-800 border-2 border-orange-500', teal: 'bg-teal-100 text-teal-800 border-2 border-teal-500', purple: 'bg-purple-100 text-purple-800 border-2 border-purple-500', rose: 'bg-rose-100 text-rose-800 border-2 border-rose-500', slate: 'bg-slate-200 text-slate-800 border-2 border-slate-500' };

                const selectedIntensity = actDef.intensityOptions.find(o => o.id === activityForm.intensity);
                const estimatedKcal = selectedIntensity ? selectedIntensity.kcalPerMin * activityForm.duration : 0;

                return (
                    <div className={`bg-white p-5 rounded-2xl shadow-sm border ${colorMap[actDef.color] || 'border-slate-100'} mx-2`}>
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">{actDef.emoji}</span> Reporte de {actDef.label}
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Duración</label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="10" max="180" step="5" value={activityForm.duration} onChange={(e) => setActivityForm((prev: any) => ({ ...prev, duration: parseInt(e.target.value) }))} className={`w-full ${accentMap[actDef.color] || 'accent-slate-500'}`} />
                                    <span className="font-bold text-slate-700 text-lg w-16 text-right">{activityForm.duration}m</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Nivel de exigencia</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {actDef.intensityOptions.map(opt => (
                                        <button key={opt.id} onClick={() => setActivityForm((prev: any) => ({ ...prev, intensity: opt.id }))} className={`py-3 px-4 rounded-xl text-left text-sm font-medium transition-colors ${activityForm.intensity === opt.id ? (btnActive[actDef.color] || 'bg-slate-200 text-slate-800 border-2 border-slate-500') : 'bg-slate-50 border-2 border-transparent text-slate-600'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {estimatedKcal > 0 && (
                                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100 shadow-inner">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimación calórica</span>
                                    <span className="text-lg font-black text-slate-800">~{estimatedKcal} kcal</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            <div className="flex justify-between items-center px-1 mb-2 mt-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-slate-900 rounded-full" />
                    Ejercicios de hoy
                </h3>
                <button 
                    onClick={() => {
                        setReplacingExerciseId(null);
                        setIsExerciseSelectorOpen(true);
                    }}
                    className="text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-md active:scale-95 transition-transform"
                >
                    + Añadir
                </button>
            </div>

            {sessionExercises.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center mx-2 shadow-inner">
                    <p className="text-slate-400 text-xs font-medium">No hay ejercicios aún. Añade uno para empezar.</p>
                </div>
            ) : (
                <div className="space-y-4 mx-2">
                <div className="space-y-6">
                    {sessionExercises.map((exercise: any) => {
                        const isSkipped = skippedExercises[exercise.id];
                        return (
                        <div key={exercise.id} className={`bg-white p-5 rounded-[2.5rem] shadow-sm border transition-all ${isSkipped ? 'border-slate-200 opacity-60' : 'border-slate-100'}`}>
                            <div className="mb-6 flex items-start justify-between relative">
                                <div className="flex-1 pr-4">
                                    <h4 className={`font-black text-[17px] mb-2 tracking-tight ${isSkipped ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{exercise.name}</h4>
                                    {!isSkipped && (
                                        <>
                                            <div className="flex items-center gap-2 flex-wrap mb-3">
                                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-widest border border-slate-200/50">
                                                    {exercise.sets} x {exercise.target}
                                                </span>
                                                {(() => {
                                                    const metric = dashboardStats.strengthMetrics?.find((m: any) => m.id === exercise.id);
                                                    const goal = metric?.goal || 0;
                                                    const currentMax = metric?.currentMax || 0;
                                                    const isAchieved = currentMax >= goal && goal > 0;
                                                    const prob = predictPRProbability(metric?.history || []);
                                                    
                                                    return (
                                                        <>
                                                            {goal > 0 && (
                                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border ${isAchieved ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                                    {isAchieved ? <IconCheckCircle size={10} /> : <IconTarget size={10} />}
                                                                    {isAchieved ? 'Misión Cumplida' : `${metric.isAssisted ? 'Asistencia: ' : 'Meta: '}${goal}kg`}
                                                                </span>
                                                            )}
                                                            {prob >= 0.7 && (
                                                                <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2.5 py-1 rounded-full uppercase tracking-widest border border-rose-200 animate-pulse shadow-sm">
                                                                    🔥 Hoy podrías hacer PR
                                                                </span>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            
                                            {exercise.tip && (() => {
                                                const isExpanded = expandedTips[exercise.id];
                                                return (
                                                    <button onClick={() => setExpandedTips(prev => ({ ...prev, [exercise.id]: !isExpanded }))} className="text-left w-full group">
                                                        <div className="flex items-start gap-2 text-[12px] font-medium leading-relaxed bg-teal-50/50 p-2.5 rounded-2xl border border-teal-100/50">
                                                            <span className="shrink-0 bg-white text-teal-600 w-6 h-6 flex items-center justify-center rounded-xl shadow-sm group-active:scale-90 transition-transform">💡</span>
                                                            <p className={`${isExpanded ? 'text-teal-700' : 'text-slate-500 overflow-hidden line-clamp-1'}`}>
                                                                {exercise.tip}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })()}
                                        </>
                                    )}
                                </div>

                                <div className="relative">
                                    <button onClick={() => setActiveMenuId(activeMenuId === exercise.id ? null : exercise.id)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 active:bg-slate-100 transition-colors">
                                        <IconMoreVertical size={18} />
                                    </button>
                                    
                                    {activeMenuId === exercise.id && (
                                        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden z-[40] animate-in fade-in zoom-in-95 duration-200">
                                            {!isSkipped && (
                                                <button onClick={() => { setReplacingExerciseId(exercise.id); setIsExerciseSelectorOpen(true); setActiveMenuId(null); }} className="w-full text-left px-5 py-4 text-[13px] font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-3">
                                                    <IconSync size={16} className="text-slate-400"/> Reemplazar
                                                </button>
                                            )}
                                            <button onClick={() => { setSkippedExercises((prev: any) => ({...prev, [exercise.id]: !isSkipped})); setActiveMenuId(null); }} className={`w-full text-left px-5 py-4 text-[13px] font-bold flex items-center gap-3 ${isSkipped ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                                                {isSkipped ? <><IconCheckCircle size={16} className="text-emerald-500"/> Recuperar</> : <><IconX size={16} className="text-slate-400"/> Omitir</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isSkipped && (
                                <div className="space-y-3">
                                    {gymProgress[exercise.id]?.map((set: any, idx: number) => {
                                        const prevLogsWithEx = logs.filter(l => l.id !== editingLogId && l.gymData?.progress?.[exercise.id]).sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                        const lastProgress = prevLogsWithEx.length > 0 ? prevLogsWithEx[0].gymData.progress[exercise.id] : null;
                                        const ghostWeight = lastProgress && lastProgress[idx] && lastProgress[idx].completed ? lastProgress[idx].weight : '';
                                        const ghostReps = lastProgress && lastProgress[idx] && lastProgress[idx].completed ? lastProgress[idx].reps : '';
                                        
                                        const metric = dashboardStats.strengthMetrics?.find((m: any) => m.id === exercise.id);
                                        const globalMax = metric ? metric.currentMax : 0;
                                        const currW = parseFloat(set.weight) || 0;
                                        const currR = parseInt(set.reps) || 0;
                                        const prevW = parseFloat(ghostWeight) || 0;
                                        const prevR = parseInt(ghostReps) || 0;
                                        
                                        const isWeightProgression = !metric?.isAssisted ? (currW > 0 && (currW > prevW || (globalMax > 0 && currW > globalMax))) : (currW > 0 && currW < prevW && prevW > 0);
                                        const isRepsProgression = currW > 0 && currR > 0 && currW >= prevW && currR > prevR;

                                        return (
                                        <div key={idx} className={`relative p-3.5 rounded-[2rem] border-2 transition-all duration-300 ${
                                            set.completed 
                                                ? (isWeightProgression ? 'bg-orange-50/50 border-orange-200' : 'bg-emerald-50 border-emerald-200') 
                                                : 'bg-slate-50/50 border-slate-100'
                                        }`}>
                                            <div className="flex items-center justify-between mb-3 px-1">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-black ${set.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}>
                                                        {idx + 1}
                                                    </span>

                                                    {ghostWeight && (
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-bold text-slate-400 italic">
                                                                Prev: {ghostWeight}kg × {ghostReps}
                                                            </span>
                                                            {(() => {
                                                                const prog = suggestProgression(parseFloat(ghostWeight), parseInt(ghostReps), parseInt(exercise.target) || 8, exercise.visual || '');
                                                                if (prog.type === 'increase') {
                                                                    return <span className="text-[9px] font-black text-orange-500 uppercase tracking-tight animate-pulse">🎯 Sugerido: {prog.suggestedWeight}kg</span>;
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const wasCompleted = set.completed;
                                                        if (!wasCompleted) {
                                                            const isPR = isWeightProgression || isRepsProgression;
                                                            hapticFeedback(isPR ? 'pr' : 'light');
                                                        }
                                                        setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], completed: !o[idx].completed }; return { ...p, [exercise.id]: o } });
                                                        if (!wasCompleted) startRestTimer(exercise.tip);
                                                    }} 
                                                    className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all shadow-sm ${
                                                        set.completed ? 'bg-emerald-500 text-white scale-110 shadow-emerald-200' : 'bg-white text-slate-300 active:bg-slate-100'
                                                    }`}
                                                >
                                                    <IconCheckCircle size={20} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {exercise.type === 'weight' ? (
                                                    <>
                                                        <div className="flex-[2] flex flex-col gap-1.5">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-3">PESO TOTAL (KG)</span>
                                                            <PillStepper 
                                                                value={set.weight}
                                                                completed={set.completed}
                                                                unit={metric?.isAssisted ? 'asist' : 'kg'}
                                                                onIncrement={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], weight: String((parseFloat(o[idx].weight) || 0) + 2.5) }; return { ...p, [exercise.id]: o }; })}
                                                                onDecrement={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], weight: String(Math.max(0, (parseFloat(o[idx].weight) || 0) - 2.5)) }; return { ...p, [exercise.id]: o }; })}
                                                                onChange={(v) => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], weight: v }; return { ...p, [exercise.id]: o }; })}
                                                            />
                                                        </div>
                                                        <div className="flex-[2] flex flex-col gap-1.5">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-3">Reps</span>
                                                            <PillStepper 
                                                                value={set.reps}
                                                                completed={set.completed}
                                                                onIncrement={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], reps: String((parseInt(o[idx].reps) || 0) + 1) }; return { ...p, [exercise.id]: o }; })}
                                                                onDecrement={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], reps: String(Math.max(0, (parseInt(o[idx].reps) || 0) - 1)) }; return { ...p, [exercise.id]: o }; })}
                                                                onChange={(v) => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], reps: v }; return { ...p, [exercise.id]: o }; })}
                                                                indicator={isRepsProgression && <span className="text-emerald-500">↑</span>}
                                                            />
                                                        </div>
                                                        <div className="flex-1 flex flex-col gap-1.5">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">RIR</span>
                                                            <button 
                                                                onClick={() => setGymProgress((p: any) => { 
                                                                    const o = [...p[exercise.id]]; 
                                                                    const nextRir = ((parseInt(o[idx].rir) || 0) + 1) % 5;
                                                                    o[idx] = { ...o[idx], rir: String(nextRir) }; 
                                                                    return { ...p, [exercise.id]: o }; 
                                                                })}
                                                                className={`h-11 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                                                                    set.rir === '0' ? 'bg-orange-100 text-orange-600 border-2 border-orange-200' :
                                                                    set.rir === '1' ? 'bg-amber-100 text-amber-600 border-2 border-amber-200' :
                                                                    'bg-slate-100 text-slate-400'
                                                                }`}
                                                            >
                                                                {set.rir || '2'}
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex-1 flex flex-col gap-1.5">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-3">
                                                            {exercise.target?.toLowerCase().includes('s') ? 'Segundos' : 'Reps'}
                                                        </span>
                                                        <PillStepper 
                                                            value={set.reps}
                                                            completed={set.completed}
                                                            onIncrement={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], reps: String((parseInt(o[idx].reps) || 0) + 1) }; return { ...p, [exercise.id]: o }; })}
                                                            onDecrement={() => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], reps: String(Math.max(0, (parseInt(o[idx].reps) || 0) - 1)) }; return { ...p, [exercise.id]: o }; })}
                                                            onChange={(v) => setGymProgress((p: any) => { const o = [...p[exercise.id]]; o[idx] = { ...o[idx], reps: v }; return { ...p, [exercise.id]: o }; })}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            )}
                            {isSkipped && (
                                <div className="text-[12px] text-center text-slate-400 italic py-4 bg-slate-50 rounded-3xl mt-4 border border-dashed border-slate-200">
                                    Ejercicio pospuesto para la próxima sesión.
                                </div>
                            )}
                        </div>
                        )})}
                </div>
                </div>
            )}

            {/* --- MÉTRICAS EN VIVO DE LA SESIÓN --- */}
            {(() => {
                // 💪 Tonelaje Total (Volume Load)
                let tonelaje = 0;
                Object.entries(gymProgress).forEach(([_exId, sets]: [string, any]) => {
                    if (Array.isArray(sets)) {
                        sets.forEach((set: any) => {
                            if (set.completed) {
                                const w = parseFloat(set.weight) || 0;
                                const r = parseInt(set.reps) || 0;
                                tonelaje += w * r;
                            }
                        });
                    }
                });

                // 🔋 Stamina Score (Unificado)
                let staminaScore = 0;
                let staminaLabel = '';

                if (activeBlock.hasSurf) {
                    const res = calculateStamina({ type: 'surf', duration: surfForm.duration, feeling: surfForm.feeling });
                    staminaScore = res.score;
                    staminaLabel = res.label;
                } else if (activeBlock.hasMuayThai) {
                    const res = calculateStamina({ type: 'muay_thai', duration: muayThaiForm.duration, intensity: muayThaiForm.intensity });
                    staminaScore = res.score;
                    staminaLabel = res.label;
                } else if (activeBlock.activityType) {
                    const actDef = ACTIVITY_TYPES.find(a => a.id === activeBlock.activityType);
                    if (actDef) {
                        const res = calculateStamina({ type: 'other', duration: activityForm.duration, intensity: activityForm.intensity });
                        staminaScore = res.score;
                        staminaLabel = res.label;
                    }
                }

                // Gymwork contributi como resistencia muscular
                const completedSets = Object.values(gymProgress).flat().filter((s: any) => s?.completed).length;
                const gymStamina = completedSets * 5;
                staminaScore += gymStamina;

                const hasSomething = tonelaje > 0 || staminaScore > 0;
                if (!hasSomething) return null;

                const tonelajeFormatted = tonelaje >= 1000 ? `${(tonelaje / 1000).toFixed(1)}t` : `${tonelaje} kg`;

                return (
                    <div className="mx-2 mt-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-slate-900/40 border border-white/5 relative overflow-hidden">
                        {/* Decoration */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-700/30 rounded-full blur-3xl" />
                        
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-5 pl-1">Resumen de sesión</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {tonelaje > 0 && (
                                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-sm">
                                    <div className="w-9 h-9 bg-slate-900/50 rounded-xl flex items-center justify-center mb-3">
                                        <IconFlame className="text-orange-400" size={18} />
                                    </div>
                                    <span className="text-3xl font-black tracking-tighter block leading-none">{tonelajeFormatted}</span>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mt-2">Volumen gym</span>
                                </div>
                            )}
                            {staminaScore > 0 && (
                                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-sm">
                                    <div className="w-9 h-9 bg-slate-900/50 rounded-xl flex items-center justify-center mb-3">
                                        <IconActivity className="text-cyan-400" size={18} />
                                    </div>
                                    <span className="text-3xl font-black tracking-tighter block leading-none">{staminaScore} <span className="text-xs uppercase font-bold text-slate-500">pts</span></span>
                                    <span className="text-[10px] text-cyan-400/70 font-black uppercase tracking-widest block mt-2">Stamina score</span>
                                    {staminaLabel && <span className="text-[9px] text-slate-500 block mt-1 font-bold">{staminaLabel}</span>}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            <div className="px-2 pt-6 pb-safe mt-6">
                <button 
                    onClick={() => {
                        hapticFeedback('success');
                        onFinishClick();
                    }} 
                    className="w-full max-w-md mx-auto block bg-slate-900 text-white py-4.5 h-16 rounded-2xl font-black shadow-2xl shadow-slate-900/40 text-lg active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                    Terminar Sesión
                    <IconCheckCircle className="text-emerald-400 group-hover:scale-125 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default ActiveSession;
