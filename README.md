# AIMS — AI Agent Operations Control Plane

AIMS is a resume-ready full-stack system for registering AI agents, governing their tools and knowledge sources, and observing executions through metrics and an audit timeline.

## Problem

As companies deploy agents across support, sales, research, finance, and engineering, they need a central view of agent ownership, tool risk, run failures, latency, cost, and review-required behavior.

## Solution

AIMS provides a secure project workspace containing an agent registry, tool governance, knowledge-source inventory, execution logs, step traces, operational metrics, and chronological audit history.

## Features

- Supabase email/password authentication
- Protected dashboard and automatic default workspace
- Agent registry with lifecycle and risk status
- Tool registry with approval and risk status
- Knowledge-source registry
- Manual agent-run logger with output, status, latency, and estimated cost
- Step-level execution traces
- Dashboard metrics and audit timeline
- Project isolation through Supabase RLS
- Realistic demo seed data

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Cloud: Auth, Postgres, RLS, functions, and triggers
- Vercel

## Architecture summary

Next.js provides the user interface and authenticated application layer. Supabase Auth manages identities. All operational data lives in Supabase Postgres and belongs to a project. RLS checks project ownership for every database operation. AIMS does not include a custom backend server or a real AI runtime.

## Demo flow

1. Sign in and review fleet metrics.
2. Inspect active and high-risk agents.
3. Compare approved and unapproved tools.
4. Review registered knowledge sources.
5. log a success, failure, or review-required run.
6. Inspect its step-level trace.
7. Confirm updated dashboard metrics and audit history.

## Setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase Cloud project.
3. Run the SQL in `docs/03_DATABASE_SCHEMA.md` using the Supabase SQL Editor.
4. Create `.env.local` from `.env.example` and add the public Supabase values.
5. Start the application:

   ```bash
   npm run dev
   ```

6. Sign up, confirm the default workspace, and load demo data from the application.
7. Add the same environment variables to Vercel and deploy.

Do not use the Supabase service-role key in this application.

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

## Screenshots

- `[Dashboard screenshot]`
- `[Agent registry screenshot]`
- `[Run details screenshot]`
- `[Audit timeline screenshot]`

## Resume relevance

AIMS demonstrates Applied AI operations, agent governance, execution observability, full-stack product engineering, relational backend design, Supabase Auth, database-level tenant isolation, dashboarding, and cloud deployment.

See `docs/05_RESUME_NOTES.md` for verified resume bullets and interview preparation.
