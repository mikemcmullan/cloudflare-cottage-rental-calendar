

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
