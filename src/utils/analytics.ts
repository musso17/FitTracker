// Pure logic utilities for fitness analytics
// Moved from Common.tsx to be used in both frontend and serverless functions

/**
 * Parses a YYYY-MM-DD string safely to a Date object at noon.
 * Prevents timezone off-by-one errors.
 */
export function parseSafeDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    // If it already has a time or is a full ISO string, return as is
    if (dateStr.includes('T') || dateStr.includes(':')) return new Date(dateStr);
    return new Date(`${dateStr}T12:00:00`);
}

export function calculateStamina(activity: {
    type: 'surf' | 'muay_thai' | 'other',
    duration: number,
    intensity?: string,
    feeling?: string
}) {
    let multiplier = 1.0;
    
    if (activity.type === 'surf') {
        const feelingMultiplier: Record<string, number> = { 'struggle': 1.3, 'good': 1.0, 'awesome': 1.15 };
        multiplier = feelingMultiplier[activity.feeling || 'good'] || 1.0;
    } else if (activity.type === 'muay_thai') {
        const intensityMap: Record<string, number> = { 'ligera': 0.8, 'media': 1.0, 'exigente': 1.4 };
        multiplier = intensityMap[activity.intensity || 'media'] || 1.0;
    } else {
        const otherMap: Record<string, number> = { 'baja': 0.7, 'media': 1.0, 'alta': 1.3 };
        multiplier = otherMap[activity.intensity || 'media'] || 1.0;
    }

    const score = Math.round(activity.duration * multiplier);
    const label = `${activity.duration}m × ${multiplier.toFixed(1)}x`;
    
    return { score, label };
}

export function calculate1RM(weight: number, reps: number): number {
    if (!weight || !reps) return 0;
    return weight * (1 + reps / 30);
}

export function suggestProgression(currentWeight: number, repsDone: number, targetReps: number, pattern: string, rir: number = 2, isAssisted: boolean = false) {
    const isLower = ['squat', 'hinge', 'lunge'].includes(pattern.toLowerCase());
    const increment = isLower ? 5 : 2.5;
    
    // Normal progression logic
    if (!isAssisted) {
        if (repsDone >= targetReps && rir >= 2) {
            return {
                suggestedWeight: currentWeight + increment,
                type: 'increase',
                message: `¡Sube a ${currentWeight + increment}kg! Se ve fácil.`
            };
        } else if (repsDone < targetReps || rir <= 1) {
            if (repsDone < targetReps * 0.7) {
                return {
                    suggestedWeight: Math.max(0, currentWeight - increment),
                    type: 'deload',
                    message: `Bajemos a ${currentWeight - increment}kg para completar reps.`
                };
            }
            return {
                suggestedWeight: currentWeight,
                type: 'maintain',
                message: 'Mantén este peso para consolidar.'
            };
        }
    } 
    // Assisted progression logic (less weight = harder)
    else {
        if (repsDone >= targetReps && rir >= 2) {
            return {
                suggestedWeight: Math.max(0, currentWeight - 5), // Menos asistencia
                type: 'increase',
                message: `¡Baja la asistencia a ${currentWeight - 5}kg! Estás más fuerte.`
            };
        } else if (repsDone < targetReps) {
            return {
                suggestedWeight: currentWeight + 5, // Más asistencia
                type: 'deload',
                message: `Sube la asistencia a ${currentWeight + 5}kg para terminar.`
            };
        }
    }
    
    return {
        suggestedWeight: currentWeight,
        type: 'maintain',
        message: 'Mantén el peso.'
    };
}

export function calculateACWR(logs: any[]) {
    const now = new Date().getTime();
    const msInDay = 24 * 60 * 60 * 1000;
    
    const getDailyLoad = (log: any) => {
        let load = 0;
        
        // Surf Load: Duration * RPE * 0.8 (Impact)
        if (log.surfData) {
            const duration = log.surfData.duration || 0;
            const rpeMap: Record<string, number> = { 'struggle': 1.4, 'good': 1.0, 'awesome': 1.2 };
            const rpe = rpeMap[log.surfData.feeling] || 1.0;
            load += duration * rpe * 0.8;
        }

        // Muay Thai Load: Duration * RPE * 1.5 (Impact)
        if (log.muayThaiData) {
            const duration = log.muayThaiData.duration || 0;
            const intensityMap: Record<string, number> = { 'ligera': 0.8, 'media': 1.1, 'exigente': 1.5 };
            const rpe = intensityMap[log.muayThaiData.intensity] || 1.1;
            load += duration * rpe * 1.5;
        }

        // Gym Tonnage
        let tonnage = 0;
        let gymTimeLoad = 0;
        if (log.gymData?.progress) {
            Object.keys(log.gymData.progress).forEach((exId) => {
                const exDef = log.gymData.exercises?.find((e: any) => e.id === exId);
                const sets = log.gymData.progress[exId];
                sets.forEach((s: any) => {
                    if (s.completed) {
                        if (exDef?.type === 'time') {
                            gymTimeLoad += (parseInt(s.reps) || 0) * 0.8;
                        } else {
                            tonnage += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
                        }
                    }
                });
            });
        }

        return load + gymTimeLoad + (tonnage / 100);
    };

    const acuteLoads = logs.filter(l => now - parseSafeDate(l.date).getTime() <= 7 * msInDay).map(getDailyLoad);
    const chronicLoads = logs.filter(l => now - parseSafeDate(l.date).getTime() <= 28 * msInDay).map(getDailyLoad);
    
    const acuteAvg = acuteLoads.length > 0 ? acuteLoads.reduce((a,b) => a+b, 0) / 7 : 0;
    const chronicAvg = chronicLoads.length > 0 ? chronicLoads.reduce((a,b) => a+b, 0) / 28 : 0;
    
    if (chronicAvg === 0) return { ratio: 1.0, status: 'optimo', label: 'Iniciando' };
    const ratio = acuteAvg / chronicAvg;
    
    let status = 'optimo';
    let label = 'Zona Óptima';
    let contributor = '';

    if (ratio < 0.8) { 
        status = 'sub'; label = 'Baja Carga'; 
    } else if (ratio > 1.3) {
        status = ratio > 1.5 ? 'riesgo' : 'alerta';
        label = ratio > 1.5 ? 'Riesgo de Lesión' : 'Zona de Alerta';
        
        const nowMs = new Date().getTime();
        const groupLoads: Record<string, number> = {};
        logs.filter(l => nowMs - parseSafeDate(l.date).getTime() <= 7 * 24 * 60 * 60 * 1000)
            .forEach(log => {
                const exLogs = log.gymData?.progress || {};
                Object.keys(exLogs).forEach(exId => {
                    const exercise = log.gymData?.exercises?.find((e: any) => e.id === exId);
                    const pattern = exercise?.visual || 'ejercicios';
                    const sets = exLogs[exId].filter((s:any) => s.completed).length || 0;
                    groupLoads[pattern] = (groupLoads[pattern] || 0) + sets;
                });
            });
        
        const sortedGroups = Object.entries(groupLoads).sort((a, b) => b[1] - a[1]);
        if (sortedGroups.length > 0) {
            contributor = sortedGroups[0][0];
        }
    }
    
    const advice = status === 'riesgo' 
        ? `¡Urgente! Baja el volumen de ${contributor}.` 
        : status === 'alerta' 
            ? `Carga alta en ${contributor}. Modera intensidad.` 
            : 'Tu progresión es estable.';

    return { ratio, status, label, advice };
}

export function calculateRecoveryScore(logs: any[], streak: number) {
    if (logs.length === 0) return 100;
    
    const now = new Date().getTime();
    const sorted = [...logs].sort((a,b) => parseSafeDate(b.date).getTime() - parseSafeDate(a.date).getTime());
    const lastLog = sorted[0];
    const diffDays = Math.floor((now - parseSafeDate(lastLog.date).getTime()) / (1000 * 60 * 60 * 24));
    
    // Base Scores
    const recency = Math.min(diffDays / 2, 1) * 40;
    let volumePenalty = 0;
    let stressPenalty = 0;

    // Analyze last 48 hours for acute fatigue
    const recentLogs = logs.filter(l => (now - parseSafeDate(l.date).getTime()) <= 48 * 60 * 60 * 1000);
    
    recentLogs.forEach(log => {
        // Surf: Thermal Stress (-12%)
        if (log.surfData) stressPenalty += 12;
        // Muay Thai: CNS Fatigue (-15%)
        if (log.muayThaiData) stressPenalty += 15;
        // High Gym Volume
        if (log.gymData?.progress) {
            const setTotal = Object.values(log.gymData.progress).reduce((acc: number, val: any) => acc + (val.length || 0), 0);
            if (setTotal > 15) volumePenalty += 10;
        }
    });

    const streakScore = Math.min(streak / 7, 1) * 30;
    
    const total = Math.max(0, recency + 30 + streakScore - volumePenalty - stressPenalty);
    const score = Math.round(total);
    
    let advice = 'Estás en plena forma.';
    if (score > 80) advice = "Listo para un PR. 🚀";
    else if (score > 60) advice = "Cuerpo cargado. Calienta bien. ⚡️";
    else if (score > 40) advice = "Fatiga detectada. Modera cargas. ⚠️";
    else advice = "Fatiga crítica. Descanso o yoga hoy. 🧘";

    return { score, advice };
}

export function detectBestDay(logs: any[]) {
    if (logs.length === 0) return null;
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const performanceByDay = Array(7).fill(0).map(() => ({ total: 0, count: 0, stamina: 0 }));
    
    logs.forEach(log => {
        const day = parseSafeDate(log.date).getDay();
        let performance = 0;
        
        if (log.gymData?.progress) {
            Object.keys(log.gymData.progress).forEach((exId) => {
                const exDef = log.gymData.exercises?.find((e: any) => e.id === exId);
                const sets = log.gymData.progress[exId];
                sets.forEach((s: any) => {
                    if (s.completed) {
                        if (exDef?.type === 'time') {
                            performance += (parseInt(s.reps) || 0) * 0.8;
                        } else {
                            performance += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0) / 100;
                        }
                    }
                });
            });
        }
        performanceByDay[day].total += performance;
        performanceByDay[day].stamina += (log.staminaScore || 0);
        performanceByDay[day].count += 1;
    });
    
    const avgs = performanceByDay.map(d => d.count ? d.total / d.count : 0);
    const bestIdx = avgs.indexOf(Math.max(...avgs));
    
    if (avgs[bestIdx] <= 0) return null;

    const dayName = days[bestIdx];
    const data = performanceByDay[bestIdx];
    let reason = 'Mayor rendimiento general';
    
    if (data.stamina / data.count > 100) reason = 'Máxima Stamina';
    else if (avgs[bestIdx] > 150) reason = 'Mayor Volumen';

    return { day: dayName, reason: `${dayName} (${reason})` };
}

export function calculateConsistency(logs: any[]) {
    if (logs.length < 3) return 100;
    const sorted = [...logs].sort((a,b) => parseSafeDate(a.date).getTime() - parseSafeDate(b.date).getTime());
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
        const diff = (parseSafeDate(sorted[i].date).getTime() - parseSafeDate(sorted[i-1].date).getTime()) / (1000 * 60 * 60 * 24);
        gaps.push(diff);
    }
    
    const avgGap = gaps.reduce((a,b) => a+b, 0) / gaps.length;
    const variance = gaps.reduce((a,b) => a + Math.pow(b - avgGap, 2), 0) / gaps.length;
    const stdDev = Math.sqrt(variance);
    
    const score = Math.max(0, Math.min(100, Math.round(100 - (stdDev * 15))));
    return { score, avgGap: avgGap.toFixed(1) };
}

export function calculateMuscleBalance(logs: any[]) {
    const volume: Record<string, number> = { 
        push: 0, pull: 0, legs: 0, core: 0,
        chest: 0, deltoids: 0, triceps: 0,
        back: 0, biceps: 0, abs: 0, glutes: 0
    };
    const legsDetail = { anterior: 0, posterior: 0 };
    
    const now = new Date().getTime();
    const weekLogs = logs.filter(l => now - parseSafeDate(l.date).getTime() <= 7 * 24 * 60 * 60 * 1000);
    
    weekLogs.forEach(log => {
        // --- GYM DATA ---
        if (log.gymData?.progress) {
            log.gymData.exercises?.forEach((ex: any) => {
                const sets = log.gymData.progress[ex.id]?.filter((s:any) => s.completed).length || 0;
                const pattern = (ex.visual || 'other').toLowerCase();
                
                const p = 1.0;
                const s = 0.5;

                if (['push', 'press', 'benchpress', 'chest'].some(k => pattern.includes(k))) {
                    volume.push += sets * p;
                    if (pattern.includes('chest') || pattern.includes('bench')) {
                        volume.chest += sets * p;
                        volume.triceps += sets * s;
                        volume.deltoids += sets * s;
                    } else if (pattern.includes('press')) {
                        volume.deltoids += sets * p;
                        volume.triceps += sets * s;
                    }
                }
                
                if (['pull', 'row', 'back'].some(k => pattern.includes(k))) {
                    volume.pull += sets * p;
                    volume.back += sets * p;
                    volume.biceps += sets * s;
                }

                if (['squat', 'hinge', 'lunge', 'legs', 'glute'].some(k => pattern.includes(k))) {
                    volume.legs += sets * p;
                    if (pattern === 'squat' || pattern === 'lunge') {
                        legsDetail.anterior += sets * p;
                        volume.glutes += sets * s;
                    }
                    if (pattern === 'hinge') {
                        legsDetail.posterior += sets * p;
                        volume.glutes += sets * p;
                    }
                    if (pattern.includes('glute')) volume.glutes += sets * p;
                }

                if (['core', 'abs'].some(k => pattern.includes(k))) {
                    volume.core += sets * p;
                    volume.abs += sets * p;
                }

                if (pattern.includes('bicep')) volume.biceps += sets * p;
                if (pattern.includes('tricep')) volume.triceps += sets * p;
            });
        }

        // --- SURF DATA ---
        if (log.surfData) {
            const duration = log.surfData.duration || 0;
            // 60 min surf ~= 8 sets of back/pull, 4 sets of core/shoulders
            const surfVolume = duration / 10; 
            volume.pull += surfVolume * 0.8;
            volume.back += surfVolume * 1.0;
            volume.deltoids += surfVolume * 0.6;
            volume.core += surfVolume * 0.4;
            volume.chest += surfVolume * 0.2; // Pop-up
        }

        // --- MUAY THAI DATA ---
        if (log.muayThaiData) {
            const duration = log.muayThaiData.duration || 0;
            // 90 min MT ~= 12 sets of metabolic/rotational load
            const mtVolume = duration / 10;
            volume.core += mtVolume * 1.0;
            volume.abs += mtVolume * 0.8;
            volume.deltoids += mtVolume * 0.7;
            volume.legs += mtVolume * 0.6;
            volume.push += mtVolume * 0.4;
        }
    });

    const pullPushRatio = volume.push > 0 ? (volume.pull / volume.push) : (volume.pull > 0 ? 2 : 1.2);
    return { volume, pullPushRatio, legsDetail };
}

export function predictGoalDate(history: any[], currentMax: number, goal: number) {
    if (!history || history.length < 3 || goal <= currentMax) return null;
    
    const recent = history.slice(-4);
    const first = recent[0].weight || 0;
    const last = recent[recent.length-1].weight || 0;
    const sessions = recent.length - 1;
    const slopeValue = (last - first) / Math.max(sessions, 1);
    
    if (slopeValue <= 0) return 'Meseta detectada. Ajusta el estímulo.';
    
    const sessionsPerWeek = 2;
    const kgToGoal = goal - currentMax;
    const weeksToGoal = kgToGoal / (slopeValue * sessionsPerWeek);
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksToGoal * 7));
    
    return `Meta en ${targetDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })}`;
}

export function getRecommendedNextBlock(blocks: any[], logs: any[], muscleBalance: any) {
    if (!blocks || blocks.length === 0) return null;
    const now = new Date().getTime();
    
    const scoredBlocks = blocks.map(block => {
        const lastLog = logs.filter(l => l.blockId === block.id).sort((a,b) => parseSafeDate(b.date).getTime() - parseSafeDate(a.date).getTime())[0];
        const daysSince = lastLog ? (now - parseSafeDate(lastLog.date).getTime()) / (1000 * 60 * 60 * 24) : 14;
        
        let muscleNeed = 0;
        block.exercises.forEach((ex: any) => {
            const pattern = ex.visual || '';
            if (pattern.includes('pull') && muscleBalance.pullPushRatio < 0.9) muscleNeed += 25;
            if (pattern.includes('legs') && muscleBalance.volume.legs < 5) muscleNeed += 15;
            if (pattern.includes('core') && muscleBalance.volume.core < 3) muscleNeed += 10;
        });

        const score = (daysSince * 0.5) + (muscleNeed * 0.5);
        return { block, score };
    });

    return scoredBlocks.sort((a,b) => b.score - a.score)[0].block;
}

export function predictPRProbability(history: any[]) {
    if (!history || history.length < 3) return 0;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    
    const now = new Date().getTime();
    const lastDate = parseSafeDate(last.date).getTime();
    const daysRest = (now - lastDate) / (1000 * 60 * 60 * 24);
    
    let prob = 0;
    if (daysRest >= 2.5 && daysRest <= 6) prob += 0.45;
    else if (daysRest > 6) prob += 0.25;
    
    const slope = (last.weight - prev.weight);
    if (slope > 0) prob += 0.35;
    else if (slope === 0 && last.reps > prev.reps) prob += 0.25;
    
    return prob;
}

export const ANALYTICS_DOCS = {
    recovery: {
        title: "Score de Recuperación",
        icon: "⚡️",
        desc: "Estimación de tu estado físico basada en la frecuencia, volumen y regularidad de tus sesiones.",
        ranges: [
            { label: "70-100", status: "Óptimo", advice: "Listo para cargas pesadas." },
            { label: "40-70", status: "Moderado", advice: "Entrena con control." },
            { label: "< 40", status: "Fatiga", advice: "Prioriza descanso o recuperación activa." }
        ]
    },
    acwr: {
        title: "Ratio de Carga (ACWR)",
        icon: "📈",
        desc: "Compara tu carga de la última semana vs. el promedio de las últimas 4 semanas para prevenir lesiones.",
        ranges: [
            { label: "0.8 - 1.3", status: "Óptimo", advice: "Progresión segura y estable." },
            { label: "1.3 - 1.5", status: "Alerta", advice: "Riesgo moderado de sobrecarga." },
            { label: "> 1.5", status: "Riesgo", advice: "Peligro de lesión. Reduce el volumen." }
        ]
    },
    balance: {
        title: "Balance Muscular",
        icon: "⚖️",
        desc: "Mide el equilibrio entre movimientos de empuje (pecho/hombros) y tracción (espalda).",
        ranges: [
            { label: "> 0.8", status: "Saludable", advice: "Balance correcto." },
            { label: "< 0.8", status: "Desequilibrio", advice: "Demasiado empuje. Podrías dañar tus hombros." }
        ]
    }
};
