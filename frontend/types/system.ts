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

// Backend Organization entity enums (from organizations/entities/organization.entity.ts)
export enum OrganizationTypeEnum {
  CORPORATION = 'corporation',
  LLC = 'llc',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  NONPROFIT = 'nonprofit',
  GOVERNMENT_AGENCY = 'government_agency',
  TRUST = 'trust',
  ESTATE = 'estate',
  OTHER = 'other'
}

export enum OrganizationStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISSOLVED = 'dissolved',
  MERGED = 'merged',
  ACQUIRED = 'acquired',
  BANKRUPT = 'bankrupt'
}

export interface Organization extends BaseEntity { 
  id: OrgId; 
  // Core fields (EXACTLY aligned with backend Organization entity)
  name: string; // Backend: varchar(255) (required)
  legalName?: string; // Backend: legal_name varchar(255)
  organizationType: OrganizationTypeEnum; // Backend: organization_type enum (required)
  taxId?: string; // Backend: tax_id varchar(100)
  registrationNumber?: string; // Backend: registration_number varchar(100)
  jurisdiction?: string; // Backend: varchar(100)
  incorporationDate?: string; // Backend: incorporation_date date
  dissolutionDate?: string; // Backend: dissolution_date date
  status: OrganizationStatusEnum; // Backend: enum (default: ACTIVE)
  
  // Address fields (backend stores flat, not nested)
  address?: string; // Backend: text
  city?: string; // Backend: varchar(100)
  state?: string; // Backend: varchar(100)
  zipCode?: string; // Backend: zip_code varchar(20)
  country?: string; // Backend: varchar(100)
  
  // Contact fields (backend stores flat, not nested)
  phone?: string; // Backend: varchar(50)
  email?: string; // Backend: varchar(255)
  website?: string; // Backend: varchar(500)
  fax?: string; // Backend: varchar(50)
  
  // Additional backend fields
  primaryContactName?: string; // Backend: primary_contact_name varchar(255)
  primaryContactTitle?: string; // Backend: primary_contact_title varchar(100)
  industryCode?: string; // Backend: industry_code varchar(100)
  numberOfEmployees?: number; // Backend: number_of_employees int
  annualRevenue?: number; // Backend: annual_revenue decimal(15,2)
  stockSymbol?: string; // Backend: stock_symbol varchar(20)
  parentOrganizationId?: string; // Backend: parent_organization_id uuid
  notes?: string; // Backend: text
  metadata?: Record<string, any>; // Backend: jsonb
  
  // Legacy aliases for backward compatibility
  type?: OrganizationType; // Deprecated - use organizationType
  domain?: string; // Frontend extension
  foundedDate?: string; // Alias for incorporationDate
}

// Backend: jurisdictions table
export enum JurisdictionSystem {
  FEDERAL = 'Federal',
  STATE = 'State',
  REGULATORY = 'Regulatory',
  INTERNATIONAL = 'International',
  ARBITRATION = 'Arbitration',
  LOCAL = 'Local'
}

export enum JurisdictionType {
  SUPREME_COURT = 'Supreme Court',
  CIRCUIT_COURT = 'Circuit Court',
  DISTRICT_COURT = 'District Court',
  APPELLATE_COURT = 'Appellate Court',
  TRIAL_COURT = 'Trial Court',
  SPECIALIZED_COURT = 'Specialized Court',
  REGULATORY_BODY = 'Regulatory Body',
  ARBITRATION_PROVIDER = 'Arbitration Provider',
  TREATY = 'Treaty'
}

export interface Jurisdiction extends BaseEntity {
  name: string; // Backend: varchar(255) (required)
  system: JurisdictionSystem; // Backend: enum (required)
  type: JurisdictionType; // Backend: enum (required)
  region?: string; // Backend: varchar(255) - Circuit, State, Country, etc.
  description?: string; // Backend: text
  website?: string; // Backend: varchar(500)
  rulesUrl?: string; // Backend: varchar(500)
  code?: string; // Backend: varchar(100) - e.g., "9th Cir.", "N.D. Cal"
  metadata?: {
    iconColor?: string;
    parties?: number; // For treaties
    status?: string; // For treaties/regulatory
    fullName?: string; // For arbitration providers
    jurisdiction?: string; // For local courts
  };
  rules?: unknown[]; // Backend: OneToMany JurisdictionRule relation
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
  rules?: unknown; 
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
  value: unknown;
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
