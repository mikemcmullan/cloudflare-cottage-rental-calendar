
import { getAccessTokenFromServiceAccount } from './lib/GoogleAuth'
import { getCalendarEvents } from './lib/GoogleCalendarApi'
import { corsHeaders } from './lib/CorsHeaders'
import { Router } from 'itty-router'
import { indexOf, range } from 'lodash'
import { DateTime } from 'luxon'

function mapResponse(resp) {
    return resp.items.map((item) => {
        let start, end
            
        if (item.start.date) {
            start = DateTime.fromISO(item.start.date + 'T12:00:00', { zone: 'UTC' }).setZone('America/Toronto')
            end = DateTime.fromISO(item.end.date + 'T00:00:00', { zone: 'UTC' }).setZone('America/Toronto')
        } else {
            start = item.start.dateTime
            end = item.end.dateTime
        }
        
        return {
            start,
            end,
        }

    })
}

async function getCachedCalendarEvents(calendarId, year) {
    const cached = await SETTINGS.get(`${calendarId}-${year}-cached`)

    if (cached) {
        console.log(`Cached ${calendarId}`)
        return { status: 200, events: cached }
    }

    console.log(`Cache Miss ${calendarId}`)

    const events = await getCalendarEvents(calendarId, year)  

    if (events.body.error) {
        console.error(events.body);
        
        throw new Error(events.body)
    }

    const value = JSON.stringify({ data: mapResponse(events.body) })

    await SETTINGS.put(`${calendarId}-${year}-cached`, value, {
        expirationTtl: CALENDAR_CACHE_LENGTH,
    })

    return { status: 200, events: value }
}

async function getCalendarEventsHttp(calendarId, year) {
    var status, events;

    try {
        const out = await getCachedCalendarEvents(calendarId, year)

        status = out.status
        events = out.events   
        
    } catch(e) {
        status = 500
        events = JSON.stringify({ error: true })
    }

    return new Response(events, {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders()
        }
    })
}

function getValidYears() {
    const start = 2020;
    const curr = new Date().getFullYear();
    return range(start, curr + 2)
}

function parseYear(year) {
    year = parseInt(year)
    const valid = getValidYears()

    if (isNaN(year) || valid.indexOf(year) === -1) {
        year = new Date().getFullYear()
    }

    return year
}

const router = Router()

router.get('/favicon.ico', async (request, event) => {
    return new Response('')
})

router.get('/driftwood-bay/:year?', async (request, event) => {
    const year = parseYear(request.params.year)

    return await getCalendarEventsHttp(DRIFTWOOD_BAY_CALENDAR_ID, year);
})

router.get('/mackers-place/:year?', async (request, event) => {
    const year = parseYear(request.params.year)

    return await getCalendarEventsHttp(MACKERS_PLACE_CALENDAR_ID, year);
})

router.all('*', () => new Response('Not Found.', { status: 404 }))

addEventListener('fetch', event => {
    event.respondWith(router.handle(event.request, event))
})

addEventListener('scheduled', async (event) => {
    event.waitUntil(getAccessTokenFromServiceAccount(GOOGLE_SERVICE_ACCOUNT_JSON, true))
})
