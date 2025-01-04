import { getAccessTokenFromServiceAccount } from './GoogleAuth'

export async function baseHeaders() {
    const token = await getAccessTokenFromServiceAccount(GOOGLE_SERVICE_ACCOUNT_JSON)

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}