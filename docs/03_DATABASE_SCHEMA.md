# AIMS Database Schema

## Source of truth

`supabase/schema.sql` is the executable source of truth. Run it in the SQL Editor of a **new Supabase Cloud project**. The repository intentionally has no local Supabase configuration, CLI requirement, Docker database, custom server, or ORM.

## Tables

| Table | Purpose | Ownership path |
|---|---|---|
| `profiles` | Authenticated user's application profile (`full_name`, `role`) | `profiles.id = auth.uid()` |
| `projects` | User-owned AIMS workspaces with an `is_default` marker | `projects.owner_id = auth.uid()` |
| `agents` | Agent inventory, model, lifecycle status, and risk | `agents.project_id -> projects.id` |
| `tools` | Approved-tool inventory and risk | `tools.project_id -> projects.id` |
| `knowledge_sources` | Registered source metadata (not ingestion) | `knowledge_sources.project_id -> projects.id` |
| `agent_runs` | Task output, result, latency, and estimated cost | `agent_runs.project_id -> projects.id` |
| `agent_run_steps` | Ordered trace entries and optional tool reference | `agent_run_steps.project_id -> projects.id`, matched to `agent_runs.project_id` by RLS |

All primary keys are UUIDs. A profile's key references `auth.users`; the other tables use `gen_random_uuid()`. Project deletion cascades through its direct children, run deletion cascades through its steps, and deletion of an agent or tool preserves historical records by setting the optional reference to `null`.

The `tools` registry stores `name`, optional `category`, `is_approved` (default `true`), `risk_level` (default `medium`, restricted to `low`, `medium`, or `high`), and `created_at`, along with its owning `project_id`. Existing Supabase Cloud projects whose `tools` table predates these fields must run `supabase/patches/phase7_tools_registry_patch.sql` in the hosted SQL Editor. The patch conditionally adds missing fields, normalizes null defaults, preserves existing data and ownership policies, and keeps RLS enabled.

The `knowledge_sources.source_type` column defaults to `website` and accepts the canonical values `website`, `pdf`, `notion`, `google_drive`, `internal_docs`, `api_docs`, `database`, `slack`, and `github_repo`. The UI maps these to **Website**, **PDF**, **Notion**, **Google Drive**, **Internal Docs**, **API Docs**, **Database**, **Slack**, and **GitHub Repo**; friendly labels are never written to the database. Existing Supabase Cloud projects with an older constraint or friendly-label rows must run `supabase/patches/phase8_knowledge_source_type_patch.sql` in the hosted SQL Editor. The transactional patch normalizes existing values without deleting rows, restores the canonical type and active/inactive status constraints, and keeps RLS enabled.

The `agent_runs` table stores a project and optional agent reference with required task, optional output, `success`/`failed`/`needs_review` status, execution `risk_level`, non-negative integer latency, non-negative numeric estimated cost, and creation timestamp. Run risk accepts only `low`, `medium`, or `high`, is required, and defaults to `medium`. `agent_run_steps` stores optional tool evidence beneath a run with a direct `project_id`, order, input, output, the same controlled statuses, and a timestamp. The duplicated project key supports direct workspace filtering and indexing; strict RLS also requires it to match the parent run’s project. Existing hosted projects must run `supabase/patches/phase9_agent_runs_patch.sql`; it safely aligns missing tables/columns, backfills null run risk to `medium`, restores defaults, foreign keys, checks, indexes, RLS, and authenticated owner policies without deleting or seeding rows.

The application queries the project owned by the authenticated user where `is_default = true` and creates it only when none exists. `projects_one_default_per_owner_idx` is a partial unique index on `owner_id` for default rows, so the database prevents two default workspaces for one owner while preserving non-default historical rows. `projects_owner_default_idx` supports the resolution query. No auth trigger or service-role client is required.

## Existing Supabase Cloud project patch

`supabase/patches/phase5_default_workspace_dedupe_patch.sql` is the source of truth for aligning a Cloud database with older or duplicated Phase 5 workspace data. Run it once in the hosted project's **SQL Editor** instead of resetting the database. It adds `is_default`, keeps the earliest row for each owner as the canonical default with the required name and description, marks later rows non-default, and installs the unique partial index.

The patch is non-destructive: it does not drop tables, delete rows, create fake users, weaken ownership checks, or add anonymous policies. It also aligns missing profile fields and ensures RLS remains enabled. A missing fundamental table or another schema mismatch still produces an actionable error in the protected layout.

## Controlled values

- Agent `status`: `active`, `paused`, `archived`
- Agent, tool, and run `risk_level`: `low`, `medium`, `high` (default `medium`)
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
