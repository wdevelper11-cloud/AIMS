# Practical Demo Script

## 1. Pre-demo setup checklist

- Confirm Node/npm and `.env.local` contain only the public Supabase URL and anon/publishable key.
- Confirm the hosted schema/patches have been applied and Email Auth behavior is known.
- Start the app, open `/`, and test login, logout, every protected route, and browser width.
- Remove accidental test clutter; do not delete the prepared records below.
- Keep a backup tab on `/dashboard` and a local README available if the network fails.
- Never display credentials, tokens, the Supabase dashboard, or private environment files.

## 2. Demo account and data checklist

Use a dedicated demo account. These records are manually entered examples, not seed data or model output.

| Module | Prepared record |
|---|---|
| Agent | **Support Triage Agent** — classifies/routes requests; active; medium risk; neutral provider-model label. |
| Agent | **Research Assistant** — synthesizes approved research sources; active; high risk. |
| Approved tool | **Web Search** — Search; approved; low risk. |
| Risky tool | **Customer Database Write** — Database; unapproved; high risk. |
| Knowledge | **Support Playbook** — Internal Docs; `https://example.com/support-playbook`; active. |
| Run | **Classify refund request** — Support Triage Agent; needs review; high risk; 830 ms; $0.0124; output: “Refund request classified as billing; human approval required.” |
| Step | **Search support policy** — Web Search; success; input “refund policy exception”; output “Policy article located.” |

Keep one item—usually the run—to create live. If a clean account is required, create records in the dependency order shown below.

## 3. Five-minute demo script

| Time | Click | What to say | Expected result |
|---|---|---|---|
| 0:00 | `/` | “AIMS is the operations control plane around agents, not an agent runtime.” | Landing page establishes scope. |
| 0:30 | Login → `/dashboard` | “Supabase Auth establishes identity, and the protected layout resolves one owned default project.” | Workspace shell and metrics appear. |
| 1:00 | Agents | “These records capture purpose, model label, lifecycle, and current risk.” Contrast support/research risk. | Two agent rows. |
| 1:40 | Tools | “Approval is visible governance metadata. The risky database-write tool remains unapproved.” | Approved and unapproved badges. |
| 2:15 | Knowledge | “This stores source metadata only—there is no ingestion or RAG.” | Active Support Playbook record. |
| 2:45 | Runs → Log Agent Run | Enter the prepared run. “This is manual evidence, not generated output. `needs_review` makes human escalation explicit.” | Run and optional approved-tool step save. |
| 3:50 | Dashboard | “The same persisted records update the operational summary and recent-runs table.” | Totals/cost/latency and run update. |
| 4:25 | Audit | “This combines current records into a 50-event timeline. It is derived, not immutable.” | New run/step appear near top. |
| 4:50 | Stay on Audit | Give the closing line below. | Clear finish without extra clicking. |

## 4. Ten-minute demo script

1. **Landing (45 seconds):** state problem, target user, and non-runtime boundary.
2. **Authentication (45 seconds):** sign in; explain cookie-backed session, `getUser()`, protected redirect, and default project resolution.
3. **Dashboard orientation (60 seconds):** explain each metric is current workspace data, all-time in the MVP, with five recent runs.
4. **Agents (75 seconds):** show the two examples; optionally update one lifecycle status and explain current risk versus run risk.
5. **Tools (75 seconds):** contrast Web Search with Customer Database Write; explain that registry approval does not enforce an external runtime.
6. **Knowledge (60 seconds):** show Support Playbook; clarify metadata-only scope and controlled types.
7. **Runs (150 seconds):** create the prepared `needs_review` run and optional Web Search step. Explain non-negative metrics, approved-tool filtering, sequential writes, and partial-failure messaging.
8. **Dashboard revisit (60 seconds):** point to run count, latency, estimated cost, and recent run. Do not call the cost verified provider billing.
9. **Audit (75 seconds):** show normalized events, newest-first ordering, and the 50-event cap; state why append-only events would be needed in production.
10. **Security and close (75 seconds):** explain that UI filters are not security; RLS checks project ownership from `auth.uid()`. Finish with the closing line.

## 5. Exact click order for a clean workspace

1. Sign up/sign in.
2. **Agents → Register Agent**: create Support Triage Agent, then Research Assistant.
3. **Tools → Register Tool**: create Web Search, then Customer Database Write.
4. **Knowledge → Register Knowledge Source**: create Support Playbook.
5. **Run monitoring → Log Agent Run**: create Classify refund request and choose Web Search for the optional step.
6. **Dashboard**: inspect metrics and recent run.
7. **Audit timeline**: inspect activity.

## 6. Lines to use at important steps

- **Agents:** “The model field is a configuration label; AIMS does not invoke it.”
- **Tools:** “Approval is a reviewable control-plane decision, not proof that an external runtime enforced it.”
- **Knowledge:** “I deliberately avoided implying ingestion; only metadata is stored.”
- **Runs:** “I am entering execution evidence manually so the MVP is deterministic and provider-neutral.”
- **Dashboard:** “These are live workspace calculations, not seeded vanity metrics.”
- **Audit:** “Useful timeline, yes; immutable compliance log, no.”
- **Security:** “The project filter helps correctness, while RLS is the authorization boundary.”

## 7. Expected results

Created records appear after refresh, status/risk badges match inputs, only approved tools appear in the optional step selector, dashboard values reflect the new run, and audit places the run/step near the top. An empty workspace should show guidance rather than sample data.

## 8. Recovery lines

- **Network/Auth failure:** “The hosted dependency is unavailable, so I will use the prepared screen and explain the verified code path rather than claim the write succeeded.”
- **Email confirmation blocks signup:** “Confirmation is a Supabase project setting; I will use the prepared confirmed account.”
- **Read error:** “Notice that the UI distinguishes a query failure from empty data instead of showing false zeros.”
- **Step fails after run:** “The app reports partial success because these are sequential writes. A production ingestion function would make this transactional.”
- **No recent run:** “I will open the run registry; the key point is that the dashboard reads persisted project-scoped data, not mock data.”
- **Slow demo:** “I will skip record creation and show the prepared workflow so we can spend time on architecture and RLS.”

## 9. Likely questions during the demo

- **Why can only approved tools be selected?** The server query filters the choices and the client rechecks them; stronger runtime enforcement belongs in a transactional backend integration.
- **Can one user see another workspace?** RLS relates each child row to a project owned by `auth.uid()`.
- **Where did this output come from?** It was manually entered as demo evidence; no model was called.
- **Is estimated cost accurate?** It is a manual estimate in this MVP, not reconciled provider billing.
- **Does knowledge search work?** No; the product records metadata only.
- **Why is audit not immutable?** It is derived from current tables to keep the MVP small. Append-only actor/action events are future work.
- **What would you build next?** Automated RLS tests and authenticated, idempotent, transactional telemetry ingestion.

## 10. Strong closing line

> AIMS shows how I think beyond an AI API call: I modeled the ownership, permissions, evidence, risk, and review layer that makes agent systems operable, while keeping the MVP's limitations explicit.
