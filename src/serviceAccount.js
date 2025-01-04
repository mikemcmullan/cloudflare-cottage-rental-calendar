import { SignJWT, importPKCS8 } from 'jose';
import { Router } from 'itty-router'
const router = Router()

async function generateKey(serviceAccount) {
    const now = new Date()
    const NOW = Math.floor( now.getTime() / 1000);
    const header = {
        alg: 'RS256',
        typ: 'JWT',
        kid: serviceAccount.private_key_id,
    }

    const privateKey = await importPKCS8(serviceAccount.private_key, header.alg)

    const payload = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        iat: NOW,
        exp: NOW + 3600
    }
    
    const jwt = await new SignJWT(payload)
        .setProtectedHeader(header)
        .sign(privateKey);

    return jwt;
}

async function exchangeKey(key) {
    const resp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: key,
        }),
    })

    const json = await resp.json()

    if (json.error) {
        throw new Error(json.error_description)
    }
    return json
}


router.get('/', async () => {
    const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON)
    const key = await generateKey(serviceAccount)
    const token = await exchangeKey(key)

    await SETTINGS.put('access_token', json.access_token, {
        expirationTtl: 60 * 30,
    })

    await SETTINGS.put('last_update', new Date().toISOString())
    
    return new Response(token)
})

router.all('*', () => new Response('Not Found.', { status: 404 }))

addEventListener('fetch', event => {
    event.respondWith(router.handle(event.request, event))
})