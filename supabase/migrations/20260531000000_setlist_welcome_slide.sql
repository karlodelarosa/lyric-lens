-- Per-setlist welcome slide (image or video URL shown instead of lyrics)
alter table public.setlists
  add column if not exists welcome_slide jsonb;

comment on column public.setlists.welcome_slide is
  'Optional welcome slide: { "url": "https://...", "type": "image" | "video" }';
