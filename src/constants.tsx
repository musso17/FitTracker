// --- ICON COMPONENTS (FontAwesome wrappers) ---
export const IconDumbbell = ({ size = 20, className = "" }) => <i className={`fas fa-dumbbell ${className}`} style={{ fontSize: size }}></i>;
export const IconWaves = ({ size = 20, className = "" }) => <i className={`fas fa-water ${className}`} style={{ fontSize: size }}></i>;
export const IconActivity = ({ size = 20, className = "" }) => <i className={`fas fa-chart-line ${className}`} style={{ fontSize: size }}></i>;
export const IconFlame = ({ size = 20, className = "" }) => <i className={`fas fa-fire ${className}`} style={{ fontSize: size }}></i>;
export const IconHeart = ({ size = 20, className = "" }) => <i className={`fas fa-heart ${className}`} style={{ fontSize: size }}></i>;
export const IconCheckCircle = ({ size = 20, className = "" }) => <i className={`fas fa-check-circle ${className}`} style={{ fontSize: size }}></i>;
export const IconX = ({ size = 20, className = "" }) => <i className={`fas fa-times ${className}`} style={{ fontSize: size }}></i>;
export const IconChevronRight = ({ size = 20, className = "" }) => <i className={`fas fa-chevron-right ${className}`} style={{ fontSize: size }}></i>;
export const IconTarget = ({ size = 20, className = "" }) => <i className={`fas fa-bullseye ${className}`} style={{ fontSize: size }}></i>;
export const IconListTodo = ({ size = 20, className = "" }) => <i className={`fas fa-list-check ${className}`} style={{ fontSize: size }}></i>;
export const IconHome = ({ size = 20, className = "" }) => <i className={`fas fa-home ${className}`} style={{ fontSize: size }}></i>;
export const IconLogout = ({ size = 20, className = "" }) => <i className={`fas fa-sign-out-alt ${className}`} style={{ fontSize: size }}></i>;
export const IconTrash = ({ size = 20, className = "" }) => <i className={`fas fa-trash-alt ${className}`} style={{ fontSize: size }}></i>;
export const IconEdit = ({ size = 20, className = "" }) => <i className={`fas fa-edit ${className}`} style={{ fontSize: size }}></i>;
export const IconCalendar = ({ size = 20, className = "" }) => <i className={`fas fa-calendar-alt ${className}`} style={{ fontSize: size }}></i>;
export const IconMoreVertical = ({ size = 20, className = "" }) => <i className={`fas fa-ellipsis-v ${className}`} style={{ fontSize: size }}></i>;
export const IconSync = ({ size = 20, className = "" }) => <i className={`fas fa-sync-alt ${className}`} style={{ fontSize: size }}></i>;
export const IconUser = ({ size = 20, className = "" }) => <i className={`fas fa-user-cog ${className}`} style={{ fontSize: size }}></i>;
export const IconPlus = ({ size = 20, className = "" }) => <i className={`fas fa-plus ${className}`} style={{ fontSize: size }}></i>;
export const IconMinus = ({ size = 20, className = "" }) => <i className={`fas fa-minus ${className}`} style={{ fontSize: size }}></i>;
export const IconArrowUp = ({ size = 20, className = "" }) => <i className={`fas fa-arrow-up ${className}`} style={{ fontSize: size }}></i>;
export const IconArrowDown = ({ size = 20, className = "" }) => <i className={`fas fa-arrow-down ${className}`} style={{ fontSize: size }}></i>;
export const IconBell = ({ size = 20, className = "" }) => <i className={`fas fa-bell ${className}`} style={{ fontSize: size }}></i>;
export const IconTrophy = ({ size = 20, className = "" }) => <i className={`fas fa-trophy ${className}`} style={{ fontSize: size }}></i>;
export const IconSparkles = ({ size = 20, className = "" }) => <i className={`fas fa-sparkles ${className}`} style={{ fontSize: size }}></i>;
export const IconMedal = ({ size = 20, className = "" }) => <i className={`fas fa-medal ${className}`} style={{ fontSize: size }}></i>;
export const IconCrown = ({ size = 20, className = "" }) => <i className={`fas fa-crown ${className}`} style={{ fontSize: size }}></i>;
export const IconZap = ({ size = 20, className = "" }) => <i className={`fas fa-bolt ${className}`} style={{ fontSize: size }}></i>;
export const IconShield = ({ size = 20, className = "" }) => <i className={`fas fa-shield-alt ${className}`} style={{ fontSize: size }}></i>;
export const IconWeight = ({ size = 20, className = "" }) => <i className={`fas fa-weight-hanging ${className}`} style={{ fontSize: size }}></i>;
export const IconAward = ({ size = 20, className = "" }) => <i className={`fas fa-award ${className}`} style={{ fontSize: size }}></i>;
export const IconTrendingUp = ({ size = 20, className = "" }) => <i className={`fas fa-trending-up ${className}`} style={{ fontSize: size }}></i>;
export const IconInfoCircle = ({ size = 20, className = "" }) => <i className={`fas fa-info-circle ${className}`} style={{ fontSize: size }}></i>;
export const IconSeedling = ({ size = 20, className = "" }) => <i className={`fas fa-seedling ${className}`} style={{ fontSize: size }}></i>;

export const ACHIEVEMENT_CATEGORIES = {
    strength: { label: 'Fuerza', color: 'slate', icon: IconWeight, bg: 'bg-slate-900', accent: 'text-slate-400' },
    consistency: { label: 'Hábito', color: 'indigo', icon: IconTrendingUp, bg: 'bg-indigo-600', accent: 'text-indigo-200' },
    striking: { label: 'Striking', color: 'orange', icon: IconZap, bg: 'bg-orange-500', accent: 'text-orange-200' },
    mastery: { label: 'Maestría', color: 'amber', icon: IconCrown, bg: 'bg-amber-500', accent: 'text-amber-200' }
};

// --- ICON MAP (for serialization/deserialization) ---
export const ICON_MAP: Record<string, any> = {
    dumbbell: IconDumbbell,
    waves: IconWaves,
    activity: IconActivity,
    flame: IconFlame,
    heart: IconHeart,
    target: IconTarget,
    TrendingUp: IconTrendingUp,
    Zap: IconZap,
    Crown: IconCrown,
    Weight: IconWeight,
    Medal: IconMedal,
    Shield: IconShield,
    Award: IconAward,
};

// --- COLOR OPTIONS ---
export const COLOR_OPTIONS = [
    { id: 'cyan', label: 'Cyan', classes: 'bg-cyan-100 text-cyan-600', ring: 'ring-cyan-400' },
    { id: 'rose', label: 'Rosa', classes: 'bg-rose-100 text-rose-600', ring: 'ring-rose-400' },
    { id: 'teal', label: 'Teal', classes: 'bg-teal-100 text-teal-600', ring: 'ring-teal-400' },
    { id: 'orange', label: 'Naranja', classes: 'bg-orange-100 text-orange-600', ring: 'ring-orange-400' },
    { id: 'purple', label: 'Púrpura', classes: 'bg-purple-100 text-purple-600', ring: 'ring-purple-400' },
    { id: 'slate', label: 'Gris', classes: 'bg-slate-100 text-slate-600', ring: 'ring-slate-400' },
];

export const VISUAL_OPTIONS = ['squat', 'hinge', 'benchpress', 'pull', 'row', 'core'];

// --- ACTIVITY TYPES ---
export const ACTIVITY_TYPES = [
    { id: 'surf', emoji: '🏄', label: 'Surf', color: 'cyan', defaultDuration: 60, intensityOptions: [
        { id: 'struggle', label: '🚣‍♀️ Pura remada / Difícil', kcalPerMin: 8 },
        { id: 'good', label: '🌊 Agarré un par, bien', kcalPerMin: 6 },
        { id: 'awesome', label: '🤙 ¡Increíble!', kcalPerMin: 7 },
    ]},
    { id: 'muay_thai', emoji: '🥊', label: 'Muay Thai', color: 'orange', defaultDuration: 80, intensityOptions: [
        { id: 'ligera', label: '🍃 Ligera', kcalPerMin: 8 },
        { id: 'media', label: '⚡ Mediana exigencia', kcalPerMin: 12 },
        { id: 'exigente', label: '🔥 Muy exigente', kcalPerMin: 16 },
    ]},
    { id: 'cycling', emoji: '🚴', label: 'Cycling', color: 'teal', defaultDuration: 45, intensityOptions: [
        { id: 'recuperacion', label: '🌿 Recuperación / Zona 1-2', kcalPerMin: 6 },
        { id: 'tempo', label: '⚡ Tempo / Zona 3', kcalPerMin: 10 },
        { id: 'hiit', label: '🔥 HIIT / Intervalos', kcalPerMin: 14 },
    ]},
    { id: 'yoga', emoji: '🧘', label: 'Yoga', color: 'purple', defaultDuration: 60, intensityOptions: [
        { id: 'restaurativa', label: '🌙 Restaurativa / Yin', kcalPerMin: 3 },
        { id: 'flow', label: '💨 Vinyasa / Flow', kcalPerMin: 5 },
        { id: 'power', label: '💪 Power Yoga', kcalPerMin: 7 },
    ]},
    { id: 'barre', emoji: '🩰', label: 'Barre', color: 'rose', defaultDuration: 50, intensityOptions: [
        { id: 'clasica', label: '🎶 Clásica / Tonificación', kcalPerMin: 5 },
        { id: 'cardio', label: '⚡ Cardio Barre', kcalPerMin: 7 },
        { id: 'intenso', label: '🔥 Barre Intenso / Sculpt', kcalPerMin: 9 },
    ]},
    { id: 'running', emoji: '🏃', label: 'Running', color: 'slate', defaultDuration: 30, intensityOptions: [
        { id: 'easy', label: '🌿 Easy Run / Z2', kcalPerMin: 9 },
        { id: 'tempo', label: '⚡ Tempo / Z3-4', kcalPerMin: 12 },
        { id: 'intervals', label: '🔥 Sprints / Intervalos', kcalPerMin: 16 },
    ]},
    { id: 'jiu_jitsu', emoji: '🥋', label: 'Jiu Jitsu', color: 'slate', defaultDuration: 90, intensityOptions: [
        { id: 'tecnica', label: '🧠 Técnica / Drills', kcalPerMin: 7 },
        { id: 'rolling', label: '⚡ Rolling moderado', kcalPerMin: 11 },
        { id: 'competicion', label: '🔥 Sparring competitivo', kcalPerMin: 15 },
    ]},
];

// --- UTILITY FUNCTIONS ---
export const isWithinCurrentWeek = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0,0,0,0);
    return date >= monday;
};

export const isWithinPreviousWeek = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0,0,0,0);
    
    const prevMonday = new Date(monday);
    prevMonday.setDate(monday.getDate() - 7);
    
    return date >= prevMonday && date < monday;
};

export const getColorClasses = (color: string): string => {
    switch (color) {
        case 'cyan': return 'bg-cyan-100 text-cyan-600';
        case 'rose': return 'bg-rose-100 text-rose-600';
        case 'teal': return 'bg-teal-100 text-teal-600';
        case 'orange': return 'bg-orange-100 text-orange-600';
        case 'purple': return 'bg-purple-100 text-purple-600';
        case 'indigo': return 'bg-indigo-100 text-indigo-600';
        case 'amber': return 'bg-amber-100 text-amber-600';
        case 'slate': return 'bg-slate-100 text-slate-600';
        default: return 'bg-slate-100 text-slate-600';
    }
};

export const getSoftColorClasses = (color: string): string => {
    switch (color) {
        case 'cyan': return 'bg-cyan-50 text-cyan-500';
        case 'rose': return 'bg-rose-50 text-rose-500';
        case 'teal': return 'bg-teal-50 text-teal-500';
        case 'orange': return 'bg-orange-50 text-orange-500';
        case 'purple': return 'bg-purple-50 text-purple-500';
        case 'indigo': return 'bg-indigo-50 text-indigo-500';
        case 'amber': return 'bg-amber-50 text-amber-500';
        case 'slate': return 'bg-slate-50 text-slate-500';
        default: return 'bg-slate-50 text-slate-500';
    }
};

export const calcTonelaje = (gymProgress: any): number => {
    let total = 0;
    Object.values(gymProgress).forEach((sets: any) => {
        if (Array.isArray(sets)) {
            sets.forEach((s: any) => {
                if (s.completed) total += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
            });
        }
    });
    return total;
};

export const formatTonelaje = (kg: number): string => {
    return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg} kg`;
};

export const hapticFeedback = (type: 'light' | 'success' | 'pr' | 'timer_done' = 'light') => {
    if (!('vibrate' in navigator)) return;
    switch (type) {
        case 'light': navigator.vibrate(50); break;
        case 'success': navigator.vibrate(70); break;
        case 'pr': navigator.vibrate([100, 50, 100]); break;
        case 'timer_done': navigator.vibrate([200, 100, 200, 100, 400]); break;
    }
};

export const calcStamina = (params: {
    hasSurf?: boolean, surfForm?: any,
    hasMuayThai?: boolean, muayThaiForm?: any,
    activityType?: string, activityForm?: any,
    gymProgress?: any,
}): { score: number, label: string, gymStamina: number, completedSets: number } => {
    let score = 0;
    let label = '';

    if (params.hasSurf && params.surfForm) {
        const fm: any = { struggle: 1.3, good: 1.0, awesome: 1.15 };
        score += Math.round(params.surfForm.duration * (fm[params.surfForm.feeling] || 1));
        label = `${params.surfForm.duration}m × ${params.surfForm.feeling === 'struggle' ? '1.3x' : params.surfForm.feeling === 'awesome' ? '1.15x' : '1.0x'}`;
    }
    if (params.hasMuayThai && params.muayThaiForm) {
        const mm: any = { ligera: 0.8, media: 1.0, exigente: 1.4 };
        score += Math.round(params.muayThaiForm.duration * (mm[params.muayThaiForm.intensity] || 1));
        label = `${params.muayThaiForm.duration}m × ${params.muayThaiForm.intensity === 'exigente' ? '1.4x' : params.muayThaiForm.intensity === 'ligera' ? '0.8x' : '1.0x'}`;
    }
    if (params.activityType && !params.hasSurf && !params.hasMuayThai && params.activityForm) {
        const actDef = ACTIVITY_TYPES.find(a => a.id === params.activityType);
        const selOpt = actDef?.intensityOptions.find(o => o.id === params.activityForm.intensity);
        if (actDef && selOpt) {
            const mult = selOpt.kcalPerMin / 10;
            score += Math.round(params.activityForm.duration * mult);
            label = `${params.activityForm.duration}m × ${mult.toFixed(1)}x`;
        }
    }

    const completedSets = params.gymProgress ? Object.values(params.gymProgress).flat().filter((s: any) => s?.completed).length : 0;
    const gymStamina = completedSets * 5;
    score += gymStamina;

    return { score, label, gymStamina, completedSets };
};

export const getBlockMoodClasses = (block: any): { card: string, button: string, accent: string, text: string, border: string } => {
    if (!block) return { card: 'bg-white border-slate-900', button: 'bg-slate-900', accent: 'bg-slate-900', text: 'text-slate-900', border: 'border-slate-900' };
    
    const title = block.title.toLowerCase();
    const isRecovery = title.includes('recuperación') || title.includes('yoga') || title.includes('movilidad');
    const isMT = title.includes('muay thai');
    const isSurf = title.includes('surf') && !isRecovery;

    if (isRecovery) {
        return {
            card: 'bg-gradient-to-br from-purple-50 via-emerald-50 to-indigo-50 shadow-purple-100/50',
            button: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200',
            accent: 'bg-purple-600',
            text: 'text-purple-900',
            border: 'border-purple-200'
        };
    }

    if (isMT) {
        return {
            card: 'bg-gradient-to-br from-orange-50 via-rose-50 to-orange-50 shadow-orange-100/50',
            button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-200',
            accent: 'bg-orange-600',
            text: 'text-orange-900',
            border: 'border-orange-200'
        };
    }

    if (isSurf) {
        return {
            card: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 shadow-cyan-100/50',
            button: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200',
            accent: 'bg-cyan-600',
            text: 'text-cyan-900',
            border: 'border-cyan-200'
        };
    }
    
    return {
        card: 'bg-white shadow-slate-200',
        button: 'bg-slate-900 hover:bg-slate-800 shadow-slate-200',
        accent: 'bg-slate-900',
        text: 'text-slate-900',
        border: 'border-slate-900'
    };
};
