/**
 * Enterprise Research Components
 *
 * Comprehensive legal research and citation management tools
 * for LexiFlow Premium enterprise platform.
 */

export { LegalResearchHub } from "./LegalResearchHub";
export type {
  Annotation,
  LegalResearchHubProps,
  ResearchResult,
  ResearchSession,
} from "./LegalResearchHub";

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
  KnowledgeResource,
  ResourceCategory,
  ResourceType,
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
export type {
  AlertPriority,
  LegislativeUpdate,
  MonitoringRule,
  RegulatoryAlert,
  StatutoryMonitorProps,
  UpdateStatus,
  UpdateType,
} from "./StatutoryMonitor";
