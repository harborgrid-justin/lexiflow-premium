/**
 * GeminiService - Workflow Automation
 * Time entry refinement, strategy generation, and linting
 */

import { Prompts } from "@/services/ai/prompts";
import { LinterResultSchema, StrategyGraphSchema } from "@/services/ai/schemas";
import { safeParseJSON, withRetry } from "@/utils/apiUtils";

import { getClient } from "./client";

/**
 * Refine time entry description for ABA compliance
 */
export async function refineTimeEntry(desc: string): Promise<string> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });
      const result = await model.generateContent(Prompts.Refine(desc));
      return result.response.text() || desc;
    } catch {
      return desc;
    }
  });
}

/**
 * Generate litigation strategy graph from prompt
 */
export async function generateStrategyFromPrompt(
  prompt: string
): Promise<{ nodes: unknown[]; connections: unknown[] } | null> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: StrategyGraphSchema,
        },
      });
      const result = await model.generateContent(Prompts.Strategy(prompt));
      const responseText = result.response.text();
      if (!responseText) return null;
      return safeParseJSON(responseText, { nodes: [], connections: [] });
    } catch (e) {
      console.error("Gemini Strategy Generation Error:", e);
      return null;
    }
  });
}

/**
 * Lint strategy graph for logical consistency
 */
export async function lintStrategy(
  graphData: unknown
): Promise<{ suggestions: unknown[] } | null> {
  return withRetry(async () => {
    try {
      const model = getClient().getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: LinterResultSchema,
        },
      });
      const result = await model.generateContent(
        Prompts.Lint(JSON.stringify(graphData))
      );
      const responseText = result.response.text();
      if (!responseText) return null;
      return safeParseJSON(responseText, { suggestions: [] });
    } catch (e) {
      console.error("Gemini Strategy Linter Error:", e);
      return null;
    }
  });
}
