# Database and RLS Explanation

## 1. Database purpose

Postgres is the source of truth for identity-linked workspace metadata and manually recorded operational evidence. It supports relational integrity and database-level access control; it is not an agent memory or vector store.

## 2. Main tables

The schema has seven public tables: `profiles`, `projects`, `agents`, `tools`, `knowledge_sources`, `agent_runs`, and `agent_run_steps`.

## 3. Table-by-table explanation

| Table | Purpose and important fields |
|---|---|
| `profiles` | One profile keyed by `auth.users.id`; optional name, role label, timestamp. |
| `projects` | Workspace ownership via `owner_id`; name, description, `is_default`. A partial unique index permits one default per owner. |
| `agents` | Project-owned inventory: name, role, model label, lifecycle (`active/paused/archived`), risk, description. The model is descriptive, not invoked. |
| `tools` | Project-owned capability registry: name, category, approval boolean, risk. Approval is a recorded decision, not a live enforcement gateway to an external tool. |
| `knowledge_sources` | Project-owned metadata: title, controlled source type, optional URL, active/inactive status. No source content is stored. |
| `agent_runs` | Manual execution evidence: project, nullable agent reference, task/output, outcome, risk snapshot, non-negative latency and estimated cost. |
| `agent_run_steps` | Optional evidence for a step: project, run, nullable tool, order, input/output, status. The UI currently creates at most one step per new run, although the schema can represent more. |

## 4. Relationships

```text
auth.users ──1:1── profiles
auth.users ──1:N── projects
projects ──1:N── agents/tools/knowledge_sources/agent_runs/agent_run_steps
agents ──1:N── agent_runs
agent_runs ──1:N── agent_run_steps
tools ──1:N── agent_run_steps
```

Project deletion cascades to operational data. User deletion cascades to profile/projects. Agent or tool deletion uses `set null` on historical references so run evidence can remain, while display text may become “Deleted agent” or lack a tool link. Composite same-project protections are documented in project materials and patches; ownership checks on steps also require the run and step project IDs to match.

## 5. Why project scoping exists

`project_id` is a tenant boundary and a useful query key. Even though the MVP exposes one default project, this avoids tying every business row directly to a user and leaves a path to multiple projects or organizations.

## 6. Supabase Auth relationship

Supabase Auth owns credentials and sessions in `auth.users`. `profiles.id` references the Auth user, while `projects.owner_id` establishes business ownership. RLS evaluates the signed-in identity through `auth.uid()`.

## 7. RLS policy model

- Every public table has RLS enabled.
- Profiles compare their `id` directly with `auth.uid()`.
- Projects compare `owner_id` with `auth.uid()`.
- Direct project children use `exists` to find a project whose ID matches the row and whose owner is the current user.
- Steps additionally prove that their run has the same project and that the project is owned by the user.
- Separate select, insert, update, and delete policies use `using` for accessible existing rows and `with check` for resulting rows.

## 8. How cross-user isolation works

Suppose user B sends user A's project UUID. The insert policy cannot find that project with `owner_id = auth.uid()` for B, so the insert is rejected. Reads return no unauthorized row. Updates/deletes cannot target rows outside B's accessible policy set. A guessed row UUID or modified request therefore does not create authorization.

## 9. Why no service-role key is used

A service-role credential bypasses RLS. Shipping it to a browser would expose unrestricted database access. AIMS needs only the public Supabase URL/key and the authenticated session, so all application operations remain subject to policies.

## 10. Avoiding trust in the browser

The server resolves the project from the authenticated user. Forms do not offer an editable project field, queries and target mutations include the resolved project ID, database checks constrain values, foreign keys constrain relationships, and RLS re-verifies ownership. The browser still transmits a project ID, so it is never inherently trusted; RLS is the decisive layer.

## 11. Common RLS interview questions

**Is the anon key a secret?** No. It identifies the Supabase project and is intended for public clients. Access is limited by roles, the user session, and RLS.

**Why filter by project if RLS already does it?** Filters express intent, reduce returned/scanned data, and prevent accidental mixing in application logic. They complement rather than replace RLS.

**What is the difference between `using` and `with check`?** `using` controls which existing rows an operation can see or target. `with check` controls whether a new or updated row state is allowed.

**Can a user move a row to another user's project?** The update's `with check` must pass for the new row, so the destination must also be owned by that user.

**Does RLS prove the whole app is secure?** No. It strongly protects row ownership, but production security also requires policy tests, input validation, secure Auth configuration, rate limits, dependency maintenance, and operational monitoring.

## 12. Limitations and production improvements

- Add automated two-user RLS integration tests for every CRUD operation.
- Make foreign-key columns non-null where historical/product rules permit.
- Add organization memberships and role-aware policies.
- Add append-only audit events and actor identity.
- Create transactional database functions for multi-row run ingestion.
- Add retention, archival, backups, and migration discipline.
- Validate URLs and business invariants more strictly.
- Review indexes and query plans using realistic volumes rather than claiming scale.
