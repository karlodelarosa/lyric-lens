-- Organization branding: theme preset + logo
alter table public.organizations
  add column if not exists theme_preset text not null default 'purple',
  add column if not exists logo_url text;

alter table public.organizations
  drop constraint if exists organizations_theme_preset_check;

alter table public.organizations
  add constraint organizations_theme_preset_check
  check (
    theme_preset in ('purple', 'blue', 'emerald', 'rose', 'amber', 'slate')
  );

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
  );
$$;

drop policy if exists "organizations_update_admin" on public.organizations;
create policy "organizations_update_admin"
  on public.organizations for update
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id));

-- Organization logo bucket (images only, max 2 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'org-branding',
  'org-branding',
  true,
  2097152,
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "org_branding_select_org_member" on storage.objects;
create policy "org_branding_select_org_member"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'org-branding'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "org_branding_insert_admin" on storage.objects;
create policy "org_branding_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'org-branding'
    and public.is_org_admin(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "org_branding_update_admin" on storage.objects;
create policy "org_branding_update_admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'org-branding'
    and public.is_org_admin(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'org-branding'
    and public.is_org_admin(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "org_branding_delete_admin" on storage.objects;
create policy "org_branding_delete_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'org-branding'
    and public.is_org_admin(((storage.foldername(name))[1])::uuid)
  );
