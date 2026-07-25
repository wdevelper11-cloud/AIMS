-- AIMS Phase 3 schema
-- Run this file in the SQL Editor of a new Supabase Cloud project.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'student',
  created_at timestamptz default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_default boolean not null default true,
  created_at timestamptz default now()
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  role text not null,
  model text not null default 'gpt-4.1-mini',
  status text not null default 'active'
    constraint agents_status_check check (status in ('active', 'paused', 'archived')),
  risk_level text not null default 'medium'
    constraint agents_risk_level_check check (risk_level in ('low', 'medium', 'high')),
  description text,
  created_at timestamptz default now()
);

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  category text,
  is_approved boolean default true,
  risk_level text not null default 'medium'
    constraint tools_risk_level_check check (risk_level in ('low', 'medium', 'high')),
  created_at timestamptz default now()
);

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  source_type text,
  url text,
  status text not null default 'active'
    constraint knowledge_sources_status_check check (status in ('active', 'inactive')),
  created_at timestamptz default now()
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  task text not null,
  output text,
  status text not null default 'success'
    constraint agent_runs_status_check check (status in ('success', 'failed', 'needs_review')),
  latency_ms integer default 0,
  cost_usd numeric default 0,
  created_at timestamptz default now()
);

create table public.agent_run_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.agent_runs(id) on delete cascade,
  tool_id uuid references public.tools(id) on delete set null,
  step_order integer,
  input text,
  output text,
  status text not null default 'success'
    constraint agent_run_steps_status_check check (status in ('success', 'failed', 'needs_review')),
  created_at timestamptz default now()
);

-- PostgreSQL does not automatically index referencing foreign-key columns.
create index projects_owner_id_idx on public.projects(owner_id);
create unique index projects_one_default_per_owner_idx on public.projects(owner_id)
  where is_default = true;
create index projects_owner_default_idx on public.projects(owner_id, is_default);
create index agents_project_id_idx on public.agents(project_id);
create index tools_project_id_idx on public.tools(project_id);
create index knowledge_sources_project_id_idx on public.knowledge_sources(project_id);
create index agent_runs_project_id_idx on public.agent_runs(project_id);
create index agent_runs_agent_id_idx on public.agent_runs(agent_id);
create index agent_run_steps_run_id_idx on public.agent_run_steps(run_id);
create index agent_run_steps_tool_id_idx on public.agent_run_steps(tool_id);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.agents enable row level security;
alter table public.tools enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_run_steps enable row level security;

-- A profile is visible and writable only by its matching authenticated user.
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using (id = (select auth.uid()));

-- Project access is determined directly by the authenticated owner.
create policy "projects_select_own" on public.projects
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "projects_insert_own" on public.projects
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "projects_update_own" on public.projects
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "projects_delete_own" on public.projects
  for delete to authenticated using (owner_id = (select auth.uid()));

-- Direct project children use the same readable ownership test for every action.
create policy "agents_select_owned_project" on public.agents for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "agents_insert_owned_project" on public.agents for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "agents_update_owned_project" on public.agents for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "agents_delete_owned_project" on public.agents for delete to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));

create policy "tools_select_owned_project" on public.tools for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "tools_insert_owned_project" on public.tools for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "tools_update_owned_project" on public.tools for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "tools_delete_owned_project" on public.tools for delete to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));

create policy "knowledge_sources_select_owned_project" on public.knowledge_sources for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "knowledge_sources_insert_owned_project" on public.knowledge_sources for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "knowledge_sources_update_owned_project" on public.knowledge_sources for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "knowledge_sources_delete_owned_project" on public.knowledge_sources for delete to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));

create policy "agent_runs_select_owned_project" on public.agent_runs for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "agent_runs_insert_owned_project" on public.agent_runs for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "agent_runs_update_owned_project" on public.agent_runs for update to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "agent_runs_delete_owned_project" on public.agent_runs for delete to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));

-- Step ownership is derived through its run and that run's project.
create policy "agent_run_steps_select_owned_run" on public.agent_run_steps for select to authenticated
  using (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id
    where r.id = run_id and p.owner_id = (select auth.uid())));
create policy "agent_run_steps_insert_owned_run" on public.agent_run_steps for insert to authenticated
  with check (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id
    where r.id = run_id and p.owner_id = (select auth.uid())));
create policy "agent_run_steps_update_owned_run" on public.agent_run_steps for update to authenticated
  using (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id
    where r.id = run_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id
    where r.id = run_id and p.owner_id = (select auth.uid())));
create policy "agent_run_steps_delete_owned_run" on public.agent_run_steps for delete to authenticated
  using (exists (select 1 from public.agent_runs r join public.projects p on p.id = r.project_id
    where r.id = run_id and p.owner_id = (select auth.uid())));

-- Seed data is intentionally omitted. Create test rows while authenticated so RLS
-- can associate them with a real auth.users ID.
