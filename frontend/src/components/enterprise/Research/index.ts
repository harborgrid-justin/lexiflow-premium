/**
 * Enterprise Research Components
 *
 * Comprehensive legal research and citation management tools
 * for LexiFlow Premium enterprise platform.
 */

export { LegalResearchHub } from "./LegalResearchHub";
export type { LegalResearchHubProps } from "./LegalResearchHub";

export { CitationManager } from "./CitationManager";
export type {
  Citation,
  CitationFormat,
  CitationGraph,
  CitationManagerProps,
  CitationStatus,
  CitationType,
} from "./CitationManager";

export { KnowledgeBase } from "./KnowledgeBase";
export type {
  KnowledgeBaseProps,
  ResourceCategory,
  SearchFilters,
} from "./KnowledgeBase";

export { ResearchMemo } from "./ResearchMemo";
export type {
  MemoCollaborator,
  MemoComment,
  MemoSection,
  MemoVersion,
  ResearchMemoProps,
  ResearchMemo as ResearchMemoType,
} from "./ResearchMemo";

export { StatutoryMonitor } from "./StatutoryMonitor";
export type { AlertPriority, StatutoryMonitorProps } from "./StatutoryMonitor";
