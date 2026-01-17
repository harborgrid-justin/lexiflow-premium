/**
 * Type definitions for Bluebook Formatter
 */

import { type BluebookCitation, type BluebookCitationType, type CitationFormat } from '@/types/bluebook';

export interface FormattingResult {
  id: string;
  original: string;
  citation: BluebookCitation | null;
  formatted: string;
  isValid: boolean;
  showDetails: boolean;
}

export interface FormatStats {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
}

export interface FormatOptions {
  format: CitationFormat;
  italicizeCaseNames: boolean;
  useSmallCaps: boolean;
}

export interface FilterOptions {
  type: BluebookCitationType | 'ALL';
  showOnlyErrors: boolean;
}
