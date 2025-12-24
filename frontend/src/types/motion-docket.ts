// types/motion-docket.ts
// Domain-specific types - split from compatibility.ts

import {
  BaseEntity, DocumentId, EvidenceId,
  MotionId, DocketId, CaseId, MetadataRecord, JsonValue
} from './primitives';
import {
  MotionType, MotionStatus, MotionOutcome,
  DocketEntryType
} from './enums';

export interface SearchResult { id: string; title: string; url?: string; type?: string; snippet?: string; }

export interface FileChunk { id: string; pageNumber: number; contentPreview: string; hash: string; }

export interface Motion extends BaseEntity { 
  id: MotionId;
  // Core fields (aligned with backend Motion entity)
  caseId: CaseId; // Backend: uuid (required), FK to cases
  title: string; // Backend: varchar(255)
  type: MotionType; // Backend: enum MotionType
  status: MotionStatus; // Backend: enum MotionStatus (DRAFT, FILED, PENDING, GRANTED, DENIED, etc.)
  description: string; // Backend: text, nullable
  
  // Filing information
  filedBy?: string; // Backend: varchar(255)
  filedDate?: string; // Backend: date
  filingDate?: string; // Backend: date (duplicate field in backend)
  
  // Hearing and deadlines
  hearingDate?: string; // Backend: date
  responseDeadline?: string; // Backend: date
  rulingDate?: string; // Backend: date
  decisionDate?: string; // Backend: date (duplicate field in backend)
  
  // Documents and attachments
  documentId?: DocumentId; // Backend: uuid
  supportingDocs?: string[]; // Backend: jsonb
  attachments?: string[]; // Backend: jsonb
  documents?: DocumentId[]; // Frontend legacy
  
  // Decision and outcome
  ruling?: JsonValue; // Backend: jsonb
  decision?: string; // Backend: text
  relief?: string; // Backend: text
  outcome?: MotionOutcome; // Frontend-specific

  // Response
  opposingPartyResponse?: JsonValue; // Backend: jsonb
  
  // Frontend-specific fields
  oppositionDueDate?: string;
  replyDueDate?: string;
  assignedAttorney?: string;
  linkedRules?: string[];
  conferralStatus?: string;
  linkedEvidenceIds?: EvidenceId[];
}

export interface DocketEntryStructuredData {
  actionType: string;
  actionVerb: string;
  documentTitle: string;
  filer: string;
  additionalText: string;
}

export interface DocketEntry extends BaseEntity { 
  id: DocketId;
  // Core fields (aligned with backend DocketEntry entity)
  caseId: CaseId; // Backend: uuid (required), FK to cases
  sequenceNumber: number; // Backend: int
  docketNumber?: string; // Backend: varchar(100)
  
  // Dates
  dateFiled: string; // Backend: date (required)
  entryDate: string; // Backend: date (required)
  date?: string; // Frontend legacy alias for entryDate
  
  // Content
  description: string; // Backend: varchar(255) (required)
  type: DocketEntryType; // Backend: enum DocketEntryType
  text?: string; // Backend: text
  filedBy?: string; // Backend: varchar(255)
  
  // Document information
  documentTitle?: string; // Backend: varchar(255)
  documentUrl?: string; // Backend: varchar(2048)
  documentId?: DocumentId; // Backend: uuid
  
  // PACER integration
  pacerDocketNumber?: string; // Backend: varchar(100)
  pacerDocumentNumber?: string; // Backend: varchar(100)
  pacerLastSyncAt?: string; // Backend: timestamp
  pacerSequenceNumber?: number; // Frontend legacy
  
  // Security flags
  isSealed?: boolean; // Backend: boolean, default false
  isRestricted?: boolean; // Backend: boolean, default false
  
  // Additional data
  notes?: string; // Backend: text
  attachments?: Array<{ // Backend: jsonb
    id: string;
    name: string;
    documentNumber?: string;
  }>;
  metadata?: MetadataRecord; // Backend: jsonb
  
  // Frontend-specific fields
  title?: string; // Alias for description
  structuredData?: DocketEntryStructuredData;
  triggersDeadlines?: Array<{ type: string; date: string; description?: string }>;
  docLink?: string; // Alias for documentUrl
  syncMetadata?: { pacerId: string; lastPolled: string; checksum: string };
}
