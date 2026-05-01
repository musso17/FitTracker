import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../utils/supabase';
import type { TrainingLog } from '../types';

// Inicializar el cliente de Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export interface CoachInsight {
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
    icon: string;
}

export interface AIAnalysisResult {
    insights: CoachInsight[];
    summary: string;
    muscleFatigue: Record<string, number>;
}

export async function generateAIAnalysis(logs: TrainingLog[], profile: any): Promise<AIAnalysisResult | null> {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.warn("Gemini API key is not set.");
        return null;
    }

    try {
        // 1. Obtener catálogo de ejercicios de Supabase
        const { data: exercisesData, error } = await supabase
            .from('exercises')
            .select('id, name_es, primary_muscle, movement_pattern, technical_tip_es')
            .limit(100); // Límite para no exceder el contexto tan rápido, aunque Gemini 1.5 soporta mucho contexto
            
        if (error) {
            console.error("Error fetching exercises for AI:", error);
            return null;
        }

        // 2. Preparar el contexto de los logs
        // Solo enviamos las últimas 10 sesiones para mantener el prompt enfocado
        const recentLogs = [...logs]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map(log => {
                let sessionSummary = '';
                if (log.gymData && log.gymData.progress) {
                    sessionSummary = Object.entries(log.gymData.progress).map(([exId, sets]: [string, any]) => {
                        const sessionEx = log.gymData?.exercises?.find((e: any) => e.id === exId);
                        const exName = sessionEx?.name || sessionEx?.name_es || exercisesData?.find(e => e.id === exId)?.name_es || exId;
                        const validSets = sets.filter((s: any) => s.completed);
                        if (validSets.length === 0) return '';
                        const maxWeight = Math.max(...validSets.map((s: any) => parseFloat(s.weight) || 0));
                        const totalReps = validSets.reduce((sum: number, s: any) => sum + (parseInt(s.reps) || 0), 0);
                        return `${exName}: ${validSets.length} sets (Max: ${maxWeight}kg, Reps: ${totalReps})`;
                    }).filter(Boolean).join(' | ');
                }
                return `Fecha: ${log.date} - Ejercicios: ${sessionSummary}`;
            })
            .join('\n');

        const catalogSummary = exercisesData?.map(ex => 
            `- ${ex.name_es} (Patrón: ${ex.movement_pattern}, Músculo: ${ex.primary_muscle}): ${ex.technical_tip_es}`
        ).join('\n') || '';

        // 3. Determinar Filosofía de Entrenamiento
        const sportFocus = profile?.sport_focus || (profile?.id && profile.id.includes('ana') ? 'surf' : 'muay_thai');
        const objective = profile?.main_objective || 'mass';
        
        const philosophies = {
            muay_thai: `
                Específicamente, entiendes la filosofía de entrenamiento de Marcelo (Home Strength + Muay Thai):
                - Sentadilla Búlgara: Maximizar déficit y tiempo bajo tensión para estabilidad en un solo pie (pateos).
                - Flexiones Arqueras/Déficit: Usar profundidad extra para reemplazar press de banca pesado.
                - Remo Pendlay: Fuerza concéntrica pura desde el suelo para potencia en el Clinch.
                - Extensiones Overhead: Estirar la cabeza larga del tríceps para el "snap" en golpes rectos.
                - Pliometría: Transferencia elástica para rodillazos y salidas rápidas.
            `,
            surf: `
                Específicamente, entiendes la biomecánica avanzada de Ana (Surf + Hipertrofia):
                1. El Remado: Requiere extensión torácica constante (erectores, cuello) y tracción potente (dorsal ancho, deltoides anterior/medio, tríceps). La fatiga lumbar es el enemigo.
                2. El Take-Off: Transición explosiva (push-up) seguida de flexión profunda de cadera (core y psoas) para llevar los pies bajo el centro de gravedad.
                3. Riding: Trabajo excéntrico e isométrico masivo de cuádriceps, isquios y glúteos. Propiocepción en tobillos.
                - Enfoque actual: Ganar masa muscular manteniendo la neuromecánica y prevención. Memoria muscular del Pop-Up.
            `
        };

        const currentPhilosophy = sportFocus === 'surf' ? philosophies.surf : philosophies.muay_thai;

        // 3. Crear el prompt
        const prompt = `
Eres un entrenador personal de élite y experto en biomecánica. 
${currentPhilosophy}

Analiza el historial reciente de entrenamiento y proporciona insights accionables.

Perfil del usuario:
- Peso: ${profile?.weight || 'N/A'} kg
- Objetivo: ${objective === 'mass' ? 'Ganar masa muscular' : objective === 'performance' ? 'Mejorar rendimiento' : 'Pérdida de grasa'}

Historial reciente (últimas 10 sesiones):
${recentLogs || 'Sin datos recientes'}

Catálogo de ejercicios disponibles:
${catalogSummary}

Instrucciones:
1. Analiza el progreso o estancamiento.
2. Da 2-3 recomendaciones directas y concisas alineadas con su filosofía (${sportFocus}). 
3. Si el objetivo es Surf, prioriza la resistencia de espalda/hombros para remar y la explosividad del pop-up.
4. Evalúa la fatiga muscular (0-4) para: "push", "pull", "legs", "core".
5. El tono debe ser directo, profesional y motivador.

Responde ÚNICAMENTE con un JSON con el formato:
{
  "summary": "Resumen corto (max 2 oraciones).",
  "muscleFatigue": { "push": 0, "pull": 0, "legs": 0, "core": 0 },
  "insights": [
    {
      "type": "success" | "warning" | "info",
      "title": "Título corto",
      "message": "Mensaje detallado.",
      "icon": "Emoji"
    }
  ]
}
        `;

        // 4. Llamar a Gemini
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        // Limpiar el response si viene con bloques de código markdown
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsedData = JSON.parse(cleanedText) as AIAnalysisResult;
        return parsedData;
        
    } catch (e) {
        console.error("AI Analysis Error:", e);
        return null;
    }
}

export interface RoutineAuditRecommendation {
    action: 'keep' | 'add' | 'remove' | 'swap';
    target: string;
    reason: string;
    blockId?: string;
    targetExerciseId?: string;
    newExerciseId?: string;
    newExerciseName?: string;
    recommendedSets?: number;
    recommendedReps?: string;
}

export interface RoutineAuditResult {
    verdict: string;
    balanceScore: number;
    recommendations: RoutineAuditRecommendation[];
}

export async function auditRoutine(planBlocks: any[], logs: TrainingLog[], profile: any): Promise<RoutineAuditResult | null> {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.warn("Gemini API key is not set.");
        return null;
    }

    try {
        const { data: exercisesData } = await supabase
            .from('exercises')
            .select('id, name_es, primary_muscle, movement_pattern, equipment')
            .limit(100);

        const routineSummary = planBlocks.map(b => {
            const exs = b.exercises.map((e: any) => {
                const dbEx = exercisesData?.find(d => d.id === e.id);
                return `- [ex_id: ${e.id}] ${e.name} (${e.sets}x${e.target}) [${dbEx?.primary_muscle || 'N/A'}]`;
            }).join('\n');
            return `Bloque: ${b.title} [block_id: ${b.id}]\n${exs}`;
        }).join('\n\n');

        const catalogSummary = exercisesData?.map(ex => 
            `- [cat_id: ${ex.id}] ${ex.name_es} (${ex.primary_muscle})`
        ).join('\n') || '';

        const recentLogs = [...logs]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map(log => `Fecha: ${log.date} - Bloque: ${planBlocks.find(b => b.id === log.blockId)?.title || log.blockId}`)
            .join('\n');

        const prompt = `
Eres un analista biomecánico experto. Evalúa la siguiente rutina de entrenamiento y sugiere mejoras basado en el catálogo disponible.

Perfil del usuario:
- Peso: ${profile?.weight || 'N/A'}kg
- Objetivo Principal: ${profile?.audit_preferences?.objective?.join(', ') || 'Desconocido'}
- Sensación Actual: ${profile?.audit_preferences?.feelings?.join(', ') || 'Desconocido'}
- Preferencia de Equipamiento: ${profile?.audit_preferences?.equipment?.join(', ') || 'Desconocido'}

Historial de entrenamiento reciente:
${recentLogs || 'Sin datos recientes'}

Rutina Actual:
${routineSummary || 'No hay rutina configurada'}

Catálogo Disponible (Extracto):
${catalogSummary}

Instrucciones:
1. Analiza el balance muscular general (ej. hay suficiente empuje vs tracción? ¿Faltan piernas?).
2. ADAPTA tus recomendaciones basándote ESTRICTAMENTE en las preferencias del usuario (objetivo, sensación y equipamiento). Justifica tus cambios haciendo referencia a cómo se siente o qué equipo tiene.
3. Recomienda si debe mantener, agregar, quitar o cambiar ejercicios específicos del catálogo disponible.
4. Responde ÚNICAMENTE con un JSON con el formato:
{
  "verdict": "Veredicto general de la rutina alineado con sus preferencias (1-2 oraciones).",
  "balanceScore": 85,
  "recommendations": [
    {
      "action": "keep" | "add" | "remove" | "swap",
      "blockId": "id del bloque afectado (OBLIGATORIO para add/remove/swap)",
      "targetExerciseId": "ex_id del ejercicio a modificar/eliminar (OBLIGATORIO para remove/swap)",
      "newExerciseId": "cat_id del nuevo ejercicio del catálogo (OBLIGATORIO para add/swap)",
      "newExerciseName": "nombre exacto del nuevo ejercicio del catálogo (OBLIGATORIO para add/swap)",
      "recommendedSets": 3, // OBLIGATORIO para add/swap (ej. 3, 4)
      "recommendedReps": "10 reps", // OBLIGATORIO para add/swap (ej. "8-12 reps", "al fallo")
      "target": "Título corto de la acción",
      "reason": "Por qué lo recomiendas basado en su objetivo/sensación/equipo"
    }
  ]
}
        `;

        const result = await model.generateContent(prompt);
        const cleanedText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText) as RoutineAuditResult;
    } catch (e) {
        console.error("Audit Error:", e);
        return null;
    }
}
