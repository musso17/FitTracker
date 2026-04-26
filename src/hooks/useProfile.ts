import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { UserProfile } from '../types';

export const useProfile = (userSession: any) => {
    const [profile, setProfile] = useState<UserProfile>({ 
        id: '',
        height: 180, weight: 82, strength_goals: {}, 
        notif_enabled: false, notif_time: '07:00',
        notif_settings: { achievements: true, streak: true, summary: true, coach: true, hydration: true }
    });

    useEffect(() => {
        async function fetchProfile() {
            if (!userSession) return;
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, height, weight, strength_goals, notif_enabled, notif_time, notif_settings')
                    .eq('id', userSession.user.id)
                    .single();
                if (data) {
                    setProfile({
                        id: data.id,
                        height: data.height,
                        weight: data.weight,
                        strength_goals: data.strength_goals || {},
                        notif_enabled: !!data.notif_enabled,
                        notif_time: data.notif_time ? data.notif_time.slice(0, 5) : '07:00',
                        notif_settings: data.notif_settings || { achievements: true, streak: true, summary: true, coach: true, hydration: true }
                    });
                } else {
                    // Si no hay datos, al menos setear el ID
                    setProfile(prev => ({ ...prev, id: userSession.user.id }));
                }
            } catch (e) {
                console.error("Profile fetch error:", e);
                setProfile(prev => ({ ...prev, id: userSession.user.id }));
            }
        }
        fetchProfile();
    }, [userSession]);

    const saveProfile = async (newProfile: UserProfile): Promise<boolean> => {
        if (!userSession) return false;
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userSession.user.id,
                    height: newProfile.height,
                    weight: newProfile.weight,
                    strength_goals: newProfile.strength_goals,
                    notif_enabled: newProfile.notif_enabled,
                    notif_time: newProfile.notif_time,
                    notif_settings: newProfile.notif_settings
                });
            if (!error) {
                setProfile({ ...newProfile, id: userSession.user.id });
                return true;
            }
        } catch (e) {
            console.error("Save profile error:", e);
        }
        return false;
    };

    return { profile, setProfile, saveProfile };
};
