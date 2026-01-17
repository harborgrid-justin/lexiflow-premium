// types/data-infrastructure.ts
// Data Platform Infrastructure Types

import { type BaseEntity } from "./primitives";

export interface SchemaTable {
  name: string;
  x: number;
  y: number;
  columns: Array<{ name: string; type: string; nullable?: boolean }>;
}

export interface DataProfile {
  column: string;
  type: string;
  nulls: number;
  unique: number;
  distribution: { name: string; value: number }[];
}

export interface DataLakeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: string;
  modified: string;
  format?: string;
  tier: "Hot" | "Cool" | "Archive";
  parentId: string;
}

export interface InfrastructureCostMetric {
  name: string;
  cost: number;
}

export interface CostForecast {
  day: string;
  actual: number | null;
  forecast: number | null;
}

export interface LineageNode {
  id: string;
  label: string;
  type: "root" | "org" | "party" | "evidence";
}

export interface LineageLink {
  source: string;
  target: string;
  strength: number;
}

export interface Connector {
  id: string;
  name: string;
  type: string;
  status: "Healthy" | "Syncing" | "Degraded" | "Error";
  color: string;
  icon?: string;
}

export interface GovernanceRule {
  id: number;
  name: string;
  status: string;
  impact: string;
  passing: string;
  desc: string;
}

export interface GovernancePolicy {
  id: string;
  title: string;
  version: string;
  status: string;
  date: string;
}

export interface PipelineJob {
  id: string;
  name: string;
  status: "Success" | "Running" | "Failed";
  lastRun: string;
  duration: string;
  volume: string;
  schedule: string;
  logs: string[];
}

export type SnapshotType = "Incremental" | "Full";

export interface BackupSnapshot {
  id: string;
  name: string;
  type: SnapshotType;
  created: string;
  size: string;
  status: "Completed" | "Running" | "Failed";
}

export interface ArchiveStats {
  totalSize: string;
  objectCount: number;
  monthlyCost: number;
  retentionPolicy: string;
  glacierTier: string;
}

// Backend: api_keys table (api-keys module)
export enum ApiKeyScope {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

// ApiKey is also defined in auth.ts - this is the backend-aligned version
export interface BackendApiKey extends BaseEntity {
  // Backend: api_keys table
  name: string; // Backend: varchar (required)
  description?: string; // Backend: varchar
  keyPrefix: string; // Backend: varchar (required)
  keyHash: string; // Backend: varchar (required) - hashed key, never expose raw key
  scopes: ApiKeyScope[]; // Backend: simple-array (required)
  expiresAt?: string; // Backend: timestamp
  rateLimit: number; // Backend: int (default: 1000)
  lastUsedAt?: string; // Backend: timestamp
  requestCount: number; // Backend: int (default: 0)
  isActive: boolean; // Backend: boolean (default: true)
  userId: string; // Backend: uuid (required)

  // Legacy aliases
  prefix?: string; // Alias for keyPrefix
  created?: string; // Alias for createdAt
  status?: "Active" | "Revoked"; // Computed from isActive
}

export interface DataDictionaryItem {
  id: string;
  table: string;
  column: string;
  dataType: string;
  description: string;
  classification: "Public" | "Internal" | "Confidential" | "Restricted";
  isPII: boolean;
  domain: string;
  owner: string;
  sourceSystem: string;
  dataQualityScore: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  target: string;
  status: "Active" | "Upcoming" | "Completed";
  budget?: string;
  dates?: string;
}

export interface MarketingMetric {
  source: string;
  leads: number;
  conversions: number;
  revenue: number;
  roi: number;
}
