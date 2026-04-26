// Type definitions for the application

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    target: string;
    type: 'weight' | 'check';
    tip?: string;
    visual: string;
    fromBlock?: string; // Para el selector
}

export interface TrainingBlock {
    id: string;
    title: string;
    icon: any;
    iconId?: string;
    color: string;
    note: string;
    hasSurf: boolean;
    hasMuayThai?: boolean;
    exercises: Exercise[];
}

export interface SetEntry {
    weight: string;
    reps: string;
    completed: boolean;
    isPR?: boolean;
}

export interface SessionExercise extends Exercise {
    sessionSets: SetEntry[];
}

export interface TrainingLog {
    id: number;
    date: string;
    blockId: string;
    userId: string;
    gymData?: {
        exercises: any[];
        progress: any;
        skipped?: any;
    };
    surfData?: any;
    muayThaiData?: any;
    activityData?: any;
}

export interface UserProfile {
    height: number;
    weight: number;
    strength_goals: Record<string, number>;
    notif_enabled: boolean;
    notif_time: string;
    notif_settings: {
        achievements: boolean;
        streak: boolean;
        summary: boolean;
        coach: boolean;
        hydration: boolean;
    };
}

export interface NotificationSettings {
    enabled: boolean;
    hydration: boolean;
    workout: boolean;
    daily: boolean;
    interval: number;
}
