# AIMS One-Day Implementation Plan

## Execution rules

- Complete phases in order and keep each commit runnable.
- Use Supabase Cloud only; do not initialize local Supabase.
- Do not introduce a custom backend, ORM, AI API, or extra MVP feature.
- Run type-checking and linting after every implementation phase.
- Prefer a complete vertical slice over premature abstraction.

## Phase 0 — Repository setup

**Goal:** Create a clean Next.js TypeScript foundation.

**Files likely touched:** `package.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `.env.example`

**Acceptance criteria:**

- Next.js App Router, TypeScript, and Tailwind CSS run locally.
- `npm run dev`, `npm run lint`, and `npm run build` succeed.
- `.env.example` contains only public Supabase placeholders.

**Manual test checklist:**

- Open `/` and confirm a responsive landing shell.
- Confirm `.env.local` is ignored.
- Confirm no backend or AI dependencies were added.

**Commit:** `chore: initialize aims nextjs application`

## Phase 1 — Command center docs

**Goal:** Lock the product boundary, architecture, schema, tasks, and interview narrative.

**Files likely touched:** `docs/01_PRD.md`, `docs/02_ARCHITECTURE.md`, `docs/03_DATABASE_SCHEMA.md`, `docs/04_TASKS.md`, `docs/05_RESUME_NOTES.md`, `README.md`

**Acceptance criteria:**

- All six requested documents exist and agree on scope.
- The schema uses only the required seven public tables.
- Out-of-scope items are explicit.

**Manual test checklist:**

- Search docs for prohibited technologies.
- Verify every required module appears in the PRD and tasks.
- Verify resume claims do not exceed the MVP.

**Commit:** `docs: add aims command center`

## Phase 2 — Codex skeleton generation

**Goal:** Build navigation, route shells, and reusable visual components without business logic.

**Files likely touched:** `app/(auth)/**`, `app/(dashboard)/**`, `components/**`, `app/globals.css`

**Acceptance criteria:**

- Public and dashboard route shells exist.
- Sidebar navigation reaches every required module.
- Metric card, status badge, risk badge, table, form, empty, and loading states are reusable.

**Manual test checklist:**

- Visit every route on desktop and mobile widths.
- Confirm navigation state and page titles.
- Confirm no fake backend logic is embedded in components.

**Commit:** `feat: scaffold aims dashboard experience`

## Phase 3 — Supabase schema and RLS

**Status:** Completed — Supabase Cloud schema and static RLS review are ready; the two-user isolation test remains a manual check in the target Cloud project.

**Goal:** Create the relational model and database authorization boundary.

**Files touched:** `supabase/schema.sql`, `docs/03_DATABASE_SCHEMA.md`, `docs/04_TASKS.md`, `README.md`

**Acceptance criteria:**

- The SQL runs in Supabase Cloud without errors.
- All seven required tables, controlled-value constraints, foreign-key indexes, and policies exist.
- RLS is enabled on all seven tables and policies are restricted to authenticated owners.
- No local Supabase dependency, seed user, auth UI, CRUD implementation, or service-role credential was added.

**Manual test checklist:**

- [ ] Run `supabase/schema.sql` once in a new Supabase Cloud project's SQL Editor without errors.
- [ ] Inspect all seven tables, foreign keys, indexes, and check constraints in Supabase.
- [ ] Confirm RLS is enabled and four authenticated policies exist on every public table.
- [ ] As user A, create a profile, project, direct child records, a run, and a run step.
- [ ] As user B, confirm user A's records are invisible and writes using A's project/run IDs fail.
- [ ] Confirm an anonymous session cannot access rows and no service-role key is present in the client.

**Commit:** `feat: add project scoped supabase schema and rls`

## Phase 4 — Supabase Auth

**Status:** Implemented in the Phase 4 codebase; Cloud-project authentication remains a deployment-specific manual check.

**Goal:** Implement email/password signup, login, logout, and protected routes.

**Files touched:** `app/login/page.tsx`, `app/(protected)/**`, `middleware.ts`, `lib/supabase/**`, `components/layout/**`

**Acceptance criteria:**

- [x] Signup, login, logout, session refresh, and redirects are implemented.
- [x] Unauthenticated users cannot open dashboard routes.
- [x] Auth errors, success feedback, and loading states are visible.
- [x] The authenticated user's email is displayed in the application shell.
- [x] Only the Supabase project URL and public anon/publishable key are used.

**Manual test checklist:**

- Create an account and complete any configured email confirmation.
- Refresh a protected page and remain signed in.
- Sign out and confirm `/dashboard` redirects to `/login`.

**Commit:** `feat: implement supabase authentication`

## Phase 5 — Default project/workspace logic

**Status:** Implemented — Cloud record creation and refresh/re-login reuse remain manual checks in the target project.

**Goal:** Resolve one private default workspace for every authenticated user.

**Files touched:** `lib/workspace.ts`, `app/(protected)/layout.tsx`, `components/layout/**`, `supabase/schema.sql`, documentation

**Acceptance criteria:**

- [x] The protected server layout creates a missing profile and default project through the authenticated RLS session.
- [x] The single `is_default = true` project is reused on refresh and re-login.
- [x] The top bar displays the resolved workspace name and signed-in email.
- [x] Resolution failures render a clear error state instead of unscoped demo pages.

**Manual test checklist:**

- [ ] Sign up a fresh account, visit `/dashboard`, and inspect its profile/project rows in Supabase Cloud.
- [ ] Confirm exactly one project per owner has `is_default = true`, the required name, and the required description.
- [ ] Confirm older duplicate rows have `is_default = false` and were not deleted.
- [ ] Refresh three times and sign out/in; confirm the default project ID is unchanged and no duplicate default exists.
- [ ] Confirm existing users see only their own project and the top bar shows their email and workspace.
- [ ] Tamper with a project owner ID and confirm RLS rejects the write.

**Schema alignment validation:**

- [ ] For older or duplicated Phase 5 data, run `supabase/patches/phase5_default_workspace_dedupe_patch.sql` once in Supabase SQL Editor.
- [ ] Confirm `profiles.role`, `profiles.full_name`, and `profiles.created_at` exist; the workspace helper no longer selects `profiles.role` during resolution.
- [ ] Sign in, visit `/dashboard`, and confirm profile/default-project creation succeeds without a workspace error.
- [ ] Confirm the partial unique index rejects a second `is_default = true` project for the same owner.
- [ ] Refresh and sign in again, confirming the same default project is reused.

**Commit:** `feat: add default user workspace`

## Phase 6 — Agent registry

**Status:** Implemented — Supabase Cloud persistence and cross-user isolation remain manual checks in the target project.

**Goal:** Create and manage the workspace's AI-agent inventory.

**Files touched:** `app/(protected)/agents/page.tsx`, `components/agents/AgentsRegistry.tsx`, `components/ui/Badge.tsx`, `lib/types.ts`, documentation

**Acceptance criteria:**

- [x] Initial data is loaded server-side and filtered by the resolved default project ID.
- [x] Users can create agents, update lifecycle status, and delete agents.
- [x] Required fields, defaults, and allowed status/risk values are validated by the UI and database constraints.
- [x] Every mutation is explicitly project-scoped in addition to RLS enforcement.
- [x] Empty, success, and Supabase error states are visible without demo-data fallback.
- [x] Status and risk are visually distinct.

**Manual test checklist:**

- [ ] Sign in as user A, open `/agents`, and confirm the empty state for a new workspace.
- [ ] Create Support Triage Agent and verify its values and `project_id` in Supabase Table Editor.
- [ ] Change its status from active to paused and verify persistence after refresh.
- [ ] Delete it and verify that the Cloud row is removed.
- [ ] Attempt blank required input and confirm it is rejected.
- [ ] Sign out and confirm `/agents` redirects to `/login`.
- [ ] Sign in as user B and confirm user A's agents are isolated by RLS.

**Commit:** `feat: build agent registry`

## Phase 7 — Tool registry

**Status:** Implemented and programmatically validated.

**Goal:** Show tool inventory, approval state, and governance risk.

**Files likely touched:** `app/(dashboard)/tools/page.tsx`, `components/forms/tool-form.tsx`, `lib/queries/tools.ts`, `lib/validation/tools.ts`

**Acceptance criteria:**

- [x] Users can list, create, update approval/risk, and delete tools in their resolved default project.
- [x] Approval and risk states are clear.
- [x] Reads and every mutation are explicitly project-scoped in addition to RLS.
- [x] Empty and Supabase query-error states never fall back to demo data.

**Manual test checklist:**

- [ ] Register Web Search as an approved, medium-risk Search tool and verify its `project_id` in Supabase Cloud.
- [ ] Change approval to unapproved and risk to high, then verify persistence after refresh.
- [ ] Delete the tool and verify that the Cloud row is removed.
- [ ] Sign out and confirm `/tools` redirects to `/login`.
- [ ] Sign in as user B and confirm user A's records are isolated by RLS.

**Schema-alignment validation:**

- [ ] For an existing Cloud project with missing Tool Registry fields, run `supabase/patches/phase7_tools_registry_patch.sql` once in Supabase SQL Editor.
- [ ] Confirm `tools.is_approved`, `tools.category`, `tools.risk_level`, and `tools.created_at` exist with the documented defaults.
- [ ] Confirm `tools_risk_level_check`, `tools_project_id_idx`, and RLS remain enabled without anonymous or unconditional policies.
- [ ] Refresh `/tools` and confirm the schema guidance is replaced by the live registry.
- [ ] Confirm pre-existing tool rows remain present and null approval/risk values were normalized without deleting data.

**Commit:** `feat: add governed tool registry`

## Phase 8 — Knowledge source registry ✅ Implemented

**Goal:** Record which sources agents may reference without implementing RAG.

**Files likely touched:** `app/(dashboard)/knowledge/page.tsx`, `components/forms/knowledge-source-form.tsx`, `lib/queries/knowledge-sources.ts`, `lib/validation/knowledge-sources.ts`

**Acceptance criteria:**

- [x] Users can list, create, update status, and delete project-scoped sources.
- [x] Title, source type, URL, and status are visible.
- [x] Initial reads and every mutation use the resolved default project ID in addition to RLS.
- [x] Query failures show an explicit error without demo-data fallback.
- [x] The UI makes clear that sources are registered, not ingested.

**Manual test checklist:**

- [ ] Confirm the professional empty state for a workspace without sources.
- [ ] Create Support Playbook as Internal Docs and verify its resolved `project_id` in Supabase Cloud.
- [ ] Change status from active to inactive and back, checking the Cloud row after each update.
- [ ] Delete the source after confirmation and verify Cloud deletion.
- [ ] Sign out and confirm `/knowledge` redirects to `/login`; optionally verify isolation with a second user.
- [x] Confirm no embedding, ingestion, file-upload, or retrieval dependency exists.

**Phase 8 source-type repair validation:**

- [x] UI option values use canonical lowercase/snake-case database values while rendering friendly labels.
- [x] Fresh schema restricts `source_type` to the nine canonical values and defaults it to `website`.
- [x] `supabase/patches/phase8_knowledge_source_type_patch.sql` safely normalizes existing friendly-label and prototype values without deleting rows or weakening RLS.
- [ ] Run the patch in an existing Supabase Cloud project, create **Internal Docs**, and confirm the stored value is `internal_docs` while the UI label remains **Internal Docs**.
- [ ] Confirm active/inactive updates, deletion, `/agents`, `/tools`, logout, and protected-route behavior still work.

**Commit:** `feat: add knowledge source registry`

## Phase 9 — Agent run logger ✅ Implemented

**Goal:** Deliver the primary demo feature: auditable agent executions.

**Files likely touched:** `app/(dashboard)/runs/page.tsx`, `app/(dashboard)/runs/[id]/page.tsx`, `components/forms/run-form.tsx`, `components/forms/run-step-form.tsx`, `lib/queries/runs.ts`, `lib/validation/runs.ts`

**Acceptance criteria:**

- [x] `/runs` lists live runs filtered to the resolved default project with agent names mapped from a separately scoped query.
- [x] Users can manually log agent, task, output, status, normalized execution risk, non-negative latency, and non-negative estimated cost.
- [x] Users can attach one optional approved-tool step; no agent execution or workflow builder is included.
- [x] Agent and tool choices come only from the current project, and RLS independently enforces ownership.
- [x] Query failures render an explicit error without demo fallback.
- [x] The non-destructive Phase 9 Cloud patch aligns tables, indexes, constraints, RLS, and authenticated-owner policies.

**Manual test checklist:**

- [ ] Run `supabase/patches/phase9_agent_runs_patch.sql` in Supabase Cloud SQL Editor.
- [ ] Log success, failure, and review-required runs; confirm each value and resolved `project_id` in Table Editor.
- [ ] Confirm a default selection stores `risk_level = medium`, a high-risk selection stores `risk_level = high`, and the table renders each risk badge.
- [ ] Attempt negative/fractional latency and negative cost; confirm client and database rejection.
- [ ] Add an optional approved-tool step and verify its `run_id`, `tool_id`, order, input/output, and status.
- [ ] Refresh without duplicating rows; verify logout protection and optional cross-user RLS isolation.
- [ ] Confirm `/dashboard`, `/agents`, `/tools`, `/knowledge`, `/login`, logout, topbar, and default-workspace behavior are unchanged.

**Commit:** `feat: implement agent execution logging`

## Phase 10 — Dashboard metrics

**Goal:** Summarize agent operations from real project records.

**Files likely touched:** `app/(dashboard)/dashboard/page.tsx`, `components/metric-card.tsx`, `lib/queries/metrics.ts`

**Acceptance criteria:**

- Display total/active agents, total/failed runs, average latency, total estimated cost, high-risk agents, and approved tools.
- Empty datasets return zero rather than errors.
- Values update after relevant records change.

**Manual test checklist:**

- Compare every card with manual database counts.
- Add a failed run and confirm totals update.
- Verify cost formatting and average-latency units.

**Commit:** `feat: add agent operations metrics`

## Phase 11 — Audit timeline

**Goal:** Provide a chronological view of operational events.

**Files likely touched:** `app/(dashboard)/audit/page.tsx`, `components/audit-timeline.tsx`, `lib/queries/runs.ts`

**Acceptance criteria:**

- Newest runs appear first.
- Each event shows agent, task, status, timestamp, latency, cost, and run-time risk.
- Each event links to run details.

**Manual test checklist:**

- Add runs at different times and verify ordering.
- Confirm all required fields are readable on mobile.
- Open an event and inspect its steps.

**Commit:** `feat: add agent run audit timeline`

## Phase 12 — Demo seed data

**Goal:** Populate a credible demonstration safely for the current workspace.

**Files likely touched:** `components/load-demo-data-button.tsx`, `lib/actions/seed-demo.ts`, `docs/03_DATABASE_SCHEMA.md`

**Acceptance criteria:**

- The authenticated seed function creates five agents, seven tools, four sources, five runs, and six steps.
- Data includes success, failed, review-required, approved, unapproved, and high-risk examples.
- Repeated seeding is blocked with a clear message.

**Manual test checklist:**

- Seed a fresh project and compare record counts.
- Confirm metrics and timeline immediately become useful.
- Attempt to seed another user's project ID and confirm denial.

**Commit:** `feat: add secure aims demo dataset`

## Phase 13 — README, screenshots, and deployment

**Goal:** Make the project verifiable by recruiters in under three minutes.

**Files likely touched:** `README.md`, `public/screenshots/**`, `.env.example`, `vercel.json` only if required

**Acceptance criteria:**

- README accurately explains problem, solution, stack, architecture, setup, demo, and resume relevance.
- Four current screenshots and a live Vercel URL are present.
- Production build, auth redirects, CRUD, RLS, metrics, and audit flow pass.

**Manual test checklist:**

- Follow setup from a clean environment.
- Test deployed signup/login/logout and every demo route.
- Open the live link and screenshots from the README.
- Copy final verified bullets into the master resume.

**Commit:** `docs: finalize aims demo and deployment`

## One-day definition of done

AIMS is done for applications when it is deployed, seeded, visually coherent, isolated by RLS, and explainable using `docs/05_RESUME_NOTES.md`. Production improvements remain roadmap items and must not delay applications.
