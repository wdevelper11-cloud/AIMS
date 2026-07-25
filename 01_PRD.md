# AIMS Product Requirements Document

## Product name

**AIMS — AI Agent Management System**

## One-line pitch

AIMS is an AI Agent Operations Control Plane for registering agents, governing their tools and knowledge sources, and monitoring every execution from one secure workspace.

## Problem statement

Companies are adding AI agents to support, sales, research, finance, and engineering workflows. These agents are often tracked in separate scripts, spreadsheets, or vendor dashboards. Teams lack one place to answer:

- Which agents are active?
- Which tools and knowledge sources can they use?
- Which runs failed or require human review?
- What latency and estimated cost are agents producing?
- Which agents or tools introduce the most risk?

AIMS provides that operational view without attempting to build or orchestrate the agents themselves.

## Target users

- Applied AI and AI platform engineers managing internal agents
- Engineering teams evaluating agent reliability and cost
- Operations and security leads reviewing risky agent behavior
- Startups demonstrating basic governance before adopting a larger platform

## Why this matters now

AI agents are moving from experiments into business workflows. An incorrect support reply is inconvenient; an agent with email, database, or finance access can create a material incident. Teams need inventory, governance, observability, and auditability alongside agent development.

## MVP scope

The one-day MVP includes:

1. Email/password authentication and protected dashboard routes
2. One default project created for each user
3. Agent registry with status and risk classification
4. Tool registry with approval and risk status
5. Knowledge-source registry without ingestion or retrieval
6. Manual agent-run logging with output, status, latency, and estimated cost
7. Optional execution steps attached to a run
8. Dashboard metrics calculated from project-owned data
9. Chronological audit timeline
10. Demo data covering healthy, failed, review-required, and high-risk cases

## Out of scope

- Real LLM or agent execution
- Multi-agent orchestration
- Tool invocation or OAuth connections
- RAG, embeddings, or vector search
- Automated approval workflows
- Teams, invitations, or role-based access
- Billing, payments, and usage metering
- Custom backend services, background workers, or queues
- Production compliance claims

## User stories

- As a user, I can sign up and receive a private default workspace.
- As an operator, I can register an agent with its model, role, status, and risk level.
- As a governance reviewer, I can see which tools are approved and which remain unapproved.
- As an operator, I can record the result, latency, cost, and status of an agent run.
- As an engineer, I can inspect steps within a run to understand where it failed.
- As a manager, I can view operational metrics across the workspace.
- As an auditor, I can scan a chronological timeline of agent activity.
- As a demo user, I can load realistic sample data instead of viewing an empty product.
- As a workspace owner, I cannot read or modify another user's project data.

## Success criteria

The MVP is resume-ready when:

- A new user can sign up, sign in, sign out, and access only protected routes.
- A default project exists automatically after signup.
- Agent, tool, knowledge-source, and run records can be created and viewed.
- Dashboard metrics match the underlying seeded records.
- The audit timeline displays newest runs first with agent, task, status, time, latency, cost, and risk.
- RLS prevents cross-project reads and writes even if a client request is manually modified.
- The app is deployed to Vercel and uses only Supabase Cloud for backend capabilities.
- The repository contains setup instructions, screenshots, and a clear engineering narrative.

## Demo flow

1. Sign in and land on the operations dashboard.
2. Explain the metric cards: agent inventory, run health, latency, cost, risk, and tool approval.
3. Open **Agents** and highlight an active high-risk Invoice Processing Agent.
4. Open **Tools** and compare approved Web Search with unapproved Database Query.
5. Open **Knowledge** and show registered documentation, policy, and CRM sources.
6. Log a new run for an agent with `needs_review` status, latency, cost, and output.
7. Return to the dashboard and show the updated metrics.
8. Open **Audit** and inspect the new event and its run steps.
9. Close with the security model: every record is project-scoped and enforced by Supabase RLS.
