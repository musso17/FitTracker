import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { 
    isWithinCurrentWeek, isWithinPreviousWeek
} from '../constants';
import { ANA_PLAN, MARCELO_PLAN, PLAN_BY_ROLE } from '../plans';

export const useTrainingData = (userSession: any, profile: any, userKey: string, PLAN_BLOCKS: any[]) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadLogs = async () => {
        if (!userSession) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('logs')
                .select('*')
                .order('date', { ascending: false });
            if (error) throw error;
            if (data) {
                setLogs(data.map(log => ({
                    id: log.id,
                    date: log.date,
                    blockId: log.blockId,
                    surfData: log.surfData,
                    muayThaiData: log.muayThaiData || null,
                    gymData: log.gymData || null,
                    activityData: log.activityData || null
                })));
            }
        } catch (e) {
            console.error("Error fetching logs", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userSession) loadLogs();
    }, [userSession]);

    const deleteLog = async (id: number) => {
        try {
            const { error } = await supabase.from('logs').delete().eq('id', id);
            if (error) throw error;
            setLogs(prev => prev.filter(l => l.id !== id));
            return true;
        } catch (e) {
            console.error("Delete error:", e);
            return false;
        }
    };

    const calculateWorkoutImpact = (log: any) => {
        if (!log || !log.blockId || !log.gymData) return { workKiloJoules: "0.0", relativeTension: 0 };
        
        const exercises = log.gymData.exercises || [...ANA_PLAN, ...MARCELO_PLAN].find(b => b.id === log.blockId)?.exercises;
        if (!exercises) return { workKiloJoules: "0.0", relativeTension: 0 };

        let totalWorkJoules = 0;
        let totalRelativeTension = 0;

        exercises.forEach((ex: any) => {
            let romMeters = 0.5; 
            if (ex.visual === 'squat' || ex.visual === 'hinge') romMeters = (profile.height / 100) * 0.45;
            if (ex.visual === 'benchpress') romMeters = (profile.height / 100) * 0.25;
            if (ex.visual === 'pull' || ex.visual === 'row') romMeters = (profile.height / 100) * 0.35;

            const progress = log.gymData.progress?.[ex.id];
            if (progress) {
                progress.forEach((set: any) => {
                    if (set.completed) {
                        const reps = parseInt(set.reps) || 0;
                        const addedWeight = parseFloat(set.weight) || 0;
                        
                        if (ex.type === 'weight') {
                            let activeBodyWeight = (ex.visual === 'squat' || ex.visual === 'pull' || ex.visual === 'hinge') ? (profile.weight * 0.7) : 0; // Subimos a 0.7 para ser más realistas
                            const isAssisted = ex.name.toLowerCase().includes('asistidas');
                            let totalMass = isAssisted ? Math.max(5, activeBodyWeight - addedWeight) : (addedWeight + activeBodyWeight);
                            totalWorkJoules += (totalMass * 9.8 * romMeters * reps);
                        } else if (ex.type === 'check' && reps > 0) {
                            totalRelativeTension += (profile.weight * reps);
                        }
                    }
                });
            }
        });

        return { 
            workKiloJoules: (totalWorkJoules / 1000).toFixed(1), 
            relativeTension: totalRelativeTension 
        };
    };

    const currentStreak = useMemo(() => {
        const isAna = userKey === 'ana';
        const filteredLogs = logs.filter(l => isAna ? l.blockId.startsWith('ana_') : l.blockId.startsWith('mar_'));
        if (filteredLogs.length === 0) return 0;
        
        const today = new Date(); today.setHours(0,0,0,0);
        let streak = 0;
        let checkDate = new Date(today);
        
        const trainingDates = new Set(filteredLogs.map(l => l.date));
        const getStr = (d: Date) => d.toISOString().split('T')[0];
        
        const todayStr = getStr(checkDate);
        const yesterday = new Date(checkDate); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getStr(yesterday);
        
        if (!trainingDates.has(todayStr) && !trainingDates.has(yesterdayStr)) return 0;
        if (!trainingDates.has(todayStr)) checkDate = yesterday;
        
        for (let i = 0; i < 365; i++) {
            if (trainingDates.has(getStr(checkDate))) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else break;
        }
        return streak;
    }, [logs, userKey]);

    const stats = useMemo(() => {
        const isAna = userKey === 'ana';
        const filteredLogs = logs.filter(l => isAna ? l.blockId.startsWith('ana_') : l.blockId.startsWith('mar_'));
        
        const workoutsThisWeek = filteredLogs.filter(l => isWithinCurrentWeek(l.date)).length;
        const totalSurfMins = filteredLogs.reduce((acc, curr) => (curr.surfData && isWithinCurrentWeek(curr.date)) ? acc + curr.surfData.duration : acc, 0);
        const totalMuayThaiMins = filteredLogs.reduce((acc, curr) => (curr.muayThaiData && isWithinCurrentWeek(curr.date)) ? acc + curr.muayThaiData.duration : acc, 0);
        
        let totalKiloJoules = 0;
        let totalTension = 0;
        let tonnageThisWeek = 0;
        let tonnagePrevWeek = 0;

        filteredLogs.forEach(log => {
            let logTonnage = 0;
            if (log.gymData?.progress) {
                Object.entries(log.gymData.progress).forEach(([exId, sets]: [string, any]) => {
                    if (Array.isArray(sets)) {
                        sets.forEach(s => {
                            if (s.completed) {
                                const exDef = (isAna ? ANA_PLAN : MARCELO_PLAN).flatMap(b => b.exercises).find(e => e.id === exId);
                                const isAssisted = exDef?.name.toLowerCase().includes('asistidas');
                                const weight = parseFloat(s.weight) || 0;
                                const reps = parseInt(s.reps) || 0;
                                
                                if (isAssisted) {
                                    const effectiveWeight = Math.max(0, (profile.weight * 0.7) - weight);
                                    logTonnage += effectiveWeight * reps;
                                } else {
                                    logTonnage += weight * reps;
                                }
                            }
                        });
                    }
                });
            }

            if (isWithinCurrentWeek(log.date)) {
                const impact = calculateWorkoutImpact(log);
                totalKiloJoules += parseFloat(impact.workKiloJoules || "0");
                totalTension += impact.relativeTension || 0;
                tonnageThisWeek += logTonnage;
            } else if (isWithinPreviousWeek(log.date)) {
                tonnagePrevWeek += logTonnage;
            }
        });

        const insights: any[] = [];
        const sortedLogs = [...filteredLogs].filter(l => l.gymData).sort((a,b) => a.date.localeCompare(b.date));
        const strengthMetrics: any[] = [];
        
        if (sortedLogs.length > 0) {
            const extHistory: Record<string, any[]> = {};
            const skippedHistory: Record<string, boolean[]> = {};
            
            sortedLogs.forEach(log => {
                const gymData = log.gymData;
                if (!gymData) return;

                const blockExercises = (isAna ? ANA_PLAN : MARCELO_PLAN).find(b => b.id === log.blockId)?.exercises || [];
                blockExercises.forEach(ex => {
                    const wasSkipped = !!gymData.skipped?.[ex.id];
                    if (!skippedHistory[ex.id]) skippedHistory[ex.id] = [];
                    skippedHistory[ex.id].push(wasSkipped);
                });

                if (gymData.progress) {
                    Object.keys(gymData.progress).forEach(exId => {
                        const sets = gymData.progress[exId];
                        let maxWeightSession = 0;
                        let repsAtMax = 0;
                        sets?.forEach((set: any) => {
                            const parsedWeight = parseFloat(set.weight);
                            const parsedReps = parseInt(set.reps) || 0;
                            if (!isNaN(parsedWeight) && set.completed && parsedWeight > maxWeightSession) {
                                maxWeightSession = parsedWeight;
                                repsAtMax = parsedReps;
                            } else if (parsedWeight === maxWeightSession && parsedReps > repsAtMax) {
                                repsAtMax = parsedReps;
                            }
                        });

                        if (maxWeightSession > 0) {
                            if (!extHistory[exId]) extHistory[exId] = [];
                            const history = extHistory[exId];
                            
                            // Calculate total session volume for this exercise
                            const totalSessionVolume = sets.reduce((acc: number, s: any) => 
                                s.completed ? acc + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0) : acc, 0
                            );

                            if (history.length > 0 && history[history.length - 1].weight === maxWeightSession && history[history.length - 1].reps === repsAtMax) {
                                history[history.length - 1].count++;
                                history[history.length - 1].date = log.date;
                                history[history.length - 1].volume = totalSessionVolume;
                            } else {
                                history.push({ 
                                    weight: maxWeightSession, 
                                    reps: repsAtMax, 
                                    volume: totalSessionVolume,
                                    date: log.date, 
                                    count: 1 
                                });
                            }
                        }
                    });
                }
            });

            const allPlanExercises = (isAna ? ANA_PLAN : MARCELO_PLAN).flatMap(b => b.exercises).filter(e => e.type === 'weight');
            
            allPlanExercises.forEach((ex: any) => {
                const history = extHistory[ex.id] || [];
                
                const exNameLower = ex.name.toLowerCase();
                const isIsolation = exNameLower.includes('curl') || exNameLower.includes('extensión') || exNameLower.includes('elevaciones') || exNameLower.includes('face') || exNameLower.includes('gemelos') || exNameLower.includes('abducciones') || exNameLower.includes('kickback');
                const isUnilateral = exNameLower.includes('búlgara') || exNameLower.includes('bulgarian') || exNameLower.includes('zancadas') || exNameLower.includes('step-ups');
                const isMancuerna = exNameLower.includes('mancuerna') || exNameLower.includes('goblet');
                const isAssisted = exNameLower.includes('asistidas');

                // Lógica especial para dominadas/fondos asistidos
                // En estos, 'weight' es el contrapeso. A MENOS peso, MÁS difícil.
                // Proyectamos el "peso real" movido = Weight_Body - Assistance
                let currentStrength = 0;
                let currentMax = 0;
                let currentReps = 0;

                if (isAssisted) {
                    // Para asistidos, buscamos la MENOR asistencia registrada
                    let minAssistance = Infinity;
                    let repsAtMin = 0;
                    history.forEach(h => {
                        if (h.weight < minAssistance) {
                            minAssistance = h.weight;
                            repsAtMin = h.reps;
                        } else if (h.weight === minAssistance && h.reps > repsAtMin) {
                            repsAtMin = h.reps;
                        }
                    });
                    
                    if (minAssistance !== Infinity) {
                        currentMax = minAssistance; // Mostramos la asistencia actual
                        currentReps = repsAtMin;
                        currentStrength = profile.weight - minAssistance; // Valor para lógica de progreso
                    }
                } else {
                    currentMax = history.length > 0 ? history[history.length - 1].weight : 0;
                    currentReps = history.length > 0 ? history[history.length - 1].reps : 0;
                    currentStrength = currentMax;
                }

                let baseGoal = 0;
                const ratioMultiplier = isAna ? 0.6 : 1.0;
                
                if (isIsolation) baseGoal = profile.weight * 0.15 * ratioMultiplier; // Bajamos de 0.2 a 0.15
                else if (isAssisted) baseGoal = 5.0; // Meta: llegar a solo 5kg de asistencia (o 0)
                else if (isUnilateral) baseGoal = profile.weight * 0.35 * ratioMultiplier;
                else if (isMancuerna) baseGoal = profile.weight * 0.45 * ratioMultiplier;
                else if (ex.visual === 'squat' || ex.visual === 'hinge') baseGoal = profile.weight * 1.1 * (isAna ? 0.8 : 1.0);
                else if (ex.visual === 'benchpress') baseGoal = profile.weight * 0.9 * ratioMultiplier;
                else if (ex.visual === 'row' || ex.visual === 'pull') baseGoal = profile.weight * 0.75 * ratioMultiplier;
                else baseGoal = profile.weight * 0.35 * ratioMultiplier;

                let milestoneStep = (isIsolation || isMancuerna) ? 2.5 : ((ex.visual === 'squat' || ex.visual === 'hinge') ? 5 : 2.5);
                baseGoal = Math.max(Math.round(baseGoal / milestoneStep) * milestoneStep, milestoneStep);

                let goal = baseGoal;
                if (isAssisted) {
                    // Si ya está cerca o mejor que la meta base de asistencia
                    if (currentMax > 0 && currentMax <= baseGoal * 1.5) {
                        goal = Math.max(0, Math.floor(currentMax / milestoneStep) * milestoneStep - milestoneStep);
                    } else if (currentMax === 0 && history.length > 0) {
                        goal = 0; // Ya lo logró
                    }
                } else {
                    if (currentStrength >= baseGoal * 0.8) {
                        goal = Math.floor(currentStrength / milestoneStep) * milestoneStep + milestoneStep;
                    }
                }
                
                // Cap de seguridad para evitar metas imposibles en aislamiento (máximo 40% del peso corporal para Ana)
                if (isIsolation && goal > profile.weight * 0.5 * ratioMultiplier) {
                    goal = Math.round((profile.weight * 0.4 * ratioMultiplier) / milestoneStep) * milestoneStep;
                }

                if (goal < 0) goal = 0;

                let progress = 0;
                if (isAssisted) {
                    const effectivelyLifted = profile.weight - currentMax;
                    const goalLifted = profile.weight - goal;
                    progress = goalLifted > 0 ? (effectivelyLifted / goalLifted) * 100 : (effectivelyLifted > 0 ? 100 : 0);
                } else {
                    progress = goal > 0 ? (currentMax / goal) * 100 : 0;
                }
                
                strengthMetrics.push({
                    id: ex.id,
                    name: ex.name,
                    currentMax, // Seguimos mostrando el peso que ella ve en la máquina
                    currentReps,
                    goal,
                    progress,
                    isSuggested: true,
                    history,
                    visual: ex.visual,
                    isAssisted // Nueva flag para el UI
                });
            });

            
            Object.keys(extHistory).forEach(exId => {
                const history = extHistory[exId];
                const exDef = (isAna ? ANA_PLAN : MARCELO_PLAN).flatMap(b => b.exercises).find(e => e.id === exId);
                const exName = exDef?.name || 'Ejercicio';
                if (history.length >= 2) {
                    const lastRecord = history[history.length - 1];
                    const prevRecord = history[history.length - 2];
                    if (isWithinCurrentWeek(lastRecord.date)) {
                        if (lastRecord.weight > prevRecord.weight) {
                            insights.push({ type: 'pr', title: '¡Sobrecarga Progresiva!', message: `Aumentaste a ${lastRecord.weight}kg en ${exName}. 💪`, icon: '🔥', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' });
                        } else if (lastRecord.weight === prevRecord.weight && lastRecord.reps > prevRecord.reps) {
                            insights.push({ type: 'vol_prog', title: 'Más Reps Estimulantes', message: `Lograste ${lastRecord.reps} reps con ${lastRecord.weight}kg en ${exName}. 📈`, icon: '🧬', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' });
                        } else if (lastRecord.count >= 3) {
                            insights.push({ type: 'plateau', title: 'Meseta Detectada', message: `Te estancaste en ${exName}. Sube el peso 5-10%. ⚖️`, icon: '💡', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' });
                        }
                    }
                }
            });
        }

        const coachInsights: any[] = [];
        // Add one basic insight if none exists
        if (insights.length === 0) {
            coachInsights.push({ icon: '✨', title: 'Signos vitales óptimos', message: 'Buen ritmo de entrenamiento.', type: 'success' });
        }

        const logrosCount = strengthMetrics.filter(m => m.currentMax >= m.goal && m.goal > 0).length;

        // --- CÁLCULO DE LOGROS (ACHIEVEMENTS) ---
        const getAchievements = () => {
            const sortedByDate = [...filteredLogs].sort((a, b) => a.date.localeCompare(b.date));
            const findFirst = (predicate: (l: any) => boolean) => {
                const log = sortedByDate.find(predicate);
                return log ? log.date : null;
            };

            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            if (userKey !== 'ana') {
                // LOGROS MARCELO (Muay Thai + Fuerza Casera)
                const firstRoundAt = findFirst(l => !!(l.muayThaiData || (l.blockId && l.blockId.toLowerCase().includes('muay'))));
                
                const muayThaiThisWeek = filteredLogs.filter(l => (l.muayThaiData || (l.blockId && l.blockId.toLowerCase().includes('muay'))) && isWithinCurrentWeek(l.date)).length;
                const furyTarget = 3;
                const furyProgress = Math.min((muayThaiThisWeek / furyTarget) * 100, 100);
                
                const homeFuerzaThisWeek = filteredLogs.filter(l => l.gymData && !l.muayThaiData && !l.blockId.toLowerCase().includes('muay') && isWithinCurrentWeek(l.date)).length;
                const homeFuerzaTarget = 2;
                const homeFuerzaProgress = Math.min((homeFuerzaThisWeek / homeFuerzaTarget) * 100, 100);

                const piernasAceroAt = findFirst(l => {
                    if (!l.gymData?.progress) return false;
                    return Object.entries(l.gymData.progress).some(([exId, sets]: [string, any]) => {
                        const exDef = (l.gymData.exercises || MARCELO_PLAN.flatMap(b => b.exercises))?.find((e: any) => e.id === exId);
                        const name = exDef?.name.toLowerCase() || '';
                        return (name.includes('búlgara') || name.includes('bulgarian')) && 
                               sets.some((s: any) => s.completed && (parseFloat(s.weight) || 0) >= 16);
                    });
                });

                const ironHabitTarget = 4; // Subimos la disciplina a 4 (ej. 3 MT + 1 Fuerza)
                const ironHabitProgress = Math.min((workoutsThisWeek / ironHabitTarget) * 100, 100);

                const streakFireTarget = 7;
                const streakProgress = Math.min((currentStreak / streakFireTarget) * 100, 100);
                const streakFireAt = currentStreak >= streakFireTarget ? todayStr : null;

                return [
                    { 
                        id: 'first_round', title: 'Primer Round', category: 'striking', 
                        desc: 'Completa tu primera sesión de técnica de striking.', 
                        icon: 'Zap', color: 'orange', 
                        unlocked: !!firstRoundAt, unlockedAt: firstRoundAt,
                        action: 'striking'
                    },
                    { 
                        id: 'thai_fury', title: 'Furia Tailandesa', category: 'striking',
                        desc: 'Completa 3 sesiones de Muay Thai en una misma semana.', 
                        icon: 'Flame', color: 'rose', 
                        unlocked: muayThaiThisWeek >= furyTarget, 
                        progress: furyProgress,
                        currentValue: muayThaiThisWeek, targetValue: furyTarget,
                        action: 'striking'
                    },
                    { 
                        id: 'home_warrior', title: 'Guerrero Casero', category: 'strength',
                        desc: 'Completa 2 sesiones de fuerza en casa por semana.', 
                        icon: 'Dumbbell', color: 'slate', 
                        unlocked: homeFuerzaThisWeek >= homeFuerzaTarget,
                        progress: homeFuerzaProgress,
                        currentValue: homeFuerzaThisWeek, targetValue: homeFuerzaTarget,
                        action: 'home'
                    },
                    { 
                        id: 'iron_legs', title: 'Piernas de Acero', category: 'mastery',
                        desc: 'Levanta 16kg o más totales en Sentadilla Búlgara.', 
                        icon: 'Weight', color: 'slate', 
                        unlocked: !!piernasAceroAt, unlockedAt: piernasAceroAt,
                        action: 'mastery'
                    },
                    { 
                        id: 'iron_habit', title: 'Disciplina', category: 'consistency',
                        desc: 'Entrena al menos 4 veces en una misma semana.', 
                        icon: 'TrendingUp', color: 'indigo', 
                        unlocked: workoutsThisWeek >= ironHabitTarget, 
                        progress: ironHabitProgress,
                        currentValue: workoutsThisWeek, targetValue: ironHabitTarget,
                        action: 'plan'
                    },
                    { 
                        id: 'streak_fire', title: 'Racha Constante', category: 'consistency',
                        desc: 'Mantén una racha de entrenamiento de 7 días seguidos.', 
                        icon: 'Activity', color: 'emerald', 
                        unlocked: currentStreak >= streakFireTarget, unlockedAt: streakFireAt,
                        progress: streakProgress,
                        currentValue: currentStreak, targetValue: streakFireTarget,
                        action: 'home'
                    }
                ];
            }

            // LOGROS ANA / DEFAULT (Gym + Surf)
            const firstRoundAt = findFirst(l => !!(l.muayThaiData || (l.blockId && l.blockId.toLowerCase().includes('muay'))));

            const tonClubAt = findFirst(l => {
                let logTonnage = 0;
                if (l.gymData?.progress) {
                    Object.values(l.gymData.progress).flat().forEach((s: any) => {
                        if (s?.completed) logTonnage += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
                    });
                }
                return logTonnage >= 1000;
            });

            const bruteForceTarget = 5000;
            const bruteForceProgress = Math.min((tonnageThisWeek / bruteForceTarget) * 100, 100);
            const bruteForceAt = tonnageThisWeek >= bruteForceTarget ? todayStr : null;

            const gravityZeroAt = findFirst(l => {
                if (!l.gymData?.progress) return false;
                return Object.entries(l.gymData.progress).some(([exId, sets]: [string, any]) => {
                    const exDef = (l.gymData.exercises || ANA_PLAN.flatMap(b => b.exercises))?.find((e: any) => e.id === exId);
                    const name = exDef?.name.toLowerCase() || '';
                    return (name.includes('dominada') || name.includes('pullup')) && 
                           sets.some((s: any) => s.completed && (parseFloat(s.weight) || 0) > 0);
                });
            });

            const ironHabitTarget = 3;
            const ironHabitProgress = Math.min((workoutsThisWeek / ironHabitTarget) * 100, 100);

            const streakFireTarget = 7;
            const streakProgress = Math.min((currentStreak / streakFireTarget) * 100, 100);
            const streakFireAt = currentStreak >= streakFireTarget ? todayStr : null;

            return [
                { 
                    id: 'first_round', title: 'Primer Round', category: 'striking', 
                    desc: 'Completa tu primera sesión de técnica de striking.', 
                    icon: 'Zap', color: 'orange', 
                    unlocked: !!firstRoundAt, unlockedAt: firstRoundAt,
                    action: 'striking'
                },
                { 
                    id: 'iron_habit', title: 'Hábito de Hierro', category: 'consistency',
                    desc: 'Entrena al menos 3 veces en una misma semana.', 
                    icon: 'TrendingUp', color: 'indigo', 
                    unlocked: workoutsThisWeek >= ironHabitTarget, 
                    progress: ironHabitProgress,
                    currentValue: workoutsThisWeek, targetValue: ironHabitTarget,
                    action: 'plan'
                },
                { 
                    id: 'ton_club', title: 'Club de la Tonelada', category: 'strength',
                    desc: 'Mueve más de 1,000kg de volumen total en una sola sesión.', 
                    icon: 'Weight', color: 'slate', 
                    unlocked: !!tonClubAt, unlockedAt: tonClubAt,
                    action: 'gym'
                },
                { 
                    id: 'brute_force', title: 'Fuerza Bruta', category: 'strength',
                    desc: 'Alcanza las 5 toneladas de volumen acumulado en una semana.', 
                    icon: 'Dumbbell', color: 'slate', 
                    unlocked: tonnageThisWeek >= bruteForceTarget, unlockedAt: bruteForceAt,
                    progress: bruteForceProgress,
                    currentValue: tonnageThisWeek, targetValue: bruteForceTarget,
                    action: 'gym'
                },
                { 
                    id: 'zero_gravity', title: 'Gravedad Cero', category: 'mastery',
                    desc: 'Realiza dominadas con peso añadido (Lastre).', 
                    icon: 'Crown', color: 'amber', 
                    unlocked: !!gravityZeroAt, unlockedAt: gravityZeroAt,
                    action: 'mastery'
                },
                { 
                    id: 'streak_fire', title: 'Racha de Fuego', category: 'consistency',
                    desc: 'Mantén una racha de entrenamiento de 7 días seguidos.', 
                    icon: 'Flame', color: 'orange', 
                    unlocked: currentStreak >= streakFireTarget, unlockedAt: streakFireAt,
                    progress: streakProgress,
                    currentValue: currentStreak, targetValue: streakFireTarget,
                    action: 'home'
                }
            ];
        };

        const achievementsList = getAchievements();

        // --- LOGS ENRICHMENT ---
        const enrichedLogs = filteredLogs.map((log, idx) => {
            let routineTitle = log.blockId || 'Entrenamiento';
            for (const roleData of Object.values(PLAN_BY_ROLE)) {
                const found = roleData.plan.find((p: any) => p.id === log.blockId);
                if (found) {
                    routineTitle = found.title;
                    break;
                }
            }

            let hasPR = false;
            if (log.gymData?.progress) {
                Object.keys(log.gymData.progress).forEach(exId => {
                    const sets = log.gymData.progress[exId];
                    sets.forEach((s: any) => {
                        if (!s.completed) return;
                        const currentVal = (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
                        if (currentVal <= 0) return;
                        
                        const isNewRecord = !filteredLogs.slice(idx + 1).some(oldLog => {
                            const oldSets = oldLog.gymData?.progress?.[exId];
                            if (!oldSets) return false;
                            return oldSets.some((os: any) => os.completed && (parseFloat(os.weight) || 0) * (parseInt(os.reps) || 0) >= currentVal);
                        });
                        if (isNewRecord) hasPR = true;
                    });
                });
            }

            return { ...log, routineTitle, hasPR };
        });

        return {
            dashboardStats: {
                workoutsThisWeek, totalSurfMins, totalMuayThaiMins,
                totalKiloJoules: totalKiloJoules.toFixed(1),
                tonnageThisWeek, tonnagePrevWeek, strengthMetrics,
                logros: logrosCount,
                achievements: achievementsList
            },
            dashboardInsights: insights.slice(0,3),
            coachInsights: coachInsights.slice(0, 4),
            enrichedLogs
        };
    }, [logs, userKey, profile, PLAN_BLOCKS]);

    return {
        logs: stats.enrichedLogs || logs, 
        setLogs, loadLogs, deleteLog,
        stats: stats.dashboardStats, 
        currentStreak, isLoading
    };
};
