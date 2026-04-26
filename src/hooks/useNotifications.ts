import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useNotifications = (userId: string, storageKey: (k: string) => string, showToast: any) => {
    const [notificationSettings, setNotificationSettings] = useState({ 
        enabled: false, hydration: true, workout: true, daily: true, interval: 60 
    });
    const [lastHydrationTime, setLastHydrationTime] = useState(Date.now());

    useEffect(() => {
        if (userId === 'guest') return;
        const saved = localStorage.getItem(storageKey('notifications'));
        if (saved) setNotificationSettings(JSON.parse(saved));
    }, [userId]);

    useEffect(() => {
        if (userId !== 'guest') {
            localStorage.setItem(storageKey('notifications'), JSON.stringify(notificationSettings));
        }
    }, [notificationSettings, userId]);

    const notify = (title: string, body: string) => {
        if (Notification.permission === "granted") {
            try {
                new Notification(title, { body });
            } catch (e) {
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(reg => reg.showNotification(title, { body }));
                }
            }
        }
    };

    const subscribeToPush = async (reg: ServiceWorkerRegistration) => {
        try {
            const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; 
            if (!VAPID_PUBLIC_KEY) {
                console.warn('VAPID_PUBLIC_KEY not found in .env');
                return;
            }

            // Cleanup old subscription if key changed
            const existingSub = await reg.pushManager.getSubscription();
            if (existingSub) {
                await existingSub.unsubscribe();
                console.log('Old subscription cleaned up');
            }

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: VAPID_PUBLIC_KEY
            });

            // Phase 2: Save to Netlify Backend
            const response = await fetch('/.netlify/functions/save-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, subscription })
            });

            if (!response.ok) throw new Error('Failed to save subscription on server');
            
            console.log('Push subscription verified and saved on server');
        } catch (error) {
            console.error('Push subscription error:', error);
        }
    };

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            showToast("Tu navegador no soporta notificaciones.", "error");
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            setNotificationSettings(prev => ({ ...prev, enabled: true }));
            const reg = await navigator.serviceWorker.ready;
            if (reg.pushManager) await subscribeToPush(reg);
            notify("¡Notificaciones Activas! 🔔", "Te avisaré para tu hidratación y sesiones.");
        } else {
            showToast("Necesitas habilitar los permisos de notificación.", "error");
        }
    };

    // Hydration Timer
    useEffect(() => {
        if (!notificationSettings.enabled || !notificationSettings.hydration) return;
        const intervalMs = notificationSettings.interval * 60 * 1000;
        const timer = setInterval(() => {
            if (Date.now() - lastHydrationTime >= intervalMs) {
                notify("¡Es hora de hidratarte! 💧", "Recuerda beber agua.");
                setLastHydrationTime(Date.now());
            }
        }, 60000);
        return () => clearInterval(timer);
    }, [notificationSettings, lastHydrationTime]);

    return { notificationSettings, setNotificationSettings, requestPermission, notify };
};
