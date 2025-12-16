/**
 * Case-related enums
 * Shared between frontend and backend
 */

export enum CaseStatus {
  OPEN = 'Open',
  ACTIVE = 'Active',
  DISCOVERY = 'Discovery',
  TRIAL = 'Trial',
  SETTLED = 'Settled',
  CLOSED = 'Closed',
  ARCHIVED = 'Archived',
  ON_HOLD = 'On Hold',
  PRE_FILING = 'Pre-Filing',
  APPEAL = 'Appeal',
  TRANSFERRED = 'Transferred',
}

export enum CaseType {
  CIVIL = 'Civil',
  CRIMINAL = 'Criminal',
  FAMILY = 'Family',
  BANKRUPTCY = 'Bankruptcy',
  IMMIGRATION = 'Immigration',
  INTELLECTUAL_PROPERTY = 'Intellectual Property',
  CORPORATE = 'Corporate',
  REAL_ESTATE = 'Real Estate',
  LABOR = 'Labor',
  ENVIRONMENTAL = 'Environmental',
  TAX = 'Tax',
  LITIGATION = 'Litigation',
  MA = 'M&A',
  IP = 'IP',
  GENERAL = 'General',
}

export enum MatterType {
  LITIGATION = 'Litigation',
  MA = 'M&A',
  IP = 'IP',
  REAL_ESTATE = 'Real Estate',
  GENERAL = 'General',
  APPEAL = 'Appeal',
}

export enum BillingModel {
  HOURLY = 'Hourly',
  FIXED = 'Fixed',
  CONTINGENCY = 'Contingency',
  HYBRID = 'Hybrid',
}
