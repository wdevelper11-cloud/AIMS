import { redirect } from "next/navigation";
import { RunsRegistry } from "@/components/runs/RunsRegistry";
import { PageHeader } from "@/components/ui/PageHeader";
import { createServerClient } from "@/lib/supabase/server";
import type { AgentOption, DatabaseAgentRun, ToolOption } from "@/lib/types";
import { resolveWorkspace } from "@/lib/workspace";

export default async function RunsPage() {
  const workspace = await resolveWorkspace();
  if (!workspace) redirect("/login");

  const supabase = createServerClient();
  const [runsResult, agentsResult, toolsResult] = await Promise.all([
    supabase.from("agent_runs").select("id, project_id, agent_id, task, output, status, risk_level, latency_ms, cost_usd, created_at").eq("project_id", workspace.project.id).order("created_at", { ascending: false }),
    supabase.from("agents").select("id, name").eq("project_id", workspace.project.id).order("name"),
    supabase.from("tools").select("id, name").eq("project_id", workspace.project.id).eq("is_approved", true).order("name"),
  ]);
  const error = runsResult.error ?? agentsResult.error ?? toolsResult.error;

  return <>
    <PageHeader title="Agent run logger" description="Manually record agent execution outcomes, latency, estimated cost, and optional tool evidence for observability." />
    {error ? <section role="alert" className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold text-red-700">Unable to load agent runs</p>
      <p className="mt-2 text-sm text-slate-600">Execution records are temporarily unavailable. Refresh the page or try again shortly.</p>

    </section> : <RunsRegistry initialRuns={(runsResult.data ?? []) as DatabaseAgentRun[]} agents={(agentsResult.data ?? []) as AgentOption[]} approvedTools={(toolsResult.data ?? []) as ToolOption[]} projectId={workspace.project.id} />}
  </>;
}
