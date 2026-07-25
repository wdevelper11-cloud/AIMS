-- AIMS Phase 5 default-workspace repair for an existing Supabase Cloud project.
-- This patch preserves every project row and may be run more than once.

-- Keep older Phase 5 profile schemas aligned as part of this standalone patch.
alter table public.profiles
  add column if not exists full_name text;
alter table public.profiles
  add column if not exists role text default 'student';
alter table public.profiles
  add column if not exists created_at timestamptz default now();

alter table public.projects
  add column if not exists is_default boolean not null default true;

-- Keep the earliest project for each owner as the canonical default. Preserve
-- all other rows, including their names and descriptions, as non-default rows.
with ranked_projects as (
  select
    id,
    owner_id,
    row_number() over (
      partition by owner_id
      order by created_at asc nulls last, id asc
    ) as row_number
  from public.projects
  where owner_id is not null
)
update public.projects as project
set
  is_default = ranked.row_number = 1,
  name = case
    when ranked.row_number = 1 then 'AIMS Workspace'
    else project.name
  end,
  description = case
    when ranked.row_number = 1 then 'Default AI agent operations workspace'
    else project.description
  end
from ranked_projects as ranked
where project.id = ranked.id;

create unique index if not exists projects_one_default_per_owner_idx
  on public.projects(owner_id)
  where is_default = true;

create index if not exists projects_owner_default_idx
  on public.projects(owner_id, is_default);

-- Keep authorization active. Existing owner-only policies are preserved.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
