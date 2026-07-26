# AIMS — AI Agent Operations Control Plane

**A resume-ready MVP for AI and agent teams to inventory agents, govern tool and knowledge access, monitor execution evidence, and review operational risk in one project-scoped workspace.**

AIMS is designed for engineers and operators who need visibility around agent systems—not another agent framework. It makes ownership, approved capabilities, run outcomes, latency, estimated cost, risk, and activity reviewable before those concerns are scattered across prompts, provider consoles, and application logs.

> **Project boundary:** AIMS records control-plane metadata and manually supplied run evidence. It does not execute agents, call an AI provider, ingest documents, or claim to be a production compliance system.

## Problem

As agent prototypes move into support, research, finance, and engineering workflows, teams need to answer practical operational questions: Which agents exist? What tools and knowledge sources may they use? Which runs failed or need review? What did an execution cost, how long did it take, and what changed recently?

Those questions cut across inventory, governance, observability, and access control. AIMS models them in a small, inspectable system so an agent team can establish an operational record without coupling the control plane to a particular model provider or runtime.

## Solution overview

An authenticated user receives a default AIMS workspace. Within it, the user:

1. registers agents and assigns lifecycle and risk states;
2. catalogs tools with approval and risk decisions;
3. tracks knowledge-source metadata without ingesting source content;
4. records run evidence, including outcome, output, latency, estimated cost, execution risk, and an optional approved-tool step; and
5. reviews workspace metrics, recent runs, and a derived chronological audit timeline.

The result is a coherent operational view of an agent fleet. All business records belong to a project, and Supabase Row Level Security (RLS) independently checks that the authenticated user owns that project.

## Features by module

### Auth + workspace

- Email/password signup, login, persistent Supabase session, logout, and protected routes
- Automatic profile and single default-workspace resolution for authenticated users
- Explicit project scoping plus database-enforced ownership policies

### Agent registry

- Register an agent with role, model label, lifecycle status, risk level, and description
- View project-owned agents, update lifecycle status, and delete records

### Tool registry

- Catalog tools by name and category
- Record approval state and low/medium/high risk; update governance decisions or remove tools

### Knowledge registry

- Register source metadata such as Internal Docs, websites, APIs, databases, or repositories
- Track active/inactive status without implying ingestion, embeddings, or retrieval

### Run monitoring

- Manually record agent, task, output, `success`/`failed`/`needs_review` status, risk, latency, and estimated USD cost
- Optionally attach one step using an approved tool, including input, output, order, and status
- Preserve the run risk as an execution-time snapshot

### Dashboard

- Summarize agent activity, failures, average latency, estimated cost, high-risk agents, approved tools, and knowledge sources
- Show the five most recent project-scoped runs; empty workspaces use honest zero states rather than mock metrics

### Audit timeline

- Derive up to 50 recent events from agents, tools, knowledge sources, runs, and run steps
- Combine and sort live project records without claiming an immutable compliance log

## Tech stack

| Layer | Technology |
|---|---|
| Application | Next.js 14 App Router, React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Authentication | Supabase Auth |
| Data | Supabase Postgres |
| Authorization | Supabase Row Level Security |
| Deployment target | Vercel-ready Next.js build; no live deployment is claimed here |

There is no custom API server, ORM, local Supabase stack, vector database, or AI-provider SDK.

## Architecture

```text
Browser
  ├─ public landing and login
  └─ protected Next.js App Router UI
       ├─ Server Components: session, workspace resolution, initial reads, aggregates
       ├─ Client Components: validated registry and run interactions
       └─ public Supabase client credentials + authenticated user session
                              │
                              ▼
                    Supabase Cloud
       Auth ──> Postgres tables ──> RLS ownership checks
```

- **Frontend:** Next.js renders the public product surface and protected operational pages. Server Components resolve authentication, the default workspace, project-scoped reads, and dashboard/audit composition; interactive client components submit CRUD operations through the signed-in user's Supabase session.
- **Backend:** Supabase Auth owns identity. Postgres stores `profiles`, `projects`, `agents`, `tools`, `knowledge_sources`, `agent_runs`, and `agent_run_steps`.
- **Application logic:** The protected server layout resolves the authenticated user's default project. Pages pass that resolved ID into their registries; it is never a user-editable form field. Reads and mutations also filter by that project ID, while RLS—not the filter—is the authorization boundary.
- **Relational integrity:** Foreign keys, controlled status/risk values, non-negative metric constraints, and same-project relationships complement RLS.

See [`docs/02_ARCHITECTURE.md`](docs/02_ARCHITECTURE.md) and [`docs/03_DATABASE_SCHEMA.md`](docs/03_DATABASE_SCHEMA.md) for deeper design notes. Executable SQL lives in [`supabase/schema.sql`](supabase/schema.sql).

## Security and project isolation

1. Supabase Auth identifies the user from the cookie-backed session.
2. The protected server layout creates or reuses that user's profile and default project through the ordinary authenticated session.
3. Each operational row carries a `project_id`. The server-resolved workspace ID is supplied to pages and is not accepted as editable browser form input; queries and target-row mutations explicitly include it.
4. RLS policies call the ownership relationship back to `projects.owner_id = auth.uid()`, so changing or omitting a frontend filter does not grant access to another user's rows.
5. Cross-project foreign-key constraints protect run/agent and step/run relationships in addition to RLS.
6. The frontend and server use only `NEXT_PUBLIC_SUPABASE_URL` and the public anon/publishable key. A service-role key is neither required nor used and must never be exposed to the browser.

This is an MVP security model, not a claim of formal audit, penetration testing, organization-level RBAC, or regulatory compliance.

## Five-minute demo walkthrough

1. **Landing (`/`):** explain that AIMS manages the operational layer around agents rather than executing them.
2. **Login (`/login`):** create an account or sign in; note the cookie-backed session and automatic default workspace.
3. **Dashboard (`/dashboard`):** orient the viewer to fleet health, governance counts, and recent runs.
4. **Register agents (`/agents`):** add the support and research examples below with different risk profiles.
5. **Register tools (`/tools`):** contrast an approved low-risk tool with an unapproved high-risk tool.
6. **Register knowledge (`/knowledge`):** add metadata for a source the agents may reference; clarify that AIMS does not ingest its content.
7. **Record execution evidence (`/runs`):** log a review-required support run with latency, estimated cost, output, and an approved-tool step.
8. **Review operations (`/dashboard`, then `/audit`):** show updated metrics and close on the project-scoped chronological evidence.

### Suggested demo data

| Module | Example | Values |
|---|---|---|
| Agent | Support Triage Agent | Role: `Classifies and routes customer requests`; model: `provider-model-label`; status: `active`; risk: `medium` |
| Agent | Research Assistant | Role: `Synthesizes approved research sources`; model: `provider-model-label`; status: `active`; risk: `high` |
| Tool | Web Search | Category: `Search`; approved: `yes`; risk: `low` |
| Tool | Customer Database Write | Category: `Data`; approved: `no`; risk: `high` |
| Knowledge | Support Playbook | Type: `Internal Docs`; URL: `https://example.com/support-playbook`; status: `active` |
| Run | Classify refund request | Agent: Support Triage Agent; status: `needs_review`; risk: `high`; latency: `830 ms`; estimated cost: `$0.0124`; output: `Refund request classified as billing; human approval required.` |
| Optional step | Search support policy | Tool: Web Search; status: `success`; input: `refund policy exception`; output: `Policy article located.` |

These are manual demo records, not generated AI output or bundled seed data.

## Route map

Only routes backed by a current `app/**/page.tsx` are listed.

| Route | Purpose | Access |
|---|---|---|
| `/` | Product landing page | Public |
| `/login` | Email/password login and signup | Public; redirects authenticated users |
| `/dashboard` | Workspace metrics and recent runs | Protected |
| `/agents` | Agent registry | Protected |
| `/tools` | Tool approval and risk registry | Protected |
| `/knowledge` | Knowledge-source metadata registry | Protected |
| `/runs` | Manual execution-evidence logger and run history | Protected |
| `/audit` | Derived operational activity timeline | Protected |

There are no run-detail dynamic routes in the current application.

## Local setup

### Prerequisites

- Node.js 18.17 or newer (compatible with Next.js 14)
- npm
- A hosted Supabase project

### 1. Install

```bash
npm install
```

### 2. Configure Supabase

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Open the hosted **SQL Editor**, paste `supabase/schema.sql`, and run it once for a fresh database.
3. Confirm RLS is enabled on all seven public tables and the authenticated policies exist.
4. Keep the Email Auth provider enabled. AIMS supports projects with or without email confirmation.
5. For an older AIMS database, apply the relevant non-destructive files in `supabase/patches/` in phase order rather than re-running the full schema. Their filenames and SQL comments describe the affected phase.

The Phase 5 default-workspace patch is `supabase/patches/phase5_default_workspace_dedupe_patch.sql`; later patches align the tool registry, knowledge-source values, run records, dashboard indexes, and audit timeline.

### 3. Add environment variables

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_or_publishable_key
```

Do **not** add `SUPABASE_SERVICE_ROLE_KEY`; it bypasses RLS and is not needed by AIMS.

### 4. Run and verify

```bash
npm run dev
# open http://localhost:3000

npm run lint
npm run build
```

A Vercel deployment can use the same two public environment variables. “Vercel-ready” describes the deployment target; this repository does not claim a verified live environment.

## Resume Bullets

- Built a Next.js and TypeScript AI agent operations control plane spanning 6 protected workflow pages for agent inventory, tool governance, knowledge tracking, execution evidence, metrics, and activity review.
- Designed a 7-table Supabase Postgres model with controlled lifecycle/risk states, relational integrity, indexes, and project ownership for agent operations data.
- Implemented Supabase Auth, project-scoped queries, and Row Level Security policies that enforce ownership at the database layer without a service-role credential.
- Developed run observability for status, risk snapshots, output, latency, estimated cost, and optional tool-step evidence, including explicit failure and human-review states.
- Aggregated live workspace data into dashboard metrics and a 50-event chronological timeline without substituting mock data when records are empty or queries fail.
- Separated the control plane from the agent runtime, keeping the MVP deterministic and provider-agnostic while defining clear integration points for future execution telemetry.

Use only the bullets that match the role, and describe this as a portfolio MVP unless you have independently deployed and validated it.

## Interview Talking Points

### Why this project matters

Agent engineering is not only prompt and model work. Teams also need to know which systems can act, what capabilities are approved, and whether executions are reliable and reviewable. AIMS demonstrates that operational layer with an intentionally small domain model.

### Hardest technical decision

The key decision was treating Postgres RLS as the authorization boundary rather than assuming a React `project_id` filter was secure. The UI still applies explicit workspace filters for correctness and clarity, but policies independently derive ownership from the authenticated user.

### How RLS works

Supabase places the signed-in user's ID in `auth.uid()`. Project policies compare it with `projects.owner_id`; child-table policies verify that each row's `project_id` belongs to that user. The public key identifies the Supabase project, while the user session determines row access. A forged row ID or project ID therefore does not bypass database authorization.

### How the main workflow works

The protected layout resolves a user's default workspace. Registry pages read that project's records, client interactions write through the user's RLS-limited session, and runs reference agents—and optionally approved tools—from the same workspace. Dashboard and audit pages read those same records into aggregate and chronological views.

### Tradeoffs

- Manual run entry makes the demo deterministic and inspectable, but it is not automatic telemetry.
- Page-load aggregation is simple for an MVP, but high-volume data would need time windows, database-side aggregation, and pagination.
- One owned default project keeps authorization understandable, but does not model organizations, invitations, or roles.
- The audit view derives events from mutable records; it is useful activity history, not an append-only evidence ledger.

### Why no real AI API in the MVP?

The engineering focus is the system around agent execution: inventory, approvals, traces, review states, latency, cost, and isolation. Omitting provider calls avoids secret management, variable model output, and usage cost while preserving a clean future boundary: a runtime or webhook could submit the same run and step fields.

### What would improve next

Add authenticated event ingestion, append-only audit storage, organization membership and RBAC, automated RLS integration tests, database-side time-window metrics, pagination, provider-specific token/cost calculation, alerts, and production observability. Real runtime adapters would follow only after defining secrets, retries, idempotency, and failure handling.

More interview prompts and honest answer framing are available in [`docs/05_RESUME_NOTES.md`](docs/05_RESUME_NOTES.md).

## Limitations and future improvements

### Current limitations

- Resume-ready internship portfolio MVP; not certified or guaranteed for enterprise deployment
- No real AI provider calls, agent execution, tool invocation, streaming, or background jobs
- Knowledge sources are metadata only: no file upload, ingestion, RAG, embeddings, or vector search
- Manual run and optional step logging rather than an authenticated telemetry ingestion API
- Derived, mutable audit timeline rather than immutable audit retention
- No production observability stack, alerting, rate limiting, billing, organizations, team roles, or formal compliance controls
- No claim of production load, external users, revenue, or a currently live deployment

### Future improvements

- Runtime/webhook ingestion with scoped, hashed credentials and idempotent event handling
- Organization membership, role-based permissions, approval workflows, and secret management
- Append-only audit events, retention controls, alerts, and provider-specific usage reconciliation
- Database views or RPCs for time-windowed metrics plus pagination, filtering, and automated security tests

## NotebookLM readiness

For a later interview-prep phase, upload this README together with `docs/01_PRD.md`, `docs/02_ARCHITECTURE.md`, `docs/03_DATABASE_SCHEMA.md`, `docs/04_TASKS.md`, and `docs/05_RESUME_NOTES.md` to NotebookLM. Together they cover product intent, architecture, schema, implementation scope, resume language, and interview rationale. This repository intentionally does not include a generated NotebookLM interview pack yet.

## Documentation index

- [`docs/01_PRD.md`](docs/01_PRD.md) — product requirements and scope
- [`docs/02_ARCHITECTURE.md`](docs/02_ARCHITECTURE.md) — system, auth, and ownership design
- [`docs/03_DATABASE_SCHEMA.md`](docs/03_DATABASE_SCHEMA.md) — table and RLS reference
- [`docs/04_TASKS.md`](docs/04_TASKS.md) — phased implementation record
- [`docs/05_RESUME_NOTES.md`](docs/05_RESUME_NOTES.md) — extended resume and interview notes
