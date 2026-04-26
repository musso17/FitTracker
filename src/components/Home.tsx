import React from 'react';
import { 
    IconFlame, IconChevronRight, IconDumbbell, IconListTodo, IconCheckCircle, IconActivity, IconTarget, IconInfoCircle, IconX,
    getColorClasses
} from '../constants';
import type { TrainingBlock } from '../types';
import { calculateACWR, calculateRecoveryScore, ANALYTICS_DOCS } from './Common';

interface HomeProps {
    currentUserName: string;
    userKey: string;
    currentStreak: number;
    logs: any[];
    PLAN_BLOCKS: TrainingBlock[];
    recommendedBlock: TrainingBlock | null;
    setActiveTab: (tab: string) => void;
    handleStartBlock: (block: TrainingBlock) => void;
    wellnessOverride?: any;
}

const Home: React.FC<HomeProps> = ({
    currentUserName,
    userKey,
    currentStreak,
    logs,
    PLAN_BLOCKS,
    recommendedBlock,
    setActiveTab,
    handleStartBlock,
    wellnessOverride
}) => {
    const [helpKey, setHelpKey] = React.useState<keyof typeof ANALYTICS_DOCS | null>(null);
    const now = new Date();
    const isEvening = now.getHours() >= 18;
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayLogs = logs.filter(l => l.date === todayStr);
    const hasTrainedToday = todayLogs.some(l => l.blockId.startsWith('ana_') || l.blockId.startsWith('mar_'));

    const acwr = calculateACWR(logs);
    const wellness = wellnessOverride || calculateRecoveryScore(logs, currentStreak);

    const getDaysAgo = (dateStr: string) => {
        const d = new Date(dateStr);
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        return `Hace ${diffDays}d`;
    };

    return (
        <div className="space-y-6 animate-in pb-24">
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

            <header className="pt-safe pb-2 mt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Hola, {currentUserName} 👋</h1>
                        <p className="text-slate-500">
                            {userKey === 'ana' ? 'Marce hizo esta app para ti.' : '¡A darle duro al entrenamiento!'}
                        </p>
                    </div>
                    {currentStreak > 0 && (
                        <div className="relative group active:scale-95 transition-all cursor-default">
                            <div className="relative flex items-center bg-white border border-slate-100 pl-1 pr-3 py-1 rounded-xl shadow-sm transition-all group-hover:border-orange-100">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-500 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),transparent)]" />
                                     <IconFlame size={18} className="transition-transform group-hover:scale-110 duration-500" />
                                </div>
                                <div className="ml-2.5">
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-xl font-black text-slate-800 leading-none tracking-tight">{currentStreak}</span>
                                        <span className="text-[9px] font-black text-orange-500 uppercase">d</span>
                                    </div>
                                    <span className="block text-[7px] font-black text-slate-400 uppercase tracking-wider leading-none mt-0.5 group-hover:text-orange-500 transition-colors">Racha</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Wellness Section */}
            <div className="grid grid-cols-1">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-2 shadow-sm relative group" onClick={() => setHelpKey('recovery')}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de Recuperación</span>
                        <IconInfoCircle size={16} className="text-slate-300 group-active:text-indigo-500 transition-colors" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black ${wellness.score > 70 ? 'text-emerald-500' : wellness.score > 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                            {wellness.score}
                        </span>
                        <span className="text-sm font-bold text-slate-400">/ 100</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 leading-tight">{wellness.advice}</p>
                </div>
            </div>

            {isEvening && !hasTrainedToday && currentStreak > 0 && (
                <div className="mx-0 mb-6 p-4 bg-orange-50 border border-orange-100 rounded-3xl flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
                        <IconFlame size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-orange-600 uppercase tracking-tight">¡Racha en riesgo! ⚡️</h4>
                        <p className="text-[11px] text-orange-500 font-medium leading-tight tracking-tight">¡Haz una sesión rápida hoy para mantener tu racha!</p>
                    </div>
                </div>
            )}

            {PLAN_BLOCKS.length === 0 ? (
                <section className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconDumbbell size={28} />
                    </div>
                    <h3 className="font-bold text-slate-700 text-lg mb-2">Sin rutinas todavía</h3>
                    <p className="text-sm text-slate-500 mb-5">Crea tu primer bloque de entrenamiento desde la pestaña de Perfil para empezar.</p>
                    <button onClick={() => { setActiveTab('profile'); window.scrollTo(0, 0); }} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform">
                        Ir a Perfil <IconChevronRight size={14} />
                    </button>
                </section>
            ) : (
                <>
                    <section className="mb-6">
                        {!hasTrainedToday ? (
                            <>
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Siguiente en tu ciclo</h2>
                                    <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Sugerido</span>
                                </div>

                                {recommendedBlock && (
                                    <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-900 shadow-2xl shadow-slate-200 animate-in zoom-in duration-500 cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden group" onClick={() => handleStartBlock(recommendedBlock)}>
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                            {<recommendedBlock.icon size={120} />}
                                        </div>
                                        <div className="relative z-10">
                                            <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">Plan de hoy</span>
                                            <h3 className="font-black text-3xl text-slate-900 leading-none">{recommendedBlock.title}</h3>
                                            <p className="text-sm text-slate-500 mt-4 leading-snug font-medium pr-10">{recommendedBlock.note}</p>
                                            <button className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 group-hover:bg-slate-800 transition-colors">
                                                Iniciar Sesión <IconChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200 animate-in slide-in-from-bottom duration-700">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">💪</div>
                                    <div>
                                        <h3 className="font-black text-xl leading-tight">¡Ya entrenaste hoy!</h3>
                                        <p className="text-emerald-50 text-sm font-bold opacity-90">Misión cumplida, descansa o vuelve mañana.</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Sesiones hoy</span>
                                    <span className="text-xl font-black">{todayLogs.length}</span>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="-mx-4 pt-4">
                        <div className="flex items-center justify-between mb-4 px-6">
                            <h2 className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]"><IconListTodo size={14} /> Tu Plan Flexible</h2>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Desliza <IconChevronRight size={8} /></span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto px-6 pb-12 hide-scrollbar snap-x">
                            {PLAN_BLOCKS.map((block) => {
                                const lastDoneDate = logs.filter(l => l.blockId === block.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;
                                const isBestToday = recommendedBlock && block.id === recommendedBlock.id;
                                
                                return (
                                    <div 
                                        key={block.id} 
                                        onClick={() => handleStartBlock(block)} 
                                        className={`shrink-0 w-48 p-5 rounded-[2rem] border-2 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between h-48 relative overflow-hidden ${isBestToday ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200' : 'bg-white border-slate-100'}`}
                                    >
                                        {lastDoneDate && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isBestToday ? 'bg-white/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    <IconCheckCircle size={10} />
                                                    {getDaysAgo(lastDoneDate)}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getColorClasses(block.color)}`}>
                                            <block.icon size={22} />
                                        </div>

                                        <div>
                                            <h4 className={`font-black text-sm leading-tight ${isBestToday ? 'text-white' : 'text-slate-800'}`}>{block.title}</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${isBestToday ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-400'}`}>
                                                    {block.exercises.length} Exs
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Home;
