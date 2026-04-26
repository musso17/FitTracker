import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { calculateMuscleBalance } from '../src/utils/analytics.js';

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
    try {
        console.log('Running Weekly Coach Tips...');
        
        const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('user_id, subscription');

        if (subError || !subscriptions) throw subError || new Error('No subscriptions found');

        for (const sub of subscriptions) {
            const { data: logs, error: logError } = await supabase
                .from('logs')
                .select('*')
                .eq('user_id', sub.user_id)
                .order('date', { ascending: false })
                .limit(20);

            if (logError || !logs || logs.length < 5) continue;

            const balance = calculateMuscleBalance(logs);
            let tip = null;

            if (balance.pullPushRatio < 0.8) {
                tip = "Tus hombros están en riesgo. Esta semana prioriza ejercicios de tracción (espalda) sobre los de empuje.";
            } else if (balance.volume.legs < 5) {
                tip = "Tus piernas están pidiendo guerra. ¡No te saltes el día de pierna esta semana!";
            } else {
                tip = "¡Balance perfecto! Sigue manteniendo esa simetría para una longevidad máxima.";
            }

            if (tip) {
                const payload = JSON.stringify({
                    title: "💡 Tip del Coach",
                    body: tip
                });
                await webpush.sendNotification(sub.subscription, payload);
            }
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Coach Tips Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
