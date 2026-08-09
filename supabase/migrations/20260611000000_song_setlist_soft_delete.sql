-- Soft delete for songs and setlists so deletions are recoverable from a Trash view.
alter table public.songs
  add column if not exists deleted_at timestamptz;

alter table public.setlists
  add column if not exists deleted_at timestamptz;

create index if not exists songs_org_deleted_at_idx
  on public.songs (organization_id, deleted_at);

create index if not exists setlists_org_deleted_at_idx
  on public.setlists (organization_id, deleted_at);
