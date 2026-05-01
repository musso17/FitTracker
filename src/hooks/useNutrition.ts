import { useMemo, useState, useEffect } from 'react';
import { FOOD_DATABASE, MEAL_SLOTS, MEAL_RULES, DAY_PROFILES } from '../data/nutritionDb';
import type { FoodItem, DayType, MealSlot } from '../data/nutritionDb';
import type { TrainingLog, TrainingBlock, UserProfile } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MealRecommendation {
    slot: MealSlot;
    foods: FoodItem[];
    tip?: string;
}

export interface WeeklyAIPlan {
    days: {
        dayName: string;
        dayType: string;
        meals: { slot: string; suggestion: string }[];
        tip: string;
    }[];
    generatedAt: number;
    logCount: number;
    sportFocus: string; // para invalidar cache al cambiar de perfil
}

function determineDayType(
    logs: TrainingLog[],
    blocks: TrainingBlock[],
    todayStr: string
): DayType {
    const todayLogs = logs.filter(l => l.date === todayStr);

    if (todayLogs.length === 0) return 'rest';

    let hasSurf = false;
    let hasMuayThai = false;
    let hasGym = false;

    for (const log of todayLogs) {
        if (log.surfData) hasSurf = true;
        if (log.muayThaiData) hasMuayThai = true;

        const block = blocks.find(b => b.id === log.blockId);
        if (block?.hasSurf) hasSurf = true;
        if (block?.hasMuayThai) hasMuayThai = true;
        if (!block?.hasSurf && !block?.hasMuayThai && log.gymData) hasGym = true;
    }

    if ((hasSurf && hasMuayThai) || (hasSurf && hasGym) || (hasMuayThai && hasGym)) return 'double';
    if (hasSurf) return 'surf';
    if (hasMuayThai) return 'muay_thai';
    if (hasGym) return 'gym';
    return 'rest';
}

// Determinar también qué tipo de día PLANIFICADO es (para el futuro inmediato)
function guessNextDayType(
    logs: TrainingLog[],
    blocks: TrainingBlock[],
    sportFocus?: string
): DayType {
    // Analizar los últimos 14 días para detectar patrones
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...

    // Si hay un bloque de surf en el plan, asumimos días de surf
    const hasSurfBlocks = blocks.some(b => b.hasSurf);
    const hasMTBlocks = blocks.some(b => b.hasMuayThai);

    if (sportFocus === 'surf' && hasSurfBlocks) {
        // Días pares: surf, impares: gym (pattern simple)
        return dayOfWeek % 2 === 0 ? 'surf' : 'gym';
    }
    if (sportFocus === 'muay_thai' && hasMTBlocks) {
        // L/Mi/V: muay thai, Ma/Ju: gym, S/D: rest
        if ([1, 3, 5].includes(dayOfWeek)) return 'muay_thai';
        if ([2, 4].includes(dayOfWeek)) return 'gym';
        return 'rest';
    }

    // Fallback: revisar el log más reciente
    if (logs.length > 0) {
        const lastLog = logs[0];
        const block = blocks.find(b => b.id === lastLog.blockId);
        if (block?.hasSurf) return 'gym'; // post-surf -> gym day likely
        if (block?.hasMuayThai) return 'gym';
        return 'rest';
    }

    return 'gym';
}

function selectFoodsForSlot(
    slotId: string,
    dayType: DayType,
    objective: string,
    sportFocus: string,
    usedIds: Set<string>
): FoodItem[] {
    const applicableRules = MEAL_RULES.filter(
        r => r.slotId === slotId && r.dayTypes.includes(dayType)
    );

    if (applicableRules.length === 0) return [];

    const rule = applicableRules[0];
    const pool = FOOD_DATABASE.filter(f => {
        if (usedIds.has(f.id)) return false;
        if (!rule.categories.includes(f.category)) return false;
        if (rule.excludeTags && f.tags.some(t => rule.excludeTags!.includes(t))) return false;
        if (rule.snackableOnly && !f.snackable) return false;
        return true;
    });

    // Score foods by relevance
    const scored = pool.map(f => {
        let score = 0;
        // Prefer items matching the user's objective
        if (f.tags.includes(objective)) score += 3;
        // Prefer items matching the user's sport
        if (f.tags.includes(sportFocus)) score += 2;
        // Prefer items tagged for the slot timing
        if (f.timing.includes(slotId as any)) score += 2;
        // Prefer items matching rule's preferTags
        if (rule.preferTags) {
            const matchCount = f.tags.filter(t => rule.preferTags!.includes(t)).length;
            score += matchCount * 2;
        }
        // Add some daily variation using day-of-year
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const hash = (f.id.charCodeAt(0) * 31 + f.id.charCodeAt(1) * 7 + dayOfYear) % 10;
        score += hash * 0.1; // Tiny variation to rotate items day-to-day

        return { food: f, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const selected = scored.slice(0, rule.count).map(s => s.food);
    selected.forEach(f => usedIds.add(f.id));
    return selected;
}

function getSuperfoods(dayType: DayType): FoodItem[] {
    const profile = DAY_PROFILES[dayType];
    return profile.superfoods
        .map(id => FOOD_DATABASE.find(f => f.id === id))
        .filter(Boolean) as FoodItem[];
}

// ==================== GEMINI WEEKLY PLAN ====================

const NUTRITION_CACHE_KEY = 'nutrition_weekly_plan';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function generateWeeklyPlan(
    profile: UserProfile,
    logs: TrainingLog[],
    blocks: TrainingBlock[]
): Promise<WeeklyAIPlan | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const sportFocus = profile.sport_focus || 'muay_thai';
        const objective = profile.main_objective || 'mass';
        const weight = profile.weight || 70;

        // Resumen de últimos 7 logs
        const recentLogs = logs.slice(0, 7).map(l => {
            const block = blocks.find(b => b.id === l.blockId);
            return `${l.date}: ${block?.title || l.blockId}${l.surfData ? ' (Surf)' : ''}${l.muayThaiData ? ' (Muay Thai)' : ''}`;
        }).join('\n');

        const prompt = `
Eres un nutricionista deportivo especializado en atletas que practican ${sportFocus === 'surf' ? 'Surf' : 'Muay Thai y entrenamiento de fuerza en casa'}.
El usuario pesa ${weight}kg y su objetivo es ${objective === 'mass' ? 'ganar masa muscular' : objective === 'performance' ? 'mejorar rendimiento' : 'perder grasa'}.
${sportFocus === 'muay_thai' ? 'Su rutina combina Muay Thai con entrenamiento de fuerza casero (búlgaras, remo, flexiones). NO practica surf.' : 'Su rutina combina surf con entrenamiento de fuerza para hipertrofia.'}

Historial reciente:
${recentLogs || 'Sin sesiones recientes'}

Genera un plan de comidas para 7 días. NO cuentes calorías. Solo recomienda QUÉ comer en cada momento.
Usa ingredientes accesibles en Perú: pollo, pescado (bonito, jurel), huevos, quinoa, kiwicha, camote, avena, plátano, palta, aceite de sacha inchi, maca negra, camu camu, jarabe de yacón.

Para cada día indica:
- Tipo de día basado en su deporte (${sportFocus === 'surf' ? 'Surf/Fuerza/Descanso' : 'Muay Thai/Fuerza/Descanso'})
- 4 momentos: Pre-entreno, Post-entreno, Snack, Cena
- Un tip breve relacionado EXCLUSIVAMENTE con ${sportFocus === 'surf' ? 'surf y resistencia en el agua' : 'Muay Thai, clinch, potencia de golpeo y recuperación muscular'}. NO menciones surf si el usuario hace Muay Thai.

Responde SOLO con JSON:
{
  "days": [
    {
      "dayName": "Lunes",
      "dayType": "Entrenamiento",
      "meals": [
        { "slot": "Pre-entreno", "suggestion": "Avena con plátano y maca negra" },
        { "slot": "Post-entreno", "suggestion": "Pollo con arroz y palta" },
        { "slot": "Snack", "suggestion": "Yogur griego con semillas de sacha inchi" },
        { "slot": "Cena", "suggestion": "Jurel con quinoa y ensalada" }
      ],
      "tip": "Tip breve"
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);

        return {
            ...parsed,
            generatedAt: Date.now(),
            logCount: logs.length,
            sportFocus,
        };
    } catch (e) {
        console.error('Nutrition AI Error:', e);
        return null;
    }
}

// ==================== HOOK PRINCIPAL ====================

export function useNutrition(
    logs: TrainingLog[],
    blocks: TrainingBlock[],
    profile?: UserProfile
) {
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyAIPlan | null>(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);

    const currentSportFocus = profile?.sport_focus || 'muay_thai';

    // Load cached plan on mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem(NUTRITION_CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached) as WeeklyAIPlan;
                const age = Date.now() - parsed.generatedAt;
                const logsChanged = parsed.logCount !== logs.length;
                const sportChanged = parsed.sportFocus !== currentSportFocus;

                if (age < CACHE_DURATION_MS && !logsChanged && !sportChanged) {
                    setWeeklyPlan(parsed);
                } else {
                    // Cache stale, clear it
                    setWeeklyPlan(null);
                }
            }
        } catch (e) {
            console.error('Error loading nutrition cache:', e);
        }
    }, [logs.length, currentSportFocus]);

    const refreshWeeklyPlan = async () => {
        if (!profile || isLoadingPlan) return;
        setIsLoadingPlan(true);
        const plan = await generateWeeklyPlan(profile, logs, blocks);
        if (plan) {
            setWeeklyPlan(plan);
            localStorage.setItem(NUTRITION_CACHE_KEY, JSON.stringify(plan));
        }
        setIsLoadingPlan(false);
    };

    // Auto-generate plan on first mount if cache is empty or stale
    useEffect(() => {
        if (!profile || weeklyPlan || isLoadingPlan) return;
        if (logs.length < 2) return; // Need some data first

        const cached = localStorage.getItem(NUTRITION_CACHE_KEY);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const age = Date.now() - parsed.generatedAt;
                const logsChanged = parsed.logCount !== logs.length;
                const sportChanged = parsed.sportFocus !== currentSportFocus;
                if (age < CACHE_DURATION_MS && !logsChanged && !sportChanged) {
                    setWeeklyPlan(parsed);
                    return;
                }
            } catch { /* stale or invalid */ }
        }

        refreshWeeklyPlan();
    }, [profile, logs.length, currentSportFocus]);

    // Daily recommendations (pure local logic, no API)
    const todayStr = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }, []);

    const dayType = useMemo(
        () => {
            const todayType = determineDayType(logs, blocks, todayStr);
            if (todayType === 'rest') {
                // Si aún no ha entrenado hoy, usar la predicción
                return guessNextDayType(logs, blocks, profile?.sport_focus);
            }
            return todayType;
        },
        [logs, blocks, todayStr, profile?.sport_focus]
    );

    const dayProfile = DAY_PROFILES[dayType];

    // Extract today's plan from the weekly AI plan (if available)
    const todayPlan = useMemo(() => {
        if (!weeklyPlan?.days) return null;

        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const todayName = dayNames[new Date().getDay()];

        return weeklyPlan.days.find(d =>
            d.dayName.toLowerCase() === todayName.toLowerCase()
        ) || null;
    }, [weeklyPlan]);

    // Daily meals: prefer AI plan for today, fallback to local algorithm
    const dailyMeals: MealRecommendation[] = useMemo(() => {
        const sportFocus = profile?.sport_focus || 'muay_thai';
        const objective = profile?.main_objective || 'mass';
        const usedIds = new Set<string>();

        return MEAL_SLOTS.map(slot => {
            const foods = selectFoodsForSlot(slot.id, dayType, objective, sportFocus, usedIds);

            // If AI plan has a suggestion for this slot, attach it as the tip
            let aiSuggestion: string | undefined;
            if (todayPlan) {
                const slotMapping: Record<string, string[]> = {
                    'pre': ['pre-entreno', 'pre entreno', 'preentreno', 'desayuno'],
                    'post': ['post-entreno', 'post entreno', 'postentreno', 'almuerzo'],
                    'snack': ['snack', 'merienda'],
                    'dinner': ['cena'],
                };
                const keys = slotMapping[slot.id] || [];
                const match = todayPlan.meals.find(m =>
                    keys.some(k => m.slot.toLowerCase().includes(k))
                );
                if (match) aiSuggestion = match.suggestion;
            }

            return { slot, foods, tip: aiSuggestion };
        });
    }, [dayType, profile?.sport_focus, profile?.main_objective, todayPlan]);

    const superfoods = useMemo(() => getSuperfoods(dayType), [dayType]);

    // Pick a "superfood of the day" with daily rotation
    const superfoodOfTheDay = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const allSuperfoods = FOOD_DATABASE.filter(f => f.category === 'superfood');
        return allSuperfoods[dayOfYear % allSuperfoods.length];
    }, []);

    return {
        dayType,
        dayProfile,
        dailyMeals,
        superfoods,
        superfoodOfTheDay,
        weeklyPlan,
        isLoadingPlan,
        refreshWeeklyPlan,
        todayPlan,
    };
}
