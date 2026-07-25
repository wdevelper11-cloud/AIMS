import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Operations control plane</p><h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p></div>{action}</div>;
}

export function ActionButton({ children }: { children: ReactNode }) {
  return <button type="button" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{children}</button>;
}
