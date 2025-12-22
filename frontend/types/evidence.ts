// types/evidence.ts
// Domain-specific types - split from compatibility.ts

import {
  BaseEntity, DocumentId, EvidenceId, CaseId, UUID, MetadataRecord
} from './primitives';
import { EvidenceType, AdmissibilityStatus } from './enums';
import type { FileChunk } from './motion-docket';

export interface TrialExhibit extends BaseEntity { 
  // Core fields (aligned with backend Exhibit entity)
  exhibitNumber: string; // Backend: varchar unique (required)
  description: string; // Backend: varchar (required)
  type: 'Document' | 'Photo' | 'Video' | 'Audio' | 'Physical' | 'Demonstrative' | 'Expert Report' | 'Other'; // Backend: enum ExhibitType
  status: 'Draft' | 'Marked' | 'Offered' | 'Admitted' | 'Excluded' | 'Withdrawn'; // Backend: enum ExhibitStatus
  caseId: CaseId; // Backend: uuid (required)
  documentId?: DocumentId; // Backend: uuid
  source?: string; // Backend: varchar
  tags?: string[]; // Backend: simple-array
  custodian?: string; // Backend: varchar
  admissionDate?: string; // Backend: timestamp
  admittedBy?: string; // Backend: varchar
  
  // Court proceedings & rulings
  exhibitLabel?: string; // e.g., "Plaintiff's Exhibit A"
  party?: 'Plaintiff' | 'Defense' | 'Joint' | 'Court';
  dateIntroduced?: string;
  dateAdmitted?: string;
  judgeRuling?: string;
  
  // Objections & challenges
  objections?: Array<{
    party: string;
    grounds: string;
    date: string;
    ruling?: 'Sustained' | 'Overruled' | 'Pending';
  }>;
  opposingObjections?: string[];
  foundationEstablished?: boolean;
  authenticity?: 'Verified' | 'Challenged' | 'Stipulated';
  
  // Relationships
  linkedEvidenceIds?: EvidenceId[];
  linkedWitnessIds?: string[];
  relatedExhibits?: string[];
  url?: string;
  thumbnailUrl?: string;
  
  // Trial presentation
  orderPresented?: number;
  presentedBy?: string;
  presentationNotes?: string;
  examQuestions?: string[];
  keyPages?: Array<{ page: number; note: string }>;
  
  // Metadata
  fileSize?: number;
  pageCount?: number;
  metadata?: MetadataRecord;
  
  // Frontend-specific (legacy)
  title?: string; // Alias for description
  dateMarked?: string;
  fileType?: string;
  witness?: string;
  uploadedBy?: string;
  admissibilityHistory?: { date: string; status: string; ruling?: string }[];
}

export interface ChainOfCustodyEvent {
  id: string;
  date: string;
  action: string;
  actor: string;
  notes?: string;
  hash?: string;
}

export interface EvidenceItem extends BaseEntity { id: EvidenceId; caseId: CaseId; title: string; type: EvidenceType; description: string; collectionDate: string; collectedBy: string; custodian: string; location: string; admissibility: AdmissibilityStatus; tags: string[]; blockchainHash?: string; trackingUuid: UUID; chainOfCustody: ChainOfCustodyEvent[]; chunks?: FileChunk[]; fileSize?: string; fileType?: string; linkedRules?: string[]; status?: string; authenticationMethod?: 'Self-Authenticated' | 'Stipulation' | 'Testimony' | 'Pending'; hearsayStatus?: 'Not Hearsay' | 'Exception Applies' | 'Objectionable' | 'Unanalyzed'; isOriginal?: boolean; relevanceScore?: number; expertId?: string; }
