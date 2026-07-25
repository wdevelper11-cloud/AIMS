import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatGrid } from "@/components/ui/StatGrid";
import { Badge } from "@/components/ui/Badge";
import { agentRuns, dashboardMetrics } from "@/lib/demo-data";

export default function DashboardPage() {
  return <AppShell><PageHeader title="Operations overview" description="Monitor agent inventory, execution health, governance, latency, and estimated cost." /><StatGrid metrics={dashboardMetrics} /><section className="mt-8"><h2 className="mb-4 text-lg font-bold">Recent runs</h2><div className="table-shell"><table className="data-table"><thead><tr><th>Agent</th><th>Task</th><th>Status</th><th>Latency</th><th>Cost</th></tr></thead><tbody>{agentRuns.slice(0, 5).map((run) => <tr key={run.id}><td className="font-semibold !text-slate-900">{run.agentName}</td><td>{run.task}</td><td><Badge value={run.status} /></td><td>{run.latencyMs.toLocaleString()} ms</td><td>${run.estimatedCostUsd.toFixed(4)}</td></tr>)}</tbody></table></div></section></AppShell>;
}
