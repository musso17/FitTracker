import React, { useState, useEffect } from 'react';
import { IconX, IconChevronRight, IconActivity, IconPlus } from '../constants';
import { supabase } from '../utils/supabase';

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
    const [catalog, setCatalog] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Initial load: show catalog and plan exercises
    useEffect(() => {
        const fetchInitialCatalog = async () => {
            setIsLoading(true);
            try {
                // Fetch top 30 exercises from master catalog
                const { data } = await supabase
                    .from('exercises')
                    .select('*')
                    .limit(30);

                const planEx = (userKey === 'ana' ? ANA_PLAN : MARCELO_PLAN)
                    .flatMap(b => b.exercises.map((ex: any) => ({ 
                        ...ex, 
                        fromBlock: 'Mi Plan',
                        primary_muscle: ex.visual 
                    })));

                if (data) {
                    const mappedCatalog = data.map(dbEx => ({
                        id: dbEx.id,
                        name: dbEx.name_es,
                        sets: 3,
                        target: '10-12',
                        type: 'weight',
                        tip: dbEx.technical_tip_es,
                        fromBlock: 'Catálogo',
                        primary_muscle: dbEx.primary_muscle,
                        equipment: dbEx.equipment,
                        rest: dbEx.suggested_rest_sec
                    }));
                    
                    // Combine prioritizing plan exercises
                    const combined = [...planEx];
                    mappedCatalog.forEach(catEx => {
                        if (!combined.some(p => p.name.toLowerCase() === catEx.name.toLowerCase())) {
                            combined.push(catEx);
                        }
                    });
                    setCatalog(combined);
                    setSearchResults(combined);
                } else {
                    setSearchResults(planEx);
                    setCatalog(planEx);
                }
            } catch (err) {
                console.error("Initial catalog load error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialCatalog();
    }, [userKey, ANA_PLAN, MARCELO_PLAN]);

    // Search effect
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setSearchResults(catalog);
            return;
        }

        if (searchQuery.trim().length < 2) return;

        const handleSearch = async () => {
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('exercises')
                    .select('*')
                    .or(`name_es.ilike.%${searchQuery}%,name_en.ilike.%${searchQuery}%,primary_muscle.ilike.%${searchQuery}%`)
                    .limit(15);

                if (data) {
                    const mappedResults = data.map(dbEx => ({
                        id: dbEx.id,
                        name: dbEx.name_es,
                        sets: 3,
                        target: '10-12',
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
    }, [searchQuery, catalog]);

    const handleCreateCustom = async () => {
        setIsLoading(true);
        const customEx = {
            id: `custom_${Date.now()}`,
            name: searchQuery,
            sets: 3,
            target: '10-12',
            type: 'weight' as const,
            tip: 'Ejercicio personalizado añadido durante la sesión.',
            fromBlock: 'Personalizado',
            primary_muscle: 'Varios',
            isCustom: true
        };

        try {
            // Attempt to save to global catalog so it's searchable next time
            const { data } = await supabase
                .from('exercises')
                .insert([{
                    name_es: searchQuery,
                    name_en: searchQuery,
                    movement_pattern: 'Isolation',
                    equipment: 'Bodyweight',
                    primary_muscle: 'Varios',
                    technical_tip_es: 'Añadido por el usuario.'
                }])
                .select();
            
            if (data && data[0]) {
                const newEx = {
                    ...customEx,
                    id: data[0].id,
                    fromBlock: 'Mis Ejercicios'
                };
                onSelect(newEx);
            } else {
                onSelect(customEx);
            }
        } catch (err) {
            console.error("Error saving custom exercise:", err);
            onSelect(customEx);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col" style={{ height: '85vh' }}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-black text-2xl text-slate-800">
                            {replacingExerciseId ? 'Reemplazar por...' : 'Añadir Ejercicio'}
                        </h3>
                        <p className="text-slate-500 text-sm">Explora el catálogo o crea uno nuevo.</p>
                    </div>
                    <button onClick={() => setIsExerciseSelectorOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                        <IconX size={20} />
                    </button>
                </div>

                <div className="relative mb-6">
                    <input 
                        type="text"
                        placeholder="Buscar o escribir nuevo..."
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
                    {searchQuery.length > 0 && (
                        <button
                            onClick={handleCreateCustom}
                            className="w-full p-5 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[24px] flex items-center gap-4 group hover:bg-indigo-100 transition-all"
                        >
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                <IconPlus size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">¿No está en la lista?</span>
                                <h4 className="font-bold text-indigo-700">Crear "{searchQuery}"</h4>
                            </div>
                        </button>
                    )}

                    {searchResults.length === 0 && !isLoading && (
                        <div className="text-center py-10 text-slate-400 italic">No hay más resultados para tu búsqueda.</div>
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
