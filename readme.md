# Cottage Rental Google Calendar Cloudflare Worker 
A simple script that fetches calendar events from the google calendar api, processes them, and returns the start and end dates for each event.

## Little Wrangler Command Reference
 - `wrangler login` - Must login before we can publish our worker.
 - `wrangler dev` - Starts a dev server, also watches for changes.
 - `wrangler publish` - Publish our workers to production.

## Required Wramgler Secrets
I used the [Google oAuth Playground](https://developers.google.com/oauthplayground) to generate the refresh token. Use the google cloud console to create a new oAuth application to get a `CLIENT_ID` and `CLIENT_SECRET`.

Set the follow variables using the `wrangler secret put` command.

    CLIENT_ID = ...
    CLIENT_SECRET = ...
    REFRESH_TOKEN = ...

## Cloudflare KV Store
Create two KV stores for this application, one for use in production and one for use in development. In the `[[kv_namespaces]]` section of the `wrangler.toml` file place the production KV store id in the `id` variables and the development KV store id in the `preview_id` variable. 

    [[kv_namespaces]]
    id = "..."
    preview_id = "..."

## Google Calendar ID
Set the id of each calendar in the `wrangler.toml` file.

    [vars]
    DRIFTWOOD_BAY_CALENDAR_ID = "..."
    MACKERS_PLACE_CALENDAR_ID = "..."