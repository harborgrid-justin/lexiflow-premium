
import { ParsedDocket, SearchResult } from "./models";

export interface GroundingChunk {
    web?: {
        title: string;
        uri: string;
    }
}

export interface AnalyzedDoc { summary: string; riskScore: number; }
export interface ResearchResponse { text: string; sources: SearchResult[]; }
export interface WorkflowDraft { title: string; tasks: string[]; }
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