/**
 * Type definitions for Enterprise Case Management components
 *
 * Centralized type exports for all enterprise case management features
 *
 * @module components/enterprise/CaseManagement/types
 */

// Re-export types from EnterpriseCaseList
export type {
  BulkOperation,
  ColumnConfig,
  EnterpriseCaseListProps,
  FilterCriteria,
  SavedView,
} from "./EnterpriseCaseList";

// Re-export types from CaseTemplates
export type {
  CaseTemplate,
  CaseTemplatesProps,
  ChecklistItem,
  PracticeArea,
  TemplateDocument,
  TemplateField,
  TemplateMilestone,
} from "./CaseTemplates";

// Re-export types from EnhancedCaseTimeline
export type {
  EnhancedCaseTimelineProps,
  EventStatus,
  EventType,
  TimelineEvent,
  TimelineGroup,
  ViewMode,
} from "./EnhancedCaseTimeline";

// Re-export types from CaseTeam
export type {
  CaseTeamProps,
  Permission,
  RoleTemplate,
  TeamMember,
  TeamMemberRole,
  WorkloadSummary,
} from "./CaseTeam";

// Re-export types from CaseBudget
export type {
  BudgetAlert,
  BudgetCategory,
  BudgetPeriod,
  CaseBudgetProps,
  Expense,
} from "./CaseBudget";

// Common Enterprise Features
export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType?:
    | "client"
    | "opposing-party"
    | "adverse-interest"
    | "prior-representation";
  conflictedCases?: string[];
  conflictedParties?: string[];
  severity: "low" | "medium" | "high" | "critical";
  recommendation: string;
  details?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface RelatedMatter {
  id: string;
  caseNumber: string;
  title: string;
  relationshipType:
    | "parent"
    | "child"
    | "related"
    | "consolidated"
    | "cross-reference";
  description?: string;
  status: string;
}

export interface MassOperation {
  operationType:
    | "status-update"
    | "bulk-assign"
    | "bulk-tag"
    | "bulk-archive"
    | "bulk-export";
  targetCaseIds: string[];
  parameters: Record<string, unknown>;
  executedBy?: string;
  executedAt?: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  results?: {
    successful: number;
    failed: number;
    errors?: Array<{ caseId: string; error: string }>;
  };
}

export interface CaseCloneConfig {
  sourceCaseId: string;
  includeParties: boolean;
  includeDocuments: boolean;
  includeTimeline: boolean;
  includeTeam: boolean;
  includeBudget: boolean;
  customizations?: Partial<{
    title: string;
    caseNumber: string;
    client: string;
    status: string;
  }>;
}

export interface PracticeAreaConfig {
  id: string;
  name: string;
  description: string;
  defaultTemplateId?: string;
  requiredFields: string[];
  optionalFields: string[];
  customFields?: Array<{
    name: string;
    type: "text" | "number" | "date" | "select" | "multiselect";
    required: boolean;
    options?: string[];
  }>;
  defaultWorkflows?: string[];
  complianceRequirements?: string[];
}

// Bulk operation results
export interface BulkOperationResult {
  operation: string;
  totalProcessed: number;
  successful: number;
  failed: number;
  duration: number; // milliseconds
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

// Advanced search criteria
export interface AdvancedSearchCriteria {
  query?: string;
  caseNumber?: string;
  clientName?: string;
  status?: string[];
  practiceArea?: string[];
  assignedTo?: string[];
  filingDateRange?: { start: string; end: string };
  trialDateRange?: { start: string; end: string };
  budgetRange?: { min: number; max: number };
  tags?: string[];
  customFields?: Record<string, unknown>;
}

// Export configuration
export interface ExportConfig {
  format: "csv" | "xlsx" | "pdf" | "json";
  caseIds: string[];
  includeFields: string[];
  includeDocuments?: boolean;
  includeTimeline?: boolean;
  includeFinancials?: boolean;
  includeTeam?: boolean;
  customTemplate?: string;
}

// Import configuration
export interface ImportConfig {
  format: "csv" | "xlsx" | "json";
  file: File | string;
  mapping: Record<string, string>; // Map import columns to case fields
  validateOnly?: boolean;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

// Import validation result
export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors?: Array<{
    row: number;
    field: string;
    error: string;
  }>;
  warnings?: Array<{
    row: number;
    field: string;
    warning: string;
  }>;
}
