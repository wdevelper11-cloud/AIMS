# Resume and Profile Language

## 1. Short project title

**AIMS — AI Agent Operations Control Plane**

## 2. One-line resume description

Built a project-scoped operations control plane for agent inventory, tool governance, knowledge metadata, manual execution evidence, and risk review using Next.js, TypeScript, Supabase Auth, Postgres, and RLS.

## 3. Six strong resume bullets

- Built a Next.js/TypeScript control-plane MVP spanning six protected workflow pages for agent inventory, governance, run monitoring, metrics, and activity review.
- Designed a seven-table Supabase Postgres model linking users, projects, agents, tools, knowledge sources, runs, and run steps with controlled states and relational constraints.
- Implemented email/password Auth and project-scoped Row Level Security so Postgres independently verifies record ownership for authenticated CRUD operations.
- Developed manual run-evidence tracking for outcome, risk snapshot, output, latency, estimated USD cost, and an optional approved-tool step.
- Composed live workspace records into nine dashboard metrics, five recent runs, and a 50-event derived timeline with distinct empty and failure states.
- Kept the system provider-agnostic by separating the operations control plane from agent execution and documenting secure telemetry integration as future work.

## 4. Three shorter bullets

- Built an authenticated AI-agent operations dashboard with Next.js and Supabase.
- Enforced project isolation using Postgres RLS and signed-in user sessions.
- Modeled agent risk, tool approvals, run evidence, metrics, and review history.

## 5. Three technical bullets

- Structured App Router Server Components for protected reads and Client Components for validated registry mutations and refresh flows.
- Added database checks, foreign keys, project-aware indexes, and ownership policies across seven public tables.
- Implemented concurrent dashboard/audit reads and normalized cross-table records into a chronological operational view.

## 6. Three product/business bullets

- Translated fragmented agent operations into one workflow covering inventory, approved capabilities, execution health, and human review.
- Distinguished current agent risk from execution-time run risk to preserve useful operational context.
- Defined honest MVP boundaries: no model execution, knowledge ingestion, immutable compliance log, or claimed production deployment.

## 7. Skills demonstrated

Product scoping, system design, Next.js App Router, React, TypeScript, Tailwind CSS, Supabase, PostgreSQL, authentication, RLS authorization, relational modeling, validation, error/empty-state UX, operational metrics, agent governance concepts, security tradeoff communication, and technical writing.

## 8. ATS keywords

`Applied AI`, `AI agents`, `agent operations`, `agent governance`, `full-stack`, `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Supabase`, `PostgreSQL`, `Supabase Auth`, `Row Level Security`, `RLS`, `multi-tenant`, `data modeling`, `observability`, `risk management`, `human-in-the-loop`, `App Router`, `Server Components`.

## 9. LinkedIn/GitHub description

AIMS is a portfolio MVP exploring the control plane around AI-agent systems. It provides a private workspace to register agents, record tool approval and knowledge-source metadata, manually log run outcomes/latency/estimated cost, and review dashboard metrics and a derived audit timeline. Built with Next.js, TypeScript, Tailwind, and Supabase Auth/Postgres/RLS. It does not execute agents, call model providers, ingest documents, or claim production deployment.

## 10. Thirty-second recruiter explanation

> I built AIMS to explore what teams need after they create several AI agents. It is an authenticated dashboard that tracks the agents, approved tools, intended knowledge sources, and manually recorded run outcomes. I used Next.js and Supabase, with database-level Row Level Security for private workspaces. It is a portfolio MVP rather than a deployed agent runtime, but it demonstrates full-stack AI-platform thinking and honest security tradeoffs.
