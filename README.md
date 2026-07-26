# AIMS — AI Agent Operations Control Plane

AIMS is a resume-ready operations control plane for registering AI agents, governing their approved tools and knowledge sources, and observing executions through latency, estimated cost, failures, risk, and an audit trail.

## Problem

As AI agents move into support, sales, finance, research, and engineering workflows, teams often lack one place to understand what agents exist, which capabilities they can access, and how reliably they operate.

## Solution

AIMS provides a project-scoped operational workspace for agent inventory, governance, and execution evidence. It records project-scoped operational data through Supabase; it does not execute agents or claim production compliance.

## Current features

- Product landing and working email/password login/signup experience
- Shared responsive SaaS dashboard shell and navigation
- Live project-scoped operational metric cards and recent-run history
- Live agent registry with create, status update, and delete operations
- Live governed tool registry with create, approval, risk, and delete operations
- Live knowledge-source governance registry with create, status update, and delete operations
- Live manual agent-run logger with status, latency, estimated cost, output, and optional tool-step persistence
- Live chronological audit timeline derived from project-scoped operational records
- Supabase Cloud cookie-backed browser/server auth clients
- Protected application routes, persistent sessions, and logout
- Automatic RLS-safe profile and default workspace resolution
- Complete seven-table Postgres schema with constraints, foreign-key indexes, and RLS

## Tech stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- Supabase Cloud (Auth, Postgres, and RLS backend)
- Vercel-ready Next.js deployment

No custom API server, ORM, local Supabase stack, AI runtime, or vector database is included.

## Architecture summary

Next.js is the application and presentation layer. Supabase Cloud is the only backend: Auth identifies users, Postgres stores project-owned operational records, and Row Level Security enforces ownership. The public URL and anon/publishable key are the only Supabase credentials intended for the browser; never expose a service-role key.

Authentication and the agent, tool, knowledge-source, and run registries are connected to Supabase Cloud. Their pages perform project-scoped reads and mutations through the authenticated session, with RLS as the authorization boundary. The dashboard and audit timeline also read these same project-owned tables through the authenticated RLS session.

## Routes

| Route | Purpose | Current state |
|---|---|---|
| `/` | Product landing page | Static |
| `/login` | Email/password login and signup | Public; redirects authenticated users |
| `/dashboard` | Fleet health and recent runs | Protected; live Supabase metrics scoped to the default workspace |
| `/agents` | Agent registry | Protected; live Supabase CRUD scoped to the default workspace |
| `/tools` | Governed tool registry | Protected; live Supabase CRUD scoped to the default workspace |
| `/knowledge` | Knowledge-source governance registry | Protected; live Supabase CRUD scoped to the default workspace |
| `/runs` | Manual execution logger | Protected; live Supabase persistence scoped to the default workspace |
| `/audit` | Derived operational audit timeline | Protected; live Supabase data scoped to the default workspace |

## Supabase Cloud Setup

1. Create a hosted project in the [Supabase Cloud dashboard](https://supabase.com/dashboard). Local Supabase is intentionally not used by AIMS.
2. In **Project Settings → API**, copy the project URL and public anon/publishable key.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to those public values.
4. For a fresh Cloud project, open **SQL Editor**, paste the complete contents of `supabase/schema.sql`, and run it once. For an existing project with older Phase 5 data, run `supabase/patches/phase5_default_workspace_dedupe_patch.sql` once instead.
5. In **Table Editor**, confirm that Row Level Security is enabled for all seven public tables and that each table has authenticated-user policies.
6. In **Authentication → Providers**, keep the Email provider enabled. Choose whether email confirmation is required for your project; AIMS supports either setting.

Never put a Supabase service-role key in `.env.local` or frontend code. It bypasses RLS and is not needed by this application. No Supabase CLI, local Supabase stack, or Docker service is required.

The schema is available both as executable SQL in `supabase/schema.sql` and as an explained reference in `docs/03_DATABASE_SCHEMA.md`.

### Phase 7 Existing Supabase Cloud Repair

Existing Cloud projects may have an older `tools` table that predates the live Tool Registry. If `/tools` reports a missing Tool Registry column, open the hosted project's **SQL Editor** and run `supabase/patches/phase7_tools_registry_patch.sql` once. The patch adds missing `tools.is_approved`, `tools.category`, `tools.risk_level`, and `tools.created_at` columns, restores their defaults and risk constraint, ensures the project index exists, and keeps RLS enabled.

The patch is safe and non-destructive: it uses conditional column, constraint, and index creation; normalizes only null approval/risk values; and never deletes tool rows or introduces anonymous policies. Refresh `/tools` after the SQL completes.

### Phase 8 Existing Supabase Cloud Repair

Knowledge source types use normalized database values—`website`, `pdf`, `notion`, `google_drive`, `internal_docs`, `api_docs`, `database`, `slack`, and `github_repo`—while the UI displays friendly labels such as **Google Drive**, **Internal Docs**, and **GitHub Repo**.

If an existing Cloud project rejects a source type or still stores friendly labels, run `supabase/patches/phase8_knowledge_source_type_patch.sql` once in the hosted **SQL Editor**. The patch removes the outdated type constraint, normalizes existing friendly labels and earlier prototype values, restores the canonical type and status constraints, sets `website` as the default type, and keeps RLS enabled. It preserves all rows and adds no policies or privileged credentials.

### Phase 9 Existing Supabase Cloud Alignment

After pulling Phase 9—and before using the live Run Logger on an existing hosted project—run `supabase/patches/phase9_agent_runs_patch.sql` once in the Supabase Cloud **SQL Editor**. The non-destructive patch aligns `agent_runs` and `agent_run_steps` columns, defaults, constraints, indexes, RLS, and strict authenticated-owner policies without deleting or seeding data. It adds and backfills run `risk_level`, defaults it to `medium`, and restricts it to `low`, `medium`, or `high`. It also repairs legacy `agent_run_steps.name` and `agent_run_steps.step_number` requirements without deleting data, while standardizing the application on canonical `step_order` with a default of `1`.

### Phase 10 Existing Supabase Cloud Alignment

Run `supabase/patches/phase10_dashboard_metrics_patch.sql` once in the hosted **SQL Editor** before using live dashboard metrics on an existing project. The non-destructive patch aligns metric columns and safe defaults, adds project/status indexes, and keeps RLS enabled without adding policies or seed data.

### Phase 11 Existing Supabase Cloud Alignment

Run `supabase/patches/phase11_audit_timeline_patch.sql` once in the hosted **SQL Editor** before using the live timeline on an existing project. It aligns current operational-table columns and chronological indexes while keeping RLS enabled. It creates no `audit_events` table, users, policies, or seed rows.

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

Then open `http://localhost:3000`. Production deployment can use Vercel with the same two public environment variables.

## Testing authentication

1. Open `/login`, enter an email and a password of at least six characters, and select **Create account**.
2. If email confirmation is enabled in Supabase, follow the confirmation link and return to `/login`. Otherwise, signup creates a session and opens `/dashboard` immediately.
3. Sign in with the same credentials and confirm that `/dashboard` opens and the account email appears in the top bar.
4. Refresh the page to verify that the cookie-backed session persists.
5. While signed in, open `/login` and confirm it redirects to `/dashboard`.
6. Select **Sign out**, then open `/dashboard` or another application route and confirm it redirects to `/login`.

Middleware protects `/dashboard`, `/agents`, `/tools`, `/knowledge`, `/runs`, and `/audit`. It also refreshes valid Supabase sessions. Authentication uses only the project URL and public anon/publishable key; authorization of database queries is enforced by RLS.

## Default workspace resolution

The protected server layout resolves the authenticated account before rendering any operational page. Using the user's cookie-backed Supabase session and public anon/publishable key, it reads or creates a `profiles` row, then queries the owned project where `is_default = true`. If none exists, it creates **AIMS Workspace** with the description **Default AI agent operations workspace** and `is_default = true`. Existing records are reused on refresh and future sign-ins. A partial unique index permits only one default per owner, and the helper recovers when concurrent requests race to create it. RLS permits inserts only when the project owner matches `auth.uid()`.

To verify this against Supabase Cloud:

1. For a fresh project, apply `supabase/schema.sql`. If the Cloud database contains older Phase 5 project rows, apply `supabase/patches/phase5_default_workspace_dedupe_patch.sql` once, then configure the two public environment variables.
2. Create or sign in as a real test user, then visit `/dashboard`.
3. In **Table Editor → profiles**, confirm one row has `id` equal to the Authentication user's ID and `role` equal to `student`.
4. In **Table Editor → projects**, confirm exactly one row for that owner has `is_default = true`, `AIMS Workspace` as its name, and the default description. Older duplicate rows must have `is_default = false`.
5. Refresh and sign out/in; confirm the same row IDs remain and the top bar shows the workspace name and email.

The dedupe patch adds `projects.is_default`, keeps the earliest project per owner as the normalized default, marks every later duplicate non-default without deleting it, and creates the partial unique index. It also aligns missing profile columns and keeps RLS enabled. The patch is safe and non-destructive: it does not drop tables, delete user data, create users, or add anonymous policies.

## Agent Registry CRUD (Phase 6)

`/agents` loads only rows whose `project_id` matches the authenticated user's resolved default workspace. Users can register an agent, change its lifecycle status, and delete it. Every mutation includes both the resolved project ID and the target row where applicable; the project ID is never accepted from user input. Supabase RLS independently verifies project ownership.

Manual validation against Supabase Cloud:

1. Sign in as test user A and open `/agents`; confirm **No agents registered yet.** appears when the workspace is empty.
2. Create **Support Triage Agent** with role **Classifies and routes customer support requests**, model `gpt-4.1-mini`, active status, medium risk, and description **Handles first-pass ticket triage**.
3. Confirm the row appears, then inspect **Table Editor → agents** and verify all values and the resolved workspace `project_id`.
4. Change the status to paused and verify the UI and Cloud row update.
5. Delete the agent after accepting the confirmation and verify it disappears from both the UI and Table Editor.
6. Sign out and confirm `/agents` redirects to `/login`.
7. Optionally sign in as test user B and confirm user A's agents are not visible or writable.

## Tool Registry CRUD (Phase 7)

`/tools` is the AI-agent tool-governance module. It loads only tools in the authenticated user's resolved default workspace and supports registration, approval changes, risk classification, and deletion. The UI always derives `project_id` from the resolved workspace rather than accepting it as input, explicitly scopes every query and mutation, and relies on Supabase RLS as the independent authorization boundary.

Manual validation against Supabase Cloud:

1. Sign in as test user A and open `/tools`; confirm **No tools registered yet.** appears when the workspace is empty.
2. Register **Web Search** in the **Search** category with approved status and medium risk.
3. Inspect **Table Editor → tools** and verify its values and the resolved workspace `project_id`.
4. Change approval to unapproved and risk to high; verify each update in the UI and Cloud row.
5. Delete the tool after accepting the confirmation and verify it disappears from the UI and Table Editor.
6. Sign out and confirm `/tools` redirects to `/login`.
7. Optionally sign in as test user B and confirm user A's tools are not visible or writable.

## Knowledge Source Registry CRUD (Phase 8)

`/knowledge` represents AI-agent knowledge governance: it records approved source-system metadata without ingesting source contents. It loads only knowledge sources belonging to the authenticated user’s resolved default workspace. Create, status-update, and delete operations derive the workspace `project_id` internally, explicitly scope target rows, and remain independently protected by Supabase RLS.

The MVP does **not** implement RAG, embeddings, vector search, file upload, document/PDF parsing, scraping, ingestion, or retrieval.

Manual validation against Supabase Cloud:

1. Sign in as test user A and open `/knowledge`; confirm **No knowledge sources registered yet.** appears when the workspace is empty.
2. Add **Support Playbook**, select **Internal Docs**, enter `https://example.com/support-playbook`, and leave status active. The UI label maps to the normalized value `internal_docs`.
3. Confirm it appears as **Internal Docs**, then inspect **Table Editor → knowledge_sources** and verify `source_type = internal_docs` along with its title, URL, status, and resolved workspace `project_id`.
4. Change status to inactive and back to active; verify both changes in the UI and Cloud row.
5. Delete the source after accepting confirmation and verify it disappears from the UI and Table Editor.
6. Sign out and confirm `/knowledge` redirects to `/login`.
7. Optionally sign in as test user B and confirm user A’s sources are neither visible nor writable.

## Agent Run Logger Persistence (Phase 9)

`/runs` records manual execution evidence for AI-agent observability. Each project-scoped run stores its agent, task, optional output, result status, execution risk level, latency, estimated cost, and timestamp. Risk is stored as the normalized value `low`, `medium`, or `high`, with `medium` selected by default. An operator may also attach one optional approved-tool step with input, output, and status; each step stores the same resolved workspace `project_id` as its parent run. This is logging only: AIMS does not execute agents or call AI APIs.

Manual validation against Supabase Cloud:

1. Run `supabase/patches/phase9_agent_runs_patch.sql` in the hosted SQL Editor.
2. Sign in as test user A, create an agent if needed, and optionally register an approved tool.
3. Open `/runs`; confirm **No agent runs logged yet.** appears when the workspace has no runs.
4. Log **Classify refund request** with output **Refund request classified as billing issue.**, success status, medium risk, `830` ms latency, and `0.0124` USD cost.
5. In **Table Editor → agent_runs**, verify the resolved `project_id`, selected `agent_id`, task, output, status, `risk_level = medium`, numeric latency/cost, and a single new row.
6. Log a `needs_review` run with high risk, then log another run with an approved tool selected; verify `risk_level = high` and that its `agent_run_steps` row has the same `project_id` as the run plus the correct `run_id`, `tool_id`, `step_order = 1`, input/output, and status.
7. Refresh and confirm rows are not duplicated. Sign out and confirm `/runs` redirects to `/login`.
8. Optionally sign in as test user B and confirm user A’s runs and steps are not visible.

## Live Dashboard Metrics (Phase 10)

`/dashboard` calculates workspace observability directly from authenticated, project-scoped Supabase rows. It shows total and active agents, total and failed runs, average latency, summed estimated cost, high-risk agents, approved tools, registered knowledge sources, and the five most recent runs. Empty workspaces render zero-valued cards and a professional recent-runs empty state; query failures never fall back to demo data.

Manual validation against Supabase Cloud:

1. Run `supabase/patches/phase10_dashboard_metrics_patch.sql` in the hosted SQL Editor.
2. Sign in as test user A and ensure the workspace has an agent, approved tool, knowledge source, and logged run.
3. Open `/dashboard` and compare every card with project-filtered Table Editor or SQL counts. Verify average latency and total estimated cost.
4. Confirm Recent runs contains at most the newest five rows with agent, status, risk, latency, cost, and timestamp.
5. Add a run, change an agent risk/status, and toggle tool approval; revisit `/dashboard` and confirm the affected values update.
6. Sign out and confirm `/dashboard` redirects to `/login`. Optionally verify a second user sees only their workspace metrics.

## Live Audit Timeline (Phase 11)

`/audit` derives a read-only operational timeline from the existing `agents`, `tools`, `knowledge_sources`, `agent_runs`, and `agent_run_steps` tables. Every source query is filtered to the resolved default project, events are combined in TypeScript, sorted newest first, and limited to 50. This is an MVP activity view—not an immutable, append-only enterprise audit log.

Manual validation against Supabase Cloud:

1. Run `supabase/patches/phase11_audit_timeline_patch.sql` in the hosted SQL Editor.
2. Sign in as test user A and ensure the workspace has an agent, tool, knowledge source, run, and tool step.
3. Open `/audit`; confirm all five event types appear newest first with the expected status, risk, latency/cost, source type, approval, and step metadata.
4. Create an agent, then log a run with a tool step; return to `/audit` and confirm the new events appear.
5. Sign out and confirm `/audit` redirects to `/login`. Optionally verify user B sees only their workspace events.

## Current status

The repository contains the complete runnable application, Supabase Cloud schema and RLS boundary, authentication, default-workspace resolution, project-scoped registries, manual run persistence, dashboard metrics, and derived operational audit timeline. No real AI APIs are called.

## Pre-deployment verification

1. Verify RLS isolation with separate test users.
2. Deploy the verified application to Vercel.

See the command center documents in `docs/` for the product boundary, architecture, schema rationale, phased plan, and verified resume narrative.
