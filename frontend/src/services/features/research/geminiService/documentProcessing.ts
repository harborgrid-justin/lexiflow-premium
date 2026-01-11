/**
 * GeminiService - Document Processing
 * Document analysis, contract review, and brief critique
 */

import { getClient } from "./client";
import { Prompts } from "@/services/ai/prompts";
import {
  AnalyzedDocSchema,
  BriefCritiqueSchema,
} from "@/services/ai/schemas";
import { GEMINI_MODEL_DEFAULT } from "@/config/features/ai.config";
import { safeParseJSON, withRetry } from "@/utils/apiUtils";
import type { AnalyzedDoc, BriefCritique } from "./types";

/**
 * Analyze document for risks and summary
 */
export async function analyzeDocument(content: string): Promise<AnalyzedDoc> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: GEMINI_MODEL_DEFAULT,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: AnalyzedDocSchema,
        },
      });

      const result = await model.generateContent(Prompts.Analysis(content));
      const response = result.response;
      const text = response.text();

      if (!text) throw new Error("No response text from Gemini");
      return safeParseJSON(text, {
        summary: "Analysis failed to parse",
        riskScore: 0,
      });
    } catch (e) {
      console.error("Gemini Analysis Error:", e);
      return {
        summary: "Analysis unavailable due to service error.",
        riskScore: 0,
      };
    }
  });
}

/**
 * Critique legal brief with scoring and recommendations
 */
export async function critiqueBrief(text: string): Promise<BriefCritique> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: BriefCritiqueSchema,
        },
      });

      const result = await model.generateContent(Prompts.Critique(text));
      const responseText = result.response.text();

      if (!responseText) throw new Error("No response text from Gemini");
      return safeParseJSON(responseText, {
        score: 0,
        strengths: [],
        weaknesses: ["Analysis unavailable"],
        suggestions: [],
        missingAuthority: [],
      });
    } catch (e) {
      console.error("Gemini Critique Error:", e);
      return {
        score: 0,
        strengths: [],
        weaknesses: ["Service Error"],
        suggestions: [],
        missingAuthority: [],
      };
    }
  });
}

/**
 * Review contract for risks and issues
 */
export async function reviewContract(text: string): Promise<string> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });
      const result = await model.generateContent(Prompts.Review(text));
      return result.response.text() || "Error reviewing contract.";
    } catch {
      return "Contract review service unavailable.";
    }
  });
}
