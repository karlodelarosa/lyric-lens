-- Service flows, announcement bank, and segment announcements

create type public.service_flow_segment_kind as enum (
  'music',
  'announcements',
  'cue'
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  body text not null default '',
  category text,
  expires_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_flows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_flow_segments (
  id uuid primary key default gen_random_uuid(),
  service_flow_id uuid not null references public.service_flows (id) on delete cascade,
  position integer not null default 0,
  label text not null,
  kind public.service_flow_segment_kind not null default 'cue',
  notes text,
  setlist_id uuid references public.setlists (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_flow_segments_setlist_only_for_music check (
    setlist_id is null or kind = 'music'
  )
);

create table public.service_flow_segment_announcements (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null references public.service_flow_segments (id) on delete cascade,
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  position integer not null default 0,
  unique (segment_id, announcement_id)
);

create index announcements_organization_id_idx on public.announcements (organization_id);
create index service_flows_organization_id_idx on public.service_flows (organization_id);
create index service_flow_segments_service_flow_id_idx on public.service_flow_segments (service_flow_id);
create index service_flow_segment_announcements_segment_id_idx
  on public.service_flow_segment_announcements (segment_id);

alter table public.announcements enable row level security;
alter table public.service_flows enable row level security;
alter table public.service_flow_segments enable row level security;
alter table public.service_flow_segment_announcements enable row level security;

drop policy if exists "announcements_org_member_all" on public.announcements;
create policy "announcements_org_member_all"
  on public.announcements for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists "service_flows_org_member_all" on public.service_flows;
create policy "service_flows_org_member_all"
  on public.service_flows for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists "service_flow_segments_org_member_all" on public.service_flow_segments;
create policy "service_flow_segments_org_member_all"
  on public.service_flow_segments for all
  using (
    exists (
      select 1 from public.service_flows sf
      where sf.id = service_flow_segments.service_flow_id
        and public.is_org_member(sf.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.service_flows sf
      where sf.id = service_flow_segments.service_flow_id
        and public.is_org_member(sf.organization_id)
    )
  );

drop policy if exists "service_flow_segment_announcements_org_member_all"
  on public.service_flow_segment_announcements;
create policy "service_flow_segment_announcements_org_member_all"
  on public.service_flow_segment_announcements for all
  using (
    exists (
      select 1
      from public.service_flow_segments sfs
      join public.service_flows sf on sf.id = sfs.service_flow_id
      where sfs.id = service_flow_segment_announcements.segment_id
        and public.is_org_member(sf.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.service_flow_segments sfs
      join public.service_flows sf on sf.id = sfs.service_flow_id
      where sfs.id = service_flow_segment_announcements.segment_id
        and public.is_org_member(sf.organization_id)
    )
  );
