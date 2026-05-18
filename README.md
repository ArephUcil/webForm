# RT 07 Resident Data Collection

A small React + Vite app for collecting resident data of RT 07.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

## Deployment

This project is ready to deploy to Vercel.

### Google Sheets upload setup

1. Create a Google Apps Script web app that accepts POST requests and writes JSON data into a sheet.
2. Publish the script and copy the web app URL.
3. In Vercel, add an environment variable named `GOOGLE_SHEETS_WEBHOOK_URL` with that URL.
4. Deploy the project.

The app sends form data to `/api/submit`, which forwards it to your Google Sheets webhook.
