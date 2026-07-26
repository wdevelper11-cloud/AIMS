# Interview Questions and Answers

Use these as speaking prompts. Keep the boundary words—**manual**, **derived**, **MVP**, and **control plane**—in your answers.

## 1. Product understanding

### 1. What is AIMS?
AIMS is an AI Agent Operations Control Plane. It inventories agents, records tool approvals and knowledge metadata, stores manually supplied run evidence, and presents metrics and a derived activity timeline inside a private workspace.

### 2. What problem does it solve?
It reduces fragmented operational visibility. Instead of tracking agent ownership, access decisions, failures, latency, cost estimates, and risk in separate spreadsheets or consoles, it models them together.

### 3. Who is it for?
The intended users are applied AI engineers, platform engineers, and operations or security reviewers working with several internal agents. These are target personas, not claimed customers.

### 4. How would you explain it to a non-technical recruiter?
It is a dashboard for keeping track of a team's AI agents: what each one does, what it is allowed to use, and whether its recorded work succeeded or needs human review.

### 5. Is this just CRUD?
CRUD is part of the interface, but the engineering value is in the domain and boundaries: tenant-safe authorization, relational execution evidence, approval/risk states, aggregate operational views, and the distinction between a control plane and a runtime. I would not claim it has complex orchestration that it does not.

## 2. Architecture

### 6. Describe the architecture end to end.
Next.js App Router renders public and protected routes. Server Components authenticate, resolve a default project, read records, and compose dashboard/audit views. Client registry components perform validated mutations through the signed-in Supabase browser client. Supabase Auth supplies identity; Postgres stores data; RLS enforces ownership.

### 7. Why mix Server and Client Components?
Server Components are a clean place for authenticated initial reads and aggregation. Client Components are needed for forms, local feedback, confirmation dialogs, and interactive updates. This keeps client JavaScript focused on interaction.

### 8. Do you have a custom backend API?
No. The MVP uses Supabase's client and PostgREST interface under the signed-in session. A production telemetry endpoint would add a deliberate server boundary for machine ingestion.

### 9. How is the workspace created?
The workspace helper verifies the user, creates a matching profile if needed, then reads or creates the user's default project. A partial unique index prevents multiple default projects, and the helper recovers from a concurrent creation attempt by rereading.

### 10. What would break at scale?
Loading all runs for all-time metrics, aggregating in application memory, unpaginated registry tables, and composing audit events from several reads would become expensive. I would introduce time windows, database views/RPCs, pagination, caching where appropriate, and query/latency monitoring.

## 3. Supabase, Auth, and RLS

### 11. How does RLS actually protect data?
For a child row, the policy checks that a project with the row's `project_id` exists and has `owner_id = auth.uid()`. Postgres applies that rule to reads and target rows, plus `with check` to inserted or updated values.

### 12. What happens if a user tries to access another project?
A select does not return the other user's rows. Inserts fail their ownership check, and updates/deletes cannot target unauthorized rows. Supplying or guessing another project UUID does not change the authenticated identity.

### 13. Why are explicit project filters still present?
They make query intent clear, reduce unnecessary work, and prevent accidental data mixing in UI logic. They are defense in depth, not the authorization boundary.

### 14. Is the public Supabase key safe?
It is designed for public clients and identifies the project, but safety depends on correct RLS and Auth configuration. It is not equivalent to a service-role key.

### 15. Why not use the service-role key?
It bypasses RLS. The app has no administrative operation that needs it, and exposing it to the browser would defeat workspace isolation.

### 16. How do protected routes work?
Middleware maintains session cookies, and the protected layout calls the server-side workspace resolver. If no authenticated user is returned, it redirects to `/login`.

### 17. Is RLS enough for production security?
No. It addresses row authorization. Production also needs policy integration tests, secure Auth settings, validation, rate limits, monitoring, dependency patching, backups, and a reviewed role model.

## 4. Database design

### 18. Why seven tables?
They separate identity metadata, ownership, three registries, run-level evidence, and step-level evidence. This keeps relationships explicit without overloading one generic entity table.

### 19. Why does every operational row have `project_id`?
It makes the tenant boundary explicit, supports direct project-filtered queries, and allows RLS to check ownership consistently.

### 20. Why store risk on both agents and runs?
Agent risk is a current classification; run risk is an execution-time snapshot. A normally medium-risk agent can produce a high-risk run, and later agent edits should not rewrite that evidence.

### 21. Why can `agent_id` or `tool_id` become null?
Those foreign keys use `on delete set null` so historical run evidence can survive registry cleanup. The tradeoff is losing the linked entity identity unless denormalized snapshots are added.

### 22. What constraints are important?
Controlled lifecycle/status/risk checks reject invalid states, non-negative checks protect latency/cost, foreign keys preserve relationships, and a partial unique index enforces one default project per owner.

### 23. Why not use a vector database?
Knowledge records are metadata only. There is no semantic retrieval requirement, so a vector store would add cost and imply functionality the MVP does not have.

## 5. Feature implementation

### 24. How are dashboard metrics calculated?
The server concurrently reads project agents and runs and counts approved tools and knowledge sources. It calculates totals, failures, averages, and sums in memory, then shows the five newest runs.

### 25. How is the audit timeline built?
The audit page reads recent rows from five operational tables, maps them to one event shape, combines them, sorts by creation time, and keeps 50. It is a derived view, not a write-once log.

### 26. How do you restrict run steps to approved tools?
The runs page queries only approved tools for the selector, and the client checks the selected ID against that list before inserting a step. Database ownership policies still apply. A stronger production version would enforce approval in a transactional server/database function to remove timing and client-trust gaps.

### 27. What happens if the step insert fails?
The run has already been saved because the writes are sequential. The UI explicitly reports that the run succeeded but its optional step did not. A transaction would be preferable if atomic creation were the product requirement.

### 28. How are empty states handled?
Empty data gets a truthful message and often a next-step action. Query errors get separate error panels, so failure is not shown as zero activity.

### 29. Does changing tool approval stop a real agent?
No. It changes a registry decision in AIMS and affects the run form's approved-tool choices. Since AIMS is not connected to a runtime, it cannot enforce external execution.

## 6. Security and tradeoffs

### 30. How do insert/update flows avoid trusting the browser?
The project is server-resolved and not editable in the form, values are constrained, mutations filter their targets, and RLS rechecks ownership. Some input validation is client-side for usability, so production APIs should also validate server-side.

### 31. What is the biggest security limitation?
There are no automated adversarial RLS integration tests in this MVP, and the permission model is single-owner rather than team RBAC. Both should precede broader use.

### 32. Is the audit page compliant or tamper-proof?
No. It derives events from mutable tables and does not capture every action. A compliant design would need append-only events, actor identity, retention controls, access reviews, and formal validation.

### 33. Why browser-side mutations at all?
They keep the MVP simple and responsive, while Supabase RLS still checks every operation. For complex workflows or secrets, I would move mutations behind validated server endpoints/actions.

### 34. What concurrency risk exists?
The run and optional step are separate writes, so they can partially succeed. Workspace creation explicitly handles a race using the unique default-project index and a reread, but other workflows are not designed as high-throughput concurrent systems.

## 7. Applied AI and agent engineering relevance

### 35. How is this relevant to AI engineering?
Reliable AI systems need more than inference: capability inventory, permission decisions, failure evidence, risk classification, latency/cost tracking, and human-review states. AIMS models that operational layer.

### 36. Why did you not use a real AI API?
The objective was to design the control plane around runtimes. Adding one provider call would introduce variable output, secrets, and cost without proving telemetry or governance. I kept inputs manual and defined a cleaner future ingestion boundary.

### 37. Does AIMS evaluate model quality?
No. It records execution outcomes and evidence supplied by a user. It does not run benchmarks, judge responses, or compute evaluation scores.

### 38. How would a real agent runtime integrate?
It would send authenticated, validated run and step events to a scoped ingestion endpoint. The endpoint would use idempotency keys, normalize provider usage, handle retries, and write atomically while preserving tenant ownership.

### 39. Why include `needs_review`?
Agent outcomes are not always simply success or failure. An explicit review state represents uncertainty or policy escalation and makes human oversight visible.

## 8. Limitations and future improvements

### 40. What would you improve with more time?
First add automated RLS tests and transactional telemetry ingestion. Then add organizations/RBAC, append-only audit events, time-window metrics, pagination, alerts, and production observability. Provider adapters would come after secure secrets and retry semantics.

### 41. Why no Docker or local Supabase?
Cloud setup minimized infrastructure for this student MVP. The tradeoff is weaker offline reproducibility; a mature workflow would use migrations and isolated local/test databases.

### 42. How would you support teams?
Add organizations, membership and role tables, project-role assignments, invitations, and policies based on membership rather than direct ownership. Approval actions should capture actor and timestamp.

### 43. How would you make metrics reliable?
Define precise time windows and units, ingest verified token/provider usage, calculate in SQL views or jobs, test edge cases, and expose freshness. Current cost is a manually supplied estimate.

### 44. Is deployment verified?
No confirmed live URL is documented. The code is described only as Vercel-ready, not as a verified production deployment.

## 9. Resume and project defense

### 45. What was the hardest technical part?
The hardest part was treating tenancy consistently across session resolution, query filters, foreign-key relationships, and RLS instead of assuming a project ID passed by the UI was trustworthy.

### 46. What did you learn?
I learned to separate authentication from authorization, distinguish UI filtering from database enforcement, preserve operational snapshots, and state system boundaries honestly.

### 47. What are you most proud of?
The project tells one coherent story from product need to schema and UI: registry decisions feed run evidence, which feeds metrics and review, while RLS consistently protects ownership.

### 48. What would you do differently if restarting?
I would define automated two-user policy tests and a transactional run-ingestion contract earlier, then build UI on those guarantees.

### 49. Did real users use it?
I present it as a portfolio MVP and do not claim real users, revenue, or production traffic. Its value is the implemented design and the engineering reasoning I can demonstrate.

### 50. Give the strongest closing defense.
AIMS is intentionally not a fake “AI-powered” wrapper. It demonstrates that I understand the operational systems agents need—ownership, permissions, evidence, review, latency, cost, and security—and that I can turn those concerns into a defensible full-stack MVP.
