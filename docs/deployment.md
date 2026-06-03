# Deployment Guide

This guide covers deploying **Lyric Lens** to production. The app runs on **Cloudflare Workers** (via [OpenNext for Cloudflare](https://opennext.js.org/cloudflare)) and uses **Supabase** for auth, database, and storage.

These steps assume your latest changes are already merged and pushed to the `main` branch.

## Architecture

| Layer | Platform | Notes |
|-------|----------|-------|
| Web app | Cloudflare Workers (`lyric-lens`) | Next.js App Router built with `@opennextjs/cloudflare` |
| Incremental cache | Cloudflare R2 (`lyric-lens-opennext-cache`) | Configured in `wrangler.jsonc` |
| Database & auth | Supabase | Postgres + RLS policies |
| File storage | Supabase Storage (`welcome-slides` bucket) | Created by migration |

## Prerequisites

- **Node.js** 18+ and **npm**
- A **Cloudflare** account with Workers and R2 enabled
- A **Supabase** project (production)
- **Wrangler** CLI (installed as a dev dependency — use `npx wrangler`)
- Access to push/deploy from the machine you run commands on

## One-time setup

Complete these steps once per environment (production). Skip on subsequent deploys unless something changed (new env vars, new migrations, new R2 bucket, etc.).

### 1. Cloudflare authentication

```bash
npx wrangler login
npx wrangler whoami
```

### 2. Create the R2 cache bucket

The Worker expects an R2 bucket named `lyric-lens-opennext-cache` (see `wrangler.jsonc`).

```bash
npx wrangler r2 bucket create lyric-lens-opennext-cache
```

If the bucket already exists, Wrangler will report that and you can continue.

### 3. Configure Supabase

#### Apply database migrations

Migrations live in `supabase/migrations/`. Apply them **in filename order** to your production Supabase project:

1. `20260523000000_lyric_lens_rls_and_flow_sections.sql`
2. `20260524000000_service_flows_and_announcements.sql`
3. `20260531000000_setlist_welcome_slide.sql`
4. `20260531100000_welcome_slides_storage.sql`
5. `20260531120000_announcement_slides.sql`

**Option A — Supabase CLI** (recommended if the project is linked):

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — Supabase Dashboard**

Open **SQL Editor** and run each migration file manually, in the order above.

#### Configure Auth redirect URLs

After your first deploy, note the Cloudflare Worker URL (for example `https://lyric-lens.<your-subdomain>.workers.dev`).

In the Supabase Dashboard, go to **Authentication → URL Configuration** and add:

- **Site URL**: your production app URL
- **Redirect URLs**: the same URL (and any custom domain you attach later)

Without this, login redirects may fail in production.

### 4. Set environment variables

Copy `.env.example` to `.dev.vars` for local Cloudflare preview/deploy builds:

```bash
cp .env.example .dev.vars
```

Fill in values from **Supabase Dashboard → Settings → API**:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public; embedded in the client bundle at build time |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Public publishable key |
| `SUPABASE_URL` | Yes | Same URL as above; used by server code |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | Same key as above; used by server code |
| `PUBLIC_SUPABASE_URL` | Optional | Alias used by some tooling |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Legacy alias for the publishable key |

For production deploys, put the same values in `.dev.vars` on the machine that runs `npm run deploy`. Wrangler reads `.dev.vars` during build and preview.

> **Important:** Do not commit `.dev.vars` or `.env.local`. They are gitignored. Never put secret keys (service role) in `NEXT_PUBLIC_*` variables.

Optional for local preview only:

```
NEXTJS_ENV=development
```

## Deploy from `main`

Run these steps whenever you want to ship what is currently on `main`.

### 1. Pull the latest code

```bash
git checkout main
git pull origin main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run tests (recommended)

```bash
npm test
```

### 4. Apply any new Supabase migrations

If new files were added under `supabase/migrations/` since the last deploy, apply them before deploying the app (see [Apply database migrations](#apply-database-migrations) above).

### 5. Deploy to Cloudflare

```bash
npm run deploy
```

This runs:

1. `opennextjs-cloudflare build` — builds Next.js and adapts output for Workers
2. `opennextjs-cloudflare deploy` — publishes the Worker and static assets

On success, Wrangler prints the deployed Worker URL.

### 6. Verify the deployment

1. Open the Worker URL in a browser.
2. Confirm the login page loads at `/login`.
3. Sign in with a Supabase user and confirm the app loads.
4. Optional: hit the health endpoint at `/api/health/supabase` to confirm Supabase connectivity.

### 7. Attach a custom domain (optional)

In the [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **lyric-lens** → **Settings** → **Domains & Routes**, add your custom domain.

Update Supabase **Site URL** and **Redirect URLs** to match the custom domain.

## Preview before deploying

To test the production build locally in the Workers runtime:

```bash
npm run preview
```

Ensure `.dev.vars` is configured first. This uses the same OpenNext build as deploy, but serves it locally via Wrangler.

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Next.js dev server (Node.js, not Workers runtime) |
| `npm run preview` | Build + local Workers preview |
| `npm run deploy` | Build + deploy to Cloudflare |
| `npm run upload` | Build + upload a new Worker version without full deploy flow |
| `npx wrangler tail` | Stream live Worker logs |
| `npm run cf-typegen` | Regenerate Cloudflare binding types |

## Troubleshooting

### Build fails with missing env vars

Ensure `.dev.vars` exists and includes all required Supabase variables before running `npm run deploy`.

### Login redirect loop or auth errors

- Confirm Supabase **Site URL** and **Redirect URLs** include your deployed Worker URL (or custom domain).
- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` match the production Supabase project.

### R2 / cache errors on deploy

Create the bucket if it is missing:

```bash
npx wrangler r2 bucket create lyric-lens-opennext-cache
```

### Database permission errors

Re-run migrations in order and confirm RLS policies from `20260523000000_lyric_lens_rls_and_flow_sections.sql` are applied.

### Storage upload failures

Confirm `20260531100000_welcome_slides_storage.sql` ran successfully and the `welcome-slides` bucket exists in Supabase Storage.

## Related files

- `wrangler.jsonc` — Worker name, R2 cache binding, compatibility flags
- `open-next.config.ts` — OpenNext Cloudflare adapter config
- `.env.example` — Template for required environment variables
- `supabase/migrations/` — Database and storage schema changes
