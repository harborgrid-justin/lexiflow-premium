/**
 * API Response Types
 *
 * Comprehensive type definitions for API responses across all services.
 * These types ensure type safety and consistency for backend API interactions.
 *
 * @module ApiResponseTypes
 */

import type { Risk } from "./compliance-risk";
import type { TrialExhibit } from "./evidence";
import type { Invoice, TimeEntry } from "./financial";
import type { BriefAnalysisSession, LegalRule } from "./legal-research";
import type { JudgeProfile, LegalEntity } from "./misc";
import type { Organization, User } from "./system";
import type { Juror, Witness } from "./trial";
import type { WorkflowProcess, WorkflowTemplateData } from "./workflow";

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse<T = unknown> {
  success: boolean;
  successCount: number;
  failureCount: number;
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// BILLING API RESPONSES
// =============================================================================

export type TimeEntriesResponse = PaginatedApiResponse<TimeEntry>;

export type TimeEntryResponse = ApiResponse<TimeEntry>;

export type InvoicesResponse = PaginatedApiResponse<Invoice>;

export type InvoiceResponse = ApiResponse<Invoice>;

export type WIPStatsResponse = ApiResponse<{
  totalWIP: number;
  unbilledHours: number;
  unbilledValue: number;
  byClient: Array<{
    clientId: string;
    clientName: string;
    wipAmount: number;
    unbilledHours: number;
  }>;
  byMatter: Array<{
    caseId: string;
    caseName: string;
    wipAmount: number;
    unbilledHours: number;
  }>;
  aging: {
    current: number;
    thirtyDays: number;
    sixtyDays: number;
    ninetyDaysPlus: number;
  };
}>;

export type RealizationStatsResponse = ApiResponse<{
  realizationRate: number;
  billedAmount: number;
  collectedAmount: number;
  writeOffs: number;
  discounts: number;
  period: {
    startDate: string;
    endDate: string;
  };
  byTimekeeper: Array<{
    userId: string;
    userName: string;
    realizationRate: number;
    billedAmount: number;
    collectedAmount: number;
  }>;
}>;

export type OperatingStatsResponse = ApiResponse<{
  balance: number;
  expensesMtd: number;
  cashFlowMtd: number;
  revenue: {
    current: number;
    mtd: number;
    ytd: number;
  };
  expenses: {
    current: number;
    mtd: number;
    ytd: number;
  };
}>;

// =============================================================================
// WORKFLOW API RESPONSES
// =============================================================================

export type WorkflowProcessesResponse = PaginatedApiResponse<WorkflowProcess>;

export type WorkflowProcessResponse = ApiResponse<WorkflowProcess>;

export type WorkflowTemplatesResponse =
  PaginatedApiResponse<WorkflowTemplateData>;

export type WorkflowTemplateResponse = ApiResponse<WorkflowTemplateData>;

export type WorkflowAnalyticsResponse = ApiResponse<{
  totalProcesses: number;
  activeProcesses: number;
  completedThisMonth: number;
  averageCompletionRate: number;
  overdueTasks: number;
  atRiskTasks: number;
  tasksByStatus: Record<string, number>;
  processByCategory: Record<string, number>;
  completionTrend: Array<{
    date: string;
    count: number;
  }>;
}>;

// =============================================================================
// TRIAL API RESPONSES
// =============================================================================

export type TrialExhibitsResponse = PaginatedApiResponse<TrialExhibit>;

export type TrialExhibitResponse = ApiResponse<TrialExhibit>;

export type JurorsResponse = ApiResponse<Juror[]>;

export type JurorResponse = ApiResponse<Juror>;

export type WitnessesResponse = ApiResponse<Witness[]>;

export type WitnessResponse = ApiResponse<Witness>;

// =============================================================================
// USER API RESPONSES
// =============================================================================

export type UsersResponse = PaginatedApiResponse<User>;

export type UserResponse = ApiResponse<User>;

export type UserSearchResponse = ApiResponse<User[]>;

// =============================================================================
// ORGANIZATION API RESPONSES
// =============================================================================

export type OrganizationsResponse = PaginatedApiResponse<Organization>;

export type OrganizationResponse = ApiResponse<Organization>;

export type OrganizationSearchResponse = ApiResponse<Organization[]>;

// =============================================================================
// TEMPLATE API RESPONSES
// =============================================================================

export type TemplatesResponse = PaginatedApiResponse<WorkflowTemplateData>;

export type TemplateResponse = ApiResponse<WorkflowTemplateData>;

// =============================================================================
// RISK API RESPONSES
// =============================================================================

export type RisksResponse = PaginatedApiResponse<Risk>;

export type RiskResponse = ApiResponse<Risk>;

export type RiskAssessmentResponse = ApiResponse<{
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  factors: Array<{
    factor: string;
    weight: number;
    contribution: number;
  }>;
  recommendations: string[];
}>;

// =============================================================================
// ENTITY API RESPONSES
// =============================================================================

export type EntitiesResponse = PaginatedApiResponse<LegalEntity>;

export type EntityResponse = ApiResponse<LegalEntity>;

export type EntityRelationshipsResponse = ApiResponse<{
  entity: LegalEntity;
  relationships: Array<{
    relatedEntity: LegalEntity;
    relationshipType: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }>;
}>;

// =============================================================================
// RULE API RESPONSES
// =============================================================================

export type RulesResponse = PaginatedApiResponse<LegalRule>;

export type RuleResponse = ApiResponse<LegalRule>;

export type RuleSearchResponse = ApiResponse<{
  results: LegalRule[];
  totalResults: number;
  searchTime: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}>;

// =============================================================================
// ANALYSIS API RESPONSES
// =============================================================================

export type AnalysisSessionsResponse =
  PaginatedApiResponse<BriefAnalysisSession>;

export type AnalysisSessionResponse = ApiResponse<BriefAnalysisSession>;

export type JudgeProfilesResponse = ApiResponse<JudgeProfile[]>;

export type JudgeProfileResponse = ApiResponse<JudgeProfile>;

export type PredictionResponse = ApiResponse<{
  caseId: string;
  settlementProbability: number;
  trialProbability: number;
  dismissalProbability: number;
  estimatedSettlementRange: {
    low: number;
    median: number;
    high: number;
    confidence: number;
  };
  estimatedDurationMonths: number;
  riskFactors: Array<{
    factor: string;
    impact: "Low" | "Medium" | "High";
    description: string;
  }>;
  recommendations: string[];
}>;

// =============================================================================
// ERROR TYPES
// =============================================================================

export enum ApiErrorCode {
  // General errors
  UNKNOWN = "UNKNOWN_ERROR",
  NETWORK = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT_ERROR",

  // Authentication errors
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Resource errors
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CONFLICT = "CONFLICT",

  // Business logic errors
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",

  // Server errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  DATABASE_ERROR = "DATABASE_ERROR",
}

export interface ApiError {
  code: ApiErrorCode | string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  requestId?: string;
}

export class ApiException extends Error {
  constructor(
    public readonly error: ApiError,
    public readonly response?: Response
  ) {
    super(error.message);
    this.name = "ApiException";
  }
}

// =============================================================================
// REQUEST FILTER TYPES
// =============================================================================

export interface BaseFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

// TimeEntryFilters is also defined in filters/billing.ts
// This version extends BaseFilters for API compatibility
export interface ApiTimeEntryFilters extends BaseFilters {
  caseId?: string;
  userId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  billable?: boolean;
}

// InvoiceFilters is also defined in filters/billing.ts
// This version extends BaseFilters for API compatibility
export interface ApiInvoiceFilters extends BaseFilters {
  caseId?: string;
  clientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface WorkflowProcessFilters extends BaseFilters {
  status?: string;
  caseId?: string;
  templateId?: string;
  ownerId?: string;
}

export interface RiskFilters extends BaseFilters {
  caseId?: string;
  impact?: string;
  probability?: string;
  status?: string;
}

export interface EntityFilters extends BaseFilters {
  type?: string;
  caseId?: string;
  status?: string;
}

export interface RuleFilters extends BaseFilters {
  jurisdiction?: string;
  type?: string;
  category?: string;
  effectiveDate?: string;
}
