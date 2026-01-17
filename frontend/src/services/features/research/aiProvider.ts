/**
 * AI Service Interface - Common interface for AI providers
 */

import type { ParsedDocket } from '@/types';
import type { AnalyzedDoc, ResearchResponse, IntentResult, BriefCritique, ShepardizeResult } from '@/types/intelligence';

/**
 * Common interface for AI services (Gemini, OpenAI, etc.)
 */
export interface AIServiceInterface {
  // Document Analysis
  analyzeDocument(text: string, docType?: string): Promise<AnalyzedDoc>;

  // Legal Research
  legalResearch(query: string, jurisdiction?: string): Promise<ResearchResponse>;

  // Contract Review
  reviewContract(text: string): Promise<AnalyzedDoc>;

  // Brief Analysis
  critiqueBrief(text: string): Promise<BriefCritique>;

  // Citation Validation
  validateCitations(citations: string[]): Promise<ShepardizeResult>;

  // Document Drafting (streaming)
  draftDocument(prompt: string, onChunk: (chunk: string) => void): Promise<void>;

  // Docket Parsing
  parseDocket(text: string): Promise<ParsedDocket>;

  // Intent Recognition
  predictIntent(query: string): Promise<IntentResult>;

  // Time Entry Refinement
  refineTimeEntry(description: string, context?: { caseName?: string; taskType?: string }): Promise<string>;

  // Message Reply Suggestions
  suggestReply(threadMessages: string[]): Promise<string>;

  // Code Linting
  lintCode?(code: string, language: string): Promise<{ issues: Array<{ line: number; message: string; severity: string }> }>;
}
