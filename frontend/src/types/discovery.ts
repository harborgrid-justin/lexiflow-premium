// types/discovery.ts
// Domain-specific types - split from compatibility.ts

import {
  BaseEntity, DocumentId, MotionId, CaseId
} from './primitives';
import {
  DiscoveryType, DiscoveryStatus,
  ConferralResult, ConferralMethod
} from './enums';

export interface DiscoveryRequest extends BaseEntity { caseId: CaseId; type: DiscoveryType; propoundingParty: string; respondingParty: string; serviceDate: string; dueDate: string; status: DiscoveryStatus; title: string; description: string; }

export interface Deposition extends BaseEntity { caseId: CaseId; witnessName: string; date: string; location: string; status: string; courtReporter?: string; prepNotes?: string; }

export interface ESISource extends BaseEntity { caseId: CaseId; name: string; type: string; custodian: string; status: string; size?: string; notes?: string; }

export interface CustodianInterview extends BaseEntity { caseId: CaseId; custodianName: string; department: string; status: string; interviewDate?: string; notes?: string; relevantSources?: string[]; legalHoldId?: string; }

export interface Examination extends BaseEntity { caseId: CaseId; examinee: string; type: 'Physical' | 'Mental'; doctorName: string; date: string; status: 'Scheduled' | 'Report Received' | 'Disputed'; goodCause: string; reportDate?: string; }

export interface Vendor extends BaseEntity { name: string; serviceType: 'Court Reporting' | 'Videography' | 'Forensics' | 'Translation'; contactName: string; phone: string; email: string; status: 'Preferred' | 'Active' | 'Blocked'; rating: number; }

export interface Transcript extends BaseEntity { caseId: CaseId; deponent: string; date: string; fileId?: DocumentId; isFinal: boolean; wordCount: number; linkedDepositionId?: string; }

export interface SanctionMotion extends BaseEntity { caseId: CaseId; title: string; relatedRequestId: string; ruleBasis: 'Rule 37(a)' | 'Rule 37(b)' | 'Rule 37(c)'; status: 'Draft' | 'Filed' | 'Granted' | 'Denied'; description: string; filedDate?: string; }

export interface LegalHold extends BaseEntity { custodian: string; dept: string; issued: string; status: string; scope?: string; }

export interface PrivilegeLogEntry extends BaseEntity { date: string; author: string; recipient: string; type: string; basis: string; desc: string; }

export interface Custodian extends BaseEntity {
  caseId: string;
  name: string;
  email?: string;
  department?: string;
  title?: string;
  legalHoldStatus?: 'pending' | 'acknowledged' | 'released';
  dataSources?: string[];
  interviewDate?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Production extends BaseEntity {
  caseId: string;
  productionNumber: string;
  title: string;
  producingParty: string;
  receivingParty: string;
  productionDate?: string;
  documentCount?: number;
  nativeCount?: number;
  imageCount?: number;
  status: 'pending' | 'produced' | 'received' | 'reviewed';
  notes?: string;
  metadata?: Record<string, any>;
}

// Witness is also defined in trial.ts with more details
// This is a simplified discovery-focused version
export interface DiscoveryWitness extends BaseEntity {
  caseId: string;
  name: string;
  witnessType: 'fact' | 'expert' | 'character' | 'impeachment';
  status: 'identified' | 'contacted' | 'interviewed' | 'deposed' | 'unavailable';
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  expectedTestimony?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface DiscoveryProcess extends BaseEntity {
  caseId: string;
  processName: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  startDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  documents?: number;
  custodians?: number;
  productions?: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface DiscoveryAnalytics {
  totalDocuments: number;
  reviewedDocuments: number;
  privilegedDocuments: number;
  productionDocuments: number;
  custodianCount: number;
  activeHolds: number;
  completedDepositions: number;
  pendingRequests: number;
  reviewProgress: number;
  avgReviewRate: number;
}

export interface ConferralSession extends BaseEntity { caseId: CaseId; topic: string; date: string; method: ConferralMethod; participants: string[]; notes: string; result: ConferralResult; nextSteps?: string; linkedMotionId?: MotionId; }
