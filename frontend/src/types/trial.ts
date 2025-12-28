// types/trial.ts
// Auto-generated from models.ts split

import {
  BaseEntity, CaseId, EvidenceId, MetadataRecord
} from './primitives';

// --- CLUSTER 5: TRIAL & STRATEGY ---

// JurorStatus enum is in enums.ts - using string literal for backward compat
export type JurorStatusLegacy = 'Panel' | 'Seated' | 'Struck' | 'Alternate' | 'Dismissed';

/**
 * Party that struck a juror
 */
export type StrikeParty = 'Plaintiff' | 'Defense';

/**
 * Juror demographics value object
 */
export type JurorDemographics = {
  readonly age?: number;
  readonly gender?: string;
  readonly occupation?: string;
  readonly education?: string;
  readonly maritalStatus?: string;
  readonly zipCode?: string;
};

/**
 * Juror entity
 * Represents potential or seated jurors with demographics and evaluation
 * 
 * @property jurorNumber - Court-assigned identifier
 * @property status - Current state in jury selection process
 * @property rating - Subjective evaluation score (1-10)
 * @property biasIndicators - Red flags from voir dire
 */
export type Juror = BaseEntity & { 
  readonly caseId: CaseId; 
  readonly jurorNumber?: string;
  readonly name: string; 
  readonly status: JurorStatus; 
  readonly strikeParty?: StrikeParty; 
  readonly strikeReason?: string;
  readonly peremptoryStrike?: boolean;
  readonly causeStrike?: string;
  readonly notes?: string; 
  readonly demographics?: JurorDemographics;
  readonly questionnaire?: MetadataRecord;
  readonly biasIndicators?: readonly string[];
  readonly rating?: number; // 1-10 scale
  readonly seatedDate?: string;
  readonly struckDate?: string;
};

// WitnessType enum is in enums.ts - using string literal for backward compat
export type WitnessTypeLegacy = 
  | 'fact_witness' 
  | 'expert_witness' 
  | 'character_witness' 
  | 'rebuttal_witness' 
  | 'impeachment_witness';

// WitnessStatus enum is in enums.ts - using string literal for backward compat
export type WitnessStatusLegacy = 
  | 'identified' 
  | 'contacted' 
  | 'interviewed' 
  | 'subpoenaed' 
  | 'deposed' 
  | 'testifying' 
  | 'testified' 
  | 'unavailable' 
  | 'withdrawn';

/**
 * Daubert challenge risk level for expert witnesses
 */
export type DauberChallengeRisk = 'Low' | 'Medium' | 'High';

/**
 * Witness entity
 * Represents fact and expert witnesses with preparation tracking
 * 
 * @property witnessType - Classification of witness role
 * @property status - Current state in witness management workflow
 * @property credibilityScore - Evaluation of witness reliability (0-100)
 * @property impeachmentRisks - Known vulnerabilities in testimony
 * @property dauberChallengeRisk - Expert-specific admissibility risk
 */
export type Witness = BaseEntity & { 
  readonly caseId: CaseId; 
  readonly name: string; 
  readonly witnessType: WitnessType;
  readonly status: WitnessStatus;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: string;
  readonly organization?: string;
  readonly title?: string;
  readonly expertise?: string;
  readonly credibilityScore?: number; 
  readonly impeachmentRisks?: readonly string[]; 
  readonly prepStatus?: number; 
  readonly linkedExhibits?: readonly string[];
  readonly notes?: string;
  readonly contactedAt?: string;
  readonly interviewedAt?: string;
  readonly subpoenaedAt?: string;
  readonly deposedAt?: string;
  readonly testifiedAt?: string;
  readonly metadata?: MetadataRecord;
  // Expert witness specific
  readonly cvUrl?: string;
  readonly hourlyRate?: number;
  readonly retainerAmount?: number;
  readonly opinions?: readonly string[];
  readonly reportsSubmitted?: readonly string[];
  readonly dauberChallengeRisk?: DauberChallengeRisk;
};
/**
 * Deposition designation entity
 * Marks specific testimony ranges for trial use
 */
export type DepositionDesignation = { 
  readonly id: string; 
  readonly depositionId: string; 
  readonly pageStart: number; 
  readonly lineStart: number; 
  readonly pageEnd: number; 
  readonly lineEnd: number; 
  readonly party: string; 
  readonly objection?: string; 
  readonly ruling?: string; 
};

/**
 * Opening statement section structure
 */
export type OpeningStatementSection = {
  readonly title: string;
  readonly durationMinutes: number;
  readonly linkedExhibitIds: readonly string[];
};

/**
 * Opening statement entity
 * Structured trial opening with time allocation and exhibit references
 */
export type OpeningStatement = BaseEntity & { 
  readonly caseId: CaseId; 
  readonly sections: readonly OpeningStatementSection[]; 
};

/**
 * Fact type discriminated union
 */
export type FactType = 'Undisputed' | 'Disputed' | 'Stipulated';

/**
 * Fact entity
 * Individual facts with evidentiary support and dispute status
 */
export type Fact = BaseEntity & { 
  readonly caseId: CaseId; 
  readonly date: string; 
  readonly description: string; 
  readonly type: FactType; 
  readonly supportingEvidenceIds: readonly EvidenceId[]; 
};

/**
 * Standing order entity
 * Judge-specific procedural rules and preferences
 */
export type StandingOrder = BaseEntity & { 
  readonly judgeId: string; 
  readonly judgeName: string; 
  readonly title: string; 
  readonly updated: string; 
  readonly url: string; 
};

// War Room - Strategic Planning (backend: war-room module)

/**
 * Expert witness specialization areas
 * @see Backend: war-room/dto/create-expert.dto.ts
 */
export enum ExpertType {
  TECHNICAL = 'Technical',
  MEDICAL = 'Medical',
  FINANCIAL = 'Financial',
  FORENSIC = 'Forensic',
  INDUSTRY = 'Industry',
  OTHER = 'Other'
}

/**
 * Advisor entity
 * @see Backend: war-room/entities/advisor.entity.ts
 * 
 * External consultants and subject matter experts
 */
export type Advisor = BaseEntity & {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly firm?: string;
  readonly specialty?: string;
  readonly caseId?: string;
  readonly isActive: boolean;
};

/**
 * Expert witness entity
 * @see Backend: war-room/entities/expert.entity.ts
 * 
 * Retained expert witnesses with credentials and billing
 */
export type Expert = BaseEntity & {
  readonly name: string;
  readonly expertType: ExpertType;
  readonly email: string;
  readonly phone?: string;
  readonly hourlyRate?: number;
  readonly credentials?: string;
  readonly caseId?: string;
  readonly isActive: boolean;
};

/**
 * Case strategy entity
 * @see Backend: war-room/entities/case-strategy.entity.ts
 * 
 * High-level litigation strategy and approach documentation
 */
export type CaseStrategy = BaseEntity & {
  readonly caseId: string;
  readonly objective?: string;
  readonly approach?: string;
  readonly keyArguments?: string;
};

