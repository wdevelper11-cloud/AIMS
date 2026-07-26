# Feature Walkthrough

## 1. Landing page

The public landing page frames AIMS as the operations layer around agents. Use it to establish the boundary early: AIMS inventories and reviews; it does not execute agents.

## 2. Authentication

`/login` supports email/password signup and sign-in. A successful session enters protected routes. The first protected request resolves a profile and default “AIMS Workspace.” Email confirmation behavior depends on the connected Supabase project's Auth settings.

## 3. Dashboard

The dashboard displays total/active/high-risk agents, total/failed runs, average latency, summed estimated cost, approved-tool count, knowledge-source count, and five recent runs. It computes real values from the current workspace. Zero is an honest zero; a query error produces an error panel rather than misleading metrics.

## 4. Main modules

### Agents

Create a record with name, role, model label, lifecycle, risk, and description. The table supports lifecycle updates and deletion. The model label documents intended configuration; no provider call occurs.

### Tools

Create a name/category record with approval and risk. Reviewers can change approval and risk or delete the tool. Both approved and unapproved records matter: one grants documented permission, while the other exposes a decision or risk needing attention.

### Knowledge

Create a source title, controlled type, optional URL, and active/inactive status. This is a registry of intended sources, not an ingestion pipeline. Status can change and records can be removed.

### Runs

Choose a registered agent and manually enter task, output, `success`/`failed`/`needs_review`, risk, latency, and estimated cost. Optionally choose an approved tool and log one step with input, output, order, and status. Only approved tools appear in that selector. The page lists run history; it does not execute anything.

### Audit

The audit page combines creation records for agents, tools, sources, runs, and steps into one newest-first timeline, capped at 50. It is useful review history but not immutable compliance evidence and does not record every update/delete action.

## 5. Data created

Authentication creates an Auth user; workspace resolution creates a profile/project if absent. Registry forms create agents, tools, and knowledge-source metadata. Run logging creates an `agent_runs` row and, when selected, an `agent_run_steps` row.

## 6. Data displayed

Tables display project-owned registry and run fields. Dashboard cards display current aggregates. Badges make statuses and risks scannable. The audit page presents a normalized view assembled from multiple tables.

## 7. Product journey

Follow the dependency order: authenticate → register agents → register tools → register knowledge → log runs → inspect dashboard → review audit. This tells a clearer story than jumping between CRUD forms.

## 8. Empty states

An empty state means the authenticated workspace genuinely lacks that type of data. It is not a loading failure and is not filled with mock records. Calls to action guide the next meaningful setup step.

## 9. Error states

Page errors mean a read failed and are visually distinct from empty data. Form errors preserve an honest outcome. In run logging, the app can report that the run was saved but the optional step was not, because those writes are sequential rather than transactional.

## 10. Smooth demo strategy

Prepare two agents, one approved low-risk tool, one unapproved high-risk tool, one knowledge source, and one `needs_review` run. Keep one new record to create live. Explain each field's operational meaning, then revisit dashboard and audit to demonstrate that the modules form one system. Never describe typed output as model-generated.
