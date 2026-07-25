import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AuditEvent } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) return <EmptyState title="No audit events yet." description="Create agents, tools, knowledge sources, or runs to populate the timeline." />;

  return <ol className="relative ml-3 border-l border-slate-300">{events.map((event) => <li key={event.id} className="relative mb-5 ml-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="absolute -left-[31px] top-6 h-3 w-3 rounded-full border-2 border-white bg-indigo-600 ring-1 ring-indigo-200" /><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><time className="text-xs font-semibold uppercase tracking-wide text-slate-400">{dateFormatter.format(new Date(event.createdAt))} UTC</time><div className="mt-2"><Badge value={event.type}>{event.label}</Badge></div><h2 className="mt-2 font-bold text-slate-950">{event.title}</h2><p className="mt-1 text-sm text-slate-600">{event.description}</p></div><div className="flex flex-wrap items-center gap-2">{event.status && <Badge value={event.status} />}{event.riskLevel && <Badge value={event.riskLevel} />}{event.metadata.map((item) => <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{item}</span>)}</div></div></li>)}</ol>;
}
