import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { userId, subscription } = req.body;

        if (!userId || !subscription) {
            return res.status(400).json({ error: 'Missing userId or subscription' });
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({ user_id: userId, subscription }, { onConflict: 'user_id' });

        if (error) throw error;

        return res.status(200).json({ message: 'Subscription saved successfully' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
