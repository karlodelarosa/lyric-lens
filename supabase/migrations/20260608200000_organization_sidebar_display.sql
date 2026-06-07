alter table public.organizations
  add column if not exists show_org_name_in_sidebar boolean not null default true;
