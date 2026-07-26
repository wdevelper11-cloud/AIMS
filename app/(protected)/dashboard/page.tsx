import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatGrid } from "@/components/ui/StatGrid";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { createServerClient } from "@/lib/supabase/server";
import { formatUtcTimestamp } from "@/lib/format";
import type { DashboardMetric, DashboardMetrics, DashboardRecentRun, RiskLevel, AgentRunStatus } from "@/lib/types";
import { resolveWorkspace } from "@/lib/workspace";

export default async function DashboardPage() {
  const workspace = await resolveWorkspace();
  if (!workspace) redirect("/login");

  const projectId = workspace.project.id;
  const supabase = createServerClient();
  const [agentsResult, runsResult, toolsResult, knowledgeResult] = await Promise.all([
    supabase.from("agents").select("id, name, status, risk_level").eq("project_id", projectId),
    supabase.from("agent_runs").select("id, agent_id, task, status, risk_level, latency_ms, cost_usd, created_at").eq("project_id", projectId).order("created_at", { ascending: false }),
    supabase.from("tools").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("is_approved", true),
    supabase.from("knowledge_sources").select("id", { count: "exact", head: true }).eq("project_id", projectId),
  ]);
  const error = agentsResult.error ?? runsResult.error ?? toolsResult.error ?? knowledgeResult.error;

  if (error) return <><PageHeader title="Operations overview" description="Monitor agent inventory, execution health, governance, latency, and estimated cost." /><section role="alert" className="rounded-xl border border-red-200 bg-white p-8 shadow-sm"><p className="text-sm font-semibold text-red-700">Unable to load dashboard metrics.</p><p className="mt-2 text-sm text-slate-600">Supabase could not load this workspace&apos;s operations data. Confirm that the current schema and patches have been applied, then refresh.</p></section></>;

  const agents = agentsResult.data ?? [];
  const runs = runsResult.data ?? [];
  const metrics: DashboardMetrics = {
    totalAgents: agents.length,
    activeAgents: agents.filter((agent) => agent.status === "active").length,
    totalRuns: runs.length,
    failedRuns: runs.filter((run) => run.status === "failed").length,
    averageLatencyMs: runs.length ? Math.round(runs.reduce((sum, run) => sum + Number(run.latency_ms ?? 0), 0) / runs.length) : 0,
    estimatedCostUsd: runs.reduce((sum, run) => sum + Number(run.cost_usd ?? 0), 0),
    highRiskAgents: agents.filter((agent) => agent.risk_level === "high").length,
    approvedTools: toolsResult.count ?? 0,
    knowledgeSources: knowledgeResult.count ?? 0,
  };
  const cards: DashboardMetric[] = [
    { label: "Total Agents", value: String(metrics.totalAgents), detail: "Registered in this workspace" },
    { label: "Active Agents", value: String(metrics.activeAgents), detail: "Currently active" },
    { label: "Total Runs", value: String(metrics.totalRuns), detail: "Manually logged executions" },
    { label: "Failed Runs", value: String(metrics.failedRuns), detail: "Runs with failed status" },
    { label: "Average Latency", value: `${metrics.averageLatencyMs.toLocaleString()} ms`, detail: "Across workspace runs" },
    { label: "Estimated Cost", value: `$${metrics.estimatedCostUsd.toFixed(4)}`, detail: "Summed estimated USD cost" },
    { label: "High-Risk Agents", value: String(metrics.highRiskAgents), detail: "Agents classified high risk" },
    { label: "Approved Tools", value: String(metrics.approvedTools), detail: "Approved for agent use" },
    { label: "Knowledge Sources", value: String(metrics.knowledgeSources), detail: "Registered governance sources" },
  ];
  const agentNames = new Map(agents.map((agent) => [agent.id, agent.name]));
  const recentRuns: DashboardRecentRun[] = runs.slice(0, 5).map((run) => ({ id: run.id, agentName: run.agent_id ? agentNames.get(run.agent_id) ?? "Deleted agent" : "Deleted agent", task: run.task, status: run.status as AgentRunStatus, riskLevel: run.risk_level as RiskLevel, latencyMs: Number(run.latency_ms ?? 0), costUsd: Number(run.cost_usd ?? 0), createdAt: run.created_at }));

  return <><PageHeader title="Operations overview" description="Monitor live, project-scoped agent inventory, execution health, governance, latency, and estimated cost." /><StatGrid metrics={cards} /><section className="mt-8"><h2 className="mb-4 text-lg font-bold">Recent runs</h2>{recentRuns.length === 0 ? <EmptyState title="No recent runs yet." description="Log an agent run to populate workspace observability." /> : <div className="table-shell"><table className="data-table"><thead><tr><th>Agent</th><th>Task</th><th>Status</th><th>Risk</th><th>Latency</th><th>Cost</th><th>Created at</th></tr></thead><tbody>{recentRuns.map((run) => <tr key={run.id}><td className="font-semibold !text-slate-900">{run.agentName}</td><td>{run.task}</td><td><Badge value={run.status} /></td><td><Badge value={run.riskLevel} /></td><td>{run.latencyMs.toLocaleString()} ms</td><td>${run.costUsd.toFixed(4)}</td><td>{formatUtcTimestamp(run.createdAt)}</td></tr>)}</tbody></table></div>}</section></>;
}
