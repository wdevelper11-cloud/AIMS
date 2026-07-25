import { Badge } from "@/components/ui/Badge";
import { ActionButton, PageHeader } from "@/components/ui/PageHeader";
import { tools } from "@/lib/demo-data";

export default function ToolsPage() {
  return <><PageHeader title="Tool governance" description="Review which capabilities agents may use and the risk each introduces." action={<ActionButton>Register Tool</ActionButton>} /><div className="table-shell"><table className="data-table"><thead><tr><th>Tool name</th><th>Category</th><th>Approval status</th><th>Risk level</th></tr></thead><tbody>{tools.map((tool) => <tr key={tool.id}><td className="font-semibold !text-slate-900">{tool.name}</td><td>{tool.category}</td><td><Badge value={tool.approvalStatus} /></td><td><Badge value={tool.riskLevel} /></td></tr>)}</tbody></table></div></>;
}
