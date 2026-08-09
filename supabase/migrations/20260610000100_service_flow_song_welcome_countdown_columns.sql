-- Columns backing the new song / welcome / countdown segment kinds.
alter table public.service_flow_segments
  add column if not exists song_id uuid references public.songs (id) on delete set null;

alter table public.service_flow_segments
  add column if not exists welcome_media jsonb;

alter table public.service_flow_segments
  add column if not exists countdown_seconds integer;

alter table public.service_flow_segments
  drop constraint if exists service_flow_segments_song_only_for_song;

alter table public.service_flow_segments
  add constraint service_flow_segments_song_only_for_song check (
    song_id is null or kind = 'song'
  );

alter table public.service_flow_segments
  drop constraint if exists service_flow_segments_welcome_media_only_for_welcome;

alter table public.service_flow_segments
  add constraint service_flow_segments_welcome_media_only_for_welcome check (
    welcome_media is null or kind = 'welcome'
  );

alter table public.service_flow_segments
  drop constraint if exists service_flow_segments_countdown_seconds_only_for_countdown;

alter table public.service_flow_segments
  add constraint service_flow_segments_countdown_seconds_only_for_countdown check (
    countdown_seconds is null or kind = 'countdown'
  );

alter table public.service_flow_segments
  drop constraint if exists service_flow_segments_countdown_seconds_range;

alter table public.service_flow_segments
  add constraint service_flow_segments_countdown_seconds_range check (
    countdown_seconds is null or (countdown_seconds > 0 and countdown_seconds <= 21600)
  );

create index if not exists service_flow_segments_song_id_idx
  on public.service_flow_segments (song_id);
