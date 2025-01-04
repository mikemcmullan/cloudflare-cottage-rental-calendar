import { SignJWT, importPKCS8 } from 'jose';

export async function getAccessTokenFromRefreshToken(refreshToken, cacheBypass = false) {
    const accessToken = await SETTINGS.get('access_token')

    if (accessToken && cacheBypass === false) {
        return accessToken
    }
    
    console.log('Auth token missing, getting a new one.')
    
    const resp = await fetch('https://accounts.google.com/o/oauth2/token', {
        method: 'POST',
        body: JSON.stringify({
            refresh_token: refreshToken,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'refresh_token',
        }),
    })

    const json = await resp.json()

    if (json.error) {
        throw new Error(json.error_description)
    }

    await SETTINGS.put('access_token', json.access_token, {
        expirationTtl: 60 * 30,
    })
    await SETTINGS.put('last_update', new Date().toISOString())

    return json.access_token
}

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

    return json.access_token
}

export async function getAccessTokenFromServiceAccount(serviceAccount, cacheBypass = false) {
    const accessToken = await SETTINGS.get('access_token')

    if (accessToken && cacheBypass === false) {
        return accessToken
    }

    if (typeof serviceAccount === 'string') {
        serviceAccount = JSON.parse(serviceAccount)
    }

    console.log('Auth token missing, getting a new one from service account.')

    const key = await generateKey(serviceAccount)
    const token = await exchangeKey(key)

    return token
}