import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { calculateMuscleBalance } from '../../src/components/Common';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY! // Should use a service role key for cron if available, but anon works with RLS open or admin.
);

// Configure web-push
webpush.setVapidDetails(
    'mailto:marcelo@example.com',
    process.env.VITE_VAPID_PUBLIC_KEY!,
    process.env.VITE_VAPID_PRIVATE_KEY!
);

export const handler = schedule('0 9 * * 1', async () => {
    try {
        console.log('Running Weekly Coach Tips...');
        
        // 1. Get all active subscriptions
        const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('user_id, subscription');

        if (subError || !subscriptions) throw subError || new Error('No subscriptions found');

        for (const sub of subscriptions) {
            // 2. Get recent logs for this user
            const { data: logs, error: logError } = await supabase
                .from('logs')
                .select('*')
                .eq('user_id', sub.user_id)
                .order('date', { ascending: false })
                .limit(20);

            if (logError || !logs || logs.length < 5) continue;

            // 3. Analyze Intelligence (Muscle Balance Example)
            const balance = calculateMuscleBalance(logs);
            let tip = null;

            if (balance.pullPushRatio < 0.8) {
                tip = "Tus hombros están en riesgo. Esta semana prioriza ejercicios de tracción (espalda) sobre los de empuje.";
            } else if (balance.volume.legs < 5) {
                tip = "Tus piernas están pidiendo guerra. ¡No te saltes el día de pierna esta semana!";
            } else {
                tip = "¡Balance perfecto! Sigue manteniendo esa simetría para una longevidad máxima.";
            }

            // 4. Send Push
            if (tip) {
                const payload = JSON.stringify({
                    title: "💡 Tip del Coach",
                    body: tip
                });
                await webpush.sendNotification(sub.subscription, payload);
            }
        }

        return { statusCode: 200 };
    } catch (error: any) {
        console.error('Coach Tips Error:', error);
        return { statusCode: 500 };
    }
});
