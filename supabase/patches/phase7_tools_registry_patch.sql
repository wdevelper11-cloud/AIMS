-- AIMS Phase 7 repair for an existing Supabase Cloud project.
-- Run once in the Supabase SQL Editor. This patch only adds/aligns Tool Registry
-- columns, defaults, a controlled-value constraint, an index, and RLS enablement.

alter table public.tools
add column if not exists is_approved boolean default true;

alter table public.tools
add column if not exists category text;

alter table public.tools
add column if not exists risk_level text not null default 'medium';

alter table public.tools
add column if not exists created_at timestamptz default now();

-- Preserve existing rows while normalizing values that predate Phase 7 defaults.
update public.tools
set is_approved = true
where is_approved is null;

update public.tools
set risk_level = 'medium'
where risk_level is null;

alter table public.tools
alter column is_approved set default true;

alter table public.tools
alter column risk_level set default 'medium';

alter table public.tools
alter column risk_level set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tools_risk_level_check'
      and conrelid = 'public.tools'::regclass
  ) then
    alter table public.tools
      add constraint tools_risk_level_check
      check (risk_level in ('low', 'medium', 'high'));
  end if;
end
$$;

create index if not exists tools_project_id_idx
on public.tools(project_id);

alter table public.tools
enable row level security;
