// types/system.ts
// System Configuration & Infrastructure Types

import { BaseEntity, UserId, OrgId, GroupId, EntityId } from './primitives';
import { UserRole, OrganizationType } from './enums';

export interface TenantConfig {
  name: string;
  tier: string;
  version: string;
  region: string;
}

export interface ApiMethod {
  name: string;
  http: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params: { name: string; type: string; desc: string }[];
  response: string; // JSON string example
}

export interface ApiServiceSpec {
  name: string;
  description: string;
  methods: ApiMethod[];
}

export interface OperatingSummary {
  id?: string;
  balance: number;
  expensesMtd: number;
  cashFlowMtd: number;
}

export interface ComplianceMetrics {
  score: number;
  high: number;
  missingDocs: number;
  violations: number;
  activeWalls: number;
}

export interface User extends BaseEntity { 
  id: UserId; 
  // Core fields (aligned with backend)
  email: string; // Backend: unique, indexed
  password?: string; // Backend field (not exposed in frontend typically)
  firstName?: string; // Backend field
  lastName?: string; // Backend field
  name: string; // Computed from firstName + lastName
  role: UserRole; // Backend: enum (indexed)
  department?: string; // Backend: varchar(200), indexed
  title?: string; // Backend: varchar(100)
  
  // Contact info
  phone?: string; // Backend: varchar(50)
  extension?: string; // Backend: varchar(50)
  mobilePhone?: string; // Backend: varchar(50)
  avatarUrl?: string; // Backend: varchar(500)
  office?: string;
  
  // Organization
  orgId?: OrgId;
  groupIds?: GroupId[];
  userType?: 'Internal' | 'External';
  
  // Status & security
  status?: 'online' | 'offline' | 'away' | 'busy'; // Frontend real-time status
  isActive?: boolean; // Backend: boolean (default: true, indexed)
  isVerified?: boolean; // Backend: boolean (default: false)
  verificationToken?: string; // Backend field
  verificationTokenExpiry?: string; // Backend: timestamp
  
  // Password reset
  resetPasswordToken?: string; // Backend field
  resetPasswordExpiry?: string; // Backend: timestamp
  
  // Login tracking
  lastLoginAt?: string; // Backend: timestamp
  lastLoginIp?: string; // Backend: varchar(100)
  loginAttempts?: number; // Backend: int (default: 0)
  lockedUntil?: string; // Backend: timestamp
  
  // Two-factor auth
  twoFactorEnabled?: boolean; // Backend: boolean (default: false)
}

export interface Organization extends BaseEntity { 
  id: OrgId; 
  name: string; 
  type: OrganizationType; 
  domain: string; 
  status: string; 
}

export interface Group extends BaseEntity { 
  id: GroupId; 
  orgId: OrgId; 
  name: string; 
  description: string; 
  permissions: string[]; 
}

export interface FeatureFlag extends BaseEntity { 
  key: string; 
  enabled: boolean; 
  rules?: any; 
  description: string; 
}

export interface IntegrationMapping extends BaseEntity { 
  system: string; 
  entity: string; 
  fieldMap: Record<string, string>; 
  direction: 'Inbound' | 'Outbound' | 'Bi-directional'; 
}

// Granular Profile System
export type AccessEffect = 'Allow' | 'Deny';
export type AccessScope = 'Global' | 'Region' | 'Office' | 'Personal';

export interface AccessCondition {
  type: 'Time' | 'Location' | 'Device' | 'Network';
  operator: 'Equals' | 'NotEquals' | 'Between' | 'Includes';
  value: any;
}

export interface GranularPermission {
  id: string;
  resource: string; // e.g., "cases", "billing.invoices", "documents.metadata"
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'approve' | '*';
  effect: AccessEffect;
  scope: AccessScope;
  conditions?: AccessCondition[]; // e.g., Time: 9am-5pm
  expiration?: string; // ISO Date for temporary access
  reason?: string; // Audit trail for why this permission exists
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
    digestFrequency: 'Realtime' | 'Daily' | 'Weekly';
  };
  dashboardLayout: string[]; // Widget IDs
  density: 'comfortable' | 'compact';
  locale: string;
  timezone: string;
}

export interface UserSecurityProfile {
  mfaEnabled: boolean;
  mfaMethod: 'App' | 'SMS' | 'Hardware';
  lastPasswordChange: string;
  passwordExpiry: string;
  ipWhitelist?: string[];
  activeSessions: {
    id: string;
    device: string;
    ip: string;
    lastActive: string;
    current: boolean;
  }[];
}

export interface ExtendedUserProfile extends User {
  entityId: EntityId; // Link to Entity Director
  title: string;
  department: string;
  managerId?: UserId;
  accessMatrix: GranularPermission[];
  preferences: UserPreferences;
  security: UserSecurityProfile;
  skills: string[];
  barAdmissions: { state: string; number: string; status: 'Active' | 'Inactive' }[];
}
