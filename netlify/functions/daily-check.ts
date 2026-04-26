import { schedule } from '@netlify/functions';
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

export const handler = schedule('0 20 * * *', async () => {
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
            // Check if streak notification is toggled on
            const settings = typeof user.notif_settings === 'string' ? JSON.parse(user.notif_settings) : user.notif_settings;
            if (!settings?.streak) continue;

            // 2. Check if user has trained today
            const { data: logs, error: logError } = await supabase
                .from('logs')
                .select('id')
                .eq('user_id', user.id)
                .eq('date', todayStr);

            if (logError) continue;

            // 3. If no logs found, send push
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

        return { statusCode: 200 };
    } catch (error: any) {
        console.error('Daily Check Error:', error);
        return { statusCode: 500 };
    }
});
