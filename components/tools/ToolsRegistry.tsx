"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { createBrowserClient } from "@/lib/supabase/client";
import type { DatabaseTool, RiskLevel } from "@/lib/types";

type Feedback = { tone: "success" | "error"; message: string } | null;

export function ToolsRegistry({ initialTools, projectId }: { initialTools: DatabaseTool[]; projectId: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();

  function refresh(message: string) {
    setFeedback({ tone: "success", message });
    startTransition(() => router.refresh());
  }

  async function createTool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    if (!name) {
      setFeedback({ tone: "error", message: "Tool name is required." });
      return;
    }

    const { error } = await createBrowserClient().from("tools").insert({
      project_id: projectId,
      name,
      category: String(values.get("category") ?? "").trim() || null,
      is_approved: values.get("is_approved") === "true",
      risk_level: values.get("risk_level") as RiskLevel,
    });

    if (error) {
      setFeedback({ tone: "error", message: "Tool could not be registered. Check the values and try again." });
      return;
    }
    form.reset();
    setShowForm(false);
    refresh("Tool registered successfully.");
  }

  async function updateApproval(tool: DatabaseTool, isApproved: boolean) {
    setFeedback(null);
    const { error } = await createBrowserClient().from("tools").update({ is_approved: isApproved }).eq("id", tool.id).eq("project_id", projectId);
    if (error) setFeedback({ tone: "error", message: "Approval could not be updated. Please try again." });
    else refresh("Tool approval updated.");
  }

  async function updateRisk(tool: DatabaseTool, riskLevel: RiskLevel) {
    setFeedback(null);
    const { error } = await createBrowserClient().from("tools").update({ risk_level: riskLevel }).eq("id", tool.id).eq("project_id", projectId);
    if (error) setFeedback({ tone: "error", message: "Risk level could not be updated. Please try again." });
    else refresh("Tool risk level updated.");
  }

  async function deleteTool(tool: DatabaseTool) {
    if (!window.confirm(`Delete ${tool.name}? This action cannot be undone.`)) return;
    setFeedback(null);
    const { error } = await createBrowserClient().from("tools").delete().eq("id", tool.id).eq("project_id", projectId);
    if (error) setFeedback({ tone: "error", message: "Tool could not be deleted. Please try again." });
    else refresh("Tool deleted.");
  }

  return <div className="space-y-5">
    <div className="flex justify-end"><button type="button" onClick={() => setShowForm((open) => !open)} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{showForm ? "Cancel" : "Register Tool"}</button></div>
    {showForm && <ToolForm onSubmit={createTool} disabled={isPending} />}
    {feedback && <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${feedback.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{feedback.message}</p>}
    {initialTools.length === 0 ? <EmptyState title="No governed tools yet" description="Register a capability to make its approval decision and operational risk visible to reviewers." /> : <div className="table-shell"><table className="data-table"><thead><tr><th>Tool name</th><th>Category</th><th>Approval status</th><th>Risk level</th><th>Actions</th></tr></thead><tbody>{initialTools.map((tool) => <tr key={tool.id}>
      <td className="font-semibold !text-slate-900">{tool.name}</td><td>{tool.category || "—"}</td>
      <td><div className="space-y-2"><Badge value={tool.is_approved ? "approved" : "unapproved"} /><select aria-label={`Approval for ${tool.name}`} value={String(tool.is_approved)} disabled={isPending} onChange={(event) => updateApproval(tool, event.target.value === "true")} className="block rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"><option value="true">Approved</option><option value="false">Unapproved</option></select></div></td>
      <td><div className="space-y-2"><Badge value={tool.risk_level} /><select aria-label={`Risk level for ${tool.name}`} value={tool.risk_level} disabled={isPending} onChange={(event) => updateRisk(tool, event.target.value as RiskLevel)} className="block rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div></td>
      <td><button type="button" disabled={isPending} onClick={() => deleteTool(tool)} className="text-sm font-semibold text-red-600 hover:text-red-500 disabled:opacity-50">Delete</button></td>
    </tr>)}</tbody></table></div>}
  </div>;
}

function ToolForm({ onSubmit, disabled }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; disabled: boolean }) {
  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
  return <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">Register a tool</h2><div className="mt-4 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-medium text-slate-700">Name *<input className={inputClass} name="name" required /></label>
    <label className="text-sm font-medium text-slate-700">Category<input className={inputClass} name="category" list="tool-categories" /><datalist id="tool-categories"><option value="Communication" /><option value="Search" /><option value="Database" /><option value="CRM" /><option value="Productivity" /><option value="Internal API" /><option value="Automation" /></datalist></label>
    <label className="text-sm font-medium text-slate-700">Approval status<select className={inputClass} name="is_approved" defaultValue="true"><option value="true">Approved</option><option value="false">Unapproved</option></select></label>
    <label className="text-sm font-medium text-slate-700">Risk level<select className={inputClass} name="risk_level" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
  </div><button disabled={disabled} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">{disabled ? "Saving…" : "Register tool"}</button></form>;
}
