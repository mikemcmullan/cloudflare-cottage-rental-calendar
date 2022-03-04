import { getAccessTokenFromRefreshToken } from './GoogleAuth'

export async function baseHeaders() {
    const token = await getAccessTokenFromRefreshToken(REFRESH_TOKEN)

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}