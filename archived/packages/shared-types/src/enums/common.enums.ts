/**
 * Common enums used across multiple domains
 * Shared between frontend and backend
 */

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
  COMPLETED = 'Completed',
  BLOCKED = 'Blocked',
  CANCELLED = 'Cancelled',
}

export enum StageStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
}

export enum TaskDependencyType {
  FINISH_TO_START = 'FinishToStart',
  START_TO_START = 'StartToStart',
  FINISH_TO_FINISH = 'FinishToFinish',
  START_TO_FINISH = 'StartToFinish',
}

export enum OrganizationType {
  LAW_FIRM = 'LawFirm',
  CORPORATE = 'Corporate',
  GOVERNMENT = 'Government',
  COURT = 'Court',
  VENDOR = 'Vendor',
}

export enum EntityType {
  INDIVIDUAL = 'Individual',
  CORPORATION = 'Corporation',
  COURT = 'Court',
  GOVERNMENT = 'Government',
  VENDOR = 'Vendor',
  LAW_FIRM = 'Law Firm',
}

export enum EntityRole {
  CLIENT = 'Client',
  OPPOSING_COUNSEL = 'Opposing Counsel',
  JUDGE = 'Judge',
  EXPERT = 'Expert',
  WITNESS = 'Witness',
  STAFF = 'Staff',
  PROSPECT = 'Prospect',
}

export enum RiskCategory {
  LEGAL = 'Legal',
  FINANCIAL = 'Financial',
  REPUTATIONAL = 'Reputational',
  OPERATIONAL = 'Operational',
  STRATEGIC = 'Strategic',
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum RiskStatus {
  IDENTIFIED = 'Identified',
  MITIGATED = 'Mitigated',
  ACCEPTED = 'Accepted',
  CLOSED = 'Closed',
}

export enum LegalRuleType {
  FRE = 'FRE',
  FRCP = 'FRCP',
  FRAP = 'FRAP',
  LOCAL = 'Local',
  STATE = 'State',
}

/**
 * Application navigation categories
 */
export enum NavCategory {
  MAIN = 'Main',
  CASE_WORK = 'Case Work',
  LITIGATION_TOOLS = 'Litigation Tools',
  OPERATIONS = 'Operations',
  KNOWLEDGE = 'Knowledge',
  ADMIN = 'Admin',
}
