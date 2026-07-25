import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { resolveWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/login");
  }

  let workspace;
  try {
    workspace = await resolveWorkspace();
  } catch (error) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5"><section className="max-w-lg rounded-xl border border-red-200 bg-white p-8 shadow-sm"><p className="text-sm font-semibold text-red-700">Workspace unavailable</p><h1 className="mt-2 text-2xl font-bold text-slate-950">AIMS could not load your workspace</h1><p className="mt-3 text-sm leading-6 text-slate-600">{error instanceof Error ? error.message : "Profile and project resolution failed. Please try again."}</p><p className="mt-4 text-xs text-slate-500">Refresh the page. If this continues, confirm the Phase 5 schema and RLS policies are applied in Supabase Cloud.</p></section></main>;
  }

  if (!workspace) redirect("/login");

  return <AppShell email={workspace.user.email ?? "Signed in"} workspaceName={workspace.project.name}>{children}</AppShell>;
}
