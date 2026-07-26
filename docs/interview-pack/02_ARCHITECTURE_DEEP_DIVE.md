# Architecture Deep Dive

## 1. System overview

```text
Browser
  ├─ public landing/login
  └─ protected App Router pages
       ├─ Server Components: auth, workspace, reads, aggregation
       └─ Client Components: forms, validation, mutations, refresh
                    │ authenticated Supabase session + public key
                    ▼
          Supabase Auth + Postgres + RLS
```

AIMS has no custom API server or ORM. Both server and browser Supabase clients act as the signed-in user; Postgres RLS remains the final authorization check.

## 2. Frontend architecture

Next.js App Router separates public pages from the `(protected)` route group. Protected pages are Server Components that fetch initial data. Interactive registry components use `"use client"`, validate forms, mutate through the browser Supabase client, show feedback, and call `router.refresh()` to obtain fresh server-rendered data. Shared layout and UI components keep navigation, badges, metrics, headers, and empty states consistent.

## 3. Backend/Supabase architecture

Supabase supplies identity, cookie-backed sessions, Postgres persistence, constraints, indexes, and RLS. The public URL and anon/publishable key select the Supabase project; they do not grant unrestricted access. The authenticated JWT supplies the user identity evaluated by `auth.uid()`.

## 4. Auth flow

1. `/login` uses `signUp` or `signInWithPassword`.
2. Middleware refreshes the Supabase session cookies.
3. The protected layout calls `getUser()` rather than trusting display state.
4. Unauthenticated requests redirect to `/login`.
5. Logout signs out, replaces the route with `/login`, and refreshes.

## 5. Workspace/project flow

`resolveWorkspace` reads or creates the user's profile, then reads or creates one default project. A partial unique index supports one default project per owner. The resolved project is passed to pages and then to client registries; it is not a user-editable form value. Creation handles a possible concurrent default-project insert by reading the winning row.

## 6. Server-side logic flow

Server pages resolve the workspace, query only selected columns, filter on `project_id`, and render either data, an empty state, or a page-level error. Dashboard and audit fetch independent tables concurrently with `Promise.all`. This logic is server-side rendering and composition, not privileged administration: it still uses the user's session and RLS.

## 7. Route structure

| Route | Responsibility |
|---|---|
| `/` | Public product explanation and call to action. |
| `/login` | Email/password signup and login. |
| `/dashboard` | Nine current metrics and five recent runs. |
| `/agents` | Agent creation, listing, lifecycle updates, deletion. |
| `/tools` | Tool creation, approval/risk updates, deletion. |
| `/knowledge` | Knowledge metadata creation, status updates, deletion. |
| `/runs` | Manual run creation, optional approved-tool step, history. |
| `/audit` | Combined, sorted operational timeline. |

There is no run-detail route or API route in the MVP.

## 8. Component structure

- `components/layout`: application shell, sidebar, top bar, logout.
- `components/agents`, `tools`, `knowledge`, `runs`: interactive registries.
- `components/dashboard`: metric presentation.
- `components/audit`: timeline presentation.
- `components/ui`: badge, empty state, page header, and stat grid primitives.
- `lib/supabase`: browser/server client factories.
- `lib/workspace.ts`: authenticated workspace resolution.
- `lib/types.ts` and `lib/format.ts`: shared domain types and UTC formatting.

## 9. Data flows

### Agent registry

The server reads project agents → the client receives records plus the resolved project ID → form validation checks required values → insert goes through the signed-in client → RLS verifies ownership → refresh re-runs the server query. Status updates and deletes match both row ID and project ID.

### Tool registry

The same pattern stores category, approval, and risk. Approval and risk can be updated independently. Unapproved tools remain visible as governance decisions rather than disappearing.

### Knowledge registry

The registry stores title, supported source type, optional URL, and active/inactive status. It does not fetch or index the source.

### Run monitoring

The server loads runs, agents, and only approved tools. The form validates non-negative latency/cost and records a risk snapshot. It inserts the run and retrieves its ID. If an approved tool is selected, it then inserts one step. These are two operations, so a step failure can leave a valid run; the UI reports that partial result honestly.

### Dashboard metrics

The page concurrently reads agents and runs, plus counts approved tools and knowledge sources. It calculates totals, active/high-risk agents, failures, average latency, summed estimated cost, and recent runs in application memory. These are current all-time workspace metrics, not time-window analytics.

### Audit timeline

The page reads agents, tools, sources, runs, and steps, maps each row into a common event shape, combines them, sorts newest first, and takes 50. It is a derived read model, not an append-only audit ledger.

## 10. Error handling

- Login translates Auth errors into user-facing feedback.
- Registry forms validate required and numeric input before writes.
- Mutations show specific success/failure messages and disable pending actions.
- Page query failures show explicit error panels rather than false empty states.
- The run flow distinguishes total failure from “run saved, optional step failed.”
- Workspace-resolution failures surface as errors; missing authentication redirects.

## 11. Why this suits a student MVP

One TypeScript application plus managed Auth/database reduces operational overhead while still demonstrating full-stack boundaries. Server Components keep protected reads close to routes, client components provide responsive forms, and RLS teaches a real database authorization pattern. The architecture remains small enough to explain end to end.

## 12. What would change in production

- Add organizations, memberships, scoped roles, and explicit project selection.
- Add a server-owned, authenticated ingestion API with scoped keys, validation, idempotency, and rate limits.
- Make run-and-step ingestion transactional or asynchronous with retry semantics.
- Use database views/RPCs for time-window metrics and paginate large tables.
- Store append-only audit events with actor/action/target and retention rules.
- Add secrets management, alerts, structured logs, traces, tests of RLS, backups, and incident procedures.
- Validate provider token/cost data rather than accepting manual estimates.
