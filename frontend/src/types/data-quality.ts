// types/data-quality.ts
// Data Quality & Governance Types

import { type BaseEntity, type MetadataRecord } from './primitives';

export type SqlCmd = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
export type RLSPermissionLevel = 'None' | 'Read' | 'Write' | 'Full' | 'Own';

export interface RLSPolicy extends BaseEntity {
  name: string;
  table: string;
  cmd: SqlCmd;
  roles: string[];
  using: string;
  withCheck?: string; 
  status: 'Active' | 'Disabled'; 
}

export interface RolePermission extends BaseEntity {
  role: string;
  resource: string;
  access: RLSPermissionLevel;
}

export interface DataAnomaly { 
  id: number; 
  table: string; 
  field: string; 
  issue: string; 
  count: number; 
  sample: string; 
  status: 'Detected' | 'Fixing' | 'Fixed' | 'Ignored'; 
  severity: 'Low' | 'Medium' | 'High' | 'Critical'; 
}

export interface CleansingRule { 
  id: string; 
  name: string; 
  targetField: string; 
  operation: 'Trim' | 'Uppercase' | 'FormatPhone' | 'FormatDate' | 'RemoveSpecialChars' | 'CustomRegex' | 'Lowercase'; 
  parameters?: MetadataRecord; 
  isActive: boolean; 
}

export interface DedupeCluster { 
  id: string; 
  masterId: string; 
  duplicates: { 
    id: string; 
    name: string; 
    similarityScore: number; 
    fieldMatch: string; 
  }[]; 
  status: 'Pending' | 'Merged' | 'Ignored'; 
}

export interface QualityMetricHistory { 
  date: string; 
  score: number; 
  issuesFound: number; 
  issuesFixed: number; 
}
