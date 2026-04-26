import { useState, useMemo, useEffect } from 'react';
import { resolveUserPlan } from '../plans';
import { ICON_MAP, IconDumbbell } from '../constants';

export const usePlan = (userSession: any) => {
    const [planBlocksOverride, setPlanBlocksOverride] = useState<Record<string, any[]> | null>(null);

    const currentUserPlan = useMemo(() => resolveUserPlan(userSession), [userSession]);
    const currentUserName = currentUserPlan.name;
    const userId = userSession?.user?.id || 'guest';
    const userKey = (currentUserName === 'Ana' || currentUserName === 'Invitado') ? 'ana' : 'marce';

    const storageKey = (key: string) => `anaapp_${userId}_${key}`;

    useEffect(() => {
        if (userId === 'guest') return;
        try {
            const savedOverrides = localStorage.getItem(storageKey('plan_overrides'));
            if (savedOverrides) setPlanBlocksOverride(JSON.parse(savedOverrides));
        } catch (e) { console.error('Error loading overrides:', e); }
    }, [userId]);

    useEffect(() => {
        if (userId === 'guest' || !planBlocksOverride) return;
        localStorage.setItem(storageKey('plan_overrides'), JSON.stringify(planBlocksOverride));
    }, [planBlocksOverride, userId]);

    const PLAN_BLOCKS = useMemo(() => {
        if (planBlocksOverride && planBlocksOverride[userKey]) {
            return planBlocksOverride[userKey].map((b: any) => ({
                ...b,
                icon: ICON_MAP[b.iconId] || IconDumbbell
            }));
        }
        return currentUserPlan.plan;
    }, [planBlocksOverride, userKey, currentUserPlan.plan]);

    const savePlanBlocks = (blocks: any[]) => {
        const serializable = blocks.map(b => {
            const iconId = Object.entries(ICON_MAP).find(([_, v]) => v === b.icon)?.[0] || b.iconId || 'dumbbell';
            const { icon, ...rest } = b;
            return { ...rest, iconId };
        });
        setPlanBlocksOverride(prev => ({ ...prev, [userKey]: serializable }));
    };

    return { 
        PLAN_BLOCKS, 
        currentUserName, 
        userKey, 
        savePlanBlocks, 
        planBlocksOverride, 
        setPlanBlocksOverride,
        storageKey
    };
};
