import { redirect } from "next/navigation";
import { ToolsRegistry } from "@/components/tools/ToolsRegistry";
import { PageHeader } from "@/components/ui/PageHeader";
import { createServerClient } from "@/lib/supabase/server";
import type { DatabaseTool } from "@/lib/types";
import { resolveWorkspace } from "@/lib/workspace";

export default async function ToolsPage() {
  const workspace = await resolveWorkspace();
  if (!workspace) redirect("/login");

  const { data, error } = await createServerClient()
    .from("tools")
    .select("id, project_id, name, category, is_approved, risk_level, created_at")
    .eq("project_id", workspace.project.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Tool governance"
        description="Manage the approved capabilities agents may use and the risk each introduces."
      />
      {error ? (
        <section role="alert" className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Unable to load tools</p>
          <p className="mt-2 text-sm text-slate-600">Supabase could not load this workspace&apos;s tool registry. Refresh the page or try again later.</p>
          <p className="mt-2 text-xs text-slate-500">{error.message}</p>
        </section>
      ) : (
        <ToolsRegistry initialTools={(data ?? []) as DatabaseTool[]} projectId={workspace.project.id} />
      )}
    </>
  );
}
