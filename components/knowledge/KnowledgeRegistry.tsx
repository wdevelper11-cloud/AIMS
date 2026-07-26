"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { createBrowserClient } from "@/lib/supabase/client";
import type { DatabaseKnowledgeSource, KnowledgeSourceStatus, KnowledgeSourceType } from "@/lib/types";

type Feedback = { tone: "success" | "error"; message: string } | null;
const SOURCE_TYPES: { value: KnowledgeSourceType; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "pdf", label: "PDF" },
  { value: "notion", label: "Notion" },
  { value: "google_drive", label: "Google Drive" },
  { value: "internal_docs", label: "Internal Docs" },
  { value: "api_docs", label: "API Docs" },
  { value: "database", label: "Database" },
  { value: "slack", label: "Slack" },
  { value: "github_repo", label: "GitHub Repo" },
];
const SOURCE_TYPE_LABELS = Object.fromEntries(SOURCE_TYPES.map(({ value, label }) => [value, label])) as Record<KnowledgeSourceType, string>;

export function KnowledgeRegistry({ initialSources, projectId }: { initialSources: DatabaseKnowledgeSource[]; projectId: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();

  function refresh(message: string) {
    setFeedback({ tone: "success", message });
    startTransition(() => router.refresh());
  }

  async function createSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = event.currentTarget;
    const values = new FormData(form);
    const title = String(values.get("title") ?? "").trim();
    if (!title) {
      setFeedback({ tone: "error", message: "Knowledge source title is required." });
      return;
    }

    const { error } = await createBrowserClient().from("knowledge_sources").insert({
      project_id: projectId,
      title,
      source_type: (values.get("source_type") || "website") as KnowledgeSourceType,
      url: String(values.get("url") ?? "").trim() || null,
      status: values.get("status") as KnowledgeSourceStatus,
    });
    if (error) {
      const constraintOutdated = /knowledge_sources_source_type_check|source_type.*check constraint/i.test(error.message);
      setFeedback({
        tone: "error",
        message: constraintOutdated
          ? "Your Supabase Cloud schema has an outdated knowledge source type constraint. Run supabase/patches/phase8_knowledge_source_type_patch.sql in the Supabase SQL Editor."
          : "Knowledge source could not be added. Check the values and try again.",
      });
      return;
    }
    form.reset();
    setShowForm(false);
    refresh("Knowledge source added successfully.");
  }

  async function updateStatus(source: DatabaseKnowledgeSource, status: KnowledgeSourceStatus) {
    setFeedback(null);
    const { error } = await createBrowserClient().from("knowledge_sources").update({ status }).eq("id", source.id).eq("project_id", projectId);
    if (error) setFeedback({ tone: "error", message: "Status could not be updated. Please try again." });
    else refresh("Knowledge source status updated.");
  }

  async function deleteSource(source: DatabaseKnowledgeSource) {
    if (!window.confirm(`Delete ${source.title}? This action cannot be undone.`)) return;
    setFeedback(null);
    const { error } = await createBrowserClient().from("knowledge_sources").delete().eq("id", source.id).eq("project_id", projectId);
    if (error) setFeedback({ tone: "error", message: "Knowledge source could not be deleted. Please try again." });
    else refresh("Knowledge source deleted.");
  }

  return <div className="space-y-5">
    <div className="flex justify-end"><button type="button" onClick={() => setShowForm((open) => !open)} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{showForm ? "Cancel" : "Add Knowledge Source"}</button></div>
    {showForm && <KnowledgeSourceForm onSubmit={createSource} disabled={isPending} />}
    {feedback && <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${feedback.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{feedback.message}</p>}
    {initialSources.length === 0 ? <EmptyState title="No knowledge sources registered yet." description="Add your first knowledge source." /> : <div className="table-shell"><table className="data-table"><thead><tr><th>Title</th><th>Source type</th><th>URL</th><th>Status</th><th>Actions</th></tr></thead><tbody>{initialSources.map((source) => <tr key={source.id}>
      <td className="font-semibold !text-slate-900">{source.title}</td><td>{source.source_type ? SOURCE_TYPE_LABELS[source.source_type] : "Website"}</td>
      <td>{source.url ? <a className="text-indigo-600 hover:underline" href={source.url} target="_blank" rel="noreferrer">{source.url}</a> : "—"}</td>
      <td><div className="space-y-2"><Badge value={source.status} /><select aria-label={`Status for ${source.title}`} value={source.status} disabled={isPending} onChange={(event) => updateStatus(source, event.target.value as KnowledgeSourceStatus)} className="block rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"><option value="active">Active</option><option value="inactive">Inactive</option></select></div></td>
      <td><button type="button" disabled={isPending} onClick={() => deleteSource(source)} className="text-sm font-semibold text-red-600 hover:text-red-500 disabled:opacity-50">Delete</button></td>
    </tr>)}</tbody></table></div>}
  </div>;
}

function KnowledgeSourceForm({ onSubmit, disabled }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; disabled: boolean }) {
  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
  return <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">Add a knowledge source</h2><p className="mt-1 text-sm text-slate-500">Register source metadata for governance; AIMS does not ingest its contents.</p><div className="mt-4 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-medium text-slate-700">Title *<input className={inputClass} name="title" required /></label>
    <label className="text-sm font-medium text-slate-700">Source type<select className={inputClass} name="source_type" defaultValue="website">{SOURCE_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">URL<input className={inputClass} name="url" type="url" placeholder="https://example.com/docs" /></label>
    <label className="text-sm font-medium text-slate-700">Status<select className={inputClass} name="status" defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
  </div><button disabled={disabled} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">{disabled ? "Saving…" : "Add knowledge source"}</button></form>;
}
