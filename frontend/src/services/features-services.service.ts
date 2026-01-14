/**
 * Feature Services Barrel Export
 *
 * Heavy feature services with external dependencies.
 * Import from '@/services/features' only when needed.
 *
 * ⚠️ WARNING: These services may load large dependencies.
 */

// Analysis
export * from "./features/analysis/analysisEngine";

// Calendar
export * from "./features/calendar/calendarConflicts";

// Discovery
export * from "./features/discovery/discovery";
export * from "./features/discovery/fallbackDocketParser";

// Documents
export * from "./features/documents/documents";
export * from "./features/documents/xmlDocketParser";

// Legal (Heavy - imports types barrel)
export { DeadlineEngine } from "./features/legal/deadlineEngine";
export * from "./features/legal/legalRules";

// Research (Heavy - imports Gemini SDK)
export { GeminiService } from "./features/research/geminiService";

// Bluebook
export * from "./features/bluebook";

// AI Services (used by heavy services)
export * from "./ai/prompts";
export * from "./ai/schemas";
