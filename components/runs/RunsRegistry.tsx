"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { createBrowserClient } from "@/lib/supabase/client";
import type { AgentOption, AgentRunStatus, DatabaseAgentRun, RiskLevel, ToolOption } from "@/lib/types";

type Feedback = { tone: "success" | "error"; message: string } | null;

export function RunsRegistry({ initialRuns, agents, approvedTools, projectId }: { initialRuns: DatabaseAgentRun[]; agents: AgentOption[]; approvedTools: ToolOption[]; projectId: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();
  const agentNames = new Map(agents.map((agent) => [agent.id, agent.name]));

  function refresh(message: string, tone: "success" | "error" = "success") {
    setFeedback({ tone, message });
    startTransition(() => router.refresh());
  }

  async function createRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = event.currentTarget;
    const values = new FormData(form);
    const agentId = String(values.get("agent_id") ?? "");
    const task = String(values.get("task") ?? "").trim();
    const latencyText = String(values.get("latency_ms") ?? "0").trim() || "0";
    const costText = String(values.get("cost_usd") ?? "0").trim() || "0";
    const riskValue = String(values.get("risk_level") ?? "medium");
    const riskLevel: RiskLevel = riskValue === "low" || riskValue === "high" ? riskValue : "medium";
    const latencyMs = Number(latencyText);
    const costUsd = Number(costText);

    if (!agents.some((agent) => agent.id === agentId)) return setFeedback({ tone: "error", message: "Select an agent from this workspace." });
    if (!task) return setFeedback({ tone: "error", message: "Task is required." });
    if (!Number.isInteger(latencyMs) || latencyMs < 0) return setFeedback({ tone: "error", message: "Latency must be a non-negative integer." });
    if (!Number.isFinite(costUsd) || costUsd < 0) return setFeedback({ tone: "error", message: "Cost must be a non-negative number." });

    const supabase = createBrowserClient();
    const { data: run, error: runError } = await supabase.from("agent_runs").insert({
      project_id: projectId,
      agent_id: agentId,
      task,
      output: String(values.get("output") ?? "").trim() || null,
      status: values.get("status") as AgentRunStatus,
      risk_level: riskLevel,
      latency_ms: latencyMs,
      cost_usd: costUsd,
    }).select("id").single<{ id: string }>();

    if (runError || !run) {
      const schemaMissingRisk = runError && /risk_level|agent_runs_risk_level_check/i.test(runError.message);
      setFeedback({
        tone: "error",
        message: schemaMissingRisk
          ? "Your Supabase Cloud agent_runs schema is missing the Phase 9 risk_level default. Run supabase/patches/phase9_agent_runs_patch.sql in the Supabase SQL Editor."
          : `Agent run could not be logged: ${runError?.message ?? "No run was returned."}`,
      });
      return;
    }

    const toolId = String(values.get("tool_id") ?? "");
    if (toolId) {
      if (!approvedTools.some((tool) => tool.id === toolId)) {
        refresh("Run logged, but the tool step was not added because the selected tool is not approved for this workspace.", "error");
        return;
      }
      const { error: stepError } = await supabase.from("agent_run_steps").insert({
        project_id: projectId,
        run_id: run.id,
        tool_id: toolId,
        step_order: 1,
        input: String(values.get("step_input") ?? "").trim() || null,
        output: String(values.get("step_output") ?? "").trim() || null,
        status: values.get("step_status") as AgentRunStatus,
      });
      if (stepError) {
        refresh(`Run logged, but its optional tool step could not be added: ${stepError.message}`, "error");
        return;
      }
    }

    form.reset();
    setShowForm(false);
    refresh(toolId ? "Agent run and tool step logged." : "Agent run logged.");
  }

  return <div className="space-y-5">
    {agents.length === 0 ? <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Create an agent before logging runs.</p> : <div className="flex justify-end"><button type="button" onClick={() => setShowForm((open) => !open)} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{showForm ? "Cancel" : "Log Agent Run"}</button></div>}
    {showForm && <RunForm agents={agents} approvedTools={approvedTools} onSubmit={createRun} disabled={isPending} />}
    {feedback && <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${feedback.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{feedback.message}</p>}
    {initialRuns.length === 0 ? <EmptyState title="No agent runs logged yet." description="Log your first agent run." /> : <div className="table-shell"><table className="data-table"><thead><tr><th>Agent</th><th>Task</th><th>Status</th><th>Risk</th><th>Latency</th><th>Cost</th><th>Output preview</th><th>Created at</th></tr></thead><tbody>{initialRuns.map((run) => <tr key={run.id}>
      <td className="font-semibold !text-slate-900">{run.agent_id ? agentNames.get(run.agent_id) ?? "Deleted agent" : "Deleted agent"}</td><td>{run.task}</td><td><Badge value={run.status} /></td><td><Badge value={run.risk_level} /></td><td>{run.latency_ms.toLocaleString()} ms</td><td>${Number(run.cost_usd).toFixed(4)}</td><td className="max-w-xs truncate" title={run.output ?? undefined}>{run.output || "—"}</td><td>{new Date(run.created_at).toLocaleString()}</td>
    </tr>)}</tbody></table></div>}
  </div>;
}

function RunForm({ agents, approvedTools, onSubmit, disabled }: { agents: AgentOption[]; approvedTools: ToolOption[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; disabled: boolean }) {
  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
  return <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">Log an agent run</h2><p className="mt-1 text-sm text-slate-500">Record execution evidence manually; this does not execute an agent or call an AI API.</p><div className="mt-4 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-medium text-slate-700">Agent *<select className={inputClass} name="agent_id" required defaultValue=""><option value="" disabled>Select an agent</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Status<select className={inputClass} name="status" defaultValue="success"><option value="success">Success</option><option value="failed">Failed</option><option value="needs_review">Needs review</option></select></label>
    <label className="text-sm font-medium text-slate-700">Risk level<select className={inputClass} name="risk_level" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
    <label className="text-sm font-medium text-slate-700 md:col-span-2">Task *<input className={inputClass} name="task" required /></label>
    <label className="text-sm font-medium text-slate-700 md:col-span-2">Output<textarea className={inputClass} name="output" rows={3} /></label>
    <label className="text-sm font-medium text-slate-700">Latency (ms)<input className={inputClass} name="latency_ms" type="number" min="0" step="1" defaultValue="0" required /></label>
    <label className="text-sm font-medium text-slate-700">Estimated cost (USD)<input className={inputClass} name="cost_usd" type="number" min="0" step="any" defaultValue="0" required /></label>
  </div><fieldset className="mt-6 border-t border-slate-200 pt-5"><legend className="text-sm font-semibold text-slate-900">Optional approved tool step</legend><div className="mt-3 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-medium text-slate-700">Tool<select className={inputClass} name="tool_id" defaultValue=""><option value="">No tool step</option>{approvedTools.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Step status<select className={inputClass} name="step_status" defaultValue="success"><option value="success">Success</option><option value="failed">Failed</option><option value="needs_review">Needs review</option></select></label>
    <label className="text-sm font-medium text-slate-700">Step input<textarea className={inputClass} name="step_input" rows={2} /></label><label className="text-sm font-medium text-slate-700">Step output<textarea className={inputClass} name="step_output" rows={2} /></label>
  </div></fieldset><button disabled={disabled} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">{disabled ? "Saving…" : "Log agent run"}</button></form>;
}
