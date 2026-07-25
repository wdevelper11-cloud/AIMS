# AIMS Database Schema

## Source of truth

`supabase/schema.sql` is the executable source of truth. Run it in the SQL Editor of a **new Supabase Cloud project**. The repository intentionally has no local Supabase configuration, CLI requirement, Docker database, custom server, or ORM.

## Tables

| Table | Purpose | Ownership path |
|---|---|---|
| `profiles` | Authenticated user's application profile (`full_name`, `role`) | `profiles.id = auth.uid()` |
| `projects` | User-owned AIMS workspaces | `projects.owner_id = auth.uid()` |
| `agents` | Agent inventory, model, lifecycle status, and risk | `agents.project_id -> projects.id` |
| `tools` | Approved-tool inventory and risk | `tools.project_id -> projects.id` |
| `knowledge_sources` | Registered source metadata (not ingestion) | `knowledge_sources.project_id -> projects.id` |
| `agent_runs` | Task output, result, latency, and estimated cost | `agent_runs.project_id -> projects.id` |
| `agent_run_steps` | Ordered trace entries and optional tool reference | `agent_run_steps.run_id -> agent_runs.project_id -> projects.id` |

All primary keys are UUIDs. A profile's key references `auth.users`; the other tables use `gen_random_uuid()`. Project deletion cascades through its direct children, run deletion cascades through its steps, and deletion of an agent or tool preserves historical records by setting the optional reference to `null`.

`projects.owner_id` is unique because the current product supports exactly one workspace per authenticated user. This also prevents repeated or concurrent first-page resolution from creating duplicate default projects. The application creates missing profile and project rows from the protected server layout; no auth trigger or service-role client is required.

## Controlled values

- Agent `status`: `active`, `paused`, `archived`
- Agent and tool `risk_level`: `low`, `medium`, `high`
- Knowledge-source `status`: `active`, `inactive`
- Run and run-step `status`: `success`, `failed`, `needs_review`

These values are enforced with named PostgreSQL check constraints. Defaults are defined in SQL, including `gpt-4.1-mini`, medium risk, success status, zero latency/cost, and current timestamps.

## Indexes

The schema explicitly indexes every requested foreign-key access path: project owner; each direct child's project; a run's agent; and a step's run and tool. Primary keys already receive unique indexes from PostgreSQL.

## Row Level Security

RLS is enabled and never disabled on all seven public tables. Policies are restricted to the `authenticated` Postgres role; no anonymous or unconditional policy is present.

Each table has separate, readable `select`, `insert`, `update`, and `delete` policies:

- Profiles compare `id` directly with `auth.uid()`.
- Projects compare `owner_id` directly with `auth.uid()`.
- Agents, tools, knowledge sources, and runs use an `exists` query against an owned project.
- Run steps resolve ownership through their parent run and its project.
- Update policies use both `using` and `with check`, preventing a row from being moved outside the user's ownership boundary.

The frontend must still query the intended project for correctness, but frontend filters are not an authorization mechanism. Supabase RLS is the security boundary. The browser may use only the project URL and anon/publishable key with an authenticated user session; a service-role key must never be exposed.

## Seed data

The executable schema contains no seed inserts and creates no fake Auth users. For Cloud verification, create real test users through Supabase Authentication and insert test records under those authenticated sessions. This makes the RLS test representative of application access.

## Cloud verification

1. Create a new hosted project in Supabase Cloud.
2. Paste all of `supabase/schema.sql` into **SQL Editor** and run it once.
3. In **Table Editor**, confirm the seven tables and their foreign keys/check constraints.
4. In each table's RLS view, confirm RLS is enabled and four authenticated policies are present.
5. Create two real Auth users, A and B, and sign in with the public anon key from separate sessions.
6. As A, insert A's profile, project, and one row in every child table; confirm A can select and update them.
7. As B, confirm A's records return no rows and that inserts/updates using A's project or run ID are rejected by RLS.
8. Confirm neither anonymous requests nor the browser without a user session can access table rows.

Use a new Cloud project for a clean run. The file is intentionally a one-time schema installation rather than a destructive reset script.
