/**
 * Legal Research Feature
 * Comprehensive legal research engine for LexiFlow
 *
 * Features:
 * - Case law search with advanced filters
 * - Statute search and cross-referencing
 * - Shepard's-style citation analysis
 * - Citation network visualization
 * - Research history and bookmarking
 * - Bluebook citation parsing
 */

// API Client
export { legalResearchApi } from './legalResearchApi';

// Components
export { ResearchSearchBar } from './components/ResearchSearchBar';
export { CaseLawViewer } from './components/CaseLawViewer';
export { StatuteViewer } from './components/StatuteViewer';
export { CitationGraph } from './components/CitationGraph';
export { ResearchWorkspace } from './components/ResearchWorkspace';

// Types
export type {
  CaseLaw,
  Statute,
  SearchResult,
  CombinedSearchResult,
  CitationAnalysis,
  CitationLink,
  ResearchQuery,
  ResearchHistoryStats,
} from './legalResearchApi';
