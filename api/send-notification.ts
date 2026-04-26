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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { userId, title, body } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const { data: subData, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', userId)
            .single();

        if (error || !subData) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const payload = JSON.stringify({ title, body });
        await webpush.sendNotification(subData.subscription, payload);

        return res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
