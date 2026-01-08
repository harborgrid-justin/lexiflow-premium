/**
 * @module research/bluebook/types
 * @category Legal Research - Citation Formatting
 * @description TypeScript interfaces for Bluebook citation formatter
 */

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
  BOOK = 'BOOK',
  LAW_REVIEW = 'LAW_REVIEW',
  JOURNAL = 'JOURNAL',
  WEB_RESOURCE = 'WEB_RESOURCE',
  UNKNOWN = 'UNKNOWN'
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
  TAX = 'TAX'
}

/**
 * Citation format styles
 */
export enum CitationFormat {
  FULL = 'FULL',
  SHORT_FORM = 'SHORT_FORM',
  ID = 'ID'
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
 * Export format options
 */
export enum ExportFormat {
  PLAIN_TEXT = 'PLAIN_TEXT',
  HTML = 'HTML',
  JSON = 'JSON'
}

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Citation validation error
 */
export interface CitationValidationError {
  code: string;
  message: string;
  severity: ValidationSeverity;
  suggestion?: string;
}

/**
 * Citation metadata
 */
export interface CitationMetadata {
  createdAt: string;
  updatedAt: string;
  shortFormEstablished: boolean;
  citationCount: number;
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

/**
 * Base citation structure
 */
export interface BluebookCitation {
  id: string;
  type: BluebookCitationType;
  rawText: string;
  formatted: string;
  pinpoint?: string;
  isValid: boolean;
  validationErrors: CitationValidationError[];
  metadata: CitationMetadata;
}

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
}

/**
 * Statute citation structure (Rule 12)
 */
export interface StatuteCitation extends BluebookCitation {
  type: BluebookCitationType.STATUTE;
  title: number | string;
  code: string;
  section: string;
  year?: number;
  subsections?: string[];
}

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
}

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

/**
 * Book citation structure (Rule 15)
 */
export interface BookCitation extends BluebookCitation {
  type: BluebookCitationType.BOOK;
  authors: Author[];
  title: string;
  edition?: number;
  year: number;
  pageNumbers?: string;
  volume?: number;
}

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
}

/**
 * Web resource citation (Rule 18.2)
 */
export interface WebCitation extends BluebookCitation {
  type: BluebookCitationType.WEB_RESOURCE;
  title: string;
  url: string;
  author?: string;
  accessDate: string;
}

// =============================================================================
// COMPONENT TYPES
// =============================================================================

/**
 * Formatting result for display
 */
export interface FormattingResult {
  id: string;
  original: string;
  citation: BluebookCitation | null;
  formatted: string;
  isValid: boolean;
  showDetails: boolean;
}

/**
 * Format statistics
 */
export interface FormatStats {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
}

/**
 * Formatting options
 */
export interface FormatOptions {
  format: CitationFormat;
  italicizeCaseNames: boolean;
  useSmallCaps: boolean;
}

/**
 * Filter options for results
 */
export interface FilterOptions {
  type: BluebookCitationType | 'ALL';
  showOnlyErrors: boolean;
}

/**
 * Table of Authorities entry
 */
export interface TOAEntry {
  citation: string;
  pages: number[];
}

/**
 * Table of Authorities structure
 */
export interface TableOfAuthorities {
  cases: TOAEntry[];
  statutes: TOAEntry[];
  regulations: TOAEntry[];
  constitutions: TOAEntry[];
  secondary: TOAEntry[];
}
