import { baseHeaders } from './BaseHeaders';

export async function getCalendarEvents(calendarId, year) {
    const min = `${year}-01-02T00:00:00.000Z`
    const max = `${year}-12-31T23:59:59.000Z`

    try {
        const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${min}&timeMax=${max}`, {
            method: 'GET',
            headers: await baseHeaders(),
        })

        const json = await resp.json()
        let body

        if (resp.ok) {
            body = json
        } else {
            body = { error: json.error  }
        }
        
        return { status: resp.status, body }
    } catch (error) {
        return {
            status: 500,
            error: {} 
        }
    }

}