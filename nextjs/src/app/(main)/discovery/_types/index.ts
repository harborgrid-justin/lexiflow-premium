/**
 * Discovery Module Types
 * Comprehensive type definitions for e-Discovery management
 *
 * @module discovery/_types
 */

import type { BaseEntity, CaseId, DocumentId, UserId } from '@/types/primitives';

// ============================================================================
// Enums & Constants
// ============================================================================

export const DiscoveryRequestType = {
  INTERROGATORIES: 'interrogatories',
  PRODUCTION: 'production',
  ADMISSION: 'admission',
  DEPOSITION: 'deposition',
  SUBPOENA: 'subpoena',
} as const;

export type DiscoveryRequestTypeValue = typeof DiscoveryRequestType[keyof typeof DiscoveryRequestType];

export const DiscoveryRequestStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  SERVED: 'served',
  RESPONDED: 'responded',
  OBJECTED: 'objected',
  OVERDUE: 'overdue',
  CLOSED: 'closed',
  MOTION_FILED: 'motion_filed',
} as const;

export type DiscoveryRequestStatusValue = typeof DiscoveryRequestStatus[keyof typeof DiscoveryRequestStatus];

export const ReviewStatus = {
  NOT_REVIEWED: 'not_reviewed',
  IN_REVIEW: 'in_review',
  REVIEWED: 'reviewed',
  FLAGGED: 'flagged',
} as const;

export type ReviewStatusValue = typeof ReviewStatus[keyof typeof ReviewStatus];

export const DocumentCodingResponsive = {
  YES: 'yes',
  NO: 'no',
  MAYBE: 'maybe',
  NOT_CODED: 'not_coded',
} as const;

export type DocumentCodingResponsiveValue = typeof DocumentCodingResponsive[keyof typeof DocumentCodingResponsive];

export const DocumentCodingPrivileged = {
  YES: 'yes',
  NO: 'no',
  PARTIAL: 'partial',
  NOT_CODED: 'not_coded',
} as const;

export type DocumentCodingPrivilegedValue = typeof DocumentCodingPrivileged[keyof typeof DocumentCodingPrivileged];

export const PrivilegeType = {
  NONE: 'none',
  ATTORNEY_CLIENT: 'attorney-client',
  WORK_PRODUCT: 'work-product',
  BOTH: 'both',
} as const;

export type PrivilegeTypeValue = typeof PrivilegeType[keyof typeof PrivilegeType];

export const ProductionStatus = {
  DRAFT: 'draft',
  STAGING: 'staging',
  QC: 'qc',
  PRODUCED: 'produced',
  DELIVERED: 'delivered',
} as const;

export type ProductionStatusValue = typeof ProductionStatus[keyof typeof ProductionStatus];

export const CollectionStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
} as const;

export type CollectionStatusValue = typeof CollectionStatus[keyof typeof CollectionStatus];

export const LegalHoldStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  RELEASED: 'released',
} as const;

export type LegalHoldStatusValue = typeof LegalHoldStatus[keyof typeof LegalHoldStatus];

export const CustodianHoldStatus = {
  PENDING: 'pending',
  ACKNOWLEDGED: 'acknowledged',
  RELEASED: 'released',
} as const;

export type CustodianHoldStatusValue = typeof CustodianHoldStatus[keyof typeof CustodianHoldStatus];

// ============================================================================
// Core Discovery Types
// ============================================================================

/**
 * Discovery Request - Main discovery request entity
 */
export interface DiscoveryRequest extends BaseEntity {
  caseId: CaseId;
  matterId?: string;
  title: string;
  description?: string;
  requestType: DiscoveryRequestTypeValue;
  requestNumber?: string;
  propoundingParty: string;
  respondingParty: string;
  status: DiscoveryRequestStatusValue;
  serviceDate?: string;
  dueDate: string;
  responseDate?: string;
  responseNotes?: string;
  assignedTo?: UserId;
  documentCount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Custodian - Data custodian in discovery
 */
export interface Custodian extends BaseEntity {
  caseId: CaseId;
  name: string;
  email: string;
  department?: string;
  title?: string;
  legalHoldStatus: CustodianHoldStatusValue;
  legalHoldId?: string;
  acknowledgmentDate?: string;
  dataSources?: string[];
  interviewDate?: string;
  interviewNotes?: string;
  estimatedDataVolume?: string;
  notes?: string;
}

/**
 * Legal Hold - Preservation hold
 */
export interface LegalHold extends BaseEntity {
  caseId: CaseId;
  holdName: string;
  matter: string;
  description: string;
  scope: string;
  issuedDate: string;
  releasedDate?: string;
  status: LegalHoldStatusValue;
  custodianIds: string[];
  custodianCount: number;
  acknowledgedCount: number;
  dataSources: string[];
  createdBy: UserId;
  escalationLevel?: 'none' | 'warning' | 'critical';
}

/**
 * Data Collection - ESI Collection job
 */
export interface DataCollection extends BaseEntity {
  caseId: CaseId;
  collectionName: string;
  custodianIds: string[];
  dataSources: string[];
  dateRange: {
    start: string;
    end: string;
  };
  status: CollectionStatusValue;
  progress: number;
  totalItems: number;
  collectedItems: number;
  estimatedSize: string;
  actualSize?: string;
  collectionMethod: 'remote' | 'onsite' | 'forensic' | 'api';
  assignedTo?: UserId;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  errors?: string[];
}

// ============================================================================
// Document Review Types
// ============================================================================

/**
 * Document Coding - Review coding for a document
 */
export interface DocumentCoding {
  responsive: DocumentCodingResponsiveValue;
  privileged: DocumentCodingPrivilegedValue;
  confidential: 'yes' | 'no' | 'not_coded';
  confidentiality?: 'public' | 'confidential' | 'highly_confidential' | 'not_coded';
  hotDocument: boolean;
  privilegeType?: PrivilegeTypeValue;
  redactionRequired: boolean;
  issues?: string[];
  issueCode?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
}

/**
 * Review Document - Document in review queue
 */
export interface ReviewDocument extends BaseEntity {
  caseId: CaseId;
  discoveryRequestId?: string;
  documentId: DocumentId;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath?: string;
  custodian: string;
  dateCreated: string;
  dateModified: string;
  author?: string;
  recipients?: string[];
  subject?: string;
  contentPreview?: string;
  extractedText?: string;
  pageCount?: number;
  reviewStatus: ReviewStatusValue;
  coding: DocumentCoding;
  batesNumber?: string;
  familyId?: string;
  hasAttachments: boolean;
  attachmentCount: number;
  reviewedBy?: UserId;
  reviewedAt?: string;
  tags?: string[];
  notes?: string;
}

/**
 * Review Queue - Batch of documents for review
 */
export interface ReviewQueue extends BaseEntity {
  caseId: CaseId;
  queueName: string;
  description?: string;
  documentCount: number;
  reviewedCount: number;
  assignedReviewers: UserId[];
  priority: 'low' | 'normal' | 'high';
  deadline?: string;
  status: 'active' | 'paused' | 'completed';
  filters?: ReviewQueueFilters;
  createdBy: UserId;
}

export interface ReviewQueueFilters {
  custodians?: string[];
  dateRange?: { start?: string; end?: string };
  fileTypes?: string[];
  keywords?: string[];
}

// ============================================================================
// Production Types
// ============================================================================

/**
 * Production Set - Document production
 */
export interface ProductionSet extends BaseEntity {
  caseId: CaseId;
  discoveryRequestId?: string;
  productionNumber: string;
  productionName: string;
  producingParty: string;
  receivingParty: string;
  productionType: 'initial' | 'supplemental' | 'rolling';
  documentCount: number;
  nativeCount: number;
  imageCount: number;
  batesRange: {
    start: string;
    end: string;
  };
  productionDate?: string;
  dueDate?: string;
  status: ProductionStatusValue;
  format: 'native' | 'pdf' | 'tiff' | 'mixed';
  loadFileType?: 'dat' | 'opt' | 'lfp' | 'csv';
  includeMetadata: boolean;
  includeText: boolean;
  confidentialityDesignation?: string;
  statistics?: ProductionStatistics;
  notes?: string;
}

export interface ProductionStatistics {
  totalPages: number;
  totalSize: string;
  fileTypes: Record<string, number>;
  custodianBreakdown: Record<string, number>;
  dateRange: {
    earliest: string;
    latest: string;
  };
  privilegedCount: number;
  redactedCount: number;
}

// ============================================================================
// Privilege Log Types
// ============================================================================

/**
 * Privilege Log Entry - Withheld document
 */
export interface PrivilegeLogEntry extends BaseEntity {
  caseId: CaseId;
  documentId?: DocumentId;
  batesNumber?: string;
  documentDate: string;
  author: string;
  authorRole?: string;
  recipients: string[];
  recipientRoles?: string[];
  ccRecipients?: string[];
  subject?: string;
  documentType: string;
  privilegeType: PrivilegeTypeValue;
  privilegeBasis: string;
  description: string;
  confidentialityLevel?: 'confidential' | 'highly_confidential' | 'attorneys_eyes_only';
  withholdingParty: string;
  objectionStatus?: 'none' | 'challenged' | 'sustained' | 'overruled';
  notes?: string;
}

// ============================================================================
// Statistics & Analytics Types
// ============================================================================

/**
 * Discovery Statistics - Dashboard metrics
 */
export interface DiscoveryStatistics {
  requests: {
    total: number;
    pending: number;
    served: number;
    responded: number;
    overdue: number;
  };
  collections: {
    total: number;
    active: number;
    completed: number;
    totalSize: string;
  };
  review: {
    totalDocuments: number;
    reviewed: number;
    notReviewed: number;
    responsive: number;
    privileged: number;
    flagged: number;
    averageReviewRate: number;
  };
  productions: {
    total: number;
    produced: number;
    staging: number;
    totalDocuments: number;
    totalSize: string;
  };
  legalHolds: {
    active: number;
    released: number;
    totalCustodians: number;
    pendingAcknowledgments: number;
  };
}

// ============================================================================
// Form & Action Types
// ============================================================================

/**
 * Create Discovery Request Form Data
 */
export interface CreateDiscoveryRequestInput {
  caseId: string;
  title: string;
  description?: string;
  requestType: DiscoveryRequestTypeValue;
  propoundingParty: string;
  respondingParty: string;
  dueDate: string;
  assignedTo?: string;
}

/**
 * Update Discovery Request Form Data
 */
export interface UpdateDiscoveryRequestInput {
  title?: string;
  description?: string;
  status?: DiscoveryRequestStatusValue;
  dueDate?: string;
  responseDate?: string;
  responseNotes?: string;
  assignedTo?: string;
}

/**
 * Create Custodian Form Data
 */
export interface CreateCustodianInput {
  caseId: string;
  name: string;
  email: string;
  department?: string;
  title?: string;
  dataSources?: string[];
  notes?: string;
}

/**
 * Create Legal Hold Form Data
 */
export interface CreateLegalHoldInput {
  caseId: string;
  holdName: string;
  matter: string;
  description: string;
  scope: string;
  custodianIds: string[];
  dataSources: string[];
}

/**
 * Create Production Set Form Data
 */
export interface CreateProductionSetInput {
  caseId: string;
  discoveryRequestId?: string;
  productionName: string;
  producingParty: string;
  receivingParty: string;
  productionType: 'initial' | 'supplemental' | 'rolling';
  dueDate?: string;
  format: 'native' | 'pdf' | 'tiff' | 'mixed';
  includeMetadata: boolean;
  includeText: boolean;
  confidentialityDesignation?: string;
}

/**
 * Bulk Document Action Input
 */
export interface BulkDocumentActionInput {
  documentIds: string[];
  action: 'code_responsive' | 'code_privileged' | 'code_confidential' | 'add_tag' | 'remove_tag' | 'assign_reviewer';
  value?: string | boolean;
}

/**
 * Search Documents Input
 */
export interface SearchDocumentsInput {
  caseId?: string;
  discoveryRequestId?: string;
  keywords?: string;
  custodians?: string[];
  dateRange?: { start?: string; end?: string };
  fileTypes?: string[];
  reviewStatus?: ReviewStatusValue[];
  responsive?: DocumentCodingResponsiveValue;
  privileged?: 'yes' | 'no' | 'not_coded';
  hasAttachments?: boolean;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Server Action Response Types
// ============================================================================

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
