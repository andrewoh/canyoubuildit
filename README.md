# canyoubuildit.com

Public Next.js site for Andrew Oh’s interactive AI and data science leadership portfolio, build archive, and standalone project pages.

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Routes

- `/` — interactive portfolio with project explorer, source-backed data lab, and illustrative AI walkthrough
- `/resume` — printable one-page profile
- `/archive` — preserved September 2026 build archive snapshot
- `/interest-boards` — living visual workspace for recurring interests
- `/wardrobe` — browsable wardrobe catalog with modeled item views
- `/interview-prep` — interview practice workspace
- `/podcast/notebook` — notebook walkthrough podcast
- `/bowman` — Bowman card explorer

The former Seoul trip dashboard and its site-wide password gate have been removed.

## Production

The site is linked to the Vercel project `canyoubuildit` and the custom domains `canyoubuildit.com` and `www.canyoubuildit.com`.

The Bowman collection uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured. Without it, local development uses the JSON data in `data/`.

## Portfolio content and interaction

Selected project narratives live in `app/portfolio/projects.ts`. Professional role and LinkedIn were confirmed by Andrew; personal projects are not presented as Xero work. `data/portfolio-injuries.json` is a compact, two-decimal extract of the existing injury analysis, not synthetic demo data. The AI walkthrough uses clearly labeled illustrative inputs and deterministic local behavior. The hero sculpture supports reduced motion, explicit pause, and offscreen suspension.
