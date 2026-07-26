# Project Overview

## 1. Project name

**AIMS — AI Agent Operations Control Plane** (the earlier PRD expands AIMS as AI Agent Management System; “Operations Control Plane” more precisely describes the implemented product).

## 2. Problem statement

As teams introduce support, research, and workflow agents, their operational facts become scattered: agent identities, lifecycle state, tool approvals, intended knowledge, run outcomes, risk, latency, and estimated cost. AIMS brings those facts into one reviewable workspace.

## 3. Target users

- Applied AI or platform engineers inventorying internal agents.
- Operators reviewing failures and `needs_review` outcomes.
- Security-minded reviewers checking tool approval and risk.
- Small teams evaluating an agent-governance workflow before adopting a larger platform.

These are intended personas, not claims of actual users.

## 4. Why this matters now

Agents can use tools and affect business workflows. Operational questions therefore extend beyond model quality: teams need ownership, permission decisions, evidence, and escalation states. AIMS explores that industry-relevant layer in a bounded MVP.

## 5. Product solution

AIMS provides a private default project with five operational modules: agents, tools, knowledge, runs, and audit. A dashboard joins those records into current metrics and recent activity.

## 6. Core workflow

1. Sign up or sign in.
2. Let the protected layout resolve or create the profile and default project.
3. Register agents and classify lifecycle/risk.
4. Register tools and record approval/risk decisions.
5. Register knowledge-source metadata.
6. Manually log run evidence and optionally one approved-tool step.
7. Review dashboard metrics and the derived audit timeline.

## 7. MVP scope

- Email/password Auth and protected routes.
- One owned default project per user.
- Agent, tool, and knowledge registries.
- Manual run and optional step evidence.
- Status, risk, latency, and estimated-cost fields.
- Current dashboard aggregates and five recent runs.
- Derived timeline of up to 50 recent combined events.
- Seven project-aware Postgres tables protected by RLS.

## 8. Explicitly out of scope

- Agent or LLM execution, provider API calls, orchestration, and streaming.
- Actual tool invocation, secrets, OAuth, or connectors.
- Document ingestion, RAG, embeddings, and vector search.
- Automated telemetry, jobs, queues, alerts, and billing.
- Organizations, invitations, roles, or approval workflows.
- Immutable compliance logging or any certification claim.
- Verified production deployment, real users, revenue, or scale.

## 9. What makes it resume-ready

The project connects a clear product problem to a coherent schema, authenticated UI, database authorization, operational metrics, error states, and documented limitations. It provides concrete implementation details to defend rather than relying on an “AI-powered” label.

## 10. What an interviewer should notice

- **Product judgment:** the runtime/control-plane boundary is explicit.
- **Security judgment:** RLS, not a hidden UI field, enforces ownership.
- **Data modeling:** run risk is retained as execution-time evidence and steps relate to runs.
- **Honesty:** manual evidence and derived audit history are labeled accurately.
- **Growth thinking:** the MVP has clear seams for runtime ingestion, RBAC, and scalable aggregation.
