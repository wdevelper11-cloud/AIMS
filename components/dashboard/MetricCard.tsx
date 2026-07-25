import type { DashboardMetric } from "@/lib/types";

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{metric.label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{metric.value}</p><p className="mt-2 text-xs text-slate-500">{metric.detail}</p></article>;
}
