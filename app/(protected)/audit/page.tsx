import { redirect } from "next/navigation";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { PageHeader } from "@/components/ui/PageHeader";
import { createServerClient } from "@/lib/supabase/server";
import type { AgentRunStatus, AuditEvent, RiskLevel } from "@/lib/types";
import { resolveWorkspace } from "@/lib/workspace";

export default async function AuditPage() {
  const workspace = await resolveWorkspace();
  if (!workspace) redirect("/login");

  const projectId = workspace.project.id;
  const supabase = createServerClient();
  const [agentsResult, toolsResult, sourcesResult, runsResult, stepsResult] = await Promise.all([
    supabase.from("agents").select("id, name, status, risk_level, created_at").eq("project_id", projectId).order("created_at", { ascending: false }),
    supabase.from("tools").select("id, name, is_approved, risk_level, created_at").eq("project_id", projectId).order("created_at", { ascending: false }),
    supabase.from("knowledge_sources").select("id, title, source_type, status, created_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(50),
    supabase.from("agent_runs").select("id, agent_id, task, status, risk_level, latency_ms, cost_usd, created_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(50),
    supabase.from("agent_run_steps").select("id, run_id, tool_id, step_order, status, created_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(50),
  ]);
  const error = agentsResult.error ?? toolsResult.error ?? sourcesResult.error ?? runsResult.error ?? stepsResult.error;

  return <><PageHeader title="Audit timeline" description="Review recent workspace activity across agents, tools, knowledge sources, runs, and tool steps." />{error ? <section role="alert" className="rounded-xl border border-red-200 bg-white p-8 shadow-sm"><p className="text-sm font-semibold text-red-700">Unable to load audit timeline.</p><p className="mt-2 text-sm text-slate-600">The complete workspace timeline is temporarily unavailable. Refresh the page or try again shortly.</p></section> : <AuditTimeline events={buildEvents(agentsResult.data ?? [], toolsResult.data ?? [], sourcesResult.data ?? [], runsResult.data ?? [], stepsResult.data ?? [])} />}</>;
}

type Row = Record<string, unknown>;

function buildEvents(agents: Row[], tools: Row[], sources: Row[], runs: Row[], steps: Row[]): AuditEvent[] {
  const agentNames = new Map(agents.map((row) => [String(row.id), String(row.name)]));
  const toolNames = new Map(tools.map((row) => [String(row.id), String(row.name)]));
  const runTasks = new Map(runs.map((row) => [String(row.id), String(row.task)]));
  const events: AuditEvent[] = [
    ...agents.map((row): AuditEvent => ({ id: `agent-${row.id}`, type: "agent_registered", label: "Agent registered", title: String(row.name), description: "Agent added to the workspace registry.", createdAt: String(row.created_at), status: String(row.status), riskLevel: row.risk_level as RiskLevel, metadata: [] })),
    ...tools.map((row): AuditEvent => ({ id: `tool-${row.id}`, type: "tool_registered", label: "Tool registered", title: String(row.name), description: "Tool added to workspace governance.", createdAt: String(row.created_at), status: row.is_approved ? "approved" : "unapproved", riskLevel: row.risk_level as RiskLevel, metadata: [] })),
    ...sources.map((row): AuditEvent => ({ id: `source-${row.id}`, type: "knowledge_source_registered", label: "Knowledge source registered", title: String(row.title), description: "Knowledge reference metadata registered for governance.", createdAt: String(row.created_at), status: String(row.status), metadata: [`Source type: ${friendlySourceType(row.source_type)}`] })),
    ...runs.map((row): AuditEvent => ({ id: `run-${row.id}`, type: "agent_run_logged", label: "Agent run logged", title: row.agent_id ? agentNames.get(String(row.agent_id)) ?? "Deleted agent" : "Deleted agent", description: String(row.task), createdAt: String(row.created_at), status: row.status as AgentRunStatus, riskLevel: row.risk_level as RiskLevel, metadata: [`${Number(row.latency_ms ?? 0).toLocaleString()} ms`, `$${Number(row.cost_usd ?? 0).toFixed(4)}`] })),
    ...steps.map((row): AuditEvent => ({ id: `step-${row.id}`, type: "tool_step_logged", label: "Tool step logged", title: row.tool_id ? toolNames.get(String(row.tool_id)) ?? "Deleted tool" : "No tool", description: `Run: ${runTasks.get(String(row.run_id)) ?? "Deleted run"}`, createdAt: String(row.created_at), status: row.status as AgentRunStatus, metadata: [`Step ${Number(row.step_order ?? 1)}`] })),
  ];
  return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50);
}

function friendlySourceType(value: unknown) {
  return String(value ?? "Website").split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
