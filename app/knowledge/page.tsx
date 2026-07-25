import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { ActionButton, PageHeader } from "@/components/ui/PageHeader";
import { knowledgeSources } from "@/lib/demo-data";

export default function KnowledgePage() {
  return <AppShell><PageHeader title="Knowledge sources" description="Track reference sources available to agents. Sources are registered, not ingested." action={<ActionButton>Add Knowledge Source</ActionButton>} /><div className="table-shell"><table className="data-table"><thead><tr><th>Title</th><th>Source type</th><th>URL</th><th>Status</th></tr></thead><tbody>{knowledgeSources.map((source) => <tr key={source.id}><td className="font-semibold !text-slate-900">{source.title}</td><td className="capitalize">{source.sourceType}</td><td><a className="text-indigo-600 hover:underline" href={source.url}>{source.url}</a></td><td><Badge value={source.status} /></td></tr>)}</tbody></table></div></AppShell>;
}
