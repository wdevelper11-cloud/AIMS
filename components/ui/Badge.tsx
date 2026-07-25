import type { ReactNode } from "react";

const tones: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", low: "bg-sky-50 text-sky-700 ring-sky-600/20",
  paused: "bg-amber-50 text-amber-700 ring-amber-600/20", needs_review: "bg-amber-50 text-amber-700 ring-amber-600/20", medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  failed: "bg-rose-50 text-rose-700 ring-rose-600/20", high: "bg-rose-50 text-rose-700 ring-rose-600/20", sync_error: "bg-rose-50 text-rose-700 ring-rose-600/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/20", archived: "bg-slate-100 text-slate-600 ring-slate-500/20", unapproved: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function Badge({ value, children }: { value: string; children?: ReactNode }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${tones[value] ?? tones.inactive}`}>{children ?? value.replace("_", " ")}</span>;
}
