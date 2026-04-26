import React from 'react';

// --- TOAST COMPONENT ---
interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type }) => (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className={`px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 ${
            type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
            type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' :
            'bg-slate-800 border-slate-700 text-white'
        }`}>
            <div className={`w-2 h-2 rounded-full ${
                type === 'success' ? 'bg-emerald-400' :
                type === 'error' ? 'bg-rose-400' :
                'bg-cyan-400'
            } animate-pulse`} />
            <span className="text-xs font-bold">{message}</span>
        </div>
    </div>
);

// --- STAMINA CALCULATOR ---
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
// --- ANALYTICS UTILITIES ---

/**
 * Calculates Estimated 1RM using Epley Formula
 * oneRM = weight * (1 + reps / 30)
 */
export function calculate1RM(weight: number, reps: number): number {
    if (!weight || !reps) return 0;
    return weight * (1 + reps / 30);
}

/**
 * Suggests progression based on completion rate and weight history
 * Lower body: +5kg | Upper body: +2.5kg | Deload: -10%
 */
export function suggestProgression(currentWeight: number, repsDone: number, targetReps: number, pattern: string) {
    const isLower = ['squat', 'hinge', 'lunge'].includes(pattern.toLowerCase());
    const increment = isLower ? 5 : 2.5;
    
    // Logic from framework: if all sets complete @ target, increase
    if (repsDone >= targetReps) {
        return {
            suggestedWeight: currentWeight + increment,
            type: 'increase',
            message: `¡Sube a ${currentWeight + increment}kg! Estás progresando.`
        };
    } else if (repsDone / targetReps < 0.6) {
        // Deload logic from framework
        return {
            suggestedWeight: Math.round(currentWeight * 0.9 * 2) / 2,
            type: 'deload',
            message: `Bajemos a ${Math.round(currentWeight * 0.9)}kg para recuperar técnica.`
        };
    }
    
    return {
        suggestedWeight: currentWeight,
        type: 'maintain',
        message: 'Mantén este peso una sesión más.'
    };
}
/**
 * Calculates ACWR (Acute:Chronic Workload Ratio) for injury prevention
 * acuteLoad = avg last 7 days | chronicLoad = avg last 28 days
 */
export function calculateACWR(logs: any[]) {
    const now = new Date().getTime();
    const msInDay = 24 * 60 * 60 * 1000;
    
    // Simplification: calculate daily load as (stamina_score + tonnage/100)
    const getDailyLoad = (log: any) => {
        const stamina = log.staminaScore || 0;
        let tonnage = 0;
        if (log.gymData?.progress) {
            Object.values(log.gymData.progress).forEach((sets: any) => {
                sets.forEach((s: any) => {
                    if (s.completed) tonnage += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
                });
            });
        }
        return stamina + (tonnage / 100);
    };

    const acuteLoads = logs.filter(l => now - new Date(l.date).getTime() <= 7 * msInDay).map(getDailyLoad);
    const chronicLoads = logs.filter(l => now - new Date(l.date).getTime() <= 28 * msInDay).map(getDailyLoad);
    
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
        
        // Precise analysis of which group spiked in last 7 days
        const nowMs = new Date().getTime();
        const groupLoads: Record<string, number> = {};
        logs.filter(l => nowMs - new Date(l.date).getTime() <= 7 * 24 * 60 * 60 * 1000)
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

/**
 * Calculates Recovery Score (0-100) based on recency, volume and streak
 */
export function calculateRecoveryScore(logs: any[], streak: number) {
    if (logs.length === 0) return 100;
    const lastLog = logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const diffDays = Math.floor((new Date().getTime() - new Date(lastLog.date).getTime()) / (1000 * 60 * 60 * 24));
    
    const recency = Math.min(diffDays / 2, 1) * 40; // Max 40pts
    const volumeScore = 30; // Max 30pts (simplified for now)
    const streakScore = Math.min(streak / 7, 1) * 30; // Max 30pts
    
    const total = recency + volumeScore + streakScore;
    
    const score = Math.round(total);
    let advice = 'Estás en plena forma.';
    
    if (score > 80) {
        advice = streak > 5 ? "Racha imparable. ¡Buen día para un PR! 🚀" : "Energía tope. ¡Entrena fuerte! 🦾";
    } else if (score > 60) {
        advice = diffDays > 3 ? "Cuerpo frío. Calienta bien hoy. ❄️" : "Buen nivel. Mantén el ritmo. ⚡️";
    } else if (score > 40) {
        advice = "Fatiga acumulada. Modera las cargas. ⚠️";
    } else {
        advice = "Fatiga crítica. Prioriza estiramientos o descanso. 🧘";
    }

    return { score, advice };
}
/**
 * Detects the day of the week with highest average performance
 */
export function detectBestDay(logs: any[]) {
    if (logs.length === 0) return null;
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const performanceByDay = Array(7).fill(0).map(() => ({ total: 0, count: 0 }));
    
    logs.forEach(log => {
        const day = new Date(log.date).getDay();
        let performance = log.staminaScore || 0;
        if (log.gymData?.progress) {
            Object.values(log.gymData.progress).forEach((sets: any) => {
                sets.forEach((s: any) => {
                    if (s.completed) performance += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0) / 100;
                });
            });
        }
        performanceByDay[day].total += performance;
        performanceByDay[day].count += 1;
    });
    
    const avgs = performanceByDay.map(d => d.count ? d.total / d.count : 0);
    const bestIdx = avgs.indexOf(Math.max(...avgs));
    return avgs[bestIdx] > 0 ? days[bestIdx] : null;
}

/**
 * Calculates consistency score based on standard deviation of session gaps
 */
export function calculateConsistency(logs: any[]) {
    if (logs.length < 3) return 100;
    const sorted = [...logs].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i].date).getTime() - new Date(sorted[i-1].date).getTime()) / (1000 * 60 * 60 * 24);
        gaps.push(diff);
    }
    
    const avgGap = gaps.reduce((a,b) => a+b, 0) / gaps.length;
    const variance = gaps.reduce((a,b) => a + Math.pow(b - avgGap, 2), 0) / gaps.length;
    const stdDev = Math.sqrt(variance);
    
    const score = Math.max(0, Math.min(100, Math.round(100 - (stdDev * 15))));
    return { score, avgGap: avgGap.toFixed(1) };
}

/**
 * Detects muscle group volume balance (Push vs Pull)
 */
export function calculateMuscleBalance(logs: any[]) {
    // Volume buckets (completed sets in last 7 days)
    const volume = { push: 0, pull: 0, legs: 0, core: 0 };
    const now = new Date().getTime();
    const weekLogs = logs.filter(l => now - new Date(l.date).getTime() <= 7 * 24 * 60 * 60 * 1000);
    
    weekLogs.forEach(log => {
        if (log.gymData?.progress) {
            log.gymData.exercises?.forEach((ex: any) => {
                const sets = log.gymData.progress[ex.id]?.filter((s:any) => s.completed).length || 0;
                const pattern = ex.visual || 'other';
                if (['push', 'press'].some(k => pattern.includes(k))) volume.push += sets;
                if (['pull', 'row'].some(k => pattern.includes(k))) volume.pull += sets;
                if (['squat', 'hinge', 'lunge'].some(k => pattern.includes(k))) volume.legs += sets;
                if (['core', 'abs'].some(k => pattern.includes(k))) volume.core += sets;
            });
        }
    });

    const pullPushRatio = volume.push > 0 ? volume.pull / volume.push : 1.2;
    return { volume, pullPushRatio };
}

/**
 * Predicts the date when a goal will be reached based on linear regression slope
 */
export function predictGoalDate(history: any[], currentMax: number, goal: number) {
    if (!history || history.length < 3 || goal <= currentMax) return null;
    
    // Simple slope calculation (last 4 points)
    const recent = history.slice(-4);
    const first = recent[0].weight || 0;
    const last = recent[recent.length-1].weight || 0;
    const sessions = recent.length - 1;
    const slopeValue = (last - first) / Math.max(sessions, 1);
    
    if (slopeValue <= 0) return 'Meseta detectada. Ajusta el estímulo.';
    
    const sessionsPerWeek = 2; // Conservative average
    const kgToGoal = goal - currentMax;
    const weeksToGoal = kgToGoal / (slopeValue * sessionsPerWeek);
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksToGoal * 7));
    
    return `Meta en ${targetDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })}`;
}

/**
 * Recommends the optimal next block based on muscle balance and recovery
 */
export function getRecommendedNextBlock(blocks: any[], logs: any[], muscleBalance: any) {
    if (!blocks || blocks.length === 0) return null;
    const now = new Date().getTime();
    
    const scoredBlocks = blocks.map(block => {
        const lastLog = logs.filter(l => l.blockId === block.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const daysSince = lastLog ? (now - new Date(lastLog.date).getTime()) / (1000 * 60 * 60 * 24) : 14; // Default to 2 weeks
        
        // Muscle need score from balance detector
        let muscleNeed = 0;
        block.exercises.forEach((ex: any) => {
            const pattern = ex.visual || '';
            if (pattern.includes('pull') && muscleBalance.pullPushRatio < 0.9) muscleNeed += 25;
            if (pattern.includes('legs') && muscleBalance.volume.legs < 5) muscleNeed += 15;
            if (pattern.includes('core') && muscleBalance.volume.core < 3) muscleNeed += 10;
        });

        // Urgency logic
        const score = (daysSince * 0.5) + (muscleNeed * 0.5);
        return { block, score };
    });

    return scoredBlocks.sort((a,b) => b.score - a.score)[0].block;
}

/**
 * Predicts PR probability for an exercise today
 */
export function predictPRProbability(history: any[]) {
    if (!history || history.length < 3) return 0;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    
    const now = new Date().getTime();
    const lastDate = new Date(last.date).getTime();
    const daysRest = (now - lastDate) / (1000 * 60 * 60 * 24);
    
    let prob = 0;
    
    // Ideal rest between specific exercise: 2.5 - 6 days
    if (daysRest >= 2.5 && daysRest <= 6) prob += 0.45;
    else if (daysRest > 6) prob += 0.25;
    
    // Trend: did weight increase last time?
    const slope = (last.weight - prev.weight);
    if (slope > 0) prob += 0.35;
    else if (slope === 0 && last.reps > prev.reps) prob += 0.25;
    
    return prob; // 0.0 to 1.0
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
