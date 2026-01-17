/**
 * GeminiService - Legal Research
 * Research queries, citation validation, and Shepardizing
 */

import { Prompts } from "@/services/ai/prompts";
import { ShepardizeSchema } from "@/services/ai/schemas";
import { safeParseJSON, withRetry } from "@/utils/apiUtils";

import { getClient } from "./client";

import type {
  GroundingChunk,
  ResearchResponse,
  SearchResult,
  ShepardizeResult,
} from "./types";

/**
 * Conduct legal research with Google Search grounding
 */
export async function conductResearch(query: string): Promise<ResearchResponse> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        tools: [{ googleSearch: {} }],
      });

      const result = await model.generateContent(Prompts.Research(query));
      const response = result.response;

      const sources: SearchResult[] = [];
      const candidates = response.candidates;
      if (candidates && candidates[0]?.groundingMetadata?.groundingChunks) {
        const chunks = candidates[0].groundingMetadata
          .groundingChunks as GroundingChunk[];
        chunks.forEach((c: GroundingChunk) => {
          if (c.web) {
            sources.push({
              id: crypto.randomUUID(),
              type: "web",
              title: c.web.title,
              score: 1.0,
              url: c.web.uri,
            });
          }
        });
      }
      const researchResponse: ResearchResponse = {
        text: response.text() || "No text response.",
        sources,
      };
      return researchResponse;
    } catch {
      const errorResponse: ResearchResponse = {
        text: "Research service unavailable.",
        sources: [],
      };
      return errorResponse;
    }
  });
}

/**
 * Shepardize citation (KeyCite-style validation)
 */
export async function shepardizeCitation(
  citation: string
): Promise<ShepardizeResult | null> {
  return withRetry<ShepardizeResult | null>(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: ShepardizeSchema,
        },
      });

      const result = await model.generateContent(Prompts.Shepardize(citation));
      const responseText = result.response.text();

      if (!responseText) return null;
      const defaultValue: ShepardizeResult = {
        caseName: "",
        citation: "",
        summary: "",
        history: [],
        treatment: [],
      };
      return safeParseJSON<ShepardizeResult>(responseText, defaultValue);
    } catch {
      return null;
    }
  });
}

/**
 * Legal research (wrapper for conductResearch)
 */
export async function legalResearch(
  query: string,
  _jurisdiction?: string
): Promise<ResearchResponse> {
  return conductResearch(query);
}

/**
 * Validate citations (wrapper for shepardizeCitation)
 */
export async function validateCitations(
  citations: string[]
): Promise<ShepardizeResult> {
  // Validate first citation for now (API limitation)
  if (citations.length === 0) {
    return {
      caseName: "No citations provided",
      citation: "",
      summary: "No citations to validate",
      history: [],
      treatment: [],
    };
  }
  const firstCitation = citations[0];
  if (!firstCitation) {
    return {
      caseName: "Unknown Case",
      citation: "",
      summary: "No citation found",
      history: [],
      treatment: [],
    };
  }
  const result = await shepardizeCitation(firstCitation);
  if (!result) {
    return {
      caseName: "Unknown Case",
      citation: firstCitation,
      summary: "Analysis unavailable",
      history: [],
      treatment: [],
    };
  }
  return result;
}
