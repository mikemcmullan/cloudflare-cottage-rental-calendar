# Cottage Rental Google Calendar Cloudflare Worker 
A simple script that fetches calendar events from the google calendar api, processes them, and returns the start and end dates for each event.

## Little Wrangler Command Reference
 - `wrangler login` - Must login before we can publish our worker.
 - `wrangler dev` - Starts a dev server, also watches for changes.
 - `wrangler publish` - Publish our workers to production.

## Required Wrangler Secrets
The only required secret is `GOOGLE_SERVICE_ACCOUNT_JSON`. 

As the name implies we use a Google Service Account to access the calendar api.

To create a service account visit the [Google Cloud Console](https://console.cloud.google.com). In the search bar type service account. The first result should be "Service Accounts" under the IAM & Admin section.

  1. Click CREATE SERVICE ACCOUNT at the top.
  2. Enter name and optional description.
  3. You can leave the next two sections blank.
  4. In the list of Service Accounts click on the one you created.
  5. Go to the Keys tab, click on Add Key > Create new key. Then click Create in the popup.
  6. The key will be downloaded automatically.
  7. Copy the text from the downloaded file and save it as the value for GOOGLE_SERVICE_ACCOUNT_JSON secret in cloudflare.

Next go to the calendar you want to share with the worker and open the settings.
  1. Under the share settings click add Add people and groups button.
  2. In the Service Account Key Json we downloaded there is an attribute named `client_email`. Enter this into the input field and click send.

The calendar should now be shared with the worker.

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