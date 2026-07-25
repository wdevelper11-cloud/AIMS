# AIMS — AI Agent Operations Control Plane

AIMS is a resume-ready operations control plane for registering AI agents, governing their approved tools and knowledge sources, and observing executions through latency, estimated cost, failures, risk, and an audit trail.

## Problem

As AI agents move into support, sales, finance, research, and engineering workflows, teams often lack one place to understand what agents exist, which capabilities they can access, and how reliably they operate.

## Solution

AIMS provides a project-scoped operational workspace for agent inventory, governance, and execution evidence. This initial skeleton demonstrates the product structure with static data; it does not execute agents or claim production compliance.

## Current features

- Product landing and working email/password login/signup experience
- Shared responsive SaaS dashboard shell and navigation
- Eight operational metric cards
- Agent, tool, knowledge-source, and run registries backed by typed demo data
- Chronological audit timeline with status, risk, cost, and latency
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

Next.js is the application and presentation layer. Supabase Cloud is the only planned backend: Auth identifies users, Postgres stores project-owned operational records, and Row Level Security enforces ownership. The public URL and anon/publishable key are the only Supabase credentials intended for the browser; never expose a service-role key.

Authentication is connected to Supabase Cloud. Operational records still read only from `lib/demo-data.ts`; CRUD and live metrics remain intentionally deferred to later phases.

## Routes

| Route | Purpose | Current state |
|---|---|---|
| `/` | Product landing page | Static |
| `/login` | Email/password login and signup | Public; redirects authenticated users |
| `/dashboard` | Fleet health and recent runs | Protected; static demo data |
| `/agents` | Agent registry | Protected; static demo data |
| `/tools` | Governed tool registry | Protected; static demo data |
| `/knowledge` | Knowledge-source inventory | Protected; static demo data |
| `/runs` | Execution log | Protected; static demo data |
| `/audit` | Chronological audit history | Protected; static demo data |

## Supabase Cloud Setup

1. Create a hosted project in the [Supabase Cloud dashboard](https://supabase.com/dashboard). Local Supabase is intentionally not used by AIMS.
2. In **Project Settings → API**, copy the project URL and public anon/publishable key.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to those public values.
4. For a fresh Cloud project, open **SQL Editor**, paste the complete contents of `supabase/schema.sql`, and run it once. For an existing project with older Phase 5 data, run `supabase/patches/phase5_default_workspace_dedupe_patch.sql` once instead.
5. In **Table Editor**, confirm that Row Level Security is enabled for all seven public tables and that each table has authenticated-user policies.
6. In **Authentication → Providers**, keep the Email provider enabled. Choose whether email confirmation is required for your project; AIMS supports either setting.

Never put a Supabase service-role key in `.env.local` or frontend code. It bypasses RLS and is not needed by this application. No Supabase CLI, local Supabase stack, or Docker service is required.

The schema is available both as executable SQL in `supabase/schema.sql` and as an explained reference in `docs/03_DATABASE_SCHEMA.md`.

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

Middleware protects `/dashboard`, `/agents`, `/tools`, `/knowledge`, `/runs`, and `/audit`. It also refreshes valid Supabase sessions. Authentication uses only the project URL and public anon/publishable key; authorization of future database queries remains enforced by RLS.

## Default workspace resolution

The protected server layout resolves the authenticated account before rendering any operational page. Using the user's cookie-backed Supabase session and public anon/publishable key, it reads or creates a `profiles` row, then queries the owned project where `is_default = true`. If none exists, it creates **AIMS Workspace** with the description **Default AI agent operations workspace** and `is_default = true`. Existing records are reused on refresh and future sign-ins. A partial unique index permits only one default per owner, and the helper recovers when concurrent requests race to create it. RLS permits inserts only when the project owner matches `auth.uid()`.

To verify this against Supabase Cloud:

1. For a fresh project, apply `supabase/schema.sql`. If the Cloud database contains older Phase 5 project rows, apply `supabase/patches/phase5_default_workspace_dedupe_patch.sql` once, then configure the two public environment variables.
2. Create or sign in as a real test user, then visit `/dashboard`.
3. In **Table Editor → profiles**, confirm one row has `id` equal to the Authentication user's ID and `role` equal to `student`.
4. In **Table Editor → projects**, confirm exactly one row for that owner has `is_default = true`, `AIMS Workspace` as its name, and the default description. Older duplicate rows must have `is_default = false`.
5. Refresh and sign out/in; confirm the same row IDs remain and the top bar shows the workspace name and email.

The dedupe patch adds `projects.is_default`, keeps the earliest project per owner as the normalized default, marks every later duplicate non-default without deleting it, and creates the partial unique index. It also aligns missing profile columns and keeps RLS enabled. The patch is safe and non-destructive: it does not drop tables, delete user data, create users, or add anonymous policies.

## Current status

This repository contains the runnable UI skeleton, the Supabase Cloud schema/RLS boundary, Phase 4 authentication, and Phase 5 profile/default-workspace resolution. All operational records and metrics remain deterministic demo data. CRUD buttons are intentionally non-functional, pages do not query Supabase for operational data, and no real AI APIs are called.

## Next implementation phases

1. Implement project-scoped CRUD for agents, tools, and knowledge sources.
2. Add manual run and run-step logging.
3. Replace demo metrics and audit events with project-scoped queries.
4. Verify RLS isolation with separate test users, then deploy to Vercel.

See the command center documents in `docs/` for the product boundary, architecture, schema rationale, phased plan, and verified resume narrative.
