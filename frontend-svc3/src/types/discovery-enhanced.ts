/**
 * Enhanced Discovery Types for E-Discovery Management
 * Industry-standard e-discovery workflow types
 */

import { BaseEntity, CaseId, DocumentId } from "./primitives";

// ============================================================================
// Collection Types
// ============================================================================

export interface DataCollection extends BaseEntity {
  caseId: CaseId;
  collectionName: string;
  custodians: string[];
  dataSources: string[];
  dateRange: {
    start: string;
    end: string;
  };
  status: "pending" | "in_progress" | "completed" | "failed" | "paused";
  progress: number; // 0-100
  totalItems: number;
  collectedItems: number;
  estimatedSize: string;
  actualSize?: string;
  collectionMethod: "remote" | "onsite" | "forensic" | "api";
  assignedTo?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  errors?: string[];
}

// ============================================================================
// Processing Types
// ============================================================================

export interface ProcessingJob extends BaseEntity {
  caseId: CaseId;
  jobName: string;
  collectionId: string;
  status: "queued" | "processing" | "completed" | "failed" | "paused";
  priority: "low" | "normal" | "high" | "urgent";
  progress: number; // 0-100
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: number;
  processingSteps: {
    deduplication: "pending" | "completed" | "failed";
    textExtraction: "pending" | "completed" | "failed";
    metadata: "pending" | "completed" | "failed";
    threading: "pending" | "completed" | "failed";
  };
  startedAt?: string;
  completedAt?: string;
  estimatedCompletion?: string;
  errors?: string[];
}

// ============================================================================
// Review Types
// ============================================================================

export interface ReviewDocument extends BaseEntity {
  caseId: CaseId;
  documentId: DocumentId;
  fileName: string;
  fileType: string;
  fileSize: number;
  custodian: string;
  dateCreated: string;
  dateModified: string;
  author?: string;
  recipients?: string[];
  subject?: string;
  content?: string;
  reviewStatus: "not_reviewed" | "in_review" | "reviewed" | "flagged";
  coding: DocumentCoding;
  batesNumber?: string;
  familyId?: string;
  hasAttachments: boolean;
  attachmentCount: number;
  reviewedBy?: string;
  reviewedAt?: string;
  tags?: string[];
  notes?: string;
}

export interface DocumentCoding {
  responsive: "yes" | "no" | "maybe" | "not_coded";
  privileged: "yes" | "no" | "not_coded";
  confidential: "yes" | "no" | "not_coded";
  hotDocument: boolean;
  privilegeType?: "attorney-client" | "work-product" | "both";
  redactionRequired: boolean;
  issues?: string[];
  customFields?: Record<string, string | number | boolean>;
}

import { UserId } from "@/types";

export interface ReviewQueue extends BaseEntity {
  caseId: CaseId;
  queueName: string;
  description: string;
  documentCount: number;
  reviewedCount: number;
  assignedReviewers: string[];
  priority: "low" | "normal" | "high";
  deadline?: string;
  status: "active" | "paused" | "completed";
  filters?: Record<string, unknown>;
  createdBy: UserId;
}

// ============================================================================
// Production Types
// ============================================================================

export interface ProductionSet extends BaseEntity {
  caseId: CaseId;
  productionNumber: string;
  productionName: string;
  producingParty: string;
  receivingParty: string;
  productionType: "initial" | "supplemental" | "rolling";
  documentCount: number;
  nativeCount: number;
  imageCount: number;
  batesRange: {
    start: string;
    end: string;
  };
  productionDate?: string;
  dueDate?: string;
  status: "draft" | "staging" | "qc" | "produced" | "delivered";
  format: "native" | "pdf" | "tiff" | "mixed";
  loadFileType?: "dat" | "opt" | "lfp" | "csv";
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
// Legal Hold Types
// ============================================================================

export interface LegalHoldNotification extends BaseEntity {
  legalHoldId: string;
  custodianId: string;
  custodianName: string;
  custodianEmail: string;
  sentAt: string;
  acknowledgedAt?: string;
  acknowledgmentMethod?: "email" | "portal" | "manual";
  remindersSent: number;
  lastReminderAt?: string;
  status: "pending" | "acknowledged" | "overdue" | "escalated";
  notes?: string;
}

export interface LegalHoldEnhanced extends BaseEntity {
  caseId: CaseId;
  holdName: string;
  matter: string;
  description: string;
  scope: string;
  issuedDate: string;
  releasedDate?: string;
  status: "active" | "released" | "draft";
  custodianCount: number;
  acknowledgedCount: number;
  dataSources: string[];
  notifications: LegalHoldNotification[];
  createdBy: UserId;
  escalationLevel?: "none" | "warning" | "critical";
}

// ============================================================================
// Privilege Log Types
// ============================================================================

export interface PrivilegeLogEntryEnhanced extends BaseEntity {
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
  privilegeType: "attorney-client" | "work-product" | "both" | "other";
  privilegeBasis: string;
  description: string;
  confidentialityLevel?:
    | "confidential"
    | "highly_confidential"
    | "attorneys_eyes_only";
  withholdingParty: string;
  objectionStatus?: "none" | "challenged" | "sustained" | "overruled";
  notes?: string;
}

// ============================================================================
// Timeline Types
// ============================================================================

export interface DiscoveryTimelineEvent extends BaseEntity {
  caseId: CaseId;
  eventType:
    | "deadline"
    | "production"
    | "hold_issued"
    | "hold_released"
    | "collection"
    | "review_started"
    | "review_completed"
    | "motion_filed";
  title: string;
  description: string;
  eventDate: string;
  dueDate?: string;
  status: "upcoming" | "completed" | "overdue" | "cancelled";
  relatedEntityType?: "request" | "production" | "hold" | "collection";
  relatedEntityId?: string;
  assignedTo?: string[];
  priority?: "low" | "normal" | "high" | "critical";
  completedAt?: string;
}

// ============================================================================
// Search Types
// ============================================================================

export interface AdvancedSearchQuery {
  caseId?: CaseId;
  keywords?: string;
  custodians?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  fileTypes?: string[];
  tags?: string[];
  reviewStatus?: ReviewDocument["reviewStatus"][];
  coding?: Partial<DocumentCoding>;
  hasAttachments?: boolean;
  batesRange?: {
    start?: string;
    end?: string;
  };
  searchIn?: ("content" | "subject" | "filename" | "metadata")[];
  sortBy?: "date" | "relevance" | "custodian" | "size";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface DiscoveryStatistics {
  collections: {
    total: number;
    active: number;
    completed: number;
    totalSize: string;
  };
  processing: {
    total: number;
    queued: number;
    processing: number;
    completed: number;
  };
  review: {
    totalDocuments: number;
    reviewed: number;
    notReviewed: number;
    responsive: number;
    privileged: number;
    flagged: number;
    averageReviewRate: number; // docs per hour
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
