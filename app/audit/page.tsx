import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { agentRuns } from "@/lib/demo-data";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export default function AuditPage() {
  return <AppShell><PageHeader title="Audit trail" description="Review a chronological, risk-aware history of agent execution activity." /><ol className="relative ml-3 border-l border-slate-300">{agentRuns.map((run) => <li key={run.id} className="relative mb-5 ml-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="absolute -left-[31px] top-6 h-3 w-3 rounded-full border-2 border-white bg-indigo-600 ring-1 ring-indigo-200" /><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><time className="text-xs font-semibold uppercase tracking-wide text-slate-400">{dateFormatter.format(new Date(run.createdAt))} UTC</time><h2 className="mt-1 font-bold text-slate-950">{run.agentName}</h2><p className="mt-1 text-sm text-slate-600">{run.task}</p></div><div className="flex flex-wrap items-center gap-2"><Badge value={run.status} /><Badge value={run.riskLevel} /><span className="text-xs font-medium text-slate-500">${run.estimatedCostUsd.toFixed(4)}</span><span className="text-xs font-medium text-slate-500">{run.latencyMs.toLocaleString()} ms</span></div></div></li>)}</ol></AppShell>;
}
