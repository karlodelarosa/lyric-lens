-- Announcement slide decks (ordered image/video slides stored in welcome-slides bucket)
alter table public.announcements
  add column if not exists slides jsonb not null default '[]'::jsonb;

comment on column public.announcements.slides is
  'Ordered slide deck: [{ "url": "https://...", "type": "image" | "video" }]';
