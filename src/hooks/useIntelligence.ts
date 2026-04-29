import { useMemo } from 'react';
import { 
    calculateRecoveryScore, 
    calculateMuscleBalance, 
    detectBestDay, 
    calculateConsistency, 
    getRecommendedNextBlock,
    parseSafeDate
} from '../components/Common';
import type { TrainingLog, TrainingBlock } from '../types';

export function useIntelligence(logs: TrainingLog[], blocks: TrainingBlock[], streak: number) {
    return useMemo(() => {
        const hasHistory = logs.length > 0;
        const sessionCount = logs.length;
        const weeksOfData = hasHistory ? 
            (new Date().getTime() - parseSafeDate(logs[logs.length-1].date).getTime()) / (1000 * 60 * 60 * 24 * 7) : 0;

        // Core Analytics
        const muscleBalance = calculateMuscleBalance(logs);
        const recovery = calculateRecoveryScore(logs, streak);
        const bestDay = sessionCount >= 8 ? detectBestDay(logs) : null;
        const consistency = sessionCount >= 8 ? calculateConsistency(logs) : { score: 0, status: 'Sin datos' };
        
        // Advanced Predictions (Minimum data guards)
        const canPredictGoals = sessionCount >= 10; // Rule of thumb for regression
        const recommendedBlock = getRecommendedNextBlock(blocks, logs, muscleBalance);

        // Coach Insights Logic
        const insights = [];
        if (sessionCount < 8) {
            insights.push("Sigue así. Necesito 8 sesiones para entender tus patrones.");
        }
        if (weeksOfData < 4) {
            insights.push("Completa 4 semanas para activar el monitor de fatiga (ACWR).");
        }

        return {
            muscleBalance,
            recovery,
            bestDay,
            consistency,
            recommendedBlock,
            metadata: {
                sessionCount,
                weeksOfData,
                canPredictGoals,
                isNewUser: sessionCount < 4
            },
            placeholders: {
                consistency: sessionCount < 8 ? "Entrena 8 sesiones para ver tu constancia" : null,
                predictions: weeksOfData < 4 ? "Entrena 4 semanas para ver tus predicciones" : null
            },
            insights
        };
    }, [logs, blocks, streak]);
}
