/**
 * Enterprise Research Components
 *
 * Comprehensive legal research and citation management tools
 * for LexiFlow Premium enterprise platform.
 */

export { LegalResearchHub } from './LegalResearchHub';
export type {
  LegalResearchHubProps,
  ResearchSession,
  ResearchResult,
  Annotation,
  SearchFilters,
} from './LegalResearchHub';

export { CitationManager } from './CitationManager';
export type {
  CitationManagerProps,
  Citation,
  CitationGraph,
  CitationFormat,
  CitationType,
  CitationStatus,
} from './CitationManager';

export { KnowledgeBase } from './KnowledgeBase';
export type {
  KnowledgeBaseProps,
  KnowledgeResource,
  ResourceType,
  ResourceCategory,
} from './KnowledgeBase';

export { ResearchMemo } from './ResearchMemo';
export type {
  ResearchMemoProps,
  ResearchMemo as ResearchMemoType,
  MemoSection,
  MemoVersion,
  MemoComment,
  MemoCollaborator,
} from './ResearchMemo';

export { StatutoryMonitor } from './StatutoryMonitor';
export type {
  StatutoryMonitorProps,
  LegislativeUpdate,
  RegulatoryAlert,
  MonitoringRule,
  UpdateType,
  UpdateStatus,
  AlertPriority,
} from './StatutoryMonitor';
