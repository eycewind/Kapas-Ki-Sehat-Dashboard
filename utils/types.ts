// Dashboard-side type definitions, aligned to MASTER-CONTRACTS.md §1 (tables)
// and §4 (risk level enum). MASTER-CONTRACTS.md is the cross-repo source of
// truth; CONTRACTS.md tracks the dashboard's view of it. Keep both in sync when
// these shapes change.

// §4 — canonical risk levels. Uppercase, no spaces, exactly these four.
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// Hex colors for map markers + UI badges, keyed by canonical risk level.
export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#6BE675',      // green  — healthy / below threshold
  MEDIUM: '#F4B740',   // amber  — monitor
  HIGH: '#F58B40',     // orange — action recommended
  CRITICAL: '#F45B5B', // red    — outbreak
};

// Fallback for any value that is not a canonical RiskLevel.
export const UNKNOWN_RISK_COLOR = '#9CA3AF';

export function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === 'string' && (RISK_LEVELS as string[]).includes(value);
}

export function riskColor(value: unknown): string {
  return isRiskLevel(value) ? RISK_COLORS[value] : UNKNOWN_RISK_COLOR;
}

// §1.1 diagnostic_logs. NOTE: there is NO `status` and NO `image_url` column.
export interface DiagnosticLog {
  id: string;
  device_id: string | null;
  timestamp: string | null;
  district: string;
  whitefly_count: number;
  risk_level: RiskLevel;
  confidence_score: number; // 0.0–1.0
  inference_time_ms: number;
  image_storage_path: string | null;
  created_at: string | null;
  latitude: number | null;  // null (not 0.0) when GPS unavailable
  longitude: number | null; // null (not 0.0) when GPS unavailable
  agricultural_belt: string | null;
}

// §1.3 model_deployments. Score columns are FLAT (not nested under `scores`).
export interface ModelDeployment {
  id: string;
  model_version: string;
  deployed_at: string | null;
  dataset_size_leaves: number;
  f1_score: number;
  precision_score: number;
  recall_score: number;
  is_active_fleet_model: boolean | null;
}
