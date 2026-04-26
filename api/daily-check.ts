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
    // Optional: add a secret check if you set one in Vercel
    // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return res.status(401).end('Unauthorized');
    // }

    try {
        console.log('Running Daily Streak Protection Check...');
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Get users with streak notifications enabled
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, notif_settings')
            .eq('notif_enabled', true);

        if (userError || !users) throw userError || new Error('No users found');

        for (const user of users) {
            const settings = typeof user.notif_settings === 'string' ? JSON.parse(user.notif_settings) : user.notif_settings;
            if (!settings?.streak) continue;

            const { data: logs, error: logError } = await supabase
                .from('logs')
                .select('id')
                .eq('user_id', user.id)
                .eq('date', todayStr);

            if (logError) continue;

            if (!logs || logs.length === 0) {
                const { data: subData } = await supabase
                    .from('push_subscriptions')
                    .select('subscription')
                    .eq('user_id', user.id)
                    .single();

                if (subData?.subscription) {
                    const payload = JSON.stringify({
                        title: "⚡️ ¡Tu racha está en riesgo!",
                        body: "Haz una sesión rápida antes de medianoche para no perder tu progreso."
                    });
                    await webpush.sendNotification(subData.subscription, payload);
                    console.log(`Streak warning sent to user ${user.id}`);
                }
            }
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Daily Check Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
