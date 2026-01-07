/**
 * [PROTOCOL 05] SCHEMA DEFINITION SEPARATION
 * All TypeScript interfaces and enums for drafting domain
 */

export interface DraftingStats {
  drafts: number;
  templates: number;
  pendingReviews: number;
  myTemplates: number;
}

export enum TemplateCategory {
  COMPLAINT = "complaint",
  ANSWER = "answer",
  MOTION = "motion",
  BRIEF = "brief",
  DISCOVERY = "discovery",
  CONTRACT = "contract",
  LETTER = "letter",
  MEMO = "memo",
  ORDER = "order",
  PLEADING = "pleading",
  NOTICE = "notice",
  STIPULATION = "stipulation",
  AFFIDAVIT = "affidavit",
  DECLARATION = "declaration",
  OTHER = "other",
}

export enum TemplateStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
  DEPRECATED = "deprecated",
}

export enum GeneratedDocumentStatus {
  GENERATING = "generating",
  DRAFT = "draft",
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  FINALIZED = "finalized",
  FILED = "filed",
}

export interface TemplateVariable {
  name: string;
  label: string;
  type:
    | "text"
    | "date"
    | "number"
    | "select"
    | "multi-select"
    | "boolean"
    | "case-data"
    | "party"
    | "attorney";
  required: boolean;
  defaultValue?: string;
  options?: string[];
  description?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface ClauseReference {
  clauseId: string;
  position: number;
  isOptional: boolean;
  condition?: string;
}

export interface DraftingTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  status: TemplateStatus;
  content: string;
  variables: TemplateVariable[];
  clauseReferences?: ClauseReference[];
  tags?: string[];
  jurisdiction?: string;
  practiceArea?: string;
  courtType?: string;
  isPublic: boolean;
  createdBy: string;
  updatedBy?: string;
  usageCount: number;
  lastUsedAt?: string;
  version?: string;
  parentTemplateId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  description?: string;
  templateId: string;
  template?: DraftingTemplate;
  caseId?: string;
  case?: unknown;
  status: GeneratedDocumentStatus;
  content: string;
  variableValues: Record<string, unknown>;
  includedClauses?: string[];
  createdBy: string;
  creator?: unknown;
  reviewedBy?: string;
  reviewer?: unknown;
  reviewedAt?: string;
  approvalNotes?: string;
  wordCount: number;
  pageCount?: number;
  filePath?: string;
  pdfPath?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  category: TemplateCategory;
  status?: TemplateStatus;
  content: string;
  variables?: TemplateVariable[];
  clauseReferences?: ClauseReference[];
  tags?: string[];
  jurisdiction?: string;
  practiceArea?: string;
  courtType?: string;
  isPublic?: boolean;
  version?: string;
  parentTemplateId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

export interface GenerateDocumentDto {
  title: string;
  description?: string;
  templateId: string;
  caseId?: string;
  variableValues: Record<string, unknown>;
  includedClauses?: string[];
}

export interface UpdateGeneratedDocumentDto {
  title?: string;
  description?: string;
  status?: GeneratedDocumentStatus;
  content?: string;
  variableValues?: Record<string, unknown>;
  includedClauses?: string[];
  approvalNotes?: string;
}

export interface ClauseValidationResult {
  isValid: boolean;
  conflicts: Array<{
    clauseId1: string;
    clauseId2: string;
    reason: string;
    severity: "error" | "warning";
  }>;
}
