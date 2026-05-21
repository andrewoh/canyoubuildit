# Seoul Trip Finance Dashboard

Password-protected Next.js dashboard for `canyoubuildit.com`, styled as a calming paper-3D Seoul trip finance dashboard.

## What is included

- Server-side password gate with HTTP-only signed session cookie.
- Default requested password: `babymoon`.
- Paper-art dashboard UI with flight, hotel, CLEAR, and airport cards.
- `/api/transactions` and `/api/transactions/refresh` endpoints that return normalized expense rows.
- Seed data from the currently visible Finances results:
  - Amex Fine Hotels & Resorts — `$4,347.40`
  - CLEAR — `$209.00`
  - CU at Incheon Airport — `$3.95`
  - United flight to Seoul — Gmail receipt detected for confirmation `J1WH7V`, waiting for card match

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` and enter password:

```text
babymoon
```

## Production environment variables

Set these in Vercel, Netlify, Render, or your host:

```bash
DASHBOARD_PASSWORD=babymoon
SESSION_SECRET=<generate-a-long-random-secret>
NEXT_PUBLIC_SITE_URL=https://seoul.canyoubuildit.com
```

Generate a secret with:

```bash
openssl rand -hex 32
```

## Deploying to canyoubuildit.com on Vercel

1. Create a GitHub repo and push this folder.
2. Import the repo into Vercel.
3. Set the environment variables above.
4. In Vercel Project Settings → Domains, add `canyoubuildit.com` or a subdomain such as `seoul.canyoubuildit.com`.
5. Update DNS at your domain registrar using the records Vercel provides.
6. Keep HTTPS enabled.

## Making it truly live

The current package is production-ready as a private dashboard shell, but the live financial/Gmail sync still needs a secure backend connector. Replace `app/api/transactions/route.ts` with a database-backed provider sync that:

1. Pulls card transactions from your finance provider or Plaid backend.
2. Pulls Gmail receipt metadata through Google OAuth read-only scopes.
3. Parses United receipt emails for `SFO`, `ICN`, `Seoul`, `Incheon`, confirmation code, and total fare.
4. Matches receipt totals to card charges when the posted transaction arrives.
5. Writes normalized rows into your database.
6. Returns normalized rows from `/api/transactions`.

Do not put provider tokens, Google OAuth secrets, Plaid secrets, or real financial raw data in browser-side code.

## Notes

I could not directly deploy to your domain from this environment, and Gmail did not appear as a callable tool here after you connected it. The app is structured so the United flight card can be receipt-sourced first and then card-matched later.
