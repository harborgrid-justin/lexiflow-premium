// types/data-infrastructure.ts
// Data Platform Infrastructure Types

export interface SchemaTable { 
  name: string; 
  x: number; 
  y: number; 
  columns: any[]; 
}

export interface DataProfile { 
  column: string; 
  type: string; 
  nulls: number; 
  unique: number; 
  distribution: {name: string, value: number}[]; 
}

export interface DataLakeItem { 
  id: string; 
  name: string; 
  type: 'folder' | 'file'; 
  size?: string; 
  modified: string; 
  format?: string; 
  tier: 'Hot' | 'Cool' | 'Archive'; 
  parentId: string; 
}

export interface CostMetric { 
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
  type: 'root' | 'org' | 'party' | 'evidence'; 
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
  status: 'Healthy' | 'Syncing' | 'Degraded' | 'Error';
  color: string;
  icon?: any; 
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
  status: 'Success' | 'Running' | 'Failed';
  lastRun: string;
  duration: string;
  volume: string;
  schedule: string;
  logs: string[];
}

export type SnapshotType = 'Incremental' | 'Full';

export interface BackupSnapshot {
  id: string;
  name: string;
  type: SnapshotType;
  created: string;
  size: string;
  status: 'Completed' | 'Running' | 'Failed';
}

export interface ArchiveStats {
  totalSize: string;
  objectCount: number;
  monthlyCost: number;
  retentionPolicy: string;
  glacierTier: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  status: 'Active' | 'Revoked';
}

export interface DataDictionaryItem {
  id: string;
  table: string;
  column: string;
  dataType: string;
  description: string;
  classification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  isPII: boolean;
  domain: string;
  owner: string;
  sourceSystem: string;
  dataQualityScore: number;
}

export interface FinancialPerformanceData {
  revenue: { month: string; actual: number; target: number }[];
  expenses: { category: string; value: number }[];
}

export interface MarketingCampaign {
  id: string;
  name: string;
  target: string;
  status: 'Active' | 'Upcoming' | 'Completed';
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
