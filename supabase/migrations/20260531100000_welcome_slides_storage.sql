-- Welcome slide media bucket (images + videos, max 20 MB per file)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'welcome-slides',
  'welcome-slides',
  true,
  20971520,
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "welcome_slides_select_org_member" on storage.objects;
create policy "welcome_slides_select_org_member"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'welcome-slides'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "welcome_slides_insert_org_member" on storage.objects;
create policy "welcome_slides_insert_org_member"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'welcome-slides'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "welcome_slides_update_org_member" on storage.objects;
create policy "welcome_slides_update_org_member"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'welcome-slides'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'welcome-slides'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "welcome_slides_delete_org_member" on storage.objects;
create policy "welcome_slides_delete_org_member"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'welcome-slides'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );
