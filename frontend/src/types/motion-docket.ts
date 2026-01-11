// types/motion-docket.ts
// Domain-specific types - split from compatibility.ts

import {
  DocketEntryType,
  MotionOutcome,
  MotionStatus,
  MotionType,
} from "./enums";
import {
  BaseEntity,
  CaseId,
  DocketId,
  DocumentId,
  EvidenceId,
  JsonValue,
  MetadataRecord,
  MotionId,
} from "./primitives";

// SearchResult is exported from ./search.ts
export interface FileChunk {
  id: string;
  pageNumber: number;
  contentPreview: string;
  hash: string;
}

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

export interface DocketFilterOptions {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
  caseId?: string;
  startDate?: string;
  endDate?: string;
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
  attachments?: Array<{
    // Backend: jsonb
    id: string;
    name: string;
    documentNumber?: string;
  }>;
  metadata?: MetadataRecord; // Backend: jsonb

  // Frontend-specific fields
  title?: string; // Alias for description
  structuredData?: DocketEntryStructuredData;
  triggersDeadlines?: Array<{
    id: string;
    type: string;
    date: string;
    title: string;
    status: string;
    ruleReference: string;
    description?: string;
  }>;
  docLink?: string; // Alias for documentUrl
  syncMetadata?: { pacerId: string; lastPolled: string; checksum: string };
  appellateData?: AppellateData;
}

export interface AppellateData {
  caseSelection?: {
    caseNumber?: string;
    shortTitle?: string;
    dateFiled?: string;
    dateLastDocketEntry?: string;
    origCaseNumber?: string;
    origCaseLink?: string;
    dateTerminated?: string;
    party?: string;
    attorney?: string;
    natureOfSuit?: string;
    type?: string;
    status?: string;
  };
  caseQuery?: {
    associatedCases?: Array<{
      caseNumber: string;
      shortTitle?: string;
      dateStart?: string;
      dateEnd?: string;
      status?: string;
      associatedType?: string;
      // Full Docket Report fields
      leadCaseNumber?: string;
      memberCaseNumber?: string;
    }>;
    originatingCase?: {
      caseNumber: string;
      caseLink?: string;
      leadCaseNumber?: string;
      leadCaseNumberLink?: string;
      dateFiled?: string;
      dateExecution?: string;
      dateJudgment?: string;
      dateNOAFiled?: string;
      judge?: string;
      courtReporter?: string;
    };
    parties?: Array<{
      name: string;
      type?: string;
      dateTerminated?: string;
      // Full Docket Report fields
      alias?: string;
      partyText?: string;
      prisonerNumber?: string;
      attorneys?: Array<{
        name: string;
        type?: string; // partyType type
        dateRepEnd?: string;
        // Full attorney info from Full Docket Report
        firstName?: string;
        middleName?: string;
        lastName?: string;
        generation?: string;
        suffix?: string;
        title?: string;
        address1?: string;
        address2?: string;
        address3?: string;
        office?: string;
        unit?: string;
        room?: string;
        businessPhone?: string;
        personalPhone?: string;
        city?: string;
        state?: string;
        zip?: string;
        terminationDate?: string;
        noticeInfo?: string;
        fax?: string;
        email?: string;
      }>;
    }>;
  };
  caseSummary?: {
    stub?: {
      caseNumber?: string;
      shortTitle?: string;
      natureOfSuit?: string;
      dateFiled?: string;
      dateTerminated?: string;
      origCourt?: string;
      caseType?: string;
      subType?: string;
      subSubType?: string;
    };
    originatingCourt?: {
      district?: string;
      division?: string;
      caseNumber?: string;
      caseNumberLink?: string;
      leadCaseNumber?: string;
      leadCaseNumberLink?: string;
      dateFiled?: string;
      dateJudgment?: string;
      dateJudgmentEOD?: string;
      dateNOAFiled?: string;
      dateDecided?: string;
      dateRecdCoa?: string;
      dateSentence?: string;
    };
    originatingPerson?: {
      role?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      generation?: string;
      title?: string;
    };
  };
  fullDocket?: {
    priorCases?: Array<{
      caseNumber: string;
      dateFiled?: string;
      dateDisposed?: string;
      disposition?: string;
    }>;
    panel?: {
      panelType?: string;
      enbanc?: boolean;
      panelists?: string;
      dateHearing?: string;
      dateComplete?: string;
      dateDecision?: string;
    };
    caption?: string;
  };
}
