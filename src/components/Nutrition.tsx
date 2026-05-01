import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconChevronRight, IconSync } from '../constants';
import type { MealRecommendation, WeeklyAIPlan } from '../hooks/useNutrition';
import type { DayProfile, FoodItem } from '../data/nutritionDb';

interface NutritionProps {
    dayType: string;
    dayProfile: DayProfile;
    dailyMeals: MealRecommendation[];
    superfoods: FoodItem[];
    superfoodOfTheDay: FoodItem;
    weeklyPlan: WeeklyAIPlan | null;
    isLoadingPlan: boolean;
    refreshWeeklyPlan: () => void;
}

const Nutrition: React.FC<NutritionProps> = ({
    dayProfile,
    dailyMeals,
    superfoodOfTheDay,
    weeklyPlan,
    isLoadingPlan,
    refreshWeeklyPlan,
}) => {
    const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
    const [showWeekly, setShowWeekly] = useState(false);

    const carbIndicator = dayProfile.carbLevel === 'high' ? { label: 'Alto', color: 'text-emerald-400', dot: 'bg-emerald-400' }
        : dayProfile.carbLevel === 'moderate' ? { label: 'Medio', color: 'text-amber-400', dot: 'bg-amber-400' }
        : { label: 'Bajo', color: 'text-rose-400', dot: 'bg-rose-400' };

    const proteinIndicator = dayProfile.proteinPriority === 'max' ? { label: 'Máxima', color: 'text-indigo-400', dot: 'bg-indigo-400' }
        : dayProfile.proteinPriority === 'high' ? { label: 'Alta', color: 'text-blue-400', dot: 'bg-blue-400' }
        : { label: 'Normal', color: 'text-slate-500', dot: 'bg-slate-500' };

    return (
        <div className="space-y-6 animate-in pt-6 pb-24">
            {/* Header */}
            <header className="px-1 pt-safe mt-4">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Nutrición</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
                            <span className="w-1 h-1 bg-slate-300 rounded-full" /> Combustible Inteligente
                        </p>
                    </div>
                </div>
            </header>

            {/* Day Context Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-7 shadow-sm relative overflow-hidden"
            >
                {/* Subtle background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-10 -mt-10" />

                <div className="relative z-10">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                                <span className="text-3xl">{dayProfile.emoji}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">{dayProfile.label}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1.5">Tu plan de hoy</p>
                            </div>
                        </div>
                    </div>

                    {/* Macro indicators — clean pills */}
                    <div className="flex gap-2.5">
                        <div className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${carbIndicator.dot}`} />
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Carbos</span>
                            </div>
                            <span className={`text-[15px] font-black ${carbIndicator.color}`}>{carbIndicator.label}</span>
                        </div>
                        <div className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${proteinIndicator.dot}`} />
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Proteína</span>
                            </div>
                            <span className={`text-[15px] font-black ${proteinIndicator.color}`}>{proteinIndicator.label}</span>
                        </div>
                        <div className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Agua</span>
                            </div>
                            <span className="text-[15px] font-black text-cyan-500">{dayProfile.carbLevel === 'high' ? '800ml/h' : '2L'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Meal Timeline */}
            <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Comidas del Día</h3>

                <div className="space-y-3">
                    {dailyMeals.map((meal, idx) => {
                        const isExpanded = expandedSlot === meal.slot.id;
                        const hasAiSuggestion = !!meal.tip;
                        return (
                            <motion.div
                                key={meal.slot.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.4 }}
                                className={`bg-white rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${isExpanded ? 'border-slate-200 shadow-xl' : 'border-slate-100 shadow-sm'}`}
                            >
                                <div
                                    className="p-5 flex items-center gap-4 cursor-pointer group"
                                    onClick={() => setExpandedSlot(isExpanded ? null : meal.slot.id)}
                                >
                                    {/* Timeline dot */}
                                    <div className="flex flex-col items-center gap-1 min-w-[44px]">
                                        <span className="text-2xl">{meal.slot.emoji}</span>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-tight">{meal.slot.time.split(' - ')[0]}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[15px] font-black text-slate-800 leading-none mb-1">{meal.slot.label}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold truncate">
                                            {hasAiSuggestion
                                                ? meal.tip
                                                : `${meal.foods.map(f => f.emoji).join(' ')} ${meal.foods.map(f => f.name).join(' · ')}`
                                            }
                                        </p>
                                    </div>

                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-slate-100 text-slate-500 rotate-90' : 'bg-slate-50 text-slate-300'}`}>
                                        <IconChevronRight size={14} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-5 pb-5 pt-1 space-y-3 animate-in slide-in-from-top-2">
                                        {/* AI Suggestion (primary) */}
                                        {hasAiSuggestion && (
                                            <div className="flex gap-3 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-lg shrink-0 shadow-sm">
                                                    ✨
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Recomendación IA</span>
                                                    <p className="text-[13px] text-indigo-900 font-bold leading-snug">{meal.tip}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Food items (supplementary detail) */}
                                        {!hasAiSuggestion && meal.foods.map(food => (
                                            <div key={food.id} className="flex gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0 border border-slate-100">
                                                    {food.emoji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline justify-between gap-2 mb-1">
                                                        <h5 className="text-sm font-black text-slate-800 leading-tight">{food.name}</h5>
                                                        {food.portion && (
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-slate-100">
                                                                {food.portion}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{food.benefit}</p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* When AI suggestion exists, show food items as compact alternativas */}
                                        {hasAiSuggestion && meal.foods.length > 0 && (
                                            <div className="pt-2 border-t border-slate-100">
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-2">Ingredientes clave</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {meal.foods.map(food => (
                                                        <div key={food.id} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                            <span className="text-sm">{food.emoji}</span>
                                                            <span className="text-[10px] font-bold text-slate-500">{food.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Superfood of the Day */}
            {superfoodOfTheDay && (
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative overflow-hidden"
                >
                    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-[2.5rem] border-2 border-emerald-100 shadow-sm">
                        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl" />

                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-md border border-emerald-100 shrink-0">
                                {superfoodOfTheDay.emoji}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[8px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Superalimento</span>
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">del Día</span>
                                </div>
                                <h4 className="text-lg font-black text-emerald-900 leading-tight mb-1">{superfoodOfTheDay.name}</h4>
                                <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">{superfoodOfTheDay.benefit}</p>
                                {superfoodOfTheDay.portion && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-lg border border-emerald-100">
                                        <span className="text-[9px] font-black text-emerald-600 uppercase">Dosis:</span>
                                        <span className="text-[11px] font-black text-emerald-800">{superfoodOfTheDay.portion}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Weekly AI Plan */}
            <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Plan Semanal IA</h3>
                    <button
                        onClick={refreshWeeklyPlan}
                        disabled={isLoadingPlan}
                        className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <IconSync size={10} className={isLoadingPlan ? 'animate-spin' : ''} />
                        {isLoadingPlan ? 'Generando...' : 'Regenerar'}
                    </button>
                </div>

                {isLoadingPlan && !weeklyPlan && (
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center">
                        <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generando plan con Gemini...</p>
                    </div>
                )}

                {!weeklyPlan && !isLoadingPlan && (
                    <div className="bg-white rounded-[2rem] p-8 border border-dashed border-slate-200 text-center">
                        <span className="text-3xl mb-3 block">✨</span>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sin plan semanal aún</p>
                        <p className="text-[11px] text-slate-400 font-medium">Registra al menos 2 sesiones para generar tu plan personalizado con IA.</p>
                    </div>
                )}

                {weeklyPlan && (
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowWeekly(!showWeekly)}
                            className={`w-full bg-white rounded-[2rem] p-5 border-2 transition-all duration-300 text-left flex items-center justify-between ${showWeekly ? 'border-indigo-200 shadow-xl shadow-indigo-50/50' : 'border-slate-100 shadow-sm'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${showWeekly ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-500'}`}>
                                    <span className="text-lg">🗓️</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800">Plan de 7 días</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        Generado {new Date(weeklyPlan.generatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showWeekly ? 'bg-indigo-50 text-indigo-500 rotate-90' : 'bg-slate-50 text-slate-300'}`}>
                                <IconChevronRight size={14} />
                            </div>
                        </button>

                        {showWeekly && (
                            <div className="space-y-3 animate-in slide-in-from-top-2">
                                {weeklyPlan.days.map((day, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{day.dayName}</span>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${day.dayType.toLowerCase().includes('descanso') || day.dayType.toLowerCase().includes('recup') ? 'bg-purple-50 text-purple-400' : 'bg-emerald-50 text-emerald-500'}`}>
                                                    {day.dayType}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {day.meals.map((m, j) => (
                                                <div key={j} className="flex gap-3 items-start">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tight min-w-[70px] mt-0.5">{m.slot}</span>
                                                    <p className="text-[12px] text-slate-600 font-medium leading-snug">{m.suggestion}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {day.tip && (
                                            <div className="mt-3 pt-3 border-t border-slate-50">
                                                <p className="text-[10px] text-indigo-500 font-bold italic flex items-center gap-1.5">
                                                    <span>💡</span> {day.tip}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Hydration Reminder */}
            <section className="bg-gradient-to-r from-cyan-50 to-blue-50 p-5 rounded-[2rem] border border-cyan-100">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">💧</span>
                    <div>
                        <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-0.5">Hidratación</h4>
                        <p className="text-[12px] text-cyan-800 font-medium">
                            {dayProfile.carbLevel === 'high'
                                ? 'Día de alta demanda. Toma 500-800ml/hora durante la sesión y repón 1.25L por cada kg perdido.'
                                : 'Mantén un mínimo de 2L de agua distribuidos durante el día.'}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Nutrition;
