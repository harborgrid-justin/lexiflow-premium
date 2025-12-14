/**
 * @module types/parser
 * @category Types - Parsing
 * @description Unified parser result types for consistent error handling across
 * XML, fallback, and AI parsers. Provides type-safe parsing with confidence levels.
 * 
 * FEATURES:
 * - Consistent error interface across all parsers
 * - Confidence scoring (high/medium/low)
 * - Warning collection for partial successes
 * - Metadata preservation (source, timing)
 * - Type-safe parsed data
 */

import { Result } from './result';
import { Case, Party, DocketEntry } from './models';

// ============================================================================
// CONFIDENCE & METADATA
// ============================================================================

/**
 * Confidence level for parsed data quality
 */
export type ParseConfidence = 'high' | 'medium' | 'low';

/**
 * Parser source identifier
 */
export type ParserSource = 'xml' | 'ai' | 'fallback' | 'manual';

/**
 * Parse metadata
 */
export interface ParseMetadata {
  /** Parser used */
  source: ParserSource;
  /** Parse timestamp */
  timestamp: string;
  /** Parse duration in milliseconds */
  durationMs?: number;
  /** Input size in bytes */
  inputSize?: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Parse error codes
 */
export enum ParseErrorCode {
  INVALID_FORMAT = 'INVALID_FORMAT',
  MISSING_REQUIRED_DATA = 'MISSING_REQUIRED_DATA',
  MALFORMED_XML = 'MALFORMED_XML',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Structured parse error
 */
export interface ParseError {
  code: ParseErrorCode;
  message: string;
  details?: string;
  field?: string;
  line?: number;
}

// ============================================================================
// WARNING TYPES
// ============================================================================

/**
 * Parse warning for non-fatal issues
 */
export interface ParseWarning {
  message: string;
  field?: string;
  suggestion?: string;
}

// ============================================================================
// PARSE RESULT
// ============================================================================

/**
 * Generic parse result with confidence and warnings
 */
export interface ParseResult<T> {
  /** Parsed data */
  data: T;
  /** Parse confidence level */
  confidence: ParseConfidence;
  /** Non-fatal warnings */
  warnings: ParseWarning[];
  /** Parse metadata */
  metadata: ParseMetadata;
}

/**
 * Docket parse result with structured case data
 */
export interface DocketParseResult {
  caseInfo: Partial<Case>;
  parties: Party[];
  docketEntries: DocketEntry[];
  confidence: ParseConfidence;
  warnings: ParseWarning[];
  metadata: ParseMetadata;
}

// ============================================================================
// RESULT TYPE ALIASES
// ============================================================================

/**
 * Type-safe parse result using Result<T, E> pattern
 */
export type SafeParseResult<T> = Result<ParseResult<T>, ParseError>;

/**
 * Type-safe docket parse result
 */
export type SafeDocketParseResult = Result<DocketParseResult, ParseError>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a successful parse result
 */
export function parseSuccess<T>(
  data: T,
  confidence: ParseConfidence,
  metadata: ParseMetadata,
  warnings: ParseWarning[] = []
): ParseResult<T> {
  return { data, confidence, warnings, metadata };
}

/**
 * Create a parse error
 */
export function parseError(
  code: ParseErrorCode,
  message: string,
  details?: string,
  field?: string,
  line?: number
): ParseError {
  return { code, message, details, field, line };
}

/**
 * Create a parse warning
 */
export function parseWarning(
  message: string,
  field?: string,
  suggestion?: string
): ParseWarning {
  return { message, field, suggestion };
}

/**
 * Convert legacy fallback parse result to unified format
 */
export function normalizeFallbackResult(
  legacyResult: {
    caseInfo: Partial<Case>;
    parties: Party[];
    entries: DocketEntry[];
    confidence: ParseConfidence;
    warnings: string[];
  },
  metadata: ParseMetadata
): DocketParseResult {
  return {
    caseInfo: legacyResult.caseInfo,
    parties: legacyResult.parties,
    docketEntries: legacyResult.entries,
    confidence: legacyResult.confidence,
    warnings: legacyResult.warnings.map(w => parseWarning(w)),
    metadata
  };
}

/**
 * Merge multiple parse results (useful for partial recovery)
 */
export function mergeParseResults(
  results: DocketParseResult[]
): DocketParseResult {
  if (results.length === 0) {
    throw new Error('Cannot merge empty results array');
  }

  const merged: DocketParseResult = {
    caseInfo: results[0].caseInfo,
    parties: [],
    docketEntries: [],
    confidence: results.reduce((min, r) => 
      r.confidence === 'low' ? 'low' : 
      r.confidence === 'medium' || min === 'medium' ? 'medium' : 'high',
      'high' as ParseConfidence
    ),
    warnings: [],
    metadata: {
      source: 'manual',
      timestamp: new Date().toISOString(),
      durationMs: results.reduce((sum, r) => sum + (r.metadata.durationMs || 0), 0)
    }
  };

  // Merge parties and entries
  for (const result of results) {
    merged.parties.push(...result.parties);
    merged.docketEntries.push(...result.docketEntries);
    merged.warnings.push(...result.warnings);
  }

  return merged;
}
