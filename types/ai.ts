// types/ai.ts

import { SearchResult } from './models';

export interface GroundingChunk {
    web?: {
        title: string;
        uri: string;
    }
}

export interface AnalyzedDoc { summary: string; riskScore: number; }
export interface ResearchResponse { text: string; sources: SearchResult[]; }
export interface IntentResult {
    action: 'NAVIGATE' | 'CREATE' | 'SEARCH' | 'ANALYZE' | 'UNKNOWN';
    targetModule?: string; entityId?: string; context?: string; confidence: number;
}
export interface BriefCritique {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    missingAuthority: string[];
}

export interface ShepardizeHistoryItem {
    action: string;
    citingCase: string;
    citingCitation?: string;
}

export type TreatmentType = 'Followed' | 'Criticized' | 'Distinguished' | 'Questioned' | 'Mentioned';

export interface ShepardizeTreatmentItem {
    treatment: TreatmentType;
    citingCase: string;
    citingCitation?: string;
    quote: string;
}

export interface ShepardizeResult {
    caseName: string;
    citation: string;
    summary: string;
    history: ShepardizeHistoryItem[];
    treatment: ShepardizeTreatmentItem[];
}
