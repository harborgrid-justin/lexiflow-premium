/**
 * Document Management Feature - Enterprise Document Management System
 *
 * Exports all components, types, hooks, and utilities for the document management feature.
 */

// Components
export { DocumentExplorer } from './components/DocumentExplorer';
export { VersionHistory } from './components/VersionHistory';
export { DocumentCompare } from './components/DocumentCompare';
export { TemplateEditor } from './components/TemplateEditor';
export { RetentionPolicyManager } from './components/RetentionPolicyManager';
export { DocumentPreview } from './components/DocumentPreview';

// Types
export type {
  DocumentNode,
  DocumentVersion,
  DocumentClassification,
  RetentionPolicy,
  DocumentTemplate,
  TemplateVariable,
  DiffOperation,
  ComparisonResult,
} from './types';
