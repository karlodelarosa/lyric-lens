-- Per-song background video loop, plus optional per-section intensity override
-- (0-100; null means "use the default intensity for this section's type").
alter table public.songs
  add column if not exists background_video_url text;

alter table public.song_sections
  add column if not exists intensity smallint;

alter table public.song_sections
  drop constraint if exists song_sections_intensity_range;

alter table public.song_sections
  add constraint song_sections_intensity_range
  check (intensity is null or (intensity >= 0 and intensity <= 100));
