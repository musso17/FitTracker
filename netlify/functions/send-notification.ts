import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

// Note: These keys should be in your .env
const vapidDetails = {
    publicKey: process.env.VITE_VAPID_PUBLIC_KEY!,
    privateKey: process.env.VITE_VAPID_PRIVATE_KEY!,
    subject: 'mailto:marcelo@example.com' // Replace with your email
};

webpush.setVapidDetails(
    vapidDetails.subject,
    vapidDetails.publicKey,
    vapidDetails.privateKey
);

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { userId, title, body } = JSON.parse(event.body || '{}');

        if (!userId) {
            return { statusCode: 400, body: 'Missing userId' };
        }

        // Fetch user subscription from Supabase
        const { data: subData, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', userId)
            .single();

        if (error || !subData) {
            return { statusCode: 404, body: 'Subscription not found' };
        }

        const payload = JSON.stringify({ title, body });

        await webpush.sendNotification(subData.subscription, payload);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Notification sent successfully' }),
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
