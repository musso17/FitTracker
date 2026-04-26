import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { UserProfile } from '../types';

export const useProfile = (userSession: any) => {
    const [profile, setProfile] = useState<UserProfile>({ 
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
                    .select('height, weight, strength_goals, notif_enabled, notif_time, notif_settings')
                    .eq('id', userSession.user.id)
                    .single();
                if (data) {
                    setProfile({
                        height: data.height,
                        weight: data.weight,
                        strength_goals: data.strength_goals || {},
                        notif_enabled: !!data.notif_enabled,
                        notif_time: data.notif_time ? data.notif_time.slice(0, 5) : '07:00',
                        notif_settings: data.notif_settings || { achievements: true, streak: true, summary: true, coach: true, hydration: true }
                    });
                }
            } catch (e) {
                console.error("Profile fetch error:", e);
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
                setProfile(newProfile);
                return true;
            }
        } catch (e) {
            console.error("Save profile error:", e);
        }
        return false;
    };

    return { profile, setProfile, saveProfile };
};
