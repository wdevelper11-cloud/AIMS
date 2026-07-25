import { Badge } from "@/components/ui/Badge";
import { ActionButton, PageHeader } from "@/components/ui/PageHeader";
import { agents } from "@/lib/demo-data";

export default function AgentsPage() {
  return <><PageHeader title="Agent registry" description="Inventory the agents operating across your business workflows." action={<ActionButton>Create Agent</ActionButton>} /><div className="table-shell"><table className="data-table"><thead><tr><th>Agent name</th><th>Role</th><th>Model</th><th>Status</th><th>Risk level</th><th>Description</th></tr></thead><tbody>{agents.map((agent) => <tr key={agent.id}><td className="font-semibold !text-slate-900">{agent.name}</td><td>{agent.role}</td><td>{agent.model}</td><td><Badge value={agent.status} /></td><td><Badge value={agent.riskLevel} /></td><td className="max-w-xs">{agent.description}</td></tr>)}</tbody></table></div></>;
}
