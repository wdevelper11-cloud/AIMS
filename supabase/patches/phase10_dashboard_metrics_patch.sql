-- Phase 10 alignment for live, project-scoped dashboard metrics.
-- Run in the hosted Supabase Cloud SQL Editor. No rows are deleted or seeded.
begin;

alter table public.agents
  add column if not exists project_id uuid,
  add column if not exists status text default 'active',
  add column if not exists risk_level text default 'medium',
  add column if not exists created_at timestamptz default now();

alter table public.tools
  add column if not exists project_id uuid,
  add column if not exists is_approved boolean default true,
  add column if not exists risk_level text default 'medium',
  add column if not exists created_at timestamptz default now();

alter table public.knowledge_sources
  add column if not exists project_id uuid,
  add column if not exists status text default 'active',
  add column if not exists created_at timestamptz default now();

alter table public.agent_runs
  add column if not exists project_id uuid,
  add column if not exists agent_id uuid,
  add column if not exists status text default 'success',
  add column if not exists risk_level text default 'medium',
  add column if not exists latency_ms integer default 0,
  add column if not exists cost_usd numeric default 0,
  add column if not exists created_at timestamptz default now();

update public.agents set status = 'active' where status is null;
update public.agents set risk_level = 'medium' where risk_level is null;
update public.agents set created_at = now() where created_at is null;
update public.tools set is_approved = true where is_approved is null;
update public.tools set risk_level = 'medium' where risk_level is null;
update public.tools set created_at = now() where created_at is null;
update public.knowledge_sources set status = 'active' where status is null;
update public.knowledge_sources set created_at = now() where created_at is null;
update public.agent_runs set status = 'success' where status is null;
update public.agent_runs set risk_level = 'medium' where risk_level is null;
update public.agent_runs set latency_ms = 0 where latency_ms is null;
update public.agent_runs set cost_usd = 0 where cost_usd is null;
update public.agent_runs set created_at = now() where created_at is null;

alter table public.agents
  alter column status set default 'active',
  alter column risk_level set default 'medium',
  alter column created_at set default now();
alter table public.tools
  alter column is_approved set default true,
  alter column risk_level set default 'medium',
  alter column created_at set default now();
alter table public.knowledge_sources
  alter column status set default 'active',
  alter column created_at set default now();
alter table public.agent_runs
  alter column status set default 'success',
  alter column risk_level set default 'medium',
  alter column latency_ms set default 0,
  alter column cost_usd set default 0,
  alter column created_at set default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.agents'::regclass and conname = 'agents_status_check') then
    alter table public.agents add constraint agents_status_check check (status in ('active', 'paused', 'archived')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.agents'::regclass and conname = 'agents_risk_level_check') then
    alter table public.agents add constraint agents_risk_level_check check (risk_level in ('low', 'medium', 'high')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.tools'::regclass and conname = 'tools_risk_level_check') then
    alter table public.tools add constraint tools_risk_level_check check (risk_level in ('low', 'medium', 'high')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.knowledge_sources'::regclass and conname = 'knowledge_sources_status_check') then
    alter table public.knowledge_sources add constraint knowledge_sources_status_check check (status in ('active', 'inactive')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_runs'::regclass and conname = 'agent_runs_status_check') then
    alter table public.agent_runs add constraint agent_runs_status_check check (status in ('success', 'failed', 'needs_review')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_runs'::regclass and conname = 'agent_runs_risk_level_check') then
    alter table public.agent_runs add constraint agent_runs_risk_level_check check (risk_level in ('low', 'medium', 'high')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_runs'::regclass and conname = 'agent_runs_latency_ms_check') then
    alter table public.agent_runs add constraint agent_runs_latency_ms_check check (latency_ms >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.agent_runs'::regclass and conname = 'agent_runs_cost_usd_check') then
    alter table public.agent_runs add constraint agent_runs_cost_usd_check check (cost_usd >= 0) not valid;
  end if;
end $$;

create index if not exists agents_project_id_idx on public.agents(project_id);
create index if not exists tools_project_id_idx on public.tools(project_id);
create index if not exists knowledge_sources_project_id_idx on public.knowledge_sources(project_id);
create index if not exists agent_runs_project_id_idx on public.agent_runs(project_id);
create index if not exists agent_runs_agent_id_idx on public.agent_runs(agent_id);
create index if not exists agents_project_status_idx on public.agents(project_id, status);
create index if not exists agent_runs_project_status_idx on public.agent_runs(project_id, status);

alter table public.agents enable row level security;
alter table public.tools enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.agent_runs enable row level security;

commit;

-- Dashboard verification (replace <PROJECT_ID>):
-- select count(*) as total_agents,
--   count(*) filter (where status = 'active') as active_agents,
--   count(*) filter (where risk_level = 'high') as high_risk_agents
-- from public.agents where project_id = '<PROJECT_ID>';
--
-- select count(*) as total_runs,
--   count(*) filter (where status = 'failed') as failed_runs,
--   coalesce(round(avg(latency_ms)::numeric, 2), 0) as avg_latency_ms,
--   coalesce(sum(cost_usd), 0) as total_cost_usd
-- from public.agent_runs where project_id = '<PROJECT_ID>';
--
-- select count(*) as approved_tools from public.tools
-- where project_id = '<PROJECT_ID>' and is_approved = true;
--
-- select count(*) as knowledge_sources from public.knowledge_sources
-- where project_id = '<PROJECT_ID>';
