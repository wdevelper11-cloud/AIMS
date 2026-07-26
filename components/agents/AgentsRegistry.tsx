"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { createBrowserClient } from "@/lib/supabase/client";
import type { AgentRegistryStatus, DatabaseAgent, RiskLevel } from "@/lib/types";

type Feedback = { tone: "success" | "error"; message: string } | null;

export function AgentsRegistry({ initialAgents, projectId }: { initialAgents: DatabaseAgent[]; projectId: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();

  function refresh(message: string) {
    setFeedback({ tone: "success", message });
    startTransition(() => router.refresh());
  }

  async function createAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    const role = String(values.get("role") ?? "").trim();
    if (!name || !role) {
      setFeedback({ tone: "error", message: "Name and role are required." });
      return;
    }

    const { error } = await createBrowserClient().from("agents").insert({
      project_id: projectId,
      name,
      role,
      model: String(values.get("model") || "gpt-4.1-mini").trim(),
      status: values.get("status") as AgentRegistryStatus,
      risk_level: values.get("risk_level") as RiskLevel,
      description: String(values.get("description") ?? "").trim() || null,
    });

    if (error) {
      setFeedback({ tone: "error", message: "Agent could not be created. Check the values and try again." });
      return;
    }
    form.reset();
    setShowForm(false);
    refresh("Agent created successfully.");
  }

  async function updateStatus(agentId: string, status: AgentRegistryStatus) {
    setFeedback(null);
    const { error } = await createBrowserClient()
      .from("agents")
      .update({ status })
      .eq("id", agentId)
      .eq("project_id", projectId);
    if (error) setFeedback({ tone: "error", message: "Status could not be updated. Please try again." });
    else refresh("Agent status updated.");
  }

  async function deleteAgent(agent: DatabaseAgent) {
    if (!window.confirm(`Delete ${agent.name}? This action cannot be undone.`)) return;
    setFeedback(null);
    const { error } = await createBrowserClient()
      .from("agents")
      .delete()
      .eq("id", agent.id)
      .eq("project_id", projectId);
    if (error) setFeedback({ tone: "error", message: "Agent could not be deleted. Please try again." });
    else refresh("Agent deleted.");
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button type="button" onClick={() => setShowForm((open) => !open)} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          {showForm ? "Cancel" : "Create Agent"}
        </button>
      </div>

      {showForm && <AgentForm onSubmit={createAgent} disabled={isPending} />}
      {feedback && <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${feedback.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{feedback.message}</p>}

      {initialAgents.length === 0 ? (
        <EmptyState title="No agents registered yet" description="Register the first agent to document its operational role, model, lifecycle status, and risk classification." />
      ) : (
        <div className="table-shell">
          <table className="data-table">
            <thead><tr><th>Agent name</th><th>Role</th><th>Model</th><th>Status</th><th>Risk level</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>{initialAgents.map((agent) => (
              <tr key={agent.id}>
                <td className="font-semibold !text-slate-900">{agent.name}</td><td>{agent.role}</td><td>{agent.model}</td>
                <td><div className="space-y-2"><Badge value={agent.status} /><select aria-label={`Status for ${agent.name}`} value={agent.status} disabled={isPending} onChange={(event) => updateStatus(agent.id, event.target.value as AgentRegistryStatus)} className="block rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option></select></div></td>
                <td><Badge value={agent.risk_level} /></td><td className="max-w-xs">{agent.description || "—"}</td>
                <td><button type="button" disabled={isPending} onClick={() => deleteAgent(agent)} className="text-sm font-semibold text-red-600 hover:text-red-500 disabled:opacity-50">Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AgentForm({ onSubmit, disabled }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; disabled: boolean }) {
  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
  return <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">Register an agent</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-slate-700">Name *<input className={inputClass} name="name" required /></label><label className="text-sm font-medium text-slate-700">Role *<input className={inputClass} name="role" required /></label><label className="text-sm font-medium text-slate-700">Model<input className={inputClass} name="model" defaultValue="gpt-4.1-mini" /></label><label className="text-sm font-medium text-slate-700">Status<select className={inputClass} name="status" defaultValue="active"><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option></select></label><label className="text-sm font-medium text-slate-700">Risk level<select className={inputClass} name="risk_level" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="text-sm font-medium text-slate-700 md:col-span-2">Description<textarea className={inputClass} name="description" rows={3} /></label></div><button disabled={disabled} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">{disabled ? "Saving…" : "Create agent"}</button></form>;
}
