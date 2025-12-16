// types/documents.ts
// Auto-generated from models.ts split

import {
  BaseEntity, UserId, OrgId, GroupId, DocumentId, EvidenceId,
  TaskId, EntityId, PartyId, MotionId, DocketId, ProjectId, 
  WorkflowTemplateId, CaseId, Money, JurisdictionObject
} from './primitives';
import {
  CaseStatus, UserRole, MatterType, BillingModel,
  OrganizationType, RiskCategory, RiskLevel, RiskStatus,
  CommunicationType, CommunicationDirection, ServiceStatus,
  ExhibitStatus, ExhibitParty, MotionType, MotionStatus, MotionOutcome,
  DocketEntryType, DiscoveryType, DiscoveryStatus,
  EvidenceType, AdmissibilityStatus, ConferralResult,
  ConferralMethod, NavCategory, TaskStatus, StageStatus, LegalRuleType, 
  ServiceMethod, EntityType, EntityRole, CurrencyCode, LedesActivityCode, 
  OcrStatus, TaskDependencyType
} from './enums';
import { LucideIcon } from 'lucide-react';
import type { FC, LazyExoticComponent } from 'react';

// --- CLUSTER 4: DOCUMENTS & DISCOVERY ---
export interface LegalDocument extends BaseEntity { 
  id: DocumentId;
  // Core fields (aligned with backend)
  title: string;
  description?: string; // Backend: text, nullable
  type: string; // Backend: DocumentType enum
  caseId: CaseId; // Backend: uuid, indexed
  creatorId?: UserId; // Backend: uuid (maps to authorId)
  authorId?: UserId; // Frontend legacy
  status?: string; // Backend: DocumentStatus enum (default: DRAFT)
  
  // File metadata
  filename?: string; // Backend field
  filePath?: string; // Backend field
  mimeType?: string; // Backend field
  fileSize?: string | number; // Backend: bigint
  checksum?: string; // Backend field
  
  // Versioning
  currentVersion?: number; // Backend: int (default: 1)
  versions: DocumentVersion[];
  
  // Content
  content: string; // Frontend-specific rich content
  fullTextContent?: string; // Backend: text field for search
  searchableText?: string; // Frontend legacy
  author?: string; // Backend: varchar field
  pageCount?: number; // Backend: int
  wordCount?: number; // Backend: int
  language?: string; // Backend field
  
  // OCR
  ocrStatus?: OcrStatus;
  ocrProcessed?: boolean; // Backend: boolean (default: false)
  ocrProcessedAt?: string; // Backend: timestamp
  
  // Organization
  tags: string[]; // Backend: simple-array
  customFields?: Record<string, any>; // Backend: jsonb
  folderId?: string;
  sourceModule?: string;
  
  // Security & access
  acls?: AccessControlList[];
  sharedWith?: string[];
  isRedacted?: boolean;
  retentionPolicyId?: string;
  
  // AI/ML features
  embedding?: number[];
  summary?: string;
  riskScore?: number;
  linkedRules?: string[];
  
  // E-signature
  signingStatus?: { recipient: string; status: 'Sent' | 'Viewed' | 'Signed'; signedAt?: string }[];
  formFields?: any[];
  
  // Dates (backend compatibility)
  uploadDate: string; // Maps to createdAt
  lastModified: string; // Maps to updatedAt
}
export interface DocumentVersion extends BaseEntity { documentId?: DocumentId; versionNumber: number; uploadedBy: string; uploadDate: string; contentSnapshot?: string; storageKey?: string; author?: string; authorId?: UserId; checksum?: string; }
export interface AccessControlList { roleId?: GroupId; userId?: UserId; permission: 'Read' | 'Write' | 'None'; }
export interface ReviewBatch extends BaseEntity { name: string; caseId: CaseId; assigneeId: UserId; documentIds: DocumentId[]; status: 'Pending' | 'In Progress' | 'Completed'; dueDate?: string; }
export interface RedactionLog extends BaseEntity { documentId: DocumentId; page: number; x: number; y: number; width: number; height: number; reason: string; appliedBy: UserId; }
export interface ProductionVolume extends BaseEntity { caseId: CaseId; name: string; batesStart: string; batesEnd: string; format: 'PDF' | 'Native' | 'TIFF'; documentCount: number; producedDate: string; }
export interface ProcessingJob extends BaseEntity { type: 'OCR' | 'Extraction' | 'Ingest'; status: 'Queued' | 'Processing' | 'Completed' | 'Failed'; progress: number; }

