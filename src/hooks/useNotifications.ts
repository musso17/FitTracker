import { useState, useEffect } from 'react';

// Utility for VAPID key conversion
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const useNotifications = (userId: string, storageKey: (k: string) => string, showToast: any) => {
    const [notificationSettings, setNotificationSettings] = useState({ 
        enabled: false, hydration: true, workout: true, daily: true, interval: 60 
    });
    const [lastHydrationTime, setLastHydrationTime] = useState(Date.now());

    useEffect(() => {
        if (userId === 'guest') return;
        const saved = localStorage.getItem(storageKey('notifications'));
        if (saved) setNotificationSettings(JSON.parse(saved));
        
        // Auto-verify subscription if permission is already granted
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(reg => {
                if (reg.pushManager) verifySubscription(reg);
            });
        }
    }, [userId]);

    useEffect(() => {
        if (userId !== 'guest') {
            localStorage.setItem(storageKey('notifications'), JSON.stringify(notificationSettings));
        }
    }, [notificationSettings, userId]);

    const notify = (title: string, body: string) => {
        if (Notification.permission === "granted") {
            try {
                // Foreground standard notification
                new Notification(title, { body, icon: '/icon-192.png' });
            } catch (e) {
                // Background SW notification fallback
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(reg => reg.showNotification(title, { body, icon: '/icon-192.png' }));
                }
            }
        }
    };

    const verifySubscription = async (reg: ServiceWorkerRegistration) => {
        try {
            const existingSub = await reg.pushManager.getSubscription();
            if (!existingSub) {
                console.log('No existing subscription found on this device/domain. Subscribing...');
                await subscribeToPush(reg);
            } else {
                console.log('Existing subscription found. Syncing with backend...');
                await saveSubscriptionToServer(existingSub);
            }
        } catch (error) {
            console.error('Subscription verification error:', error);
        }
    };

    const subscribeToPush = async (reg: ServiceWorkerRegistration) => {
        try {
            const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; 
            if (!VAPID_PUBLIC_KEY) {
                console.error('CRITICAL: VITE_VAPID_PUBLIC_KEY is missing');
                return;
            }

            const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
            });

            await saveSubscriptionToServer(subscription);
            console.log('Push subscription successful for user:', userId);
        } catch (error) {
            console.error('Push subscription failed:', error);
            showToast("Error al activar notificaciones push.", "error");
        }
    };

    const saveSubscriptionToServer = async (subscription: PushSubscription) => {
        try {
            const response = await fetch('/api/save-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, subscription })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save subscription');
            }
        } catch (error) {
            console.error('Server subscription save failed:', error);
        }
    };

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            showToast("Tu navegador no soporta notificaciones.", "error");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationSettings(prev => ({ ...prev, enabled: true }));
                const reg = await navigator.serviceWorker.ready;
                if (reg.pushManager) {
                    await subscribeToPush(reg);
                }
                notify("¡Notificaciones Activas! 🔔", "Te avisaré para tu hidratación y sesiones.");
            } else {
                showToast("Necesitas habilitar los permisos de notificación en tu navegador.", "error");
            }
        } catch (err) {
            console.error("Permission request error:", err);
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
