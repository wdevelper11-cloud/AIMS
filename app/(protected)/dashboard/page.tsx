import { redirect } from "next/navigation";
import Link from "next/link";
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

  if (error) return <><PageHeader title="Operations overview" description="Monitor agent inventory, execution health, governance, latency, and estimated cost." /><section role="alert" className="rounded-xl border border-red-200 bg-white p-8 shadow-sm"><p className="text-sm font-semibold text-red-700">Unable to load dashboard metrics.</p><p className="mt-2 text-sm text-slate-600">Workspace metrics are temporarily unavailable. Refresh the page or try again shortly.</p></section></>;

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

  const nextSteps = [
    { href: "/agents", label: "Register agents", detail: "Define role, model, lifecycle, and risk." },
    { href: "/tools", label: "Govern tools", detail: "Review capability approval and risk." },
    { href: "/knowledge", label: "Add knowledge", detail: "Catalog approved reference systems." },
    { href: "/runs", label: "Review runs", detail: "Log and inspect execution evidence." },
  ];

  return <><PageHeader title="Operations overview" description="A current view of agent inventory, governed access, execution health, latency, and estimated cost for this workspace." /><section aria-labelledby="next-steps-title" className="mb-7 rounded-xl border border-indigo-100 bg-indigo-50/70 p-5"><h2 id="next-steps-title" className="font-semibold text-slate-950">Continue the operations workflow</h2><p className="mt-1 text-sm text-slate-600">Build the registry first, then record runs and use the audit timeline to review activity.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{nextSteps.map((step, index) => <Link key={step.href} href={step.href} className="group rounded-lg border border-indigo-100 bg-white p-4 shadow-sm transition hover:border-indigo-300"><span className="text-xs font-bold text-indigo-600">0{index + 1}</span><p className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-indigo-700">{step.label} →</p><p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p></Link>)}</div></section><StatGrid metrics={cards} /><section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-bold">Recent runs</h2><p className="mt-1 text-sm text-slate-500">The five latest execution records in this workspace.</p></div>{recentRuns.length > 0 && <Link href="/runs" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">View all runs →</Link>}</div>{recentRuns.length === 0 ? <EmptyState title="No execution evidence yet" description="Register an agent, then log its first run to begin tracking outcomes, latency, estimated cost, and risk." action={{ label: "Go to run logger", href: "/runs" }} /> : <div className="table-shell"><table className="data-table"><thead><tr><th>Agent</th><th>Task</th><th>Status</th><th>Risk</th><th>Latency</th><th>Cost</th><th>Recorded</th></tr></thead><tbody>{recentRuns.map((run) => <tr key={run.id}><td className="font-semibold !text-slate-900">{run.agentName}</td><td>{run.task}</td><td><Badge value={run.status} /></td><td><Badge value={run.riskLevel} /></td><td>{run.latencyMs.toLocaleString()} ms</td><td>${run.costUsd.toFixed(4)}</td><td>{formatUtcTimestamp(run.createdAt)}</td></tr>)}</tbody></table></div>}</section></>;
}
