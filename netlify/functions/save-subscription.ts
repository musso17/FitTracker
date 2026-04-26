import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { userId, subscription } = JSON.parse(event.body || '{}');

        if (!userId || !subscription) {
            return { statusCode: 400, body: 'Missing userId or subscription' };
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({ user_id: userId, subscription }, { onConflict: 'user_id' });

        if (error) throw error;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Subscription saved successfully' }),
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
