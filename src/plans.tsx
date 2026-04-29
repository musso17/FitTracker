import { IconWaves, IconDumbbell, IconActivity, IconFlame, IconHeart } from './constants';
import type { TrainingBlock } from './types';

// --- PLANES POR USUARIO ---
export const ANA_PLAN: TrainingBlock[] = [
    {
        id: 'ana_b1', title: 'Surf + Core Ligero', icon: IconWaves, color: 'cyan',
        note: 'Objetivo: Activar core sin fatigar para rendir en el agua.', hasSurf: true,
        exercises: [
            { id: 'a1', name: 'Plancha frontal', sets: 3, target: '40s', type: 'check', visual: 'core' },
            { id: 'a2', name: 'Plancha lateral', sets: 3, target: '30s', type: 'check', visual: 'core' },
            { id: 'a3', name: 'Dead bug', sets: 3, target: '12', type: 'check', visual: 'core' },
            { id: 'a4', name: 'Bird dog', sets: 3, target: '12', type: 'check', visual: 'core' }
        ]
    },
    {
        id: 'ana_b2', title: 'Glúteos: Fuerza Segura', icon: IconDumbbell, color: 'rose',
        note: 'DÍA IMPORTANTE. No sacrifiques técnica por peso. Cuida la espalda en RDL.', hasSurf: false,
        exercises: [
            { id: 'a5', name: 'Hip thrust pesado', sets: 4, target: '8', type: 'weight', tip: 'Aprieta glúteos arriba 1s.', visual: 'hinge' },
            { id: 'a6', name: 'Goblet squat', sets: 4, target: '8', type: 'weight', tip: 'Pecho arriba, baja controlado.', visual: 'squat' },
            { id: 'a7', name: 'RDL (Peso muerto rumano)', sets: 3, target: '10', type: 'weight', tip: 'Caderas hacia atrás, siente el estiramiento.', visual: 'hinge' },
            { id: 'a8', name: 'Bulgarian split squat', sets: 3, target: '10', type: 'weight', tip: 'Inclina el torso ligeramente adelante.', visual: 'squat' },
            { id: 'a9', name: 'Abducciones', sets: 3, target: '15', type: 'weight', visual: 'core' }
        ]
    },
    {
        id: 'ana_b3', title: 'Espalda, Remada + Core', icon: IconActivity, color: 'teal',
        note: 'Mejora postura y remada. Control, no impulso.', hasSurf: false,
        exercises: [
            { id: 'a10', name: 'Dominadas (asistidas)', sets: 4, target: '6-8', type: 'weight', visual: 'pull' },
            { id: 'a11', name: 'Remo con barra/mancuerna', sets: 4, target: '10', type: 'weight', visual: 'row' },
            { id: 'a12', name: 'Jalón al pecho', sets: 3, target: '10', type: 'weight', visual: 'pull' },
            { id: 'a13', name: 'Face pulls', sets: 3, target: '15', type: 'weight', visual: 'row' },
            { id: 'a14', name: 'Plancha c/', sets: 3, target: '16', type: 'check', visual: 'core' },
            { id: 'a15', name: 'Pallof press', sets: 3, target: '12', type: 'weight', visual: 'core' },
            { id: 'a16', name: 'Dead bug con peso', sets: 3, target: '10', type: 'weight', visual: 'core' },
            { id: 'a17', name: 'Superman hold', sets: 3, target: '40s', type: 'check', visual: 'core' }
        ]
    },
    {
        id: 'ana_b4', title: 'Glúteos: Potencia', icon: IconFlame, color: 'orange',
        note: 'Construye explosividad (clave para ponerte de pie en la tabla).', hasSurf: false,
        exercises: [
            { id: 'a18', name: 'Hip thrust moderado', sets: 4, target: '10', type: 'weight', visual: 'hinge' },
            { id: 'a19', name: 'Step-ups con peso', sets: 3, target: '10', type: 'weight', visual: 'squat' },
            { id: 'a20', name: 'Hip extension', sets: 3, target: '12', type: 'weight', visual: 'hinge' },
            { id: 'a21', name: 'Kettlebell swings', sets: 3, target: '15', type: 'weight', tip: 'El impulso viene de la cadera, no de los brazos.', visual: 'hinge' },
            { id: 'a22', name: 'Kickback (Polea/Máq)', sets: 3, target: '12', type: 'weight', visual: 'hinge' },
            { id: 'a23', name: 'Plancha lateral elevando pierna', sets: 3, target: '30s', type: 'check', visual: 'core' },
            { id: 'a24', name: 'Elevaciones de piernas', sets: 3, target: '12', type: 'check', visual: 'core' },
            { id: 'a25', name: 'Russian twist', sets: 3, target: '20', type: 'weight', visual: 'core' }
        ]
    },
    {
        id: 'ana_b5', title: 'Surf + Movilidad', icon: IconWaves, color: 'cyan',
        note: 'Día de mar. Mantén la movilidad ligera.', hasSurf: true,
        exercises: [
            { id: 'a26', name: 'Movilidad Caderas', sets: 1, target: '5 min', type: 'time', visual: 'core' },
            { id: 'a27', name: 'Movilidad Espalda Torácica', sets: 1, target: '5 min', type: 'time', visual: 'core' },
            { id: 'a28', name: 'Movilidad Hombros', sets: 1, target: '5 min', type: 'time', visual: 'core' }
        ]
    },
    {
        id: 'ana_b6', title: 'Recuperación / Yoga', icon: IconHeart, color: 'purple',
        note: 'Recuperación activa. Tómate tu tiempo para respirar.', hasSurf: false,
        exercises: [
            { id: 'a29', name: 'Sesión Yoga/Estiramientos', sets: 1, target: '30-60m', type: 'time', visual: 'core' }
        ]
    }
];

export const MARCELO_PLAN: TrainingBlock[] = [
    {
        id: 'mar_b1', title: 'Muay Thai: Clase', icon: IconFlame, color: 'orange',
        note: 'Clase guiada. Enfoque en volumen e intensidad constante (1h 20m).', hasSurf: false, hasMuayThai: true,
        exercises: []
    },
    {
        id: 'mar_b2', title: 'Torso A: Masa Total (Pecho+)', icon: IconDumbbell, color: 'rose',
        note: 'Objetivo: Construir masa muscular en todo el torso, con énfasis en el pecho superior.', hasSurf: false,
        exercises: [
            { id: 'm6', name: 'Press de Banca Plano', sets: 4, target: '6-8', type: 'weight', tip: 'Carga pesada. Descanso: 120-180s. Controla la bajada.', visual: 'benchpress' },
            { id: 'm7', name: 'Remo con Barra (45º)', sets: 4, target: '8-10', type: 'weight', tip: 'Carga pesada. Descanso: 120s. Codos a la cadera.', visual: 'row' },
            { id: 'm8', name: 'Press Inclinado (Manc)', sets: 3, target: '8-10', type: 'weight', tip: 'Prioriza pecho superior. Descanso: 90s. Controla el estiramiento.', visual: 'benchpress' },
            { id: 'm9', name: 'Extensión Tríceps Overhead', sets: 3, target: '10-12', type: 'weight', tip: 'Estira la cabeza larga al máximo. Descanso: 90s.', visual: 'push' },
            { id: 'm10', name: 'Curl Bíceps Inclinado', sets: 3, target: '10-12', type: 'weight', tip: 'Máxima tensión en estiramiento. Descanso: 90s.', visual: 'pull' }
        ]
    },
    {
        id: 'mar_b3', title: 'Piernas A: Fuerza y Core', icon: IconActivity, color: 'teal',
        note: 'Objetivo: Desarrollar fuerza y masa en piernas delgadas y fortalecer el núcleo.', hasSurf: false,
        exercises: [
            { id: 'm11', name: 'Sentadilla con Barra', sets: 4, target: '6-8', type: 'weight', tip: 'Carga pesada. Descanso: 180s. Baja lo más profundo posible.', visual: 'squat' },
            { id: 'm12', name: 'Peso Muerto Rumano (RDL)', sets: 4, target: '8-10', type: 'weight', tip: 'Carga pesada. Descanso: 120-180s. Siente el tirón en isquios.', visual: 'hinge' },
            { id: 'm13', name: 'Zancadas Búlgaras', sets: 3, target: '10', type: 'weight', tip: 'Torso inclinado adelante para glúteo. Descanso: 90s.', visual: 'squat' },
            { id: 'm14', name: 'Deadbug (Core)', sets: 3, target: '12', type: 'check', tip: 'Protege lumbar. Fortalece el núcleo. Descanso: 60s.', visual: 'core' }
        ]
    },
    {
        id: 'mar_b4', title: 'Torso B: V-Taper y Postura', icon: IconFlame, color: 'orange',
        note: 'Objetivo: Ensanchar espalda (V-taper) y corregir hombros redondeados.', hasSurf: false,
        exercises: [
            { id: 'm15', name: 'Press Inclinado (Barra)', sets: 4, target: '8-10', type: 'weight', tip: 'Carga moderada. Descanso: 120s. Énfasis pecho superior.', visual: 'benchpress' },
            { id: 'm16', name: 'Dominadas (Wide Grip)', sets: 4, target: 'Fallo (-1)', type: 'check', tip: 'Mejor compuesto para espalda ancha. Descanso: 120-180s.', visual: 'pull' },
            { id: 'm17', name: 'Elevaciones Laterales', sets: 4, target: '12-15', type: 'weight', tip: 'Poco peso, tensión constante. Descanso: 60-90s.', visual: 'push' },
            { id: 'm18', name: 'Face Pull con cuerda', sets: 3, target: '12-15', type: 'weight', tip: 'Corrige hombros redondeados. Descanso: 90s.', visual: 'pull' }
        ]
    },
    {
        id: 'mar_b5', title: 'Piernas B: Daño y Volumen', icon: IconActivity, color: 'cyan',
        note: 'Objetivo: Maximizar crecimiento con ejercicios específicos.', hasSurf: false,
        exercises: [
            { id: 'm19', name: 'Prensa Inclinada', sets: 4, target: '10-12', type: 'weight', tip: 'Carga moderada. Descanso: 120s. Baja profundo.', visual: 'squat' },
            { id: 'm20', name: 'Curl Femoral Sentado', sets: 4, target: '10-12', type: 'weight', tip: 'Énfasis en el estiramiento. Descanso: 90s.', visual: 'hinge' },
            { id: 'm21', name: 'Extensión Cuádriceps', sets: 3, target: '12-15', type: 'weight', tip: 'Énfasis en aguantar fase baja. Descanso: 90s.', visual: 'squat' },
            { id: 'm22', name: 'Plancha Pesada', sets: 3, target: '45-60s', type: 'weight', tip: 'Añade disco en la espalda. Descanso: 60s.', visual: 'core' }
        ]
    },
    {
        id: 'mar_b6', title: 'Recuperación Activa', icon: IconHeart, color: 'purple',
        note: 'Objetivo: Reset de Cortisol y recuperación. Sueño de 8h obligatorio.', hasSurf: false,
        exercises: [
            { id: 'm23', name: 'Caminata Ligera (Z2)', sets: 1, target: '45-60m', type: 'time', tip: 'No correr. Baja el cortisol.', visual: 'core' }
        ]
    }
];

// Mapeo por user_id — se configura una sola vez en el perfil de Supabase Auth.
// En Supabase Dashboard > Auth > Users, agregar user_metadata: { role: 'ana' } o { role: 'marcelo' }
export const PLAN_BY_ROLE: Record<string, { plan: any[], name: string }> = {
    'ana': { plan: ANA_PLAN, name: 'Ana' },
    'marcelo': { plan: MARCELO_PLAN, name: 'Marce' },
};

export const DEFAULT_PLAN = { plan: ANA_PLAN, name: 'Invitado' };

// Función para resolver el plan del usuario actual desde su sesión de Supabase
export function resolveUserPlan(session: any): { plan: any[], name: string } {
    if (!session?.user) return DEFAULT_PLAN;
    
    // Prioridad 1: user_metadata.role (configurado en Supabase Dashboard)
    const role = session.user.user_metadata?.role;
    if (role && PLAN_BY_ROLE[role]) return PLAN_BY_ROLE[role];
    
    // Prioridad 2: Fallback por email (temporal, para no romper nada)
    const email = session.user.email?.toLowerCase() || '';
    if (email.includes('anacecilia')) return PLAN_BY_ROLE['ana'];
    if (email.includes('mmusso')) return PLAN_BY_ROLE['marcelo'];
    
    return DEFAULT_PLAN;
}
