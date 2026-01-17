/**
 * @module types/bluebook
 * @category Legal Research - Citations
 * @description Comprehensive type definitions for Bluebook citation formatting system
 */

import { type BaseEntity } from './primitives';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Citation types supported by Bluebook 21st Edition
 */
export enum BluebookCitationType {
  CASE = 'CASE',
  STATUTE = 'STATUTE',
  CONSTITUTION = 'CONSTITUTION',
  REGULATION = 'REGULATION',
  LEGISLATIVE_MATERIAL = 'LEGISLATIVE_MATERIAL',
  BOOK = 'BOOK',
  LAW_REVIEW = 'LAW_REVIEW',
  NEWSPAPER = 'NEWSPAPER',
  JOURNAL = 'JOURNAL',
  TREATY = 'TREATY',
  RESTATEMENT = 'RESTATEMENT',
  UNIFORM_LAW = 'UNIFORM_LAW',
  MODEL_CODE = 'MODEL_CODE',
  WEB_RESOURCE = 'WEB_RESOURCE',
  BRIEF = 'BRIEF',
  RECORD = 'RECORD',
  ADMINISTRATIVE_DECISION = 'ADMINISTRATIVE_DECISION',
  EXECUTIVE_ORDER = 'EXECUTIVE_ORDER',
  UNPUBLISHED_OPINION = 'UNPUBLISHED_OPINION',
  FOREIGN_LAW = 'FOREIGN_LAW',
  INTERNATIONAL_LAW = 'INTERNATIONAL_LAW'
}

/**
 * Court levels for case citations
 */
export enum CourtLevel {
  SUPREME_COURT = 'SUPREME_COURT',
  CIRCUIT = 'CIRCUIT',
  DISTRICT = 'DISTRICT',
  STATE_SUPREME = 'STATE_SUPREME',
  STATE_APPELLATE = 'STATE_APPELLATE',
  STATE_TRIAL = 'STATE_TRIAL',
  BANKRUPTCY = 'BANKRUPTCY',
  TAX = 'TAX',
  FEDERAL_CLAIMS = 'FEDERAL_CLAIMS',
  MILITARY = 'MILITARY',
  TRIBAL = 'TRIBAL'
}

/**
 * Citation format styles
 */
export enum CitationFormat {
  FULL = 'FULL',              // Full citation with all components
  SHORT_FORM = 'SHORT_FORM',  // Abbreviated subsequent reference
  ID = 'ID',                  // Id. citation
  SUPRA = 'SUPRA',            // Supra citation
  HEREINAFTER = 'HEREINAFTER' // Hereinafter designation
}

/**
 * Signal types for citation context
 */
export enum CitationSignal {
  NONE = 'NONE',
  SEE = 'SEE',
  SEE_ALSO = 'SEE_ALSO',
  CF = 'CF',
  COMPARE = 'COMPARE',
  WITH = 'WITH',
  CONTRA = 'CONTRA',
  BUT_SEE = 'BUT_SEE',
  BUT_CF = 'BUT_CF',
  SEE_GENERALLY = 'SEE_GENERALLY',
  ACCORD = 'ACCORD',
  E_G = 'E_G'
}

/**
 * Parenthetical types
 */
export enum ParentheticalType {
  EXPLANATORY = 'EXPLANATORY',
  WEIGHT_OF_AUTHORITY = 'WEIGHT_OF_AUTHORITY',
  QUOTING = 'QUOTING',
  CITING = 'CITING',
  ALTERATIONS = 'ALTERATIONS',
  DATE = 'DATE'
}

/**
 * Validation error severity
 */
export enum ValidationSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

/**
 * Citation validation error
 */
export interface CitationValidationError {
  code: string;
  message: string;
  severity: ValidationSeverity;
  suggestion?: string;
}

// =============================================================================
// BASE CITATION INTERFACES
// =============================================================================

/**
 * Base citation structure
 */
export interface BluebookCitation {
  id: string;
  type: BluebookCitationType;
  rawText: string;
  formatted: string;
  signal?: CitationSignal;
  parenthetical?: string;
  pinpoint?: string;
  isValid: boolean;
  validationErrors: CitationValidationError[];
  metadata: CitationMetadata;
}

/**
 * Citation metadata
 */
export interface CitationMetadata {
  createdAt: string;
  updatedAt: string;
  userId?: string;
  caseId?: string;
  documentId?: string;
  shortFormEstablished: boolean;
  hereinafterName?: string;
  lastCitedAt?: string;
  citationCount: number;
}

/**
 * Validation error details (Bluebook-specific)
 */
export interface BluebookValidationError {
  code: string;
  message: string;
  severity: ValidationSeverity;
  location?: TextRange;
  suggestion?: string;
}

/**
 * Text range for error highlighting
 */
export interface TextRange {
  start: number;
  end: number;
  text: string;
}

// =============================================================================
// CASE CITATIONS
// =============================================================================

/**
 * Case citation structure (Rule 10)
 */
export interface CaseCitation extends BluebookCitation {
  type: BluebookCitationType.CASE;
  caseName: string;
  party1: string;
  party2: string;
  reporter: string;
  volume: number;
  page: number;
  court: CourtLevel;
  courtAbbreviation: string;
  year: number;
  parallel?: ParallelCitation[];
  subsequent?: string;
  unpublished?: boolean;
  docketNumber?: string;
}

/**
 * Parallel citation
 */
export interface ParallelCitation {
  reporter: string;
  volume: number;
  page: number;
}

// =============================================================================
// STATUTE CITATIONS
// =============================================================================

/**
 * Statute citation structure (Rule 12)
 */
export interface StatuteCitation extends BluebookCitation {
  type: BluebookCitationType.STATUTE;
  title: number | string;
  code: string;
  section: string;
  year?: number;
  supplement?: boolean;
  subsections?: string[];
  publisher?: string;
}

// =============================================================================
// CONSTITUTION CITATIONS
// =============================================================================

/**
 * Constitutional provision citation (Rule 11)
 */
export interface ConstitutionCitation extends BluebookCitation {
  type: BluebookCitationType.CONSTITUTION;
  jurisdiction: string;
  article?: string;
  section?: string;
  clause?: string;
  amendment?: number;
  repealed?: boolean;
}

// =============================================================================
// BOOK CITATIONS
// =============================================================================

/**
 * Book citation structure (Rule 15)
 */
export interface BookCitation extends BluebookCitation {
  type: BluebookCitationType.BOOK;
  authors: Author[];
  title: string;
  edition?: number;
  publisher?: string;
  year: number;
  pageNumbers?: string;
  volume?: number;
  isbn?: string;
}

/**
 * Author information
 */
export interface Author {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  fullName: string;
}

// =============================================================================
// PERIODICAL CITATIONS
// =============================================================================

/**
 * Law review/journal article citation (Rule 16)
 */
export interface PeriodicalCitation extends BluebookCitation {
  type: BluebookCitationType.LAW_REVIEW | BluebookCitationType.JOURNAL;
  authors: Author[];
  title: string;
  publication: string;
  volume: number;
  page: number;
  year: number;
  issue?: number;
  studentWork?: boolean;
}

// =============================================================================
// REGULATION CITATIONS
// =============================================================================

/**
 * Administrative regulation citation (Rule 14)
 */
export interface RegulationCitation extends BluebookCitation {
  type: BluebookCitationType.REGULATION;
  title: number;
  section: string;
  year: number;
  agency?: string;
}

// =============================================================================
// WEB CITATIONS
// =============================================================================

/**
 * Web resource citation (Rule 18.2)
 */
export interface WebCitation extends BluebookCitation {
  type: BluebookCitationType.WEB_RESOURCE;
  title: string;
  url: string;
  author?: string;
  publisher?: string;
  date?: string;
  accessDate: string;
  archived?: boolean;
  archiveUrl?: string;
}

// =============================================================================
// CITATION FORMATTING OPTIONS
// =============================================================================

/**
 * Options for citation formatting
 */
export interface BluebookFormatOptions {
  format: CitationFormat;
  includeSignal: boolean;
  includeParenthetical: boolean;
  includePinpoint: boolean;
  typeface: TypefaceStyle;
  jurisdiction?: string;
  shortFormReference?: string;
  italicizeCaseNames: boolean;
  useSmallCaps: boolean;
  spacing: SpacingStyle;
}

/**
 * Typeface styling
 */
export enum TypefaceStyle {
  NORMAL = 'NORMAL',
  LARGE_AND_SMALL_CAPS = 'LARGE_AND_SMALL_CAPS',
  ITALICS = 'ITALICS',
  UNDERLINE = 'UNDERLINE'
}

/**
 * Spacing conventions
 */
export enum SpacingStyle {
  BLUEBOOK = 'BLUEBOOK',      // Bluebook standard spacing
  PRACTITIONERS = 'PRACTITIONERS', // Practitioner's note spacing
  CUSTOM = 'CUSTOM'
}

// =============================================================================
// CITATION BATCH OPERATIONS
// =============================================================================

/**
 * Batch formatting request
 */
export interface BatchFormatRequest {
  citations: string[];
  options: BluebookFormatOptions;
  validateOnly?: boolean;
}

/**
 * Batch formatting result
 */
export interface BatchFormatResult {
  results: FormattedCitation[];
  summary: BatchSummary;
}

/**
 * Individual formatted citation result
 */
export interface FormattedCitation {
  original: string;
  formatted: string;
  type: BluebookCitationType;
  isValid: boolean;
  errors: CitationValidationError[];
  suggestions: string[];
}

/**
 * Batch operation summary
 */
export interface BatchSummary {
  total: number;
  successful: number;
  failed: number;
  warnings: number;
  processingTime: number;
}

// =============================================================================
// CITATION CONTEXT
// =============================================================================

/**
 * Citation context for proper formatting
 */
export interface CitationContext {
  documentType: DocumentType;
  jurisdiction: string;
  previousCitations: string[];
  footnoteMode: boolean;
  caseId?: string;
}

/**
 * Document types affecting citation format
 */
export enum DocumentType {
  LAW_REVIEW = 'LAW_REVIEW',
  BRIEF = 'BRIEF',
  MEMORANDUM = 'MEMORANDUM',
  MOTION = 'MOTION',
  OPINION = 'OPINION',
  COMPLAINT = 'COMPLAINT',
  ANSWER = 'ANSWER'
}

// =============================================================================
// CITATION SUGGESTIONS
// =============================================================================

/**
 * Citation correction suggestion
 */
export interface CitationSuggestion {
  original: string;
  suggested: string;
  reason: string;
  rule: string;
  confidence: number;
  autoApply: boolean;
}

// =============================================================================
// EXPORT & PERSISTENCE
// =============================================================================

/**
 * Citation library entry
 */
export interface BluebookLibraryEntry extends BaseEntity {
  citation: BluebookCitation;
  tags: string[];
  notes: string;
  frequency: number;
  lastUsed: string;
  favorite: boolean;
  caseIds: string[];
}

/**
 * Export format options
 */
export enum ExportFormat {
  PLAIN_TEXT = 'PLAIN_TEXT',
  RTF = 'RTF',
  WORD = 'WORD',
  JSON = 'JSON',
  LATEX = 'LATEX',
  HTML = 'HTML'
}

/**
 * Export request
 */
export interface ExportRequest {
  citations: string[];
  format: ExportFormat;
  includeMetadata: boolean;
  groupByType: boolean;
}
