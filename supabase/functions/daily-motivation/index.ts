import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Base64URL utilities ---
function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function b64urlDec(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  const bin = atob(str)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

function join(...bufs: (Uint8Array | ArrayBuffer)[]): Uint8Array {
  const arrs = bufs.map(b => b instanceof Uint8Array ? b : new Uint8Array(b))
  const len = arrs.reduce((s, a) => s + a.length, 0)
  const r = new Uint8Array(len)
  let off = 0
  for (const a of arrs) { r.set(a, off); off += a.length }
  return r
}

// --- VAPID JWT (RFC 8292) ---
async function createVapidAuth(
  endpoint: string,
  vapidPub: string,
  vapidPriv: string,
): Promise<string> {
  const pubBytes = b64urlDec(vapidPub)
  const x = b64url(pubBytes.slice(1, 33))
  const y = b64url(pubBytes.slice(33, 65))

  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x, y, d: vapidPriv },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )

  const enc = new TextEncoder()
  const header = b64url(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payload = b64url(enc.encode(JSON.stringify({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 43200,
    sub: 'mailto:admin@anafit.app',
  })))

  const token = `${header}.${payload}`
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    enc.encode(token),
  )

  return `vapid t=${token}.${b64url(sig)}, k=${vapidPub}`
}

// --- Web Push Encryption (RFC 8291, aes128gcm) ---
async function encryptPayload(
  p256dh: string,
  auth: string,
  data: string,
): Promise<Uint8Array> {
  const te = new TextEncoder()
  const subPub = b64urlDec(p256dh)
  const authSec = b64urlDec(auth)

  // 1. Ephemeral ECDH key pair
  const localPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  )
  const localPubRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', localPair.publicKey),
  )

  // 2. Import subscriber key
  const subKey = await crypto.subtle.importKey(
    'raw', subPub,
    { name: 'ECDH', namedCurve: 'P-256' },
    false, [],
  )

  // 3. ECDH shared secret
  const shared = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subKey },
    localPair.privateKey,
    256,
  )

  // 4. IKM = HKDF(salt=auth, ikm=shared, info="WebPush: info\0" + subPub + localPub, 32)
  const sharedKey = await crypto.subtle.importKey(
    'raw', shared, 'HKDF', false, ['deriveBits'],
  )
  const keyInfo = join(te.encode('WebPush: info\0'), subPub, localPubRaw)
  const ikm = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSec, info: keyInfo },
    sharedKey,
    256,
  )

  // 5. Random salt
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // 6. CEK and Nonce from IKM
  const ikmKey = await crypto.subtle.importKey(
    'raw', ikm, 'HKDF', false, ['deriveBits'],
  )

  const cek = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: te.encode('Content-Encoding: aes128gcm\0') },
    ikmKey,
    128,
  )

  const nonce = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: te.encode('Content-Encoding: nonce\0') },
    ikmKey,
    96,
  )

  // 7. AES-128-GCM encrypt
  const aesKey = await crypto.subtle.importKey(
    'raw', cek, 'AES-GCM', false, ['encrypt'],
  )
  const plaintext = join(te.encode(data), new Uint8Array([2])) // 0x02 delimiter
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 },
    aesKey,
    plaintext,
  )

  // 8. aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
  const rs = new ArrayBuffer(4)
  new DataView(rs).setUint32(0, 4096, false)

  return join(
    salt,
    new Uint8Array(rs),
    new Uint8Array([65]),
    localPubRaw,
    new Uint8Array(encrypted),
  )
}

// --- Send Push ---
async function sendPush(
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPub: string,
  vapidPriv: string,
): Promise<boolean> {
  try {
    const authorization = await createVapidAuth(sub.endpoint, vapidPub, vapidPriv)
    const body = await encryptPayload(sub.keys.p256dh, sub.keys.auth, payload)

    const resp = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
        'Urgency': 'high',
      },
      body,
    })

    if (!resp.ok) {
      console.error(`Push ${resp.status}: ${await resp.text()}`)
      return false
    }
    return true
  } catch (e) {
    console.error('sendPush error:', e)
    return false
  }
}

// --- Main Handler ---
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const VAPID_PUB = Deno.env.get('VAPID_PUBLIC_KEY')!
    const VAPID_PRIV = Deno.env.get('VAPID_PRIVATE_KEY')!
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!VAPID_PUB || !VAPID_PRIV) {
      throw new Error('VAPID keys not configured. Run: supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=...')
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    let payload: any = {}
    try {
      const text = await req.text()
      if (text) payload = JSON.parse(text)
    } catch (_) {}

    const { data: profiles, error: dbErr } = await supabase
      .from('profiles')
      .select('id, push_subscription')
      .not('push_subscription', 'is', null)

    if (dbErr) throw dbErr
    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ status: 'no_subscribers' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // --- Test PR notification ---
    if (payload.event === 'test_pr') {
      let sent = 0
      for (const p of profiles) {
        if (!p.push_subscription) continue
        const sub = JSON.parse(p.push_subscription)
        if (!sub.endpoint || !sub.keys) continue

        const msg = JSON.stringify({
          title: '¡Nuevo Récord Detectado! 💎',
          body: '¡Alguien acaba de romper un PR en su sesión. A por todo!',
        })

        if (await sendPush(sub, msg, VAPID_PUB, VAPID_PRIV)) sent++
      }
      return new Response(
        JSON.stringify({ status: 'sent', count: sent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // --- Daily motivation / streak alerts ---
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const isEvening = now.getHours() >= 18
    let sent = 0

    for (const p of profiles) {
      if (!p.push_subscription) continue
      const sub = JSON.parse(p.push_subscription)
      if (!sub.endpoint || !sub.keys) continue

      const { data: todayLogs } = await supabase
        .from('logs')
        .select('id')
        .eq('userId', p.id)
        .eq('date', todayStr)
        .limit(1)

      if (!todayLogs || todayLogs.length === 0) {
        let title = '¡Buen día! 🎯'
        let body = 'Hoy es un gran día para entrenar.'
        if (isEvening) {
          title = '¡Racha en Riesgo! ⚡️'
          body = 'No dejes que se pierda tu progreso de hoy.'
        }

        const msg = JSON.stringify({ title, body })
        if (await sendPush(sub, msg, VAPID_PUB, VAPID_PRIV)) sent++
      }
    }

    return new Response(
      JSON.stringify({ status: 'done', sent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
