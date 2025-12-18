/**
 * @module services/bluebook
 * @category Legal Research - Bluebook Citations
 * @description Comprehensive Bluebook citation system with parsing, formatting, and validation
 */

export { BluebookParser } from './bluebookParser';
export { BluebookFormatter } from './bluebookFormatter';
export { bluebookApi } from '../api/bluebook-api';

// Re-export types
export * from '../../types/bluebook';
