# AIMS — AI Agent Operations Control Plane

AIMS is a resume-ready operations control plane for registering AI agents, governing their approved tools and knowledge sources, and observing executions through latency, estimated cost, failures, risk, and an audit trail.

## Problem

As AI agents move into support, sales, finance, research, and engineering workflows, teams often lack one place to understand what agents exist, which capabilities they can access, and how reliably they operate.

## Solution

AIMS provides a project-scoped operational workspace for agent inventory, governance, and execution evidence. This initial skeleton demonstrates the product structure with static data; it does not execute agents or claim production compliance.

## Skeleton features

- Product landing and static login/signup experience
- Shared responsive SaaS dashboard shell and navigation
- Eight operational metric cards
- Agent, tool, knowledge-source, and run registries backed by typed demo data
- Chronological audit timeline with status, risk, cost, and latency
- Supabase Cloud browser-client foundation
- Complete seven-table Postgres schema with constraints, triggers, and RLS

## Tech stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- Supabase Cloud (planned Auth, Postgres, and RLS backend)
- Vercel-ready Next.js deployment

No custom API server, ORM, local Supabase stack, AI runtime, or vector database is included.

## Architecture summary

Next.js is the application and presentation layer. Supabase Cloud is the only planned backend: Auth identifies users, Postgres stores project-owned operational records, and Row Level Security enforces ownership. The public URL and anon/publishable key are the only Supabase credentials intended for the browser; never expose a service-role key.

The current UI reads only `lib/demo-data.ts`. Supabase connectivity, authentication, protected routes, CRUD, and live metrics are intentionally deferred to later phases.

## Routes

| Route | Purpose | Current state |
|---|---|---|
| `/` | Product landing page | Static |
| `/login` | Login/signup preview | Static; auth not connected |
| `/dashboard` | Fleet health and recent runs | Static demo data |
| `/agents` | Agent registry | Static demo data |
| `/tools` | Governed tool registry | Static demo data |
| `/knowledge` | Knowledge-source inventory | Static demo data |
| `/runs` | Execution log | Static demo data |
| `/audit` | Chronological audit history | Static demo data |

## Supabase Cloud setup

1. Create a hosted Supabase project at Supabase Cloud. Do not initialize local Supabase.
2. Open its SQL Editor and run `supabase/schema.sql` once. The SQL creates profiles, projects, agents, tools, knowledge sources, agent runs, and run steps; enables RLS; and installs project-isolation policies.
3. Copy `.env.example` to `.env.local` and fill in the public project values.
4. Do not place the service-role key in this application.

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

## Current status

This repository contains the initial runnable skeleton only. All visible records and metrics are deterministic demo data. Buttons are intentionally non-functional, authentication is not implemented, pages do not query Supabase, and no real AI APIs are called.

## Next implementation phases

1. Connect Supabase Auth and protect application routes.
2. Resolve the authenticated user's default project.
3. Implement project-scoped CRUD for agents, tools, and knowledge sources.
4. Add manual run and run-step logging.
5. Replace demo metrics and audit events with project-scoped queries.
6. Verify RLS isolation with separate test users, then deploy to Vercel.

See the command center documents in `docs/` for the product boundary, architecture, schema rationale, phased plan, and verified resume narrative.
