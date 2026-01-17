// types/pleadings.ts
// Domain-specific types - split from compatibility.ts

import {
  type BaseEntity, type DocumentId, type CaseId, type MetadataRecord
} from './primitives';


export interface Pleading extends Omit<BaseEntity, 'createdBy' | 'updatedBy'> {
  // Core fields (aligned with backend Pleading entity)
  title: string; // Backend: varchar (required)
  description?: string; // Backend: text, nullable
  type: 'complaint' | 'answer' | 'motion' | 'brief' | 'memorandum' | 'reply' | 'opposition' | 'petition' | 'response'; // Backend: enum PleadingType
  caseId: CaseId; // Backend: uuid (required), FK to cases
  documentId?: DocumentId; // Backend: uuid
  status: 'draft' | 'review' | 'approved' | 'filed' | 'rejected' | 'withdrawn'; // Backend: enum PleadingStatus
  filedDate?: string; // Backend: timestamp
  filedBy?: string; // Backend: varchar
  courtName?: string; // Backend: varchar
  caseNumber?: string; // Backend: varchar
  docketNumber?: string; // Backend: varchar
  hearingDate?: string; // Backend: timestamp
  judge?: string; // Backend: varchar
  parties?: string[]; // Backend: simple-array
  summary?: string; // Backend: text
  customFields?: MetadataRecord; // Backend: jsonb
  tags?: string[]; // Backend: simple-array
  createdBy?: string; // Backend: uuid - overrides BaseEntity.createdBy
  updatedBy?: string; // Backend: uuid - overrides BaseEntity.updatedBy
}

export interface Clause extends Omit<BaseEntity, 'createdBy' | 'updatedBy'> {
  // Core fields (aligned with backend Clause entity)
  title: string; // Backend: varchar (required)
  name?: string; // Frontend legacy alias
  content: string; // Backend: text (required)
  description?: string; // Backend: text, nullable
  category: 'general' | 'contract' | 'motion' | 'pleading' | 'discovery' | 'custom' | string; // Backend: enum ClauseCategory
  tags?: string[]; // Backend: simple-array
  variables?: MetadataRecord; // Backend: jsonb
  isActive?: boolean; // Backend: boolean, default true
  usageCount: number; // Backend: int, default 0
  lastUsedAt?: string; // Backend: timestamp
  createdBy?: string; // Backend: uuid - overrides BaseEntity.createdBy
  updatedBy?: string; // Backend: uuid - overrides BaseEntity.updatedBy
  metadata?: MetadataRecord; // Backend field
  // Frontend legacy fields
  version?: number;
  lastUpdated?: string;
  riskRating?: string;
  versions?: ClauseVersion[];
  embedding?: number[];
}

export interface ClauseVersion {
  id?: string;
  version: number;
  content: string;
  author: string;
  updatedAt: string;
  createdAt?: string;
}

export interface PlanSection { id: string; title: string; content: string; status: 'Agreed' | 'Disputed'; opposingComments?: string; }

export interface JointPlan extends BaseEntity { caseId: CaseId; title: string; lastUpdated: string; status: string; sections: PlanSection[]; }

export interface StipulationRequest extends BaseEntity { title: string; requestingParty: string; proposedDate: string; status: string; reason: string; caseId?: CaseId; }
