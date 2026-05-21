# Seoul Trip Finance Dashboard

Password-protected Next.js dashboard for `canyoubuildit.com`, styled as a calming paper-3D Seoul trip finance dashboard.

## What is included

- Server-side password gate with HTTP-only signed session cookie.
- Default requested password: `babymoon`.
- Paper-art dashboard UI with flight, hotel, CLEAR, and airport cards.
- `/api/transactions` and `/api/transactions/refresh` endpoints that return normalized expense rows.
- `/api/import/transactions` endpoint for importing finance exports from a scheduled external assistant/job.
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
IMPORT_SECRET=<generate-a-long-random-import-secret>
BLOB_READ_WRITE_TOKEN=<vercel-blob-read-write-token>
TRANSACTION_IMPORT_BLOB_PATH=seoul/imported-transactions.json
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

The dashboard can ingest normalized finance exports from another tool through:

```bash
curl -X POST https://www.canyoubuildit.com/api/import/transactions \
  -H "Authorization: Bearer $IMPORT_SECRET" \
  -H "Content-Type: application/json" \
  --data @transactions.json
```

The body can be either a JSON array or an object:

```json
{
  "mode": "replace",
  "transactions": [
    {
      "id": "amex-2026-05-22-signiel-hold",
      "source": "chatgpt-finance-export",
      "date": "2026-05-22",
      "merchant": "SIGNIEL SEOUL",
      "title": "Hotel authorization hold",
      "amount": 500,
      "currency": "USD",
      "category": "Hotels",
      "confidence": "review",
      "status": "pending",
      "notes": "Exported from finance connector.",
      "rawSource": {
        "matchedReceiptId": "19e4be75386e1a76",
        "reservationNumber": "26109B3331728",
        "account": "Amex Platinum",
        "card": {
          "brand": "American Express",
          "product": "Platinum",
          "last4": "1005",
          "role": "Charged"
        }
      }
    }
  ]
}
```

Use `mode: "replace"` for a full export from the external job, or `mode: "merge"` for incremental rows. Rows are deduped by `id`, `rawSource.matchedReceiptId`, and reservation number where possible. Production persistence uses Vercel Blob; local development uses `data/imported-transactions.json`.

Do not put provider tokens, Google OAuth secrets, Plaid secrets, or real financial raw data in browser-side code.

For a direct live connector, replace the external export job with a provider sync that:

1. Pulls card transactions from your finance provider or Plaid backend.
2. Pulls Gmail receipt metadata through Google OAuth read-only scopes.
3. Parses United receipt emails for `SFO`, `ICN`, `Seoul`, `Incheon`, confirmation code, and total fare.
4. Matches receipt totals to card charges when the posted transaction arrives.
5. Writes normalized rows into durable storage.
6. Returns normalized rows from `/api/transactions`.

## Notes

I could not directly deploy to your domain from this environment, and Gmail did not appear as a callable tool here after you connected it. The app is structured so the United flight card can be receipt-sourced first and then card-matched later.
