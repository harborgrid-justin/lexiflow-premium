/**
 * OpenAI Service - Alternative AI Provider for LexiFlow
 * Provides fallback when Gemini quota is exceeded
 */

import OpenAI from "openai";

import { MissingConfigurationError } from "@/services/core/errors";
import { defaultStorage } from "@/services/infrastructure/adapters/StorageAdapter";
import { type ParsedDocket } from "@/types";
import {
  type AnalyzedDoc,
  type BriefCritique,
  type IntentResult,
  type ResearchResponse,
  type ShepardizeResult,
} from "@/types/intelligence";
import { withRetry } from "@/utils/apiUtils";

// Note: Import AI types from @/types, don't re-export them

// =============================================================================
// CLIENT FACTORY
// =============================================================================

const getClient = () => {
  const apiKey =
    import.meta.env["VITE_OPENAI_API_KEY"] ||
    import.meta.env["OPENAI_API_KEY"] ||
    (typeof localStorage !== "undefined"
      ? defaultStorage.getItem("openai_api_key")
      : null);

  if (!apiKey) {
    throw new MissingConfigurationError(
      "OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable or openai_api_key in storage.",
    );
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // For client-side use - move to backend in production
  });
};

// =============================================================================
// OPENAI SERVICE
// =============================================================================

export const OpenAIService = {
  async analyzeDocument(content: string): Promise<AnalyzedDoc> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o-mini",
          instructions:
            "You are a legal document analyzer. Analyze the document and provide a risk score (0-100) and summary.",
          input: `Analyze this legal document and return JSON with {summary: string, riskScore: number}:\n\n${content.slice(0, 10000)}`,
          text: {
            format: {
              type: "json_object",
            },
          },
          temperature: 0.3,
        });

        const textContent = response.output_text || "";
        const result = JSON.parse(textContent || "{}");
        return {
          summary: result.summary || "Analysis unavailable",
          riskScore: result.riskScore || 0,
        };
      } catch (e) {
        console.error("OpenAI Analysis Error:", e);
        return {
          summary: "Analysis unavailable due to service error.",
          riskScore: 0,
        };
      }
    });
  },

  async critiqueBrief(text: string): Promise<BriefCritique> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o",
          instructions:
            "You are a senior legal partner reviewing a brief. Provide constructive critique.",
          input: `Critique this brief and return JSON with {score: number, strengths: string[], weaknesses: string[], suggestions: string[], missingAuthority: string[]}:\n\n${text.slice(0, 15000)}`,
          text: {
            format: {
              type: "json_object",
            },
          },
          temperature: 0.4,
        });

        const textContent = response.output_text || "";
        const result = JSON.parse(textContent || "{}");
        return {
          score: result.score || 0,
          strengths: result.strengths || [],
          weaknesses: result.weaknesses || ["Analysis unavailable"],
          suggestions: result.suggestions || [],
          missingAuthority: result.missingAuthority || [],
        };
      } catch (e) {
        console.error("OpenAI Critique Error:", e);
        return {
          score: 0,
          strengths: [],
          weaknesses: ["Service Error"],
          suggestions: [],
          missingAuthority: [],
        };
      }
    });
  },

  async reviewContract(text: string): Promise<string> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o-mini",
          instructions:
            "You are a contract review attorney. Identify risks and missing clauses.",
          input: `Review this contract:\n\n${text.slice(0, 10000)}`,
          temperature: 0.3,
        });

        return response.output_text || "Error reviewing contract.";
      } catch {
        return "Contract review service unavailable.";
      }
    });
  },

  async *streamDraft(
    context: string,
    type: string,
  ): AsyncGenerator<string, void, unknown> {
    try {
      const client = getClient();
      const stream = await client.responses.create({
        model: "gpt-4o",
        instructions: `You are a legal drafting assistant. Generate a professional ${type}.`,
        input: context.slice(0, 10000),
        stream: true,
        temperature: 0.7,
      });

      for await (const event of stream) {
        const eventObj = event as {
          type?: string;
          item?: {
            type?: string;
            content?: Array<{ type?: string; text?: string }>;
          };
          delta?: { type?: string; text?: string };
        };
        if (
          eventObj.type === "response.output_item.added" &&
          eventObj.item?.type === "message"
        ) {
          const content = eventObj.item.content?.[0];
          if (content && content.type === "output_text") {
            yield content.text || "";
          }
        } else if (eventObj.type === "response.output_item.delta") {
          const delta = eventObj.delta;
          if (delta && delta.type === "output_text" && delta.text) {
            yield delta.text;
          }
        }
      }
    } catch {
      yield "Error streaming content.";
    }
  },

  async generateDraft(prompt: string, type: string): Promise<string> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o",
          instructions: `You are a legal drafting assistant. Generate a professional ${type}.`,
          input: prompt.slice(0, 10000),
          temperature: 0.7,
        });

        return response.output_text || "Error generating content.";
      } catch {
        return "Generation failed.";
      }
    });
  },

  async predictIntent(query: string): Promise<IntentResult> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o-mini",
          instructions:
            "Predict user intent and return JSON with {action: string, confidence: number}",
          input: query,
          text: {
            format: {
              type: "json_object",
            },
          },
          temperature: 0.2,
        });

        const textContent = response.output_text || "";
        const result = JSON.parse(textContent || "{}");
        return {
          action: result.action || "UNKNOWN",
          confidence: result.confidence || 0,
        };
      } catch {
        return { action: "UNKNOWN", confidence: 0 };
      }
    });
  },

  async parseDocket(text: string): Promise<Partial<ParsedDocket>> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o-mini",
          instructions:
            "Extract case data from docket and return structured JSON.",
          input: `Parse this docket:\n\n${text.slice(0, 10000)}`,
          text: {
            format: {
              type: "json_object",
            },
          },
          temperature: 0.1,
        });

        const textContent = response.output_text || "";
        return JSON.parse(textContent || "{}");
      } catch (e) {
        console.error("Docket Parse Error", e);
        return {};
      }
    });
  },

  async conductResearch(query: string): Promise<ResearchResponse> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o",
          instructions:
            "You are a legal research assistant. Provide thorough legal analysis.",
          input: query,
          temperature: 0.3,
        });

        return {
          text: response.output_text || "Research unavailable.",
          sources: [],
        };
      } catch {
        return {
          text: "Research service unavailable.",
          sources: [],
        };
      }
    });
  },

  async generateReply(lastMsg: string, role: string): Promise<string> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o-mini",
          instructions: `Draft a professional reply to this message from a ${role}.`,
          input: lastMsg,
          temperature: 0.5,
        });

        return response.output_text || "";
      } catch {
        return "Unable to generate reply.";
      }
    });
  },

  async refineTimeEntry(desc: string): Promise<string> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o-mini",
          instructions:
            "Rewrite time entries to be ABA-compliant and professional.",
          input: desc,
          temperature: 0.3,
        });

        return response.output_text || desc;
      } catch {
        return desc;
      }
    });
  },

  async shepardizeCitation(citation: string): Promise<ShepardizeResult> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o",
          instructions:
            "You are a legal research assistant. Analyze case citation validity and treatment history. Return JSON with {caseName: string, citation: string, summary: string, history: array, treatment: array}.",
          input: `Shepardize this citation: ${citation}`,
          text: {
            format: {
              type: "json_object",
            },
          },
          temperature: 0.2,
        });

        const textContent = response.output_text || "";
        const result = JSON.parse(textContent || "{}");
        return {
          caseName: result.caseName || "Unknown Case",
          citation: result.citation || citation,
          summary: result.summary || "No summary available",
          history: result.history || [],
          treatment: result.treatment || [],
        };
      } catch (e) {
        console.error("Shepardize Error:", e);
        return {
          caseName: "Unknown Case",
          citation: citation,
          summary: "Analysis unavailable",
          history: [],
          treatment: [],
        };
      }
    });
  },

  async extractCaseData(text: string): Promise<Partial<ParsedDocket>> {
    return withRetry(async () => {
      try {
        const client = getClient();
        const response = await client.responses.create({
          model: "gpt-4o",
          instructions:
            "Extract structured case data from unstructured text. Return JSON with case details including parties, attorneys, dates, court, etc.",
          input: `Extract case data from this text:\n\n${text.slice(0, 15000)}`,
          text: {
            format: {
              type: "json_object",
            },
          },
          temperature: 0.1,
        });

        const textContent = response.output_text || "";
        return JSON.parse(textContent || "{}");
      } catch (e) {
        console.error("Extract Case Data Error:", e);
        return {};
      }
    });
  },

  // ============================================================================
  // AIServiceInterface Compatibility Methods
  // ============================================================================

  /**
   * Legal research (wrapper for conductResearch)
   * @param query - Research query
   * @param jurisdiction - Optional jurisdiction filter
   */
  async legalResearch(
    query: string,
    _jurisdiction?: string,
  ): Promise<ResearchResponse> {
    return this.conductResearch(query);
  },

  /**
   * Validate citations (wrapper for shepardizeCitation)
   * @param citations - Array of citations to validate
   */
  async validateCitations(citations: string[]): Promise<ShepardizeResult> {
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
    return this.shepardizeCitation(firstCitation);
  },

  /**
   * Draft document (wrapper for generateDraft with callback support)
   * @param prompt - Draft prompt
   * @param onChunk - Callback for streaming chunks
   */
  async draftDocument(
    prompt: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    const stream = this.streamDraft(prompt, "document");
    for await (const chunk of stream) {
      onChunk(chunk);
    }
  },

  /**
   * Suggest reply (wrapper for generateReply)
   * @param threadMessages - Array of thread messages
   */
  async suggestReply(threadMessages: string[]): Promise<string> {
    // Use the last message for context
    const lastMessage = threadMessages[threadMessages.length - 1] || "";
    return this.generateReply(lastMessage, "professional");
  },
};
