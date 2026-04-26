const { subtle } = globalThis.crypto || require('crypto').webcrypto;
const fs = require('fs');
const path = require('path');

(async () => {
  const keyPair = await subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const pubRaw = await subtle.exportKey('raw', keyPair.publicKey);
  const privJwk = await subtle.exportKey('jwk', keyPair.privateKey);

  const publicKey = Buffer.from(pubRaw).toString('base64url');
  const privateKey = privJwk.d;

  fs.writeFileSync(path.join(__dirname, 'vapid_keys.json'), JSON.stringify({ publicKey, privateKey }, null, 2));

  console.log('\n✅ VAPID Keys generadas correctamente!\n');
  console.log(`  Public Key:  ${publicKey}`);
  console.log(`  Private Key: ${privateKey}`);
  console.log('\n📋 Copia y pega estos comandos en tu terminal:\n');
  console.log(`supabase secrets set VAPID_PUBLIC_KEY="${publicKey}"`);
  console.log(`supabase secrets set VAPID_PRIVATE_KEY="${privateKey}"`);
  console.log('');
})();
