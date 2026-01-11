/**
 * GeminiService - Data Processing
 * Docket parsing, case data extraction, and intent prediction
 */

import { getClient } from "./client";
import { Prompts } from "@/services/ai/prompts";
import { DocketSchema, IntentResultSchema } from "@/services/ai/schemas";
import { safeParseJSON, withRetry } from "@/utils/apiUtils";
import type { IntentResult, ParsedDocket } from "./types";

/**
 * Parse docket text into structured data
 */
export async function parseDocket(text: string): Promise<Partial<ParsedDocket>> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: DocketSchema,
        },
      });

      const result = await model.generateContent(Prompts.Docket(text));
      const responseText = result.response.text();

      if (!responseText) throw new Error("No response text from Gemini");
      return safeParseJSON<Partial<ParsedDocket>>(responseText, {});
    } catch (e) {
      console.error("Docket Parse Error", e);
      return {};
    }
  });
}

/**
 * Extract case data from text
 */
export async function extractCaseData(text: string): Promise<Partial<ParsedDocket>> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: DocketSchema,
        },
      });

      const result = await model.generateContent(
        `Extract structured case data from the following text. Include all parties, attorneys, dates, court information, case numbers, and any other relevant case details:\n\n${text.slice(0, 15000)}`
      );
      const responseText = result.response.text();

      if (!responseText) throw new Error("No response text from Gemini");
      return safeParseJSON<Partial<ParsedDocket>>(responseText, {});
    } catch (e) {
      console.error("Extract Case Data Error:", e);
      return {};
    }
  });
}

/**
 * Predict user intent from query
 */
export async function predictIntent(query: string): Promise<IntentResult> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: IntentResultSchema,
        },
      });

      const result = await model.generateContent(Prompts.Intent(query));
      const responseText = result.response.text();

      if (!responseText) throw new Error("No response text from Gemini");
      return safeParseJSON(responseText, {
        action: "UNKNOWN",
        confidence: 0,
      });
    } catch {
      return { action: "UNKNOWN", confidence: 0 };
    }
  });
}
