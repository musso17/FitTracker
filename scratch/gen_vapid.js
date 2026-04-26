import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('--- VAPID KEYS ---');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('------------------');
console.log('Add these to your .env as:');
console.log('VITE_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VITE_VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
