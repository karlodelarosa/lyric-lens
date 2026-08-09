-- New service flow segment kinds: single song, welcome media, countdown timer.
alter type public.service_flow_segment_kind add value if not exists 'song';
alter type public.service_flow_segment_kind add value if not exists 'welcome';
alter type public.service_flow_segment_kind add value if not exists 'countdown';
