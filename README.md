# Lyric Lens (Next.js App Router)

Worship platform prototype running on **Next.js App Router** with the main UI in `src/app/`.

## Setup

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`

## App Router Entry Point

- Root layout: `app/layout.tsx`
- Main app page: `app/page.tsx`
- Login page: `app/login/page.tsx`

`app/page.tsx` mounts your existing React app (`src/app/App.tsx`) as a client component.

## Database migrations

SQL migrations live in `supabase/migrations/`. Apply them to your Supabase project (SQL editor or `supabase db push`) before using organization RLS and setlist flow sections.

## Tests

```bash
npm test
```
