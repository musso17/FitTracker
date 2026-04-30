import { useMemo, useState, useEffect } from 'react';
import { 
    calculateRecoveryScore, 
    calculateMuscleBalance, 
    detectBestDay, 
    calculateConsistency, 
    getRecommendedNextBlock,
    parseSafeDate
} from '../components/Common';
import type { TrainingLog, TrainingBlock } from '../types';
import { generateAIAnalysis } from '../services/ai';
import type { AIAnalysisResult, CoachInsight } from '../services/ai';

export function useIntelligence(logs: TrainingLog[], blocks: TrainingBlock[], streak: number, profile?: any) {
    const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    useEffect(() => {
        if (logs.length > 0) {
            const cacheKey = 'ai_analysis_cache';
            const cachedDataStr = localStorage.getItem(cacheKey);
            let shouldFetch = true;

            if (cachedDataStr) {
                try {
                    const cachedData = JSON.parse(cachedDataStr);
                    const now = new Date().getTime();
                    const cacheTime = cachedData.timestamp || 0;
                    const cacheLogCount = cachedData.logCount || 0;
                    
                    if (now - cacheTime < 86400000 && cacheLogCount === logs.length) {
                        setAiResult(cachedData.result);
                        shouldFetch = false;
                    }
                } catch (e) {
                    console.error("Error parsing AI cache", e);
                }
            }

            if (shouldFetch) {
                setIsLoadingAi(true);
                generateAIAnalysis(logs, profile).then(res => {
                    if (res) {
                        setAiResult(res);
                        localStorage.setItem(cacheKey, JSON.stringify({
                            timestamp: new Date().getTime(),
                            logCount: logs.length,
                            result: res
                        }));
                    }
                    setIsLoadingAi(false);
                });
            }
        }
    }, [logs, profile]);

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
        const insights: CoachInsight[] = aiResult?.insights || [];
        if (!aiResult && !isLoadingAi) {
            if (sessionCount < 8) {
                insights.push({ type: 'info', title: 'Recopilando datos', message: "Sigue así. Necesito 8 sesiones para entender tus patrones.", icon: '📊' });
            }
            if (weeksOfData < 4) {
                insights.push({ type: 'info', title: 'Fase de adaptación', message: "Completa 4 semanas para activar el monitor de fatiga (ACWR).", icon: '⏳' });
            }
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
            insights,
            aiSummary: aiResult?.summary,
            muscleFatigue: aiResult?.muscleFatigue,
            isLoadingAi
        };
    }, [logs, blocks, streak, aiResult, isLoadingAi]);
}
