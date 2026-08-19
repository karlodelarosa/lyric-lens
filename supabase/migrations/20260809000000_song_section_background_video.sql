-- Per-section background video override. When set, this section's own video
-- takes precedence over the song-level background_video_url during live
-- presentation (resolution order: section -> song -> black).
alter table public.song_sections
  add column if not exists background_video_url text;
