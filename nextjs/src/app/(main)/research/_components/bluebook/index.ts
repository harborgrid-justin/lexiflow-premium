/**
 * @module research/bluebook
 * @category Legal Research - Citation Formatting
 * @description Bluebook Citation Formatter Suite exports
 */

// Main component
export { BluebookFormatter, default } from './BluebookFormatter';
export type { BluebookFormatterProps } from './BluebookFormatter';

// Types
export * from './types';

// Utilities
export {
  BluebookParser,
  BluebookFormatter as BluebookFormatterService,
  copyToClipboard,
  getCitationTypeLabel,
  getCitationTypeColor,
  SAMPLE_CITATIONS
} from './citation-utils';

// Export utilities
export {
  generateTableOfAuthorities,
  createTableOfAuthorities,
  exportToText,
  exportToHTML,
  exportToJSON,
  exportTOAToText,
  exportTOAToHTML,
  openTOAInWindow,
  copyTOAToClipboard
} from './export-utils';
