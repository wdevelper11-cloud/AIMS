export type AgentStatus = "active" | "inactive" | "paused";
export type RiskLevel = "low" | "medium" | "high";
export type AgentRegistryStatus = "active" | "paused" | "archived";
export type RunStatus = "success" | "failed" | "needs_review";

export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  riskLevel: RiskLevel;
  description: string;
}

export interface DatabaseAgent {
  id: string;
  project_id: string;
  name: string;
  role: string;
  model: string;
  status: AgentRegistryStatus;
  risk_level: RiskLevel;
  description: string | null;
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  approvalStatus: "approved" | "unapproved" | "needs_review";
  riskLevel: RiskLevel;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  sourceType: "website" | "document" | "database" | "api" | "repository";
  url: string;
  status: "active" | "inactive" | "sync_error";
}

export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  task: string;
  status: RunStatus;
  latencyMs: number;
  estimatedCostUsd: number;
  output: string;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}
