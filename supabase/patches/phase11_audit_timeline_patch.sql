-- Phase 11 alignment for the read-only, derived operational audit timeline.
-- No audit_events table is created; no rows are deleted or seeded.
begin;

alter table public.agents
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists project_id uuid,
  add column if not exists name text,
  add column if not exists role text,
  add column if not exists status text default 'active',
  add column if not exists risk_level text default 'medium',
  add column if not exists created_at timestamptz default now();

alter table public.tools
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists project_id uuid,
  add column if not exists name text,
  add column if not exists category text,
  add column if not exists is_approved boolean default true,
  add column if not exists risk_level text default 'medium',
  add column if not exists created_at timestamptz default now();

alter table public.knowledge_sources
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists project_id uuid,
  add column if not exists title text,
  add column if not exists source_type text default 'website',
  add column if not exists status text default 'active',
  add column if not exists created_at timestamptz default now();

alter table public.agent_runs
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists project_id uuid,
  add column if not exists agent_id uuid,
  add column if not exists task text,
  add column if not exists status text default 'success',
  add column if not exists risk_level text default 'medium',
  add column if not exists latency_ms integer default 0,
  add column if not exists cost_usd numeric default 0,
  add column if not exists created_at timestamptz default now();

alter table public.agent_run_steps
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists project_id uuid,
  add column if not exists run_id uuid,
  add column if not exists tool_id uuid,
  add column if not exists step_order integer default 1,
  add column if not exists status text default 'success',
  add column if not exists created_at timestamptz default now();

update public.agents set name = 'Legacy agent' where name is null;
update public.agents set role = 'Legacy role' where role is null;
update public.agents set status = 'active' where status is null;
update public.agents set risk_level = 'medium' where risk_level is null;
update public.agents set created_at = now() where created_at is null;
update public.tools set name = 'Legacy tool' where name is null;
update public.tools set is_approved = true where is_approved is null;
update public.tools set risk_level = 'medium' where risk_level is null;
update public.tools set created_at = now() where created_at is null;
update public.knowledge_sources set title = 'Legacy knowledge source' where title is null;
update public.knowledge_sources set source_type = 'website' where source_type is null;
update public.knowledge_sources set status = 'active' where status is null;
update public.knowledge_sources set created_at = now() where created_at is null;
update public.agent_runs set task = 'Legacy agent run' where task is null;
update public.agent_runs set status = 'success' where status is null;
update public.agent_runs set risk_level = 'medium' where risk_level is null;
update public.agent_runs set latency_ms = 0 where latency_ms is null;
update public.agent_runs set cost_usd = 0 where cost_usd is null;
update public.agent_runs set created_at = now() where created_at is null;
update public.agent_run_steps set step_order = 1 where step_order is null;
update public.agent_run_steps set status = 'success' where status is null;
update public.agent_run_steps set created_at = now() where created_at is null;
update public.agent_run_steps s set project_id = r.project_id
from public.agent_runs r where s.run_id = r.id and s.project_id is null;

alter table public.agents alter column status set default 'active', alter column risk_level set default 'medium', alter column created_at set default now();
alter table public.tools alter column is_approved set default true, alter column risk_level set default 'medium', alter column created_at set default now();
alter table public.knowledge_sources alter column source_type set default 'website', alter column status set default 'active', alter column created_at set default now();
alter table public.agent_runs alter column status set default 'success', alter column risk_level set default 'medium', alter column latency_ms set default 0, alter column cost_usd set default 0, alter column created_at set default now();
alter table public.agent_run_steps alter column step_order set default 1, alter column status set default 'success', alter column created_at set default now();

create index if not exists agents_project_id_idx on public.agents(project_id);
create index if not exists tools_project_id_idx on public.tools(project_id);
create index if not exists knowledge_sources_project_id_idx on public.knowledge_sources(project_id);
create index if not exists agent_runs_project_id_idx on public.agent_runs(project_id);
create index if not exists agent_runs_agent_id_idx on public.agent_runs(agent_id);
create index if not exists agent_run_steps_project_id_idx on public.agent_run_steps(project_id);
create index if not exists agent_run_steps_run_id_idx on public.agent_run_steps(run_id);
create index if not exists agent_run_steps_tool_id_idx on public.agent_run_steps(tool_id);
create index if not exists agents_project_created_at_idx on public.agents(project_id, created_at desc);
create index if not exists tools_project_created_at_idx on public.tools(project_id, created_at desc);
create index if not exists knowledge_sources_project_created_at_idx on public.knowledge_sources(project_id, created_at desc);
create index if not exists agent_runs_project_created_at_idx on public.agent_runs(project_id, created_at desc);
create index if not exists agent_run_steps_project_created_at_idx on public.agent_run_steps(project_id, created_at desc);

alter table public.agents enable row level security;
alter table public.tools enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_run_steps enable row level security;

commit;

-- Timeline verification (replace <PROJECT_ID>):
-- select id, name, created_at from public.agents where project_id = '<PROJECT_ID>' order by created_at desc;
-- select id, task, status, risk_level, created_at from public.agent_runs where project_id = '<PROJECT_ID>' order by created_at desc;
-- select id, run_id, tool_id, step_order, status, created_at from public.agent_run_steps where project_id = '<PROJECT_ID>' order by created_at desc;
-- select indexname from pg_indexes where schemaname = 'public' and indexname like '%project_created_at_idx' order by indexname;
