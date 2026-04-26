import React, { useState, useEffect } from 'react';
import { IconX, IconChevronRight, IconActivity } from '../constants';

interface ExerciseSelectorProps {
    userKey: string;
    ANA_PLAN: any[];
    MARCELO_PLAN: any[];
    replacingExerciseId: string | null;
    setIsExerciseSelectorOpen: (open: boolean) => void;
    onSelect: (ex: any) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
    userKey,
    ANA_PLAN,
    MARCELO_PLAN,
    replacingExerciseId,
    setIsExerciseSelectorOpen,
    onSelect
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Initial load: show plan exercises
    useEffect(() => {
        const planEx = (userKey === 'ana' ? ANA_PLAN : MARCELO_PLAN)
            .flatMap(b => b.exercises.map((ex: any) => ({ 
                ...ex, 
                fromBlock: b.title,
                primary_muscle: ex.visual // Map old visual field to primary muscle for display
            })));
        setSearchResults(planEx);
    }, [userKey, ANA_PLAN, MARCELO_PLAN]);

    // Search effect
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            // Revert to plan exercises if search is cleared
            const planEx = (userKey === 'ana' ? ANA_PLAN : MARCELO_PLAN)
                .flatMap(b => b.exercises.map((ex: any) => ({ ...ex, fromBlock: b.title })));
            setSearchResults(planEx);
            return;
        }

        const handleSearch = async () => {
            setIsLoading(true);
            try {
                // Fuzzy search using OR on technical and regional terms
                const { data, error } = await supabase
                    .from('exercises')
                    .select('*')
                    .or(`name_es.ilike.%${searchQuery}%,name_en.ilike.%${searchQuery}%,synonyms.cs.{"${searchQuery}"}`)
                    .limit(10);

                if (data) {
                    const mappedResults = data.map(dbEx => ({
                        id: dbEx.id,
                        name: dbEx.name_es,
                        sets: 3, // Default values for new exercises
                        target: '10-12 reps',
                        type: 'weight',
                        tip: dbEx.technical_tip_es,
                        fromBlock: 'Ontología Fitness',
                        primary_muscle: dbEx.primary_muscle,
                        equipment: dbEx.equipment,
                        rest: dbEx.suggested_rest_sec
                    }));
                    setSearchResults(mappedResults);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        const timeout = setTimeout(handleSearch, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col" style={{ height: '85vh' }}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-black text-2xl text-slate-800">
                            {replacingExerciseId ? 'Reemplazar por...' : 'Añadir Ejercicio'}
                        </h3>
                        <p className="text-slate-500 text-sm">Busca por nombre, músculo o jerga.</p>
                    </div>
                    <button onClick={() => setIsExerciseSelectorOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                        <IconX size={20} />
                    </button>
                </div>

                <div className="relative mb-6">
                    <input 
                        type="text"
                        placeholder="Ej: 'Afilas', 'Pecho', 'Squat'..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-bold focus:border-slate-300 focus:outline-none transition-all"
                    />
                    <IconActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-10 custom-scrollbar">
                    {searchResults.length === 0 && !isLoading && (
                        <div className="text-center py-10 text-slate-400 italic">No encontramos coincidencias...</div>
                    )}
                    {searchResults.map((ex: any, idx: number) => (
                        <button
                            key={`${ex.id}-${idx}`}
                            onClick={() => onSelect(ex)}
                            className="w-full text-left p-5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-[24px] transition-all group active:scale-[0.98]"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ex.fromBlock}</span>
                                        {ex.equipment && <span className="text-[9px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase">{ex.equipment}</span>}
                                    </div>
                                    <h4 className="font-bold text-slate-700 group-hover:text-slate-900">{ex.name}</h4>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">{ex.primary_muscle || 'Músculo'}</span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">{ex.sets} sets</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-300 group-hover:text-slate-600 shadow-sm transition-colors">
                                    <IconChevronRight size={16} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExerciseSelector;
