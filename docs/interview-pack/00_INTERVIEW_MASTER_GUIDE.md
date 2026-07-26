# AIMS Interview Master Guide

## 1. Project identity

**AIMS — AI Agent Operations Control Plane** is a portfolio MVP for the operational layer around AI agents. It is not an agent runtime. It centralizes agent, tool, knowledge-source, run, run-step, and audit views inside one authenticated, project-scoped workspace.

## 2. One-line explanation

AIMS gives an AI team one place to inventory agents, govern what they may access, record execution evidence, and review operational risk.

## 3. Best 30-second pitch

> Teams building several agents quickly lose visibility across scripts and provider dashboards. I built AIMS as a Next.js and Supabase control plane: users register agents, approve tools, catalog knowledge sources, manually log run evidence, and review metrics and a derived activity timeline. Supabase Auth and Row Level Security isolate every workspace. The MVP deliberately does not execute agents or call an AI API; it focuses on the governance and observability boundary around a runtime.

## 4. Best 2-minute pitch

> AIMS addresses an operational problem that appears after an AI-agent prototype works. A team still needs to know which agents exist, who owns their records, which tools are approved, what knowledge they are intended to use, and which runs failed or need review.
>
> I modeled that as a control plane rather than another orchestration framework. A signed-in user receives a default project. Within that project they can register agents with lifecycle and risk classifications, register approved or risky tools, catalog knowledge-source metadata, and manually record run output, status, latency, estimated cost, risk, and an optional approved-tool step. The dashboard computes a current operational summary, while the audit page derives a chronological view from persisted records.
>
> Technically, it uses Next.js App Router and TypeScript, with Supabase Auth and a seven-table Postgres schema. Every operational record has a project ID. UI queries filter by that ID for correctness, and RLS independently checks project ownership for security. No service-role credential is used. This is an honest student MVP: run evidence is manual, the audit view is not immutable, and there is no real model execution. The next production steps would be authenticated telemetry ingestion, organization roles, append-only audit events, pagination, database-side metrics, and observability.

## 5. What problem it solves

Agent inventory, capability approval, execution evidence, and operational review often live in different tools. AIMS creates a coherent record so a reviewer can answer: What can act? What may it access? What happened? Was it risky? What changed recently?

## 6. Why it is relevant to AI/agent engineering

Agent engineering includes the systems around models: permissions, evidence, failure states, human review, cost, and latency. AIMS demonstrates those concerns without pretending that a model call alone constitutes an operational platform.

## 7. Main technical strengths

- Database-enforced ownership through Supabase RLS.
- Clear control-plane/runtime boundary and provider-neutral records.
- Relational links among projects, agents, runs, steps, and tools.
- Server-rendered protected reads and client-side interactive registries.
- Honest empty/error states instead of fake dashboard data.
- Risk snapshots and explicit `needs_review` outcomes.

## 8. Interview risks and honest answers

| Risk | Honest answer |
|---|---|
| “Is it production ready?” | No. It is a portfolio MVP with a production-relevant data and authorization design, but it lacks load validation, formal security review, monitoring, and team RBAC. |
| “Does it run agents?” | No. It is a control plane. Runs are manually supplied evidence, which keeps the MVP deterministic and provider-agnostic. |
| “Is the audit log immutable?” | No. It is a timeline derived from mutable operational rows. An append-only event table would be a production improvement. |
| “Is knowledge ingested?” | No. Only source metadata is registered; there is no RAG, embedding, or vector search. |
| “Are browser filters security?” | No. Filters improve correctness. RLS using `auth.uid()` is the authorization boundary. |
| “Has it been deployed?” | The repository is Vercel-ready, but it does not confirm a live deployment. |
| “Why no AI API?” | The chosen problem is operations around agents. Omitting model calls avoids hiding the control-plane work behind a superficial API demo. |

## 9. Recommended reading order

1. This guide and `01_PROJECT_OVERVIEW.md` for the story.
2. `04_FEATURE_WALKTHROUGH.md` and `08_DEMO_SCRIPT.md` for product fluency.
3. `02_ARCHITECTURE_DEEP_DIVE.md` and `03_DATABASE_AND_RLS_EXPLANATION.md` for technical depth.
4. `05_ENGINEERING_DECISIONS.md` for tradeoffs.
5. `06_INTERVIEW_QA.md` for rehearsal.
6. `07_RESUME_BULLETS.md` for applications.

## 10. Using this pack with NotebookLM

Upload all nine files together with the README and existing architecture/schema documents. Ask NotebookLM to: create flashcards by topic; conduct a mock interview one question at a time; challenge every claim against the sources; produce a five-minute oral quiz; and flag any answer that implies real AI execution, real users, production scale, or immutable auditing. Practice answering aloud before reading the suggested answer.

## 11. Final interviewer narrative

The strongest narrative is: **“I did not build another agent wrapper. I built the small operational control plane a multi-agent team would need around its runtimes.”** AIMS centralizes inventory, access decisions, knowledge metadata, run evidence, and review. Its strongest engineering choice is defense-in-depth project isolation with Auth, explicit filters, and RLS. Its limitations are deliberate and clearly stated.
