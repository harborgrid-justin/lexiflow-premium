// types/documents.ts
// Auto-generated from models.ts split

import {
  BaseEntity, UserId, GroupId, DocumentId, CaseId, MetadataRecord, JsonValue
} from './primitives';
import { OcrStatus, PermissionLevel } from './enums';
import { Case } from './case';
import { User } from './system';


/**
 * Signing status type for e-signature workflows
 */
export type SigningStatus = 'Sent' | 'Viewed' | 'Signed';

/**
 * Legal document entity
 * @see Backend: documents/entities/document.entity.ts
 * 
 * Represents legal documents with versioning, OCR, and access control.
 * Supports rich content, metadata, and AI features like summarization.
 * 
 * @property id - Unique document identifier
 * @property type - Document classification (Contract, Pleading, Evidence, etc.)
 * @property caseId - Associated case (required, indexed for performance)
 * @property versions - Immutable version history
 * @property ocrStatus - OCR processing state
 * @property embedding - AI vector representation for semantic search
 */
export type LegalDocument = BaseEntity & { 
  readonly id: DocumentId;
  // Core fields (aligned with backend)
  readonly title: string;
  readonly description?: string; // Backend: text, nullable
  readonly type: string; // Backend: DocumentType enum
  readonly caseId: CaseId; // Backend: uuid, indexed
  readonly case?: Case; // Relation
  readonly creatorId?: UserId; // Backend: uuid (maps to authorId)
  readonly creator?: User; // Relation
  readonly authorId?: UserId; // Frontend legacy
  readonly status?: string; // Backend: DocumentStatus enum (default: DRAFT)
  
  // File metadata
  readonly filename?: string; // Backend field
  readonly filePath?: string; // Backend field
  readonly mimeType?: string; // Backend field
  readonly fileSize?: string | number; // Backend: bigint
  readonly checksum?: string; // Backend field
  
  // Versioning
  readonly currentVersion?: number; // Backend: int (default: 1)
  readonly versions: readonly DocumentVersion[];
  
  // Content
  readonly content: string; // Frontend-specific rich content
  readonly fullTextContent?: string; // Backend: text field for search
  readonly searchableText?: string; // Frontend legacy
  readonly author?: string; // Backend: varchar field
  readonly pageCount?: number; // Backend: int
  readonly wordCount?: number; // Backend: int
  readonly language?: string; // Backend field
  
  // OCR
  readonly ocrStatus?: OcrStatus;
  readonly ocrProcessed?: boolean; // Backend: boolean (default: false)
  readonly ocrProcessedAt?: string; // Backend: timestamp
  
  // Organization
  readonly tags: readonly string[]; // Backend: simple-array
  readonly customFields?: MetadataRecord; // Backend: jsonb
  readonly folderId?: string;
  readonly sourceModule?: string;
  
  // Security & access
  readonly acls?: readonly AccessControlList[];
  readonly sharedWith?: readonly string[];
  readonly isRedacted?: boolean;
  readonly retentionPolicyId?: string;
  
  // AI/ML features
  readonly embedding?: readonly number[];
  readonly summary?: string;
  readonly riskScore?: number;
  readonly linkedRules?: readonly string[];
  
  // E-signature
  readonly signingStatus?: readonly { 
    readonly recipient: string; 
    readonly status: SigningStatus; 
    readonly signedAt?: string 
  }[];
  readonly formFields?: ReadonlyArray<{ 
    readonly name: string; 
    readonly type: string; 
    readonly value: JsonValue 
  }>;
  
  // Dates (backend compatibility)
  readonly uploadDate: string; // Maps to createdAt
  readonly lastModified: string; // Maps to updatedAt
};
/**
 * Document version entity
 * Immutable snapshot of document at a point in time
 */
export type DocumentVersion = BaseEntity & { 
  readonly documentId?: DocumentId; 
  readonly versionNumber: number; 
  readonly uploadedBy: string; 
  readonly uploadDate: string; 
  readonly contentSnapshot?: string; 
  readonly storageKey?: string; 
  readonly author?: string; 
  readonly authorId?: UserId; 
  readonly checksum?: string; 
};

/**
 * Permission level for document access control (legacy)
 * See data-quality.ts for full PermissionLevel type
 */
export type DocumentPermissionLevel = 'Read' | 'Write' | 'None';

/**
 * Access control list entry
 * Defines role or user-based document permissions
 */
export type AccessControlList = { 
  readonly roleId?: GroupId; 
  readonly userId?: UserId; 
  readonly permission: PermissionLevel; 
};

/**
 * Review batch status discriminated union
 */
export type ReviewBatchStatus = 'Pending' | 'In Progress' | 'Completed';

/**
 * Review batch entity
 * Groups documents for assigned review workflows
 */
export type ReviewBatch = BaseEntity & { 
  readonly name: string; 
  readonly caseId: CaseId; 
  readonly assigneeId: UserId; 
  readonly documentIds: readonly DocumentId[]; 
  readonly status: ReviewBatchStatus; 
  readonly dueDate?: string; 
};

/**
 * Redaction log entry
 * Audit trail for document redactions
 */
export type RedactionLog = BaseEntity & { 
  readonly documentId: DocumentId; 
  readonly page: number; 
  readonly x: number; 
  readonly y: number; 
  readonly width: number; 
  readonly height: number; 
  readonly reason: string; 
  readonly appliedBy: UserId; 
};

/**
 * Production format type
 */
export type ProductionFormat = 'PDF' | 'Native' | 'TIFF';

/**
 * Production volume entity
 * Represents batched document productions with Bates numbering
 */
export type ProductionVolume = BaseEntity & { 
  readonly caseId: CaseId; 
  readonly name: string; 
  readonly batesStart: string; 
  readonly batesEnd: string; 
  readonly format: ProductionFormat; 
  readonly documentCount: number; 
  readonly producedDate: string; 
};

/**
 * Processing job type discriminated union
 */
export type ProcessingJobType = 'OCR' | 'Extraction' | 'Ingest';

/**
 * Processing job status discriminated union
 */
export type ProcessingJobStatus = 'Queued' | 'Processing' | 'Completed' | 'Failed';

/**
 * Processing job entity
 * Tracks background document processing tasks
 */
export type ProcessingJob = BaseEntity & { 
  readonly type: ProcessingJobType; 
  readonly status: ProcessingJobStatus; 
  readonly progress: number; 
};

