/**
 * GeminiService Type Definitions
 * Module declarations and type exports for Google Generative AI integration
 */

// Workaround for broken type definitions in @google/generative-ai
// The package exports classes/enums at runtime but the .d.ts file has empty export block
declare module "@google/generative-ai" {
  export interface ModelParams {
    model: string;
    [key: string]: unknown;
  }
  export interface RequestOptions {
    [key: string]: unknown;
  }

  export interface GenerateContentResult {
    response: {
      text(): string;
      candidates?: {
        content: { parts: { text: string }[] };
        groundingMetadata?: {
          groundingChunks: unknown[];
        };
      }[];
    };
  }

  export interface GenerativeModel {
    generateContent(prompt: unknown): Promise<GenerateContentResult>;
    generateContentStream(
      prompt: unknown
    ): Promise<{ stream: AsyncIterable<GenerateContentResult> }>;
  }

  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(
      modelParams: ModelParams,
      requestOptions?: RequestOptions
    ): GenerativeModel;
  }
}

// Re-export intelligence types
export type {
  AnalyzedDoc,
  BriefCritique,
  GroundingChunk,
  IntentResult,
  ResearchResponse,
  ShepardizeResult,
  TreatmentType,
} from "@/types/intelligence";

export type { SearchResult, ParsedDocket } from "@/types";
