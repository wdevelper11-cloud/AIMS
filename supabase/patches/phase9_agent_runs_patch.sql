-- Phase 9 alignment for existing Supabase Cloud projects.
-- Run once in the hosted SQL Editor. No rows are deleted or seeded.
begin;

create extension if not exists pgcrypto;

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  task text not null,
  output text,
  status text not null default 'success',
  risk_level text not null default 'medium',
  latency_ms integer default 0,
  cost_usd numeric default 0,
  created_at timestamptz default now()
);

alter table public.agent_runs
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists project_id uuid,
  add column if not exists agent_id uuid,
  add column if not exists task text,
  add column if not exists output text,
  add column if not exists status text default 'success',
  add column if not exists risk_level text default 'medium',
  add column if not exists latency_ms integer default 0,
  add column if not exists cost_usd numeric default 0,
  add column if not exists created_at timestamptz default now();

create table if not exists public.agent_run_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.agent_runs(id) on delete cascade,
  tool_id uuid references public.tools(id) on delete set null,
  step_order integer,
  input text,
  output text,
  status text not null default 'success',
  created_at timestamptz default now()
);

alter table public.agent_run_steps
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists run_id uuid,
  add column if not exists tool_id uuid,
  add column if not exists step_order integer,
  add column if not exists input text,
  add column if not exists output text,
  add column if not exists status text default 'success',
  add column if not exists created_at timestamptz default now();

-- Restore defaults and required fields after older nullable schemas are aligned.
update public.agent_runs set task = 'Legacy agent run' where task is null;
update public.agent_runs set status = 'success' where status is null;
update public.agent_runs set risk_level = 'medium' where risk_level is null;
update public.agent_runs set latency_ms = 0 where latency_ms is null;
update public.agent_runs set cost_usd = 0 where cost_usd is null;
update public.agent_run_steps set status = 'success' where status is null;

alter table public.agent_runs
  alter column id set default gen_random_uuid(),
  alter column task set not null,
  alter column status set default 'success',
  alter column status set not null,
  alter column risk_level set default 'medium',
  alter column risk_level set not null,
  alter column latency_ms set default 0,
  alter column cost_usd set default 0,
  alter column created_at set default now();

alter table public.agent_run_steps
  alter column id set default gen_random_uuid(),
  alter column status set default 'success',
  alter column status set not null,
  alter column created_at set default now();

-- Add missing primary keys, foreign keys, and canonical checks without removing rows.
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_runs'::regclass and contype = 'p') then
    alter table public.agent_runs add constraint agent_runs_pkey primary key (id);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_runs'::regclass and conname = 'agent_runs_project_id_fkey') then
    alter table public.agent_runs add constraint agent_runs_project_id_fkey foreign key (project_id) references public.projects(id) on delete cascade not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_runs'::regclass and conname = 'agent_runs_agent_id_fkey') then
    alter table public.agent_runs add constraint agent_runs_agent_id_fkey foreign key (agent_id) references public.agents(id) on delete set null not valid;
  end if;
  alter table public.agent_runs drop constraint if exists agent_runs_status_check;
  alter table public.agent_runs add constraint agent_runs_status_check check (status in ('success', 'failed', 'needs_review')) not valid;
  alter table public.agent_runs drop constraint if exists agent_runs_risk_level_check;
  alter table public.agent_runs add constraint agent_runs_risk_level_check check (risk_level in ('low', 'medium', 'high')) not valid;
  alter table public.agent_runs drop constraint if exists agent_runs_latency_ms_check;
  alter table public.agent_runs add constraint agent_runs_latency_ms_check check (latency_ms >= 0) not valid;
  alter table public.agent_runs drop constraint if exists agent_runs_cost_usd_check;
  alter table public.agent_runs add constraint agent_runs_cost_usd_check check (cost_usd >= 0) not valid;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_run_steps'::regclass and contype = 'p') then
    alter table public.agent_run_steps add constraint agent_run_steps_pkey primary key (id);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_run_steps'::regclass and conname = 'agent_run_steps_run_id_fkey') then
    alter table public.agent_run_steps add constraint agent_run_steps_run_id_fkey foreign key (run_id) references public.agent_runs(id) on delete cascade not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_run_steps'::regclass and conname = 'agent_run_steps_tool_id_fkey') then
    alter table public.agent_run_steps add constraint agent_run_steps_tool_id_fkey foreign key (tool_id) references public.tools(id) on delete set null not valid;
  end if;
  alter table public.agent_run_steps drop constraint if exists agent_run_steps_status_check;
  alter table public.agent_run_steps add constraint agent_run_steps_status_check check (status in ('success', 'failed', 'needs_review')) not valid;
end $$;

create index if not exists agent_runs_project_id_idx on public.agent_runs(project_id);
create index if not exists agent_runs_agent_id_idx on public.agent_runs(agent_id);
create index if not exists agent_run_steps_run_id_idx on public.agent_run_steps(run_id);
create index if not exists agent_run_steps_tool_id_idx on public.agent_run_steps(tool_id);

alter table public.agent_runs enable row level security;
alter table public.agent_run_steps enable row level security;

-- Install strict authenticated-owner policies only when each named policy is absent.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agent_runs' and policyname = 'agent_runs_select_owned_project') then
    create policy "agent_runs_select_owned_project" on public.agent_runs for select to authenticated
      using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agent_runs' and policyname = 'agent_runs_insert_owned_project') then
    create policy "agent_runs_insert_owned_project" on public.agent_runs for insert to authenticated
      with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agent_runs' and policyname = 'agent_runs_update_owned_project') then
    create policy "agent_runs_update_owned_project" on public.agent_runs for update to authenticated
      using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())))
      with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agent_runs' and policyname = 'agent_runs_delete_owned_project') then
    create policy "agent_runs_delete_owned_project" on public.agent_runs for delete to authenticated
      using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agent_run_steps' and policyname = 'agent_run_steps_select_owned_run') then
    create policy "agent_run_steps_select_owned_run" on public.agent_run_steps for select to authenticated
      using (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id where r.id = run_id and p.owner_id = (select auth.uid())));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agent_run_steps' and policyname = 'agent_run_steps_insert_owned_run') then
    create policy "agent_run_steps_insert_owned_run" on public.agent_run_steps for insert to authenticated
      with check (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id where r.id = run_id and p.owner_id = (select auth.uid())));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agent_run_steps' and policyname = 'agent_run_steps_update_owned_run') then
    create policy "agent_run_steps_update_owned_run" on public.agent_run_steps for update to authenticated
      using (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id where r.id = run_id and p.owner_id = (select auth.uid())))
      with check (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id where r.id = run_id and p.owner_id = (select auth.uid())));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agent_run_steps' and policyname = 'agent_run_steps_delete_owned_run') then
    create policy "agent_run_steps_delete_owned_run" on public.agent_run_steps for delete to authenticated
      using (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id where r.id = run_id and p.owner_id = (select auth.uid())));
  end if;
end $$;

commit;

-- Verification (run separately after the patch):
-- select column_name, data_type, column_default, is_nullable from information_schema.columns
--   where table_schema = 'public' and table_name in ('agent_runs', 'agent_run_steps') order by table_name, ordinal_position;
-- select indexname from pg_indexes where schemaname = 'public' and tablename in ('agent_runs', 'agent_run_steps') order by indexname;
-- select tablename, policyname, roles, cmd from pg_policies
--   where schemaname = 'public' and tablename in ('agent_runs', 'agent_run_steps') order by tablename, policyname;
