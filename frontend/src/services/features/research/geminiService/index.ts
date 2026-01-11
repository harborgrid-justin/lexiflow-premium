/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    LEXIFLOW GEMINI AI SERVICE                             ║
 * ║         Google Gemini API Integration for Legal Intelligence v2.0         ║
 * ║                       PhD-Level Systems Architecture                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/features/research/geminiService
 * @architecture Singleton Factory with Retry Logic & Streaming Support
 * @author LexiFlow Engineering Team
 * @since 2025-12-18 (Enterprise AI Integration)
 * @status PRODUCTION READY
 */

// Export types
export type {
  IntentResult,
  ShepardizeResult,
  TreatmentType,
} from "./types";

// Import all operation modules
import * as docProcessing from "./documentProcessing";
import * as research from "./legalResearch";
import * as contentGen from "./contentGeneration";
import * as dataProc from "./dataProcessing";
import * as workflow from "./workflowAutomation";

/**
 * GeminiService
 * Provides AI-powered legal intelligence via Google Gemini API
 */
export const GeminiService = {
  // Document Processing
  analyzeDocument: docProcessing.analyzeDocument,
  critiqueBrief: docProcessing.critiqueBrief,
  reviewContract: docProcessing.reviewContract,

  // Legal Research
  conductResearch: research.conductResearch,
  shepardizeCitation: research.shepardizeCitation,
  legalResearch: research.legalResearch,
  validateCitations: research.validateCitations,

  // Content Generation
  streamDraft: contentGen.streamDraft,
  generateDraft: contentGen.generateDraft,
  generateReply: contentGen.generateReply,
  draftDocument: contentGen.draftDocument,
  suggestReply: contentGen.suggestReply,

  // Data Processing
  parseDocket: dataProc.parseDocket,
  extractCaseData: dataProc.extractCaseData,
  predictIntent: dataProc.predictIntent,

  // Workflow Automation
  refineTimeEntry: workflow.refineTimeEntry,
  generateStrategyFromPrompt: workflow.generateStrategyFromPrompt,
  lintStrategy: workflow.lintStrategy,
};
