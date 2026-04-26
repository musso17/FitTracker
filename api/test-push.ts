import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

webpush.setVapidDetails(
    'mailto:marcelo@example.com',
    process.env.VITE_VAPID_PUBLIC_KEY!,
    process.env.VITE_VAPID_PRIVATE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const { data: subData, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', userId)
            .single();

        if (error || !subData) {
            return res.status(404).json({ error: 'No subscription found for this user. Be sure to enable notifications in the app first.' });
        }

        const payload = JSON.stringify({
            title: "🚀 Prueba de Push",
            body: "Si ves esto, el sistema de notificaciones en el servidor está funcionando perfectamente."
        });

        await webpush.sendNotification(subData.subscription, payload);

        return res.status(200).json({ success: true, message: 'Test notification sent' });
    } catch (err: any) {
        console.error('Push test error:', err);
        return res.status(500).json({ error: err.message });
    }
}
