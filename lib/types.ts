export type AgentStatus = "active" | "inactive" | "paused";
export type RiskLevel = "low" | "medium" | "high";
export type AgentRegistryStatus = "active" | "paused" | "archived";
export type RunStatus = "success" | "failed" | "needs_review";
export type AgentRunStatus = RunStatus;

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

export interface DatabaseTool {
  id: string;
  project_id: string;
  name: string;
  category: string | null;
  is_approved: boolean;
  risk_level: RiskLevel;
  created_at: string;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  sourceType: "website" | "document" | "database" | "api" | "repository";
  url: string;
  status: "active" | "inactive" | "sync_error";
}

export type KnowledgeSourceStatus = "active" | "inactive";
export type KnowledgeSourceType =
  | "website"
  | "pdf"
  | "notion"
  | "google_drive"
  | "internal_docs"
  | "api_docs"
  | "database"
  | "slack"
  | "github_repo";

export interface DatabaseKnowledgeSource {
  id: string;
  project_id: string;
  title: string;
  source_type: KnowledgeSourceType | null;
  url: string | null;
  status: KnowledgeSourceStatus;
  created_at: string;
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

export interface DatabaseAgentRun {
  id: string;
  project_id: string;
  agent_id: string | null;
  task: string;
  output: string | null;
  status: AgentRunStatus;
  risk_level: RiskLevel;
  latency_ms: number;
  cost_usd: number;
  created_at: string;
}

export interface DatabaseAgentRunStep {
  id: string;
  project_id: string;
  run_id: string;
  tool_id: string | null;
  step_order: number;
  step_number?: number | null;
  name?: string | null;
  input: string | null;
  output: string | null;
  status: AgentRunStatus;
  created_at: string;
}

export type AgentOption = Pick<DatabaseAgent, "id" | "name">;
export type ToolOption = Pick<DatabaseTool, "id" | "name">;

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface DashboardMetrics {
  totalAgents: number;
  activeAgents: number;
  totalRuns: number;
  failedRuns: number;
  averageLatencyMs: number;
  estimatedCostUsd: number;
  highRiskAgents: number;
  approvedTools: number;
  knowledgeSources: number;
}

export interface DashboardRecentRun {
  id: string;
  agentName: string;
  task: string;
  status: AgentRunStatus;
  riskLevel: RiskLevel;
  latencyMs: number;
  costUsd: number;
  createdAt: string;
}

export type AuditEventType = "agent_registered" | "tool_registered" | "knowledge_source_registered" | "agent_run_logged" | "tool_step_logged";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  label: string;
  title: string;
  description: string;
  createdAt: string;
  status?: string;
  riskLevel?: RiskLevel;
  metadata: string[];
}
