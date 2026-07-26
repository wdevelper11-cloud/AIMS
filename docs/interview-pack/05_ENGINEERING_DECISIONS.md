# Engineering Decisions

## 1. Why Next.js App Router

App Router supports public/protected route organization, shared layouts, Server Components for initial reads, and Client Components only where interaction is needed. The tradeoff is learning two execution environments and being precise about session handling.

## 2. Why TypeScript

Shared types make controlled statuses, risks, and database record shapes explicit across pages and components. TypeScript reduces accidental field mismatches, though it does not replace runtime or database validation.

## 3. Why Tailwind CSS

Tailwind made a consistent portfolio UI possible without adding a component framework. The tradeoff is verbose class strings and the need for discipline around repeated patterns.

## 4. Why Supabase Cloud

Managed Postgres, Auth, browser/server clients, and RLS cover the MVP backend with little infrastructure. The tradeoff is platform coupling and reliance on correct hosted configuration.

## 5. Why Supabase Auth

It provides signup, login, sessions, and a database-visible user identity. Building password/session security from scratch would add risk without improving the product lesson.

## 6. Why Supabase RLS

RLS moves tenant authorization to the data boundary. A missing frontend filter then does not automatically expose another user's rows. The cost is policy complexity and the need for dedicated tests as the permission model grows.

## 7. Why project/workspace scoping

Project ownership separates tenancy from individual records and keeps a future multi-project path open. One default project keeps this MVP understandable; it is not yet organization collaboration.

## 8. Why server-side logic and helpers

Server Components resolve the authenticated workspace, perform initial reads, and compose metrics/audit data before rendering. Shared client factories and the workspace helper avoid duplicated session logic. Interactive mutations remain in focused client registries.

## 9. Why no service-role key

Normal user actions should be authorized as that user. A service role would bypass the central RLS guarantee and would be catastrophic if exposed in client code.

## 10. Why no real AI API in the MVP

The product studies inventory, governance, and observability around agents, not response generation. Manual evidence makes demos reproducible, avoids provider costs/secrets, and keeps the schema provider-neutral. A real integration would require authenticated ingestion, retries, idempotency, token/cost normalization, and secrets—not merely one SDK call.

## 11. Why no Docker/local Supabase

The documented setup targets Supabase Cloud and uses its SQL editor. This reduces local infrastructure for a small portfolio project. The tradeoff is less reproducible offline integration testing; production-minded development would add migrations and an isolated test environment.

## 12. AIMS-specific choices

### Control plane, not runtime

Separating observation/governance from execution avoids coupling AIMS to one framework or model provider and makes the boundary honest.

### Manually logged run evidence

Manual input proves the data model and review workflow deterministically. It does not prove automated observability and can contain inaccurate estimates.

### Tools and knowledge as registries

These records document permitted capabilities and intended sources without pretending to connect, invoke, ingest, or secure external systems.

### Audit derived from operational records

A derived timeline adds review value without a separate event pipeline. Its weakness is mutability and incomplete action coverage, so it is not called a compliance log.

## 13. Key tradeoffs and mistakes avoided

- **Simple aggregation vs scale:** in-memory totals are easy to inspect but not suited to millions of rows.
- **Sequential run/step writes vs atomicity:** feedback is clear, but partial success is possible.
- **Single-owner workspace vs collaboration:** authorization stays understandable, but there is no RBAC.
- **Browser mutations vs server-only writes:** fewer layers, while RLS remains essential.
- Avoided fake metrics, fake AI responses, exposed secrets, service-role use, editable tenant fields, and claims of immutable audit or verified deployment.

## 14. What I would improve next

1. Automated two-user RLS and end-to-end tests.
2. A scoped telemetry ingestion endpoint with idempotency and schema validation.
3. Transactional creation of a run and its steps.
4. Organization membership and role-based approvals.
5. Append-only audit events with actor/action context.
6. Database-side time windows, pagination, filtering, and query monitoring.
7. Provider adapters only after secrets, retry, and cost semantics are designed.
