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
        id: 'mar_b1', title: 'Muay Thai (Técnica y Cardio)', icon: IconFlame, color: 'orange',
        note: 'Lunes, Miércoles y Viernes. Enfoque en técnica y resistencia. Menos es más.', hasSurf: false, hasMuayThai: true,
        exercises: []
    },
    {
        id: 'mar_b2', title: 'Día 1: Empuje y Cuádriceps', icon: IconDumbbell, color: 'rose',
        note: 'Maximizando el déficit. Carga unilateral para proteger la estabilidad en pateos (Middle Kicks).', hasSurf: false,
        exercises: [
            { id: 'm1', name: 'Sentadilla Búlgara (Mancuernas)', sets: 4, target: 'Fallo/RIR 1', type: 'weight', tip: 'Baja en 3s, pausa 1s abajo. Aísla la carga en un solo cuádriceps. Brutal para equilibrio en un solo pie.', visual: 'squat' },
            { id: 'm2', name: 'Flexiones Arqueras/Déficit', sets: 4, target: 'Fallo', type: 'check', tip: 'Déficit (manos en discos) o Arqueras (brazo estirado). Estira fibras al máximo para hipertrofia sin press pesado.', visual: 'benchpress' },
            { id: 'm3', name: 'Press Militar de Pie (Barra)', sets: 4, target: '12-15', type: 'weight', tip: 'Sin impulso de rodillas. Glúteos/abdomen apretados. Tu seguro de vida para no bajar la guardia en el 3er round.', visual: 'push' },
            { id: 'm4', name: 'Extensiones Tríceps Copa', sets: 3, target: '15', type: 'weight', tip: 'Codo sobre la cabeza para estirar la cabeza larga. El tríceps es el pistón que da el "snap" a tus Jabs y Cross.', visual: 'push' }
        ]
    },
    {
        id: 'mar_b3', title: 'Día 2: Jalón y Cadena Posterior', icon: IconActivity, color: 'teal',
        note: 'Estabilidad para pateos y potencia rotacional. Clinch y tracción pura.', hasSurf: false,
        exercises: [
            { id: 'm5', name: 'RDL a UNA pierna (Manc)', sets: 4, target: '12/pierna', type: 'weight', tip: 'Espalda recta, pierna libre como balancín. Hazlo descalzo para ganar equilibrio y potencia rotacional en el tatami.', visual: 'hinge' },
            { id: 'm6', name: 'Remo Pendlay Unilateral', sets: 4, target: '10-12/lado', type: 'weight', tip: 'Toca suelo en cada rep. Sin inercia. Genera fuerza desde cero. Crítico para la fuerza de tracción en el Clinch.', visual: 'row' },
            { id: 'm7', name: 'Zancadas Pliométricas (Manc)', sets: 3, target: '20 saltos', type: 'weight', tip: 'Fibras Tipo II. Salta explosivo y cambia en el aire. Motor para rodillazos con salto y salidas rápidas.', visual: 'squat' },
            { id: 'm8', name: 'Curl Bíceps Estricto (Barra)', sets: 3, target: '15', type: 'weight', tip: 'Talones/glúteos pegados a la pared. Cero balanceo. Aislamiento al 100% para destrozar el bíceps con poco peso.', visual: 'pull' }
        ]
    },
    {
        id: 'mar_b4', title: 'Descanso Total / Activo Ligero', icon: IconHeart, color: 'purple',
        note: 'Sábado y Domingo. Reset de cortisol y recuperación articular.', hasSurf: false,
        exercises: [
            { id: 'm9', name: 'Caminata Ligera / Descanso', sets: 1, target: 'Libre', type: 'time', tip: 'Recuperación de SNC. Menos es más.', visual: 'core' }
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
