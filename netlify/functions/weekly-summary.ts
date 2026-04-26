import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { calculateConsistency } from '../../src/components/Common';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

webpush.setVapidDetails(
    'mailto:marcelo@example.com',
    process.env.VITE_VAPID_PUBLIC_KEY!,
    process.env.VITE_VAPID_PRIVATE_KEY!
);

export const handler = schedule('0 20 * * 0', async () => {
    try {
        console.log('Generating Weekly Summaries...');
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

        // 1. Get users with summary notifications enabled
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, notif_settings')
            .eq('notif_enabled', true);

        if (userError || !users) throw userError || new Error('No users found');

        for (const user of users) {
            const settings = typeof user.notif_settings === 'string' ? JSON.parse(user.notif_settings) : user.notif_settings;
            if (!settings?.summary) continue;

            // 2. Fetch logs for the last 7 days
            const { data: logs, error: logError } = await supabase
                .from('logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', sevenDaysAgo);

            if (logError || !logs || logs.length === 0) continue;

            // 3. Calculate Stats
            let totalVolume = 0;
            logs.forEach(log => {
                if (log.gymData?.progress) {
                    Object.values(log.gymData.progress).flat().forEach((s: any) => {
                        if (s.completed) totalVolume += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
                    });
                }
            });

            const sessionCount = logs.length;
            const volumeFormatted = totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`;
            
            // 4. Send Summary Push
            const { data: subData } = await supabase
                .from('push_subscriptions')
                .select('subscription')
                .eq('user_id', user.id)
                .single();

            if (subData?.subscription) {
                const payload = JSON.stringify({
                    title: "Tu semana en resumen 💪",
                    body: `${sessionCount} sesiones · ${volumeFormatted} de volumen · ¡Semana sólida!`
                });
                await webpush.sendNotification(subData.subscription, payload);
                console.log(`Weekly summary sent to user ${user.id}`);
            }
        }

        return { statusCode: 200 };
    } catch (error: any) {
        console.error('Weekly Summary Error:', error);
        return { statusCode: 500 };
    }
});
