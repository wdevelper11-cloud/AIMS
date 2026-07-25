# AIMS Database Schema

## Design principles

- Supabase Cloud Postgres is the only database.
- Supabase Auth owns credentials; `profiles` stores application-visible identity data.
- Every operational record belongs to a project.
- RLS enforces ownership independently of the frontend.
- Run records preserve historical latency, cost, output, status, and risk.
- Demo records are inserted only through an ownership-checked function.

## Tables and columns

### `profiles`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` PK/FK | Matches `auth.users.id` |
| `email` | `text` | Display email |
| `full_name` | `text` nullable | User display name |
| `created_at` | `timestamptz` | Creation time |
| `updated_at` | `timestamptz` | Last update |

### `projects`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` PK | Workspace ID |
| `owner_id` | `uuid` FK | Owning authenticated user |
| `name` | `text` | Workspace name |
| `is_default` | `boolean` | Marks the default project |
| `created_at`, `updated_at` | `timestamptz` | Audit timestamps |

### `agents`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` PK | Agent ID |
| `project_id` | `uuid` FK | Project owner boundary |
| `name` | `text` | Agent name |
| `role` | `text` | Business responsibility |
| `model` | `text` | Configured model label |
| `status` | `text` | `active`, `inactive`, or `paused` |
| `risk_level` | `text` | `low`, `medium`, or `high` |
| `description` | `text` | Short operating description |
| `created_at`, `updated_at` | `timestamptz` | Audit timestamps |

### `tools`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` PK | Tool ID |
| `project_id` | `uuid` FK | Project owner boundary |
| `name` | `text` | Tool name |
| `category` | `text` | Tool category |
| `approval_status` | `text` | `approved`, `unapproved`, or `needs_review` |
| `risk_level` | `text` | `low`, `medium`, or `high` |
| `created_at`, `updated_at` | `timestamptz` | Audit timestamps |

### `knowledge_sources`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` PK | Source ID |
| `project_id` | `uuid` FK | Project owner boundary |
| `title` | `text` | Source title |
| `source_type` | `text` | `website`, `document`, `database`, `api`, or `repository` |
| `url` | `text` | Source location; no ingestion occurs |
| `status` | `text` | `active`, `inactive`, or `sync_error` |
| `created_at`, `updated_at` | `timestamptz` | Audit timestamps |

### `agent_runs`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` PK | Run ID |
| `project_id` | `uuid` FK | Project owner boundary |
| `agent_id` | `uuid` FK | Executing agent in the same project |
| `task` | `text` | Requested task |
| `output` | `text` nullable | Result or failure summary |
| `status` | `text` | `success`, `failed`, or `needs_review` |
| `latency_ms` | `integer` | End-to-end latency |
| `estimated_cost_usd` | `numeric(12,6)` | Estimated—not billed—cost |
| `risk_level` | `text` | Risk snapshot at run time |
| `created_at`, `updated_at` | `timestamptz` | Audit timestamps |

### `agent_run_steps`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` PK | Step ID |
| `project_id` | `uuid` FK | Explicit RLS owner boundary |
| `run_id` | `uuid` FK | Parent run in the same project |
| `step_number` | `integer` | Display order |
| `name` | `text` | Step label |
| `tool_name` | `text` nullable | Tool label used during the step |
| `status` | `text` | `success`, `failed`, `needs_review`, or `skipped` |
| `input_summary` | `text` nullable | Safe input summary |
| `output_summary` | `text` nullable | Safe output summary |
| `latency_ms` | `integer` | Step latency |
| `created_at` | `timestamptz` | Event time |

## Relationships

- One Supabase Auth user has one profile and owns one or more projects.
- One default project is created automatically for each new user.
- One project has many agents, tools, knowledge sources, runs, and run steps.
- One agent has many runs.
- One run has many ordered steps.
- Composite foreign keys ensure an agent, run, and step cannot be linked across projects.

## RLS policy model

`profiles` compares its `id` directly with `auth.uid()`. `projects` compares `owner_id` with `auth.uid()`. Every child table passes its `project_id` to `owns_project()`, which checks the authenticated owner's project. Both `USING` and `WITH CHECK` are required: the first protects existing rows; the second protects inserted or updated values.

The service-role key bypasses RLS and is therefore not part of the application. Use only the public anon/publishable key and the user's session.

## Complete Supabase Cloud SQL

Run the following once in a new Supabase project's **SQL Editor**. It creates the schema, RLS policies, signup trigger, and an authenticated demo-seed function.

```sql
create extension if not exists pgcrypto;

-- Shared timestamp trigger.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index projects_one_default_per_owner
  on public.projects(owner_id)
  where is_default = true;

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  role text not null check (char_length(role) between 1 and 120),
  model text not null check (char_length(model) between 1 and 100),
  status text not null default 'inactive'
    check (status in ('active', 'inactive', 'paused')),
  risk_level text not null default 'low'
    check (risk_level in ('low', 'medium', 'high')),
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id)
);

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  category text not null check (char_length(category) between 1 and 80),
  approval_status text not null default 'unapproved'
    check (approval_status in ('approved', 'unapproved', 'needs_review')),
  risk_level text not null default 'low'
    check (risk_level in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  source_type text not null
    check (source_type in ('website', 'document', 'database', 'api', 'repository')),
  url text not null check (char_length(url) between 1 and 500),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'sync_error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  agent_id uuid not null,
  task text not null check (char_length(task) between 1 and 1000),
  output text,
  status text not null
    check (status in ('success', 'failed', 'needs_review')),
  latency_ms integer not null default 0 check (latency_ms >= 0),
  estimated_cost_usd numeric(12,6) not null default 0
    check (estimated_cost_usd >= 0),
  risk_level text not null
    check (risk_level in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id),
  constraint agent_runs_agent_same_project_fk
    foreign key (agent_id, project_id)
    references public.agents(id, project_id)
    on delete cascade
);

create table public.agent_run_steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  run_id uuid not null,
  step_number integer not null check (step_number > 0),
  name text not null check (char_length(name) between 1 and 120),
  tool_name text,
  status text not null
    check (status in ('success', 'failed', 'needs_review', 'skipped')),
  input_summary text,
  output_summary text,
  latency_ms integer not null default 0 check (latency_ms >= 0),
  created_at timestamptz not null default now(),
  unique (run_id, step_number),
  constraint agent_run_steps_run_same_project_fk
    foreign key (run_id, project_id)
    references public.agent_runs(id, project_id)
    on delete cascade
);

create index agents_project_id_idx on public.agents(project_id);
create index tools_project_id_idx on public.tools(project_id);
create index knowledge_sources_project_id_idx on public.knowledge_sources(project_id);
create index agent_runs_project_created_idx
  on public.agent_runs(project_id, created_at desc);
create index agent_runs_agent_id_idx on public.agent_runs(agent_id);
create index agent_run_steps_run_order_idx
  on public.agent_run_steps(run_id, step_number);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger agents_set_updated_at
before update on public.agents
for each row execute function public.set_updated_at();

create trigger tools_set_updated_at
before update on public.tools
for each row execute function public.set_updated_at();

create trigger knowledge_sources_set_updated_at
before update on public.knowledge_sources
for each row execute function public.set_updated_at();

create trigger agent_runs_set_updated_at
before update on public.agent_runs
for each row execute function public.set_updated_at();

-- Safe ownership helper used by child-table policies.
create or replace function public.owns_project(check_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects
    where id = check_project_id
      and owner_id = auth.uid()
  );
$$;

revoke all on function public.owns_project(uuid) from public;
grant execute on function public.owns_project(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.agents enable row level security;
alter table public.tools enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_run_steps enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "projects_select_own"
on public.projects for select
to authenticated
using (owner_id = auth.uid());

create policy "projects_insert_own"
on public.projects for insert
to authenticated
with check (owner_id = auth.uid());

create policy "projects_update_own"
on public.projects for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "projects_delete_own"
on public.projects for delete
to authenticated
using (owner_id = auth.uid());

create policy "agents_owner_all"
on public.agents for all
to authenticated
using (public.owns_project(project_id))
with check (public.owns_project(project_id));

create policy "tools_owner_all"
on public.tools for all
to authenticated
using (public.owns_project(project_id))
with check (public.owns_project(project_id));

create policy "knowledge_sources_owner_all"
on public.knowledge_sources for all
to authenticated
using (public.owns_project(project_id))
with check (public.owns_project(project_id));

create policy "agent_runs_owner_all"
on public.agent_runs for all
to authenticated
using (public.owns_project(project_id))
with check (public.owns_project(project_id));

create policy "agent_run_steps_owner_all"
on public.agent_run_steps for all
to authenticated
using (public.owns_project(project_id))
with check (public.owns_project(project_id));

-- Create public profile and default project after signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, 'AIMS User'), '@', 1)
    )
  );

  insert into public.projects (owner_id, name, is_default)
  values (new.id, 'My Agent Workspace', true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Authenticated, idempotent demo seed. Call after signup with the user's project ID.
create or replace function public.seed_aims_demo(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  support_agent uuid;
  sales_agent uuid;
  code_agent uuid;
  invoice_agent uuid;
  market_agent uuid;
  run_one uuid;
  run_two uuid;
  run_three uuid;
  run_four uuid;
  run_five uuid;
begin
  if auth.uid() is null or not exists (
    select 1 from public.projects
    where id = p_project_id and owner_id = auth.uid()
  ) then
    raise exception 'Not authorized for this project';
  end if;

  if exists (select 1 from public.agents where project_id = p_project_id) then
    raise exception 'Demo data not inserted: this project already has agents';
  end if;

  insert into public.agents
    (project_id, name, role, model, status, risk_level, description)
  values
    (p_project_id, 'Customer Support Agent', 'Resolve support requests',
     'GPT-4.1 Mini', 'active', 'medium', 'Drafts grounded customer replies.')
  returning id into support_agent;

  insert into public.agents
    (project_id, name, role, model, status, risk_level, description)
  values
    (p_project_id, 'Sales Research Agent', 'Research target accounts',
     'Claude Sonnet 4', 'active', 'low', 'Creates account research briefs.')
  returning id into sales_agent;

  insert into public.agents
    (project_id, name, role, model, status, risk_level, description)
  values
    (p_project_id, 'Code Review Agent', 'Review pull request changes',
     'GPT-4.1', 'paused', 'medium', 'Flags defects and security risks.')
  returning id into code_agent;

  insert into public.agents
    (project_id, name, role, model, status, risk_level, description)
  values
    (p_project_id, 'Invoice Processing Agent', 'Validate and route invoices',
     'Gemini 2.5 Pro', 'active', 'high', 'Processes finance documents for review.')
  returning id into invoice_agent;

  insert into public.agents
    (project_id, name, role, model, status, risk_level, description)
  values
    (p_project_id, 'Market Research Agent', 'Summarize market signals',
     'Claude Sonnet 4', 'inactive', 'low', 'Produces structured market summaries.')
  returning id into market_agent;

  insert into public.tools
    (project_id, name, category, approval_status, risk_level)
  values
    (p_project_id, 'Web Search', 'Research', 'approved', 'low'),
    (p_project_id, 'Gmail', 'Communication', 'needs_review', 'high'),
    (p_project_id, 'CRM', 'Sales', 'approved', 'medium'),
    (p_project_id, 'Database Query', 'Data', 'unapproved', 'high'),
    (p_project_id, 'Slack', 'Communication', 'approved', 'medium'),
    (p_project_id, 'Notion', 'Knowledge', 'approved', 'low'),
    (p_project_id, 'Calendar', 'Productivity', 'unapproved', 'medium');

  insert into public.knowledge_sources
    (project_id, title, source_type, url, status)
  values
    (p_project_id, 'Support Help Center', 'website',
     'https://example.com/help', 'active'),
    (p_project_id, 'Refund and Escalation Policy', 'document',
     'https://example.com/policies/refunds', 'active'),
    (p_project_id, 'Product Repository', 'repository',
     'https://github.com/example/product', 'active'),
    (p_project_id, 'Legacy CRM Export', 'database',
     'https://example.com/data/crm', 'sync_error');

  insert into public.agent_runs
    (project_id, agent_id, task, output, status, latency_ms,
     estimated_cost_usd, risk_level, created_at)
  values
    (p_project_id, support_agent, 'Draft a reply for ticket #1842',
     'Drafted a policy-grounded refund response.', 'success', 1840,
     0.014200, 'medium', now() - interval '6 hours')
  returning id into run_one;

  insert into public.agent_runs
    (project_id, agent_id, task, output, status, latency_ms,
     estimated_cost_usd, risk_level, created_at)
  values
    (p_project_id, sales_agent, 'Research Acme Corp before outreach',
     'Created an account brief with five verified signals.', 'success', 3210,
     0.026500, 'low', now() - interval '5 hours')
  returning id into run_two;

  insert into public.agent_runs
    (project_id, agent_id, task, output, status, latency_ms,
     estimated_cost_usd, risk_level, created_at)
  values
    (p_project_id, invoice_agent, 'Validate invoice INV-9021',
     'Bank details differ from the approved vendor record.', 'needs_review', 2460,
     0.031800, 'high', now() - interval '3 hours')
  returning id into run_three;

  insert into public.agent_runs
    (project_id, agent_id, task, output, status, latency_ms,
     estimated_cost_usd, risk_level, created_at)
  values
    (p_project_id, code_agent, 'Review pull request #228',
     'Repository source was unavailable.', 'failed', 890,
     0.006100, 'medium', now() - interval '2 hours')
  returning id into run_four;

  insert into public.agent_runs
    (project_id, agent_id, task, output, status, latency_ms,
     estimated_cost_usd, risk_level, created_at)
  values
    (p_project_id, support_agent, 'Classify ticket #1849',
     'Classified as account access with high confidence.', 'success', 970,
     0.008700, 'medium', now() - interval '45 minutes')
  returning id into run_five;

  insert into public.agent_run_steps
    (project_id, run_id, step_number, name, tool_name, status,
     input_summary, output_summary, latency_ms, created_at)
  values
    (p_project_id, run_one, 1, 'Classify request', null, 'success',
     'Refund request', 'Refund intent detected', 220, now() - interval '6 hours'),
    (p_project_id, run_one, 2, 'Retrieve policy', 'Notion', 'success',
     'Refund policy lookup', 'Relevant policy found', 610, now() - interval '6 hours'),
    (p_project_id, run_three, 1, 'Extract invoice', null, 'success',
     'Invoice INV-9021', 'Invoice fields extracted', 780, now() - interval '3 hours'),
    (p_project_id, run_three, 2, 'Validate vendor', 'Database Query', 'needs_review',
     'Compare vendor bank details', 'Bank details mismatch', 1030, now() - interval '3 hours'),
    (p_project_id, run_four, 1, 'Load repository', 'Product Repository', 'failed',
     'Pull request #228', 'Repository connection unavailable', 890, now() - interval '2 hours'),
    (p_project_id, run_five, 1, 'Classify request', null, 'success',
     'Account access issue', 'High-confidence classification', 310, now() - interval '45 minutes');
end;
$$;

revoke all on function public.seed_aims_demo(uuid) from public;
grant execute on function public.seed_aims_demo(uuid) to authenticated;
```

## Loading demo data

After signup, query the user's default project ID and invoke:

```ts
await supabase.rpc("seed_aims_demo", { p_project_id: projectId });
```

The function refuses anonymous calls, cross-project calls, and repeated seeding into a project that already contains agents. This is safer than pasting another user's UUID into seed SQL.
