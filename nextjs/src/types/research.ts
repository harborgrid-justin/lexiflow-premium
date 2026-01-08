/**
 * Research Module Types
 * Comprehensive type definitions for the Legal Research module
 *
 * @module types/research
 */

import type { BaseEntity, UserId, CaseId, DocumentId, MetadataRecord } from './primitives';
import type { SearchResult } from './search';

// ==================== Core Research Types ====================

/**
 * Research project status enumeration
 */
export type ResearchProjectStatus =
  | 'draft'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'archived';

/**
 * Legal database source types
 */
export type LegalDatabaseSource =
  | 'westlaw'
  | 'lexisnexis'
  | 'casetext'
  | 'fastcase'
  | 'courtlistener'
  | 'pacer'
  | 'google_scholar'
  | 'internal';

/**
 * Research item type classification
 */
export type ResearchItemType =
  | 'case_law'
  | 'statute'
  | 'regulation'
  | 'secondary_source'
  | 'treatise'
  | 'law_review'
  | 'practice_guide'
  | 'form'
  | 'news'
  | 'blog';

/**
 * Citation validation status
 */
export type CitationStatus =
  | 'valid'
  | 'warning'
  | 'negative'
  | 'overruled'
  | 'distinguished'
  | 'questioned'
  | 'cited'
  | 'unknown';

/**
 * Shepard's signal types for citation analysis
 */
export type ShepardsSignal =
  | 'positive'
  | 'negative'
  | 'caution'
  | 'citing_references'
  | 'neutral';

// ==================== Research Project ====================

/**
 * Research project entity
 * Represents a research project or matter-specific research
 */
export interface ResearchProject extends BaseEntity {
  /** Project title */
  title: string;
  /** Detailed description of research objective */
  description?: string;
  /** Current project status */
  status: ResearchProjectStatus;
  /** User who owns/created the project */
  ownerId: UserId;
  /** Associated case ID if linked to a matter */
  caseId?: CaseId;
  /** Associated matter ID if linked */
  matterId?: string;
  /** Research questions or issues to address */
  researchQuestions: string[];
  /** Target jurisdictions for research */
  jurisdictions: string[];
  /** Practice areas relevant to research */
  practiceAreas: string[];
  /** Due date for completing research */
  dueDate?: string;
  /** Estimated hours for research */
  estimatedHours?: number;
  /** Actual hours spent */
  actualHours?: number;
  /** Priority level (1-5) */
  priority?: number;
  /** Tags for categorization */
  tags?: string[];
  /** Collaborator user IDs */
  collaborators?: UserId[];
  /** Project notes */
  notes?: string;
  /** Additional metadata */
  metadata?: MetadataRecord;
}

/**
 * Create research project DTO
 */
export interface CreateResearchProjectDto {
  title: string;
  description?: string;
  caseId?: CaseId;
  matterId?: string;
  researchQuestions?: string[];
  jurisdictions?: string[];
  practiceAreas?: string[];
  dueDate?: string;
  estimatedHours?: number;
  priority?: number;
  tags?: string[];
  collaborators?: UserId[];
}

/**
 * Update research project DTO
 */
export interface UpdateResearchProjectDto extends Partial<CreateResearchProjectDto> {
  status?: ResearchProjectStatus;
  actualHours?: number;
  notes?: string;
}

// ==================== Research Session ====================

/**
 * Research session entity
 * Tracks individual research sessions and queries
 */
export interface ResearchSessionEntity extends BaseEntity {
  /** Session title or auto-generated name */
  title?: string;
  /** Original search query */
  query: string;
  /** AI-generated or user response */
  response?: string;
  /** User who conducted the research */
  userId: UserId;
  /** Associated project ID */
  projectId?: string;
  /** Search results returned */
  results: ResearchSearchResult[];
  /** Sources consulted */
  sources: LegalDatabaseSource[];
  /** Session duration in seconds */
  duration?: number;
  /** Whether session is bookmarked */
  isBookmarked: boolean;
  /** Session notes */
  notes?: string;
  /** Search filters applied */
  filters?: ResearchSearchFilters;
  /** Timestamp of the session */
  timestamp: string;
}

/**
 * Research search result with legal-specific metadata
 */
export interface ResearchSearchResult extends SearchResult {
  /** Type of legal document */
  itemType: ResearchItemType;
  /** Legal citation string */
  citation?: string;
  /** Court that issued the decision */
  court?: string;
  /** Date of decision/publication */
  decisionDate?: string;
  /** Year of the source */
  year?: number;
  /** Jurisdiction (e.g., "Federal", "California") */
  jurisdiction?: string;
  /** Citation status from Shepard's/KeyCite */
  citationStatus?: CitationStatus;
  /** Shepard's signal indicator */
  shepardsSignal?: ShepardsSignal;
  /** Headnotes or key points */
  headnotes?: string[];
  /** Key numbers or topics */
  topics?: string[];
  /** Source database */
  source: LegalDatabaseSource;
  /** Full text available */
  hasFullText: boolean;
  /** PDF available */
  hasPdf: boolean;
  /** Relevance explanation */
  relevanceExplanation?: string;
}

/**
 * Research search filters
 */
export interface ResearchSearchFilters {
  /** Filter by item types */
  itemTypes?: ResearchItemType[];
  /** Filter by jurisdictions */
  jurisdictions?: string[];
  /** Filter by courts */
  courts?: string[];
  /** Filter by date range (from) */
  dateFrom?: string;
  /** Filter by date range (to) */
  dateTo?: string;
  /** Filter by practice areas */
  practiceAreas?: string[];
  /** Filter by sources */
  sources?: LegalDatabaseSource[];
  /** Only show bookmarked items */
  bookmarkedOnly?: boolean;
  /** Only show items with positive treatment */
  validCitationsOnly?: boolean;
  /** Include secondary sources */
  includeSecondary?: boolean;
  /** Search within specific field */
  searchField?: 'all' | 'title' | 'text' | 'headnotes' | 'citation';
}

// ==================== Saved Searches & Bookmarks ====================

/**
 * Saved search entity
 */
export interface SavedSearch extends BaseEntity {
  /** Search name/title */
  name: string;
  /** Original query string */
  query: string;
  /** User who saved the search */
  userId: UserId;
  /** Associated project ID */
  projectId?: string;
  /** Applied filters */
  filters?: ResearchSearchFilters;
  /** Alert enabled for new results */
  alertEnabled: boolean;
  /** Alert frequency */
  alertFrequency?: 'daily' | 'weekly' | 'monthly';
  /** Last alert sent date */
  lastAlertDate?: string;
  /** Number of times executed */
  executionCount: number;
  /** Last execution date */
  lastExecuted?: string;
  /** Tags for organization */
  tags?: string[];
  /** Notes about this search */
  notes?: string;
}

/**
 * Research bookmark entity
 */
export interface ResearchBookmark extends BaseEntity {
  /** User who created the bookmark */
  userId: UserId;
  /** Associated project ID */
  projectId?: string;
  /** Type of bookmarked item */
  itemType: ResearchItemType;
  /** External item ID (from source) */
  externalId: string;
  /** Item title */
  title: string;
  /** Citation if applicable */
  citation?: string;
  /** Source database */
  source: LegalDatabaseSource;
  /** URL to original source */
  sourceUrl?: string;
  /** User notes/annotations */
  notes?: string;
  /** User highlights from the document */
  highlights?: BookmarkHighlight[];
  /** Tags for organization */
  tags?: string[];
  /** Folder/collection ID */
  folderId?: string;
  /** Citation status at bookmark time */
  citationStatus?: CitationStatus;
}

/**
 * Highlight within a bookmarked document
 */
export interface BookmarkHighlight {
  /** Unique highlight ID */
  id: string;
  /** Highlighted text */
  text: string;
  /** Position in document */
  position?: {
    start: number;
    end: number;
    page?: number;
  };
  /** User annotation for this highlight */
  annotation?: string;
  /** Color of highlight */
  color?: string;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Research folder for organizing bookmarks
 */
export interface ResearchFolder extends BaseEntity {
  /** Folder name */
  name: string;
  /** Folder description */
  description?: string;
  /** User who owns the folder */
  userId: UserId;
  /** Parent folder ID for nesting */
  parentId?: string;
  /** Associated project ID */
  projectId?: string;
  /** Folder color for UI */
  color?: string;
  /** Sort order */
  sortOrder?: number;
  /** Number of items in folder */
  itemCount?: number;
}

// ==================== Citation Checking ====================

/**
 * Citation check request
 */
export interface CitationCheckRequest {
  /** Citations to check (can be multiple) */
  citations: string[];
  /** Check depth level */
  depth?: 'basic' | 'standard' | 'comprehensive';
  /** Include negative treatment details */
  includeNegativeTreatment?: boolean;
  /** Include citing references */
  includeCitingReferences?: boolean;
}

/**
 * Citation check result
 */
export interface CitationCheckResult {
  /** Original citation string */
  citation: string;
  /** Parsed citation components */
  parsed?: ParsedCitation;
  /** Citation status */
  status: CitationStatus;
  /** Shepard's signal */
  signal?: ShepardsSignal;
  /** Case/statute title */
  title?: string;
  /** Court */
  court?: string;
  /** Year */
  year?: number;
  /** Jurisdiction */
  jurisdiction?: string;
  /** Negative treatment details */
  negativeTreatment?: NegativeTreatment[];
  /** Positive treatment details */
  positiveTreatment?: PositiveTreatment[];
  /** Citing references count */
  citingReferencesCount?: number;
  /** Recent citing references */
  recentCitingReferences?: CitingReference[];
  /** Valid Bluebook format */
  bluebookValid: boolean;
  /** Suggested Bluebook format */
  suggestedFormat?: string;
}

/**
 * Parsed citation components
 */
export interface ParsedCitation {
  /** Volume number */
  volume?: string;
  /** Reporter abbreviation */
  reporter?: string;
  /** Page number */
  page?: string;
  /** Pinpoint citation */
  pinpoint?: string;
  /** Court parenthetical */
  court?: string;
  /** Year */
  year?: string;
  /** Parallel citations */
  parallelCitations?: string[];
}

/**
 * Negative treatment information
 */
export interface NegativeTreatment {
  /** Type of negative treatment */
  type: 'overruled' | 'distinguished' | 'questioned' | 'criticized' | 'limited';
  /** Citation of the treating case */
  citation: string;
  /** Title of the treating case */
  title: string;
  /** Year of treatment */
  year: number;
  /** Court */
  court: string;
  /** Brief description */
  description?: string;
}

/**
 * Positive treatment information
 */
export interface PositiveTreatment {
  /** Type of positive treatment */
  type: 'followed' | 'affirmed' | 'cited' | 'explained';
  /** Citation of the treating case */
  citation: string;
  /** Title of the treating case */
  title: string;
  /** Year of treatment */
  year: number;
  /** Court */
  court: string;
}

/**
 * Citing reference for a case
 */
export interface CitingReference {
  /** Citation string */
  citation: string;
  /** Case title */
  title: string;
  /** Court */
  court: string;
  /** Year */
  year: number;
  /** How this reference treats the original */
  treatment: CitationStatus;
  /** Depth of discussion */
  depth?: 'mentioned' | 'discussed' | 'analyzed' | 'quoted';
}

// ==================== Research Notes & Annotations ====================

/**
 * Research note entity
 */
export interface ResearchNote extends BaseEntity {
  /** Note title */
  title?: string;
  /** Note content (supports markdown) */
  content: string;
  /** User who created the note */
  userId: UserId;
  /** Associated project ID */
  projectId?: string;
  /** Associated session ID */
  sessionId?: string;
  /** Associated bookmark ID */
  bookmarkId?: string;
  /** Linked citations */
  linkedCitations?: string[];
  /** Tags for categorization */
  tags?: string[];
  /** Note type/category */
  noteType?: 'general' | 'analysis' | 'summary' | 'question' | 'todo';
  /** Is pinned to top */
  isPinned?: boolean;
}

// ==================== Research Trail/History ====================

/**
 * Research trail entry for tracking research history
 */
export interface ResearchTrailEntry extends BaseEntity {
  /** User ID */
  userId: UserId;
  /** Action type */
  actionType: ResearchActionType;
  /** Associated project ID */
  projectId?: string;
  /** Search query if search action */
  query?: string;
  /** Target item ID (e.g., case ID, bookmark ID) */
  targetId?: string;
  /** Target item type */
  targetType?: string;
  /** Target item title */
  targetTitle?: string;
  /** Source of the action */
  source?: LegalDatabaseSource;
  /** Additional action details */
  details?: Record<string, unknown>;
  /** Timestamp */
  timestamp: string;
}

/**
 * Research action types for trail tracking
 */
export type ResearchActionType =
  | 'search'
  | 'view_case'
  | 'view_statute'
  | 'view_document'
  | 'bookmark'
  | 'unbookmark'
  | 'save_search'
  | 'check_citation'
  | 'export'
  | 'create_note'
  | 'share'
  | 'print';

// ==================== Export Types ====================

/**
 * Research export request
 */
export interface ResearchExportRequest {
  /** Items to export (IDs) */
  itemIds: string[];
  /** Export format */
  format: 'pdf' | 'docx' | 'rtf' | 'txt' | 'csv';
  /** Include annotations */
  includeAnnotations?: boolean;
  /** Include citations */
  includeCitations?: boolean;
  /** Include table of authorities */
  includeTableOfAuthorities?: boolean;
  /** Export template ID */
  templateId?: string;
  /** Destination (download or document management) */
  destination?: 'download' | 'documents';
  /** Target document ID if saving to documents */
  targetDocumentId?: DocumentId;
}

/**
 * Research export result
 */
export interface ResearchExportResult {
  /** Export job ID */
  jobId: string;
  /** Export status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Download URL when completed */
  downloadUrl?: string;
  /** Created document ID if saved to documents */
  documentId?: DocumentId;
  /** Error message if failed */
  error?: string;
}

// ==================== Statistics & Analytics ====================

/**
 * Research statistics for dashboard
 */
export interface ResearchStatistics {
  /** Total research projects */
  totalProjects: number;
  /** Active projects */
  activeProjects: number;
  /** Total search sessions */
  totalSessions: number;
  /** Sessions this week */
  sessionsThisWeek: number;
  /** Total bookmarks */
  totalBookmarks: number;
  /** Total saved searches */
  totalSavedSearches: number;
  /** Total research hours */
  totalHours: number;
  /** Most searched topics */
  topTopics: Array<{ topic: string; count: number }>;
  /** Most used sources */
  topSources: Array<{ source: LegalDatabaseSource; count: number }>;
  /** Recent activity count */
  recentActivityCount: number;
}

// ==================== API Response Types ====================

/**
 * Paginated research results response
 */
export interface ResearchSearchResponse {
  /** Search results */
  results: ResearchSearchResult[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  limit: number;
  /** Total pages */
  totalPages: number;
  /** Query execution time (ms) */
  executionTime?: number;
  /** Suggested alternative queries */
  suggestedQueries?: string[];
  /** Related topics */
  relatedTopics?: string[];
}

/**
 * Research dashboard data
 */
export interface ResearchDashboardData {
  /** Statistics */
  statistics: ResearchStatistics;
  /** Recent projects */
  recentProjects: ResearchProject[];
  /** Recent sessions */
  recentSessions: ResearchSessionEntity[];
  /** Recent bookmarks */
  recentBookmarks: ResearchBookmark[];
  /** Pending alerts */
  pendingAlerts: SavedSearch[];
}
