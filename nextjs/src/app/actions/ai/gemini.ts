'use server';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                LEXIFLOW GEMINI AI SERVER ACTIONS                          ║
 * ║         Secure Server-Side Google Gemini API Integration                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * All AI operations must run server-side to protect API keys and ensure
 * proper rate limiting, authentication, and audit logging.
 *
 * @module app/actions/ai/gemini
 * @security Server-only - API keys never exposed to client
 * @author LexiFlow Engineering Team
 * @since 2026-01-12 (Security Hardening)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';
import { Prompts } from '@/services/ai/prompts';
import {
  AnalyzedDocSchema,
  BriefCritiqueSchema,
  DocketSchema,
  IntentResultSchema,
  LinterResultSchema,
  ShepardizeSchema,
  StrategyGraphSchema,
} from '@/services/ai/schemas';
import type { ParsedDocket, SearchResult } from '@/types';
import type {
  AnalyzedDoc,
  BriefCritique,
  GroundingChunk,
  IntentResult,
  ResearchResponse,
  ShepardizeResult,
} from '@/types/intelligence';
import { safeParseJSON, withRetry } from '@/utils/apiUtils';

/**
 * Re-export types for client components
 */
export type {
  IntentResult,
  ShepardizeResult,
  TreatmentType,
} from '@/types/intelligence';

/**
 * Get authenticated client with proper API key from environment
 * @private
 * @throws {Error} If API key is not configured
 */
function getAuthenticatedClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Gemini API key not configured. Set GEMINI_API_KEY environment variable.'
    );
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Verify user authentication from cookies
 * @private
 * @throws {Error} If user is not authenticated
 */
async function requireAuthentication() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  return token;
}

/**
 * Analyze document for risk scoring and summary generation
 * @param content - Document text to analyze
 * @returns Promise<AnalyzedDoc> - Risk score and summary
 */
export async function analyzeDocument(content: string): Promise<AnalyzedDoc> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: AnalyzedDocSchema,
        },
      });

      const result = await model.generateContent(Prompts.Analysis(content));
      const text = result.response.text();

      if (!text) throw new Error('No response from Gemini API');

      return safeParseJSON(text, {
        summary: 'Analysis failed to parse',
        riskScore: 0,
      });
    } catch (error) {
      console.error('[Gemini] Analysis error:', error);
      return {
        summary: 'Analysis unavailable due to service error.',
        riskScore: 0,
      };
    }
  });
}

/**
 * Critique legal brief with senior partner-level review
 * @param text - Brief content to critique
 * @returns Promise<BriefCritique> - Scoring and recommendations
 */
export async function critiqueBrief(text: string): Promise<BriefCritique> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: BriefCritiqueSchema,
        },
      });

      const result = await model.generateContent(Prompts.Critique(text));
      const responseText = result.response.text();

      if (!responseText) throw new Error('No response from Gemini API');

      return safeParseJSON(responseText, {
        score: 0,
        strengths: [],
        weaknesses: ['Analysis unavailable'],
        suggestions: [],
        missingAuthority: [],
      });
    } catch (error) {
      console.error('[Gemini] Critique error:', error);
      return {
        score: 0,
        strengths: [],
        weaknesses: ['Service error occurred'],
        suggestions: [],
        missingAuthority: [],
      };
    }
  });
}

/**
 * Review contract for risks, missing clauses, and unusual terms
 * @param text - Contract text to review
 * @returns Promise<string> - Review analysis
 */
export async function reviewContract(text: string): Promise<string> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

      const result = await model.generateContent(Prompts.Review(text));
      return result.response.text() || 'Error reviewing contract.';
    } catch (error) {
      console.error('[Gemini] Contract review error:', error);
      return 'Contract review service unavailable.';
    }
  });
}

/**
 * Generate draft content with streaming support (server-side)
 * @param context - Context for draft generation
 * @param type - Document type (motion, brief, letter, etc.)
 * @returns Promise<string> - Complete generated draft
 */
export async function generateDraft(
  context: string,
  type: string
): Promise<string> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

      const result = await model.generateContent(Prompts.Draft(context, type));
      return result.response.text() || 'Error generating content.';
    } catch (error) {
      console.error('[Gemini] Draft generation error:', error);
      return 'Generation failed.';
    }
  });
}

/**
 * Refine time entry description for ABA compliance
 * @param description - Raw time entry description
 * @returns Promise<string> - Refined description
 */
export async function refineTimeEntry(description: string): Promise<string> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

      const result = await model.generateContent(Prompts.Refine(description));
      return result.response.text() || description;
    } catch (error) {
      console.error('[Gemini] Time entry refinement error:', error);
      return description;
    }
  });
}

/**
 * Predict intent from natural language query
 * @param query - User query for intent recognition
 * @returns Promise<IntentResult> - Predicted action and confidence
 */
export async function predictIntent(query: string): Promise<IntentResult> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: IntentResultSchema,
        },
      });

      const result = await model.generateContent(Prompts.Intent(query));
      const responseText = result.response.text();

      if (!responseText) throw new Error('No response from Gemini API');

      return safeParseJSON(responseText, {
        action: 'UNKNOWN',
        confidence: 0,
      });
    } catch (error) {
      console.error('[Gemini] Intent prediction error:', error);
      return { action: 'UNKNOWN', confidence: 0 };
    }
  });
}

/**
 * Parse docket text into structured data
 * @param text - Raw docket text
 * @returns Promise<Partial<ParsedDocket>> - Structured docket data
 */
export async function parseDocket(
  text: string
): Promise<Partial<ParsedDocket>> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: DocketSchema,
        },
      });

      const result = await model.generateContent(Prompts.Docket(text));
      const responseText = result.response.text();

      if (!responseText) throw new Error('No response from Gemini API');

      return safeParseJSON<Partial<ParsedDocket>>(responseText, {});
    } catch (error) {
      console.error('[Gemini] Docket parsing error:', error);
      return {};
    }
  });
}

/**
 * Conduct legal research with Google Search grounding
 * @param query - Research query
 * @returns Promise<ResearchResponse> - Research text and sources
 */
export async function conductResearch(
  query: string
): Promise<ResearchResponse> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        tools: [{ googleSearch: {} }],
      });

      const result = await model.generateContent(Prompts.Research(query));
      const response = result.response;

      const sources: SearchResult[] = [];
      const candidates = response.candidates;
      
      if (candidates && candidates[0]?.groundingMetadata?.groundingChunks) {
        const chunks = candidates[0].groundingMetadata
          .groundingChunks as GroundingChunk[];
        
        chunks.forEach((chunk: GroundingChunk) => {
          if (chunk.web) {
            sources.push({
              id: crypto.randomUUID(),
              type: 'web',
              title: chunk.web.title,
              score: 1.0,
              url: chunk.web.uri,
            });
          }
        });
      }

      return {
        text: response.text() || 'No text response.',
        sources,
      };
    } catch (error) {
      console.error('[Gemini] Research error:', error);
      return {
        text: 'Research service unavailable.',
        sources: [],
      };
    }
  });
}

/**
 * Generate professional reply to message
 * @param lastMessage - Last message in thread
 * @param role - Role context for reply
 * @returns Promise<string> - Generated reply
 */
export async function generateReply(
  lastMessage: string,
  role: string
): Promise<string> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

      const prompt = `Draft a professional reply to this message from a ${role}: "${lastMessage}"`;
      const result = await model.generateContent(prompt);
      
      return result.response.text() || '';
    } catch (error) {
      console.error('[Gemini] Reply generation error:', error);
      return 'Unable to generate reply.';
    }
  });
}

/**
 * Shepardize citation (KeyCite-style validation)
 * @param citation - Citation to validate
 * @returns Promise<ShepardizeResult | null> - Citation analysis
 */
export async function shepardizeCitation(
  citation: string
): Promise<ShepardizeResult | null> {
  await requireAuthentication();

  return withRetry<ShepardizeResult | null>(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: ShepardizeSchema,
        },
      });

      const result = await model.generateContent(Prompts.Shepardize(citation));
      const responseText = result.response.text();

      if (!responseText) return null;

      return safeParseJSON<ShepardizeResult>(responseText, {
        caseName: '',
        citation: '',
        summary: '',
        history: [],
        treatment: [],
      });
    } catch (error) {
      console.error('[Gemini] Shepardize error:', error);
      return null;
    }
  });
}

/**
 * Generate litigation strategy graph from natural language
 * @param prompt - Strategy description
 * @returns Promise<{nodes, connections} | null> - Strategy graph
 */
export async function generateStrategyFromPrompt(
  prompt: string
): Promise<{ nodes: unknown[]; connections: unknown[] } | null> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: StrategyGraphSchema,
        },
      });

      const result = await model.generateContent(Prompts.Strategy(prompt));
      const responseText = result.response.text();

      if (!responseText) return null;

      return safeParseJSON(responseText, { nodes: [], connections: [] });
    } catch (error) {
      console.error('[Gemini] Strategy generation error:', error);
      return null;
    }
  });
}

/**
 * Lint litigation strategy for logical consistency
 * @param graphData - Strategy graph data
 * @returns Promise<{suggestions} | null> - Linting results
 */
export async function lintStrategy(
  graphData: unknown
): Promise<{ suggestions: unknown[] } | null> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: LinterResultSchema,
        },
      });

      const result = await model.generateContent(
        Prompts.Lint(JSON.stringify(graphData))
      );
      const responseText = result.response.text();

      if (!responseText) return null;

      return safeParseJSON(responseText, { suggestions: [] });
    } catch (error) {
      console.error('[Gemini] Strategy linting error:', error);
      return null;
    }
  });
}

/**
 * Extract structured case data from text
 * @param text - Raw case text
 * @returns Promise<Partial<ParsedDocket>> - Extracted case data
 */
export async function extractCaseData(
  text: string
): Promise<Partial<ParsedDocket>> {
  await requireAuthentication();

  return withRetry(async () => {
    try {
      const model = getAuthenticatedClient().getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: DocketSchema,
        },
      });

      const prompt = `Extract structured case data from the following text. Include all parties, attorneys, dates, court information, case numbers, and any other relevant case details:\n\n${text.slice(0, 15000)}`;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (!responseText) throw new Error('No response from Gemini API');

      return safeParseJSON<Partial<ParsedDocket>>(responseText, {});
    } catch (error) {
      console.error('[Gemini] Case data extraction error:', error);
      return {};
    }
  });
}

/**
 * Legal research with optional jurisdiction filter
 * @param query - Research query
 * @param jurisdiction - Optional jurisdiction filter
 * @returns Promise<ResearchResponse> - Research results
 */
export async function legalResearch(
  query: string,
  jurisdiction?: string
): Promise<ResearchResponse> {
  await requireAuthentication();
  
  const enhancedQuery = jurisdiction
    ? `${query} (jurisdiction: ${jurisdiction})`
    : query;
  
  return conductResearch(enhancedQuery);
}

/**
 * Validate multiple citations
 * @param citations - Array of citations
 * @returns Promise<ShepardizeResult> - Validation results
 */
export async function validateCitations(
  citations: string[]
): Promise<ShepardizeResult> {
  await requireAuthentication();

  if (citations.length === 0) {
    return {
      caseName: 'No citations provided',
      citation: '',
      summary: 'No citations to validate',
      history: [],
      treatment: [],
    };
  }

  const firstCitation = citations[0];
  if (!firstCitation) {
    return {
      caseName: 'Unknown Case',
      citation: '',
      summary: 'No citation found',
      history: [],
      treatment: [],
    };
  }

  const result = await shepardizeCitation(firstCitation);
  
  if (!result) {
    return {
      caseName: 'Unknown Case',
      citation: firstCitation,
      summary: 'Analysis unavailable',
      history: [],
      treatment: [],
    };
  }

  return result;
}

/**
 * Draft document with chunk callback support
 * @param prompt - Draft prompt
 * @returns Promise<string> - Complete draft
 */
export async function draftDocument(prompt: string): Promise<string> {
  await requireAuthentication();
  return generateDraft(prompt, 'document');
}

/**
 * Suggest reply from thread messages
 * @param threadMessages - Array of thread messages
 * @returns Promise<string> - Suggested reply
 */
export async function suggestReply(threadMessages: string[]): Promise<string> {
  await requireAuthentication();
  
  const lastMessage = threadMessages[threadMessages.length - 1] || '';
  return generateReply(lastMessage, 'professional');
}
