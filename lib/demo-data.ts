import type { Agent, AgentRun, DashboardMetric, KnowledgeSource, Tool } from "./types";

export const agents: Agent[] = [
  { id: "a1", name: "Support Triage", role: "Customer support", model: "GPT-4.1 mini", status: "active", riskLevel: "low", description: "Classifies incoming tickets and drafts responses." },
  { id: "a2", name: "Sales Research", role: "Sales intelligence", model: "Claude 3.7 Sonnet", status: "active", riskLevel: "medium", description: "Researches accounts and prepares briefing notes." },
  { id: "a3", name: "Invoice Processing", role: "Finance operations", model: "GPT-4.1", status: "active", riskLevel: "high", description: "Extracts invoice fields and flags payment anomalies." },
  { id: "a4", name: "Code Review", role: "Engineering quality", model: "Claude 3.7 Sonnet", status: "paused", riskLevel: "high", description: "Reviews pull requests for quality and security risks." },
  { id: "a5", name: "Policy Research", role: "Compliance research", model: "GPT-4.1 mini", status: "inactive", riskLevel: "low", description: "Summarizes internal policy and regulatory updates." },
];

export const tools: Tool[] = [
  { id: "t1", name: "Web Search", category: "Research", approvalStatus: "approved", riskLevel: "low" },
  { id: "t2", name: "Knowledge Lookup", category: "Knowledge", approvalStatus: "approved", riskLevel: "low" },
  { id: "t3", name: "CRM Read", category: "Customer data", approvalStatus: "approved", riskLevel: "medium" },
  { id: "t4", name: "Email Draft", category: "Communication", approvalStatus: "needs_review", riskLevel: "medium" },
  { id: "t5", name: "Database Query", category: "Data", approvalStatus: "unapproved", riskLevel: "high" },
  { id: "t6", name: "Invoice Parser", category: "Finance", approvalStatus: "approved", riskLevel: "medium" },
  { id: "t7", name: "Repository Read", category: "Engineering", approvalStatus: "needs_review", riskLevel: "high" },
];

export const knowledgeSources: KnowledgeSource[] = [
  { id: "k1", title: "Support Handbook", sourceType: "document", url: "https://example.com/support-handbook", status: "active" },
  { id: "k2", title: "Product Documentation", sourceType: "website", url: "https://docs.example.com", status: "active" },
  { id: "k3", title: "Sales CRM", sourceType: "database", url: "https://crm.example.com", status: "inactive" },
  { id: "k4", title: "Product Repository", sourceType: "repository", url: "https://github.com/example/product", status: "sync_error" },
];

export const agentRuns: AgentRun[] = [
  { id: "r1", agentId: "a1", agentName: "Support Triage", task: "Classify refund request", status: "success", latencyMs: 830, estimatedCostUsd: 0.0124, output: "Refund intent identified and routed.", riskLevel: "low", createdAt: "2026-07-25T14:42:00Z" },
  { id: "r2", agentId: "a2", agentName: "Sales Research", task: "Prepare Acme account brief", status: "success", latencyMs: 2140, estimatedCostUsd: 0.047, output: "Account brief prepared with three signals.", riskLevel: "medium", createdAt: "2026-07-25T13:18:00Z" },
  { id: "r3", agentId: "a3", agentName: "Invoice Processing", task: "Validate invoice INV-9021", status: "needs_review", latencyMs: 1810, estimatedCostUsd: 0.0312, output: "Vendor bank details require human review.", riskLevel: "high", createdAt: "2026-07-25T12:51:00Z" },
  { id: "r4", agentId: "a4", agentName: "Code Review", task: "Review pull request #228", status: "failed", latencyMs: 920, estimatedCostUsd: 0.018, output: "Repository connection unavailable.", riskLevel: "high", createdAt: "2026-07-25T11:36:00Z" },
  { id: "r5", agentId: "a1", agentName: "Support Triage", task: "Route account access issue", status: "success", latencyMs: 640, estimatedCostUsd: 0.0091, output: "Request routed to identity support.", riskLevel: "low", createdAt: "2026-07-25T10:04:00Z" },
  { id: "r6", agentId: "a5", agentName: "Policy Research", task: "Summarize retention policy", status: "success", latencyMs: 1650, estimatedCostUsd: 0.026, output: "Retention requirements summarized.", riskLevel: "low", createdAt: "2026-07-24T17:22:00Z" },
  { id: "r7", agentId: "a2", agentName: "Sales Research", task: "Find expansion signals", status: "success", latencyMs: 2380, estimatedCostUsd: 0.052, output: "Five expansion signals identified.", riskLevel: "medium", createdAt: "2026-07-24T15:48:00Z" },
  { id: "r8", agentId: "a3", agentName: "Invoice Processing", task: "Extract invoice INV-9017", status: "success", latencyMs: 1290, estimatedCostUsd: 0.022, output: "Eight invoice fields extracted.", riskLevel: "high", createdAt: "2026-07-24T14:05:00Z" },
  { id: "r9", agentId: "a1", agentName: "Support Triage", task: "Draft billing response", status: "needs_review", latencyMs: 1120, estimatedCostUsd: 0.0165, output: "Draft includes an unverified refund promise.", riskLevel: "medium", createdAt: "2026-07-24T12:10:00Z" },
  { id: "r10", agentId: "a2", agentName: "Sales Research", task: "Summarize discovery notes", status: "success", latencyMs: 980, estimatedCostUsd: 0.019, output: "Discovery notes summarized by theme.", riskLevel: "low", createdAt: "2026-07-24T09:32:00Z" },
];

const averageLatency = Math.round(agentRuns.reduce((sum, run) => sum + run.latencyMs, 0) / agentRuns.length);
const totalCost = agentRuns.reduce((sum, run) => sum + run.estimatedCostUsd, 0);

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Total Agents", value: String(agents.length), detail: "Registered in this workspace" },
  { label: "Active Agents", value: String(agents.filter((agent) => agent.status === "active").length), detail: "Currently operational" },
  { label: "Total Runs", value: String(agentRuns.length), detail: "Recorded executions" },
  { label: "Failed Runs", value: String(agentRuns.filter((run) => run.status === "failed").length), detail: "Execution failures" },
  { label: "Average Latency", value: `${averageLatency.toLocaleString()} ms`, detail: "Across recorded runs" },
  { label: "Estimated Cost", value: `$${totalCost.toFixed(3)}`, detail: "Not billed usage" },
  { label: "High-Risk Agents", value: String(agents.filter((agent) => agent.riskLevel === "high").length), detail: "Require closer oversight" },
  { label: "Approved Tools", value: String(tools.filter((tool) => tool.approvalStatus === "approved").length), detail: `Of ${tools.length} registered tools` },
];
