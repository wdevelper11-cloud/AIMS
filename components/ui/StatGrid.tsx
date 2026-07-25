import type { DashboardMetric } from "@/lib/types";
import { MetricCard } from "@/components/dashboard/MetricCard";

export function StatGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>;
}
