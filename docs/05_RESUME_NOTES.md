# AIMS Resume and Interview Notes

## Project summary

AIMS is a full-stack AI Agent Operations Control Plane that centralizes agent inventory, tool governance, knowledge-source registration, execution observability, cost/latency monitoring, and audit history. The MVP uses Next.js and Supabase Cloud, with project isolation enforced through PostgreSQL Row Level Security.

## Resume title

**AIMS — AI Agent Operations & Governance Control Plane**

## Resume bullets

- Built a full-stack control plane for registering AI agents, governing tool access, and auditing executions across support, sales, research, finance, and engineering workflows.
- Designed project-scoped Supabase Postgres tables and Row Level Security policies to enforce tenant isolation at the database layer rather than relying on frontend filters.
- Implemented execution observability with run status, step-level traces, latency, estimated cost, risk snapshots, failure tracking, and a chronological audit timeline.
- Developed an operational dashboard in Next.js and TypeScript that aggregates active agents, failed runs, average latency, estimated cost, high-risk agents, and approved tools.
- Implemented authenticated, project-scoped agent inventory CRUD through Supabase Cloud, combining explicit workspace filters with Postgres RLS authorization.
- Built project-scoped tool-governance CRUD for approval and risk controls through authenticated Supabase Cloud sessions, with explicit workspace filters and RLS isolation.

Use the strongest three bullets that match the role and only claim features that are working in the deployed build.

## Technical skills demonstrated

- Next.js App Router and TypeScript
- React server/client component boundaries
- Tailwind CSS and responsive dashboard UI
- Supabase Auth and session-aware routing
- PostgreSQL schema design, constraints, indexes, functions, and triggers
- Supabase RLS and project-scoped authorization
- Full-stack CRUD, aggregations, deployment, and manual verification

## Applied AI skills demonstrated

- Agent inventory and lifecycle status
- Human approval and tool-governance concepts
- Execution observability and step-level traces
- Agent risk classification and review states
- Latency, failure, and estimated-cost monitoring
- Clear separation between an agent runtime and its operations control plane

## Backend and security skills demonstrated

- User identities separated from public profile data
- Default workspace creation after signup
- Ownership represented through `projects.owner_id`
- RLS on every public table
- Database constraints for enumerated states and non-negative metrics
- Cross-project reference protection through composite foreign keys
- Privilege-limited demo seed function
- Project-scoped agent reads, inserts, status updates, and deletes through the user's RLS-limited session
- Project-scoped tool reads, inserts, approval/risk updates, and deletes through the user's RLS-limited session
- Project-scoped knowledge-source governance CRUD through Supabase Cloud with explicit query scoping and RLS ownership enforcement

## Demo explanation

“AIMS does not try to build another agent framework. It manages the operational layer around agents. I can register agents and the tools or knowledge they may use, then log executions with status, output, latency, cost, risk, and step-level evidence. The dashboard shows fleet health, and the audit timeline makes risky or failed behavior reviewable. Supabase Auth identifies the user, while Postgres RLS ensures that the user can access only their project.”

## Interview explanation

Start with the engineering problem, not the UI:

1. AI agents gain access to increasingly sensitive business tools.
2. Teams need inventory, governance, observability, and audit history.
3. AIMS models those concerns in a small, inspectable data system.
4. The Next.js UI is the operational surface.
5. Supabase provides identity, persistence, and the authorization boundary.
6. The MVP logs simulated/manual runs because reliable operations modeling can be demonstrated without hiding behind a real AI API.

## Likely interview questions and strong answers

### 1. Why is this an Applied AI project if it does not call an LLM?

The MVP focuses on the systems around AI execution: agent inventory, tool approval, run traces, review states, latency, cost, and risk. These are real Applied AI engineering concerns. Avoiding a live model dependency keeps the demo deterministic; a production runtime can later send the same execution events.

### 2. Why call it a control plane?

A control plane manages configuration, policy, and visibility, while a data plane performs the actual work. AIMS manages agent metadata, governance, and execution records; it intentionally does not execute agents.

### 3. Why use Supabase as the only backend?

It provides Auth, Postgres, RLS, triggers, and database functions in one managed platform. That meets the one-day constraint while retaining a real relational model and database-level authorization.

### 4. How is tenant isolation enforced?

Every business row contains a `project_id`. RLS checks whether the current authenticated user owns that project. The UI also scopes queries, but RLS remains the actual security boundary.

### 5. Why have both profiles and auth users?

`auth.users` is managed by Supabase and stores identity credentials. `profiles` contains application-visible user data and can be queried safely under RLS.

### 6. How is the default project created?

The protected Next.js server layout resolves the authenticated user, then inserts a missing profile and default project through the user's ordinary Supabase session. RLS checks ownership, while a partial unique index permits only one `is_default = true` workspace per owner without a service-role key.

### 7. Why store a risk level on a run when the agent already has one?

The run value is a historical snapshot. If an agent's risk classification changes later, old audit records still reflect the risk understood at execution time.

### 8. How do you prevent a run from referencing another project's agent?

`agent_runs` stores both `agent_id` and `project_id`, backed by a composite foreign key to `agents(id, project_id)`. RLS protects access, and the constraint protects relational integrity.

### 9. How are dashboard metrics calculated?

They are project-scoped aggregates: counts with status/risk filters, average latency over completed records, and the sum of estimated cost. For this MVP, the dataset is small enough to calculate on page load.

### 10. What does `needs_review` mean?

The run completed but produced an output or action that requires human judgment. It is separate from `failed`, which represents an execution that did not complete successfully.

### 11. What is the purpose of agent run steps?

Steps provide trace-level context within one run, such as planning, tool selection, lookup, and response generation. They help locate the stage associated with latency or failure.

### 12. What security mistake would be most serious here?

Treating a frontend `project_id` filter as authorization. A user can modify browser requests. RLS must independently validate ownership for every operation.

### 13. Why use estimated rather than billed cost?

The MVP does not execute real models or reconcile provider invoices. The field demonstrates cost observability while honestly labeling the value as an estimate.

### 14. What would break first at larger scale?

Repeated client-side or page-load aggregation would become inefficient. I would add indexed time-window queries, database views or RPC aggregation, pagination, and asynchronous event ingestion.

### 15. What would you build next for production?

I would add organizations and roles, append-only event ingestion with API keys, real runtime integrations, approval workflows, immutable audit retention, alerting, provider-specific cost calculation, and stronger observability.

## Future production improvements

- Organizations, project memberships, and role-based access
- Project-scoped ingestion API keys stored only as hashes
- Append-only event ingestion from real agent runtimes
- Real tool connections and scoped approval workflows
- Provider-specific token and cost accounting
- Alerts for failure rate, latency, cost, and risky actions
- Immutable audit retention and export
- Database views or RPCs for time-windowed metrics
- Pagination, search, filtering, and data retention policies
- Automated tests for RLS, validation, and dashboard calculations

These are roadmap items, not MVP claims.
