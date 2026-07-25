import { Badge } from "@/components/ui/Badge";
import { ActionButton, PageHeader } from "@/components/ui/PageHeader";
import { agentRuns } from "@/lib/demo-data";

export default function RunsPage() {
  return <><PageHeader title="Agent runs" description="Inspect manually recorded execution outcomes and operating signals." action={<ActionButton>Log Agent Run</ActionButton>} /><div className="table-shell"><table className="data-table"><thead><tr><th>Agent</th><th>Task</th><th>Status</th><th>Latency</th><th>Cost</th><th>Output preview</th></tr></thead><tbody>{agentRuns.map((run) => <tr key={run.id}><td className="font-semibold !text-slate-900">{run.agentName}</td><td>{run.task}</td><td><Badge value={run.status} /></td><td>{run.latencyMs.toLocaleString()} ms</td><td>${run.estimatedCostUsd.toFixed(4)}</td><td className="max-w-xs truncate">{run.output}</td></tr>)}</tbody></table></div></>;
}
