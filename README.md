# Lyric Lens (Next.js App Router + Supabase Boilerplate)

This project now runs on **Next.js App Router** and includes a baseline setup for **Supabase** in:

- Browser/client components
- Server components and route handlers
- Server-only admin usage

## Setup

1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `cp .env.example .env.local`
3. Fill in your Supabase values in `.env.local` (at minimum `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
4. Start dev server:
   - `npm run dev`

### Login fails with “Missing Supabase URL”

That means the dev server process does not see your env vars. Fix:

- Ensure the file is named **`.env.local`** in the **project root** (same folder as `package.json`), not only `.env.example`.
- Restart `npm run dev` after editing env files.
- For production (e.g. Vercel), add the same `NEXT_PUBLIC_*` variables in the host’s Environment Variables UI.

## App Router Entry Point

- Root layout: `app/layout.tsx`
- Main app page: `app/page.tsx`

`app/page.tsx` currently mounts your existing React app (`src/app/App.tsx`) as a client component, so you can migrate routes/features incrementally.

## Supabase Usage Patterns

### 1) Browser/Client component

- Utility: `lib/supabase/client.ts`
- Example page: `app/supabase-client-example/page.tsx`

Use this when querying from client-side UI interactions.

### 2) Server component or route handler

- Utility: `lib/supabase/server.ts`
- Example server page: `app/supabase-example/page.tsx`
- Example API route: `app/api/songs/route.ts`

Use this for SSR queries and internal API routes with cookie-aware auth context.

### 3) Admin/server-only operations

- Utility: `lib/supabase/admin.ts`

Use this only for trusted server contexts (never expose service role key to browser code).

## Example Endpoints and Pages

- `GET /api/songs` - queries top 20 songs from Supabase
- `/supabase-example` - server component query demo
- `/supabase-client-example` - browser query demo
