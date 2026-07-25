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

**Goal:** Implement email/password signup, login, logout, and protected routes.

**Files likely touched:** `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/auth/callback/route.ts`, `middleware.ts`, `lib/supabase/middleware.ts`, `components/sign-out-button.tsx`

**Acceptance criteria:**

- Signup, login, logout, session refresh, and redirects work.
- Unauthenticated users cannot open dashboard routes.
- Auth errors and loading states are visible.

**Manual test checklist:**

- Create an account and complete any configured email confirmation.
- Refresh a protected page and remain signed in.
- Sign out and confirm `/dashboard` redirects to `/login`.

**Commit:** `feat: implement supabase authentication`

## Phase 5 — Default project/workspace logic

**Goal:** Resolve one private default workspace for every authenticated user.

**Files likely touched:** `lib/queries/projects.ts`, `app/(dashboard)/layout.tsx`, `components/workspace-header.tsx`

**Acceptance criteria:**

- Signup trigger creates a profile and default project.
- Dashboard layout loads the current user's default project.
- Missing-project state fails clearly instead of querying unscoped data.

**Manual test checklist:**

- Sign up a fresh account and inspect its profile/project rows.
- Confirm existing users see only their own project.
- Tamper with a project ID and confirm RLS rejects access.

**Commit:** `feat: add default user workspace`

## Phase 6 — Agent registry

**Goal:** Create and manage the workspace's AI-agent inventory.

**Files likely touched:** `app/(dashboard)/agents/page.tsx`, `components/forms/agent-form.tsx`, `lib/queries/agents.ts`, `lib/validation/agents.ts`

**Acceptance criteria:**

- Users can list, create, edit, and delete agents.
- Required fields and allowed status/risk values are validated.
- Status and risk are visually distinct.

**Manual test checklist:**

- Create each risk/status combination.
- Edit an agent and refresh to verify persistence.
- Attempt blank or invalid input and confirm it is rejected.

**Commit:** `feat: build agent registry`

## Phase 7 — Tool registry

**Goal:** Show tool inventory, approval state, and governance risk.

**Files likely touched:** `app/(dashboard)/tools/page.tsx`, `components/forms/tool-form.tsx`, `lib/queries/tools.ts`, `lib/validation/tools.ts`

**Acceptance criteria:**

- Users can list, create, edit, and delete tools.
- Approval and risk states are clear.
- Approved-tool counts use stored data.

**Manual test checklist:**

- Add approved, unapproved, and review-required tools.
- Change an approval state and refresh.
- Confirm another user cannot see the records.

**Commit:** `feat: add governed tool registry`

## Phase 8 — Knowledge source registry

**Goal:** Record which sources agents may reference without implementing RAG.

**Files likely touched:** `app/(dashboard)/knowledge/page.tsx`, `components/forms/knowledge-source-form.tsx`, `lib/queries/knowledge-sources.ts`, `lib/validation/knowledge-sources.ts`

**Acceptance criteria:**

- Users can list, create, edit, and delete sources.
- Title, source type, URL, and status are visible.
- The UI makes clear that sources are registered, not ingested.

**Manual test checklist:**

- Create one source of each supported type.
- Verify URL and status validation.
- Confirm no embedding or retrieval dependency exists.

**Commit:** `feat: add knowledge source registry`

## Phase 9 — Agent run logger

**Goal:** Deliver the primary demo feature: auditable agent executions.

**Files likely touched:** `app/(dashboard)/runs/page.tsx`, `app/(dashboard)/runs/[id]/page.tsx`, `components/forms/run-form.tsx`, `components/forms/run-step-form.tsx`, `lib/queries/runs.ts`, `lib/validation/runs.ts`

**Acceptance criteria:**

- Users can log agent, task, output, status, latency, cost, and risk.
- A run detail page displays ordered steps.
- Run forms permit only agents from the current project.

**Manual test checklist:**

- Log success, failure, and review-required runs.
- Add multiple ordered steps and refresh the detail page.
- Attempt negative latency/cost and a foreign agent ID; confirm rejection.

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
