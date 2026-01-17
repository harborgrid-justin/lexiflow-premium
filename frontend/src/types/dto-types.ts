/**
 * Data Transfer Object (DTO) Types
 *
 * Type definitions for creating and updating entities via API.
 * These DTOs align with backend validation requirements.
 *
 * @module DTOTypes
 */

import type {
  RiskImpact,
  RiskProbability,
  RiskStatusEnum,
} from "./compliance-risk";
import type {
  TimeEntryStatus,
  InvoiceStatus,
  WorkflowStatus,
  JurorStatus,
  WitnessType,
  WitnessStatus,
  TemplateStatus,
  UserRole,

  BillingModel,
  EntityType,
  EntityRole,
  LegalRuleType} from "./enums";
import type { MetadataRecord } from "./primitives";
import type { OrganizationTypeEnum, OrganizationStatusEnum } from "./system";

// =============================================================================
// BASE DTO TYPES
// =============================================================================

/**
 * Omit standard BaseEntity fields for create operations
 */
export type CreateDTO<T> = Omit<T, "id" | "createdAt" | "updatedAt" | "userId">;

/**
 * Partial for update operations
 */
export type UpdateDTO<T> = Partial<Omit<T, "id" | "createdAt">>;

// =============================================================================
// BILLING DTOs
// =============================================================================

export interface CreateTimeEntryDTO {
  caseId: string;
  date: string;
  duration: number; // hours
  description: string;
  activity?: string;
  ledesCode?: string;
  rate: number;
  billable?: boolean;
  taskCode?: string;
  discount?: number;
  internalNotes?: string;
}

export interface UpdateTimeEntryDTO {
  date?: string;
  duration?: number;
  description?: string;
  activity?: string;
  ledesCode?: string;
  rate?: number;
  status?: TimeEntryStatus;
  billable?: boolean;
  discount?: number;
  internalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ApproveTimeEntryDTO {
  timeEntryIds: string[];
  approvedBy: string;
  notes?: string;
}

export interface CreateInvoiceDTO {
  invoiceNumber: string;
  caseId: string;
  clientId: string;
  clientName: string;
  matterDescription: string;
  invoiceDate: string;
  dueDate: string;
  periodStart?: string;
  periodEnd?: string;
  billingModel: BillingModel;
  timeEntryIds?: string[];
  expenseIds?: string[];
  notes?: string;
  terms?: string;
  taxRate?: number;
  discountAmount?: number;
}

export interface UpdateInvoiceDTO {
  status?: InvoiceStatus;
  dueDate?: string;
  notes?: string;
  terms?: string;
  taxRate?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  paidAmount?: number;
  paidAt?: string;
}

export interface SendInvoiceDTO {
  invoiceId: string;
  recipientEmail: string;
  ccEmails?: string[];
  subject?: string;
  message?: string;
  attachPdf?: boolean;
}

// =============================================================================
// WORKFLOW DTOs
// =============================================================================

export interface CreateWorkflowProcessDTO {
  name: string;
  description?: string;
  templateId?: string;
  caseId?: string;
  projectId?: string;
  startDate?: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High" | "Urgent";
  assignedTo?: string[];
  ownerId?: string;
}

export interface UpdateWorkflowProcessDTO {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High" | "Urgent";
  completionPercentage?: number;
  completedDate?: string;
}

export interface CreateWorkflowTemplateDTO {
  name: string;
  description?: string;
  category: string;
  type?: "Workflow" | "Pleading" | "Motion" | "Document" | "Email" | "Other";
  content?: string;
  variables?: Array<{
    key: string;
    label: string;
    type: string;
    required?: boolean;
  }>;
  sections?: string[];
  tags?: string[];
  jurisdictions?: string[];
  complexity?: "Low" | "Medium" | "High";
  estimatedDuration?: string;
}

export interface UpdateWorkflowTemplateDTO {
  name?: string;
  description?: string;
  category?: string;
  content?: string;
  status?: TemplateStatus;
  variables?: Array<{
    key: string;
    label: string;
    type: string;
    required?: boolean;
  }>;
  sections?: string[];
  tags?: string[];
}

// =============================================================================
// TRIAL DTOs
// =============================================================================

export interface CreateJurorDTO {
  caseId: string;
  jurorNumber?: string;
  name: string;
  status?: JurorStatus;
  demographics?: {
    age?: number;
    gender?: string;
    occupation?: string;
    education?: string;
    maritalStatus?: string;
    zipCode?: string;
  };
  questionnaire?: MetadataRecord;
  notes?: string;
}

export interface UpdateJurorDTO {
  name?: string;
  status?: JurorStatus;
  notes?: string;
  rating?: number;
}

export interface StrikeJurorDTO {
  jurorId: string;
  strikeParty: "Plaintiff" | "Defense";
  peremptoryStrike?: boolean;
  causeStrike?: string;
}

export interface CreateWitnessDTO {
  caseId: string;
  name: string;
  witnessType: WitnessType;
  status?: WitnessStatus;
  email?: string;
  phone?: string;
  address?: string;
  organization?: string;
  title?: string;
  expertise?: string;
  notes?: string;
  // Expert witness specific
  cvUrl?: string;
  hourlyRate?: number;
  retainerAmount?: number;
}

export interface UpdateWitnessDTO {
  name?: string;
  status?: WitnessStatus;
  email?: string;
  phone?: string;
  credibilityScore?: number;
  prepStatus?: number;
  notes?: string;
  contactedAt?: string;
  interviewedAt?: string;
  subpoenaedAt?: string;
  deposedAt?: string;
}

export interface CreateTrialExhibitDTO {
  caseId: string;
  exhibitNumber: string;
  description: string;
  type:
    | "Document"
    | "Photo"
    | "Video"
    | "Audio"
    | "Physical"
    | "Demonstrative"
    | "Expert Report"
    | "Other";
  party: "Plaintiff" | "Defense" | "Joint" | "Court";
  status?:
    | "Draft"
    | "Marked"
    | "Offered"
    | "Admitted"
    | "Excluded"
    | "Withdrawn";
  documentId?: string;
  source?: string;
  tags?: string[];
  custodian?: string;
  notes?: string;
}

export interface UpdateTrialExhibitDTO {
  exhibitNumber?: string;
  description?: string;
  status?:
    | "Draft"
    | "Marked"
    | "Offered"
    | "Admitted"
    | "Excluded"
    | "Withdrawn";
  dateIntroduced?: string;
  admissionDate?: string;
  admittedBy?: string;
  judgeRuling?: string;
  foundationEstablished?: boolean;
  authenticity?: "Verified" | "Challenged" | "Stipulated";
  orderPresented?: number;
  notes?: string;
}

// =============================================================================
// USER DTOs
// =============================================================================

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  title?: string;
  phone?: string;
  extension?: string;
  mobilePhone?: string;
  office?: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  title?: string;
  phone?: string;
  extension?: string;
  mobilePhone?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordDTO {
  email: string;
}

// =============================================================================
// ORGANIZATION DTOs
// =============================================================================

export interface CreateOrganizationDTO {
  name: string;
  legalName?: string;
  organizationType: OrganizationTypeEnum;
  taxId?: string;
  registrationNumber?: string;
  jurisdiction?: string;
  incorporationDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  notes?: string;
}

export interface UpdateOrganizationDTO {
  name?: string;
  legalName?: string;
  status?: OrganizationStatusEnum;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  notes?: string;
  metadata?: MetadataRecord;
}

// =============================================================================
// RISK DTOs
// =============================================================================

export interface CreateRiskDTO {
  title: string;
  description?: string;
  impact: RiskImpact;
  probability: RiskProbability;
  caseId?: string;
  mitigationStrategy?: string;
  identifiedBy?: string;
}

export interface UpdateRiskDTO {
  title?: string;
  description?: string;
  impact?: RiskImpact;
  probability?: RiskProbability;
  status?: RiskStatusEnum;
  mitigationStrategy?: string;
  riskScore?: number;
}

// =============================================================================
// ENTITY DTOs
// =============================================================================

export interface CreateEntityDTO {
  name: string;
  type: EntityType;
  roles: EntityRole[];
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  taxId?: string;
  company?: string;
  title?: string;
  barNumber?: string;
  jurisdiction?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateEntityDTO {
  name?: string;
  type?: EntityType;
  roles?: EntityRole[];
  email?: string;
  phone?: string;
  status?: "Active" | "Inactive" | "Prospect" | "Blacklisted" | "Deceased";
  riskScore?: number;
  tags?: string[];
  notes?: string;
  aliases?: string[];
}

// =============================================================================
// RULE DTOs
// =============================================================================

export interface CreateRuleDTO {
  code: string;
  name: string;
  type: LegalRuleType;
  category?: string;
  description?: string;
  jurisdiction?: string;
  jurisdictionId?: string;
  court?: string;
  effectiveDate?: string;
  source?: string;
  url?: string;
  summary?: string;
  text?: string;
  fullText?: string;
  tags?: string[];
}

export interface UpdateRuleDTO {
  name?: string;
  category?: string;
  description?: string;
  effectiveDate?: string;
  expiryDate?: string;
  summary?: string;
  text?: string;
  fullText?: string;
  status?: "Active" | "Superseded" | "Repealed" | "Draft";
  tags?: string[];
}

// =============================================================================
// ANALYSIS DTOs
// =============================================================================

export interface CreateAnalysisSessionDTO {
  caseId?: string;
  sessionType: "Brief" | "Case" | "Motion" | "Discovery" | "Trial" | "General";
  inputData?: string;
}

export interface UpdateAnalysisSessionDTO {
  outputData?: string;
  findings?: string[];
  recommendations?: string[];
  riskScore?: number;
  endTime?: string;
}

export interface RequestPredictionDTO {
  caseId: string;
  includeFinancials?: boolean;
  includeTimeline?: boolean;
  includeRiskFactors?: boolean;
}

// =============================================================================
// BULK OPERATION DTOs
// =============================================================================

export interface BulkDeleteDTO {
  ids: string[];
  reason?: string;
  cascade?: boolean;
}

export interface BulkUpdateDTO<T> {
  ids: string[];
  updates: Partial<T>;
}

export interface BulkCreateDTO<T> {
  items: T[];
  validateAll?: boolean;
  stopOnError?: boolean;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

export function validateDTO<T extends Record<string, unknown>>(
  dto: T,
  rules: Record<keyof T, (value: unknown) => boolean | string>,
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  for (const [field, validator] of Object.entries(rules)) {
    const value = dto[field as keyof T];
    const result = (validator as (value: unknown) => boolean | string)(value);

    if (result !== true) {
      errors.push({
        field,
        message:
          typeof result === "string" ? result : `Invalid value for ${field}`,
      });
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
