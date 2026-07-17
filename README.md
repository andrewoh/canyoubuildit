# canyoubuildit.com

Public Next.js site for the canyoubuildit.com build archive and standalone project pages.

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Routes

- `/` — public build archive
- `/interest-boards` — living visual workspace for recurring interests
- `/wardrobe` — browsable wardrobe catalog with modeled item views
- `/interview-prep` — interview practice workspace
- `/podcast/notebook` — notebook walkthrough podcast
- `/bowman` — Bowman card explorer

The former Seoul trip dashboard and its site-wide password gate have been removed.

## Production

The site is linked to the Vercel project `canyoubuildit` and the custom domains `canyoubuildit.com` and `www.canyoubuildit.com`.

The Bowman collection uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured. Without it, local development uses the JSON data in `data/`.
