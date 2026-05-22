-- Lyric Lens schema additions and RLS policies
-- Apply with: supabase db push (or run in Supabase SQL editor)

alter table public.setlists
  add column if not exists flow_sections jsonb not null default '[]'::jsonb;

-- Organizations: members can read orgs they belong to
alter table public.organizations enable row level security;

drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member"
  on public.organizations for select
  using (public.is_org_member(id));

drop policy if exists "organizations_insert_authenticated" on public.organizations;
create policy "organizations_insert_authenticated"
  on public.organizations for insert
  with check (auth.uid() = created_by);

-- Organization members
alter table public.organization_members enable row level security;

drop policy if exists "organization_members_select_member" on public.organization_members;
create policy "organization_members_select_member"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

drop policy if exists "organization_members_insert_admin" on public.organization_members;
create policy "organization_members_insert_admin"
  on public.organization_members for insert
  with check (
    public.is_org_member(organization_id)
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_members.organization_id
        and om.user_id = auth.uid()
        and om.role = 'admin'
    )
    or (
      user_id = auth.uid()
      and role = 'admin'
      and not exists (
        select 1 from public.organization_members existing
        where existing.organization_id = organization_members.organization_id
          and existing.user_id = auth.uid()
      )
    )
  );

-- Songs (org-scoped)
alter table public.songs enable row level security;

drop policy if exists "songs_org_member_all" on public.songs;
create policy "songs_org_member_all"
  on public.songs for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Setlists
alter table public.setlists enable row level security;

drop policy if exists "setlists_org_member_all" on public.setlists;
create policy "setlists_org_member_all"
  on public.setlists for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Events
alter table public.events enable row level security;

drop policy if exists "events_org_member_all" on public.events;
create policy "events_org_member_all"
  on public.events for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
