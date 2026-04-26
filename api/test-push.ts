import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS for testing if needed, though same-origin should work
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const URL = process.env.VITE_SUPABASE_URL;
        const KEY = process.env.VITE_SUPABASE_ANON_KEY;
        const VAPID_PUB = process.env.VITE_VAPID_PUBLIC_KEY;
        const VAPID_PRIV = process.env.VITE_VAPID_PRIVATE_KEY;

        // Diagnostic Check
        const missing = [];
        if (!URL) missing.push('VITE_SUPABASE_URL');
        if (!KEY) missing.push('VITE_SUPABASE_ANON_KEY');
        if (!VAPID_PUB) missing.push('VITE_VAPID_PUBLIC_KEY');
        if (!VAPID_PRIV) missing.push('VITE_VAPID_PRIVATE_KEY');

        if (missing.length > 0) {
            return res.status(200).json({ 
                success: false, 
                error: `Faltan variables en Vercel: ${missing.join(', ')}. Agrégalas en el panel de Vercel (Project Settings > Environment Variables).` 
            });
        }

        const supabase = createClient(URL!, KEY!);
        webpush.setVapidDetails('mailto:marcelo@example.com', VAPID_PUB!, VAPID_PRIV!);

        const { userId } = req.body || (req.query as any);
        if (!userId) return res.status(200).json({ success: false, error: 'No se recibió userId en la petición.' });

        const { data: subData, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', userId)
            .single();

        if (error || !subData) {
            return res.status(200).json({ 
                success: false, 
                error: 'No se encontró suscripción en Supabase. Prueba a desactivar y volver a activar las notificaciones en la app.' 
            });
        }

        const payload = JSON.stringify({
            title: "🚀 Prueba de Push",
            body: "Si ves esto, el sistema de notificaciones está funcionando perfectamente."
        });

        await webpush.sendNotification(subData.subscription, payload);

        return res.status(200).json({ success: true, message: 'Test notification sent' });
    } catch (err: any) {
        return res.status(200).json({ 
            success: false, 
            error: `Error interno: ${err.message}` 
        });
    }
}
