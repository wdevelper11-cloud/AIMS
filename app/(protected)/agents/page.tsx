import { redirect } from "next/navigation";
import { AgentsRegistry } from "@/components/agents/AgentsRegistry";
import { PageHeader } from "@/components/ui/PageHeader";
import { createServerClient } from "@/lib/supabase/server";
import type { DatabaseAgent } from "@/lib/types";
import { resolveWorkspace } from "@/lib/workspace";

export default async function AgentsPage() {
  const workspace = await resolveWorkspace();
  if (!workspace) redirect("/login");

  const { data, error } = await createServerClient()
    .from("agents")
    .select("id, project_id, name, role, model, status, risk_level, description, created_at")
    .eq("project_id", workspace.project.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Agent registry"
        description="Inventory the agents operating across your business workflows."
      />
      {error ? (
        <section role="alert" className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Unable to load agents</p>
          <p className="mt-2 text-sm text-slate-600">Supabase could not load this workspace&apos;s agent registry. Refresh the page or try again later.</p>
          <p className="mt-2 text-xs text-slate-500">{error.message}</p>
        </section>
      ) : (
        <AgentsRegistry initialAgents={(data ?? []) as DatabaseAgent[]} projectId={workspace.project.id} />
      )}
    </>
  );
}
