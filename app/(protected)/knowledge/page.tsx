import { redirect } from "next/navigation";
import { KnowledgeRegistry } from "@/components/knowledge/KnowledgeRegistry";
import { PageHeader } from "@/components/ui/PageHeader";
import { createServerClient } from "@/lib/supabase/server";
import type { DatabaseKnowledgeSource } from "@/lib/types";
import { resolveWorkspace } from "@/lib/workspace";

export default async function KnowledgePage() {
  const workspace = await resolveWorkspace();
  if (!workspace) redirect("/login");

  const { data, error } = await createServerClient()
    .from("knowledge_sources")
    .select("id, project_id, title, source_type, url, status, created_at")
    .eq("project_id", workspace.project.id)
    .order("created_at", { ascending: false });

  return <>
    <PageHeader title="Knowledge source registry" description="Govern the reference systems available to agents. Sources are registered as metadata, not ingested or used for retrieval." />
    {error ? <section role="alert" className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold text-red-700">Unable to load knowledge sources</p>
      <p className="mt-2 text-sm text-slate-600">Supabase could not load this workspace&apos;s knowledge-source registry. Refresh the page or try again later.</p>
      <p className="mt-2 text-xs text-slate-500">{error.message}</p>
    </section> : <KnowledgeRegistry initialSources={(data ?? []) as DatabaseKnowledgeSource[]} projectId={workspace.project.id} />}
  </>;
}
