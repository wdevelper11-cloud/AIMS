import Link from "next/link";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-lg text-indigo-600">+</div><h3 className="mt-4 font-semibold text-slate-900">{title}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>{action && <Link href={action.href} className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">{action.label}</Link>}</div>;
}
