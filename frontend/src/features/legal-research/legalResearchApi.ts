import { apiClient } from '@/api/client';

/**
 * Legal Research API Client
 * Handles all API calls for the legal research feature
 */

// Types
export interface CaseLaw {
  id: string;
  citation: string;
  title: string;
  court: string;
  decisionDate: string;
  summary?: string;
  fullText: string;
  jurisdiction: string;
  opinionAuthor?: string;
  vote?: string;
  headnotes?: string[];
  keyNumber?: string;
  topics?: string[];
  isBinding: boolean;
  citationCount: number;
  treatmentSignal?: string;
  metadata?: Record<string, unknown>;
  sourceUrl?: string;
}

export interface Statute {
  id: string;
  code: string;
  section: string;
  title: string;
  text: string;
  jurisdiction: string;
  state?: string;
  type: string;
  effectiveDate?: string;
  lastAmended?: string;
  isActive: boolean;
  sunsetDate?: string;
  crossReferences?: string[];
  topics?: string[];
  legislativeHistory?: string;
  notes?: string;
  chapter?: string;
  subchapter?: string;
  metadata?: Record<string, unknown>;
  sourceUrl?: string;
  citationCount: number;
}

export interface SearchResult {
  id: string;
  type: 'case_law' | 'statute';
  citation: string;
  title: string;
  snippet: string;
  relevanceScore: number;
  metadata?: Record<string, unknown>;
}

export interface CombinedSearchResult {
  caseLaw: SearchResult[];
  statutes: SearchResult[];
  totalResults: number;
  executionTimeMs: number;
  queryId?: string;
}

export interface CitationAnalysis {
  caseId: string;
  citation: string;
  title: string;
  totalCitations: number;
  positiveCitations: number;
  negativeCitations: number;
  neutralCitations: number;
  treatmentSignal: 'red_flag' | 'yellow_flag' | 'blue_a' | 'green_c' | 'orange_q' | 'neutral';
  isStillGoodLaw: boolean;
  criticalTreatments: CitationLink[];
  recentTreatments: CitationLink[];
  citationHistory: {
    year: number;
    count: number;
  }[];
}

export interface CitationLink {
  id: string;
  sourceCaseId: string;
  targetCaseId: string;
  treatment: string;
  signal?: string;
  citationDate: string;
  contextSnippet?: string;
  pageNumber?: number;
  isNegativeTreatment: boolean;
  citationWeight?: number;
  legalTopic?: string;
  keyNumber?: string;
  isCritical: boolean;
  opinionType?: string;
  sourceCase?: CaseLaw;
  targetCase?: CaseLaw;
}

export interface ResearchQuery {
  id: string;
  userId: string;
  query: string;
  queryType: 'case_law' | 'statute' | 'combined' | 'citation_analysis';
  filters?: Record<string, unknown>;
  results: SearchResult[];
  resultCount: number;
  status: string;
  timestamp: string;
  executionTimeMs?: number;
  notes?: string;
  isBookmarked: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ResearchHistoryStats {
  totalQueries: number;
  totalBookmarked: number;
  averageExecutionTime: number;
  queryTypeDistribution: {
    type: string;
    count: number;
  }[];
  recentQueries: ResearchQuery[];
  topTopics: string[];
}

// API Methods
export const legalResearchApi = {
  /**
   * Perform combined search across case law and statutes
   */
  async search(params: {
    query: string;
    searchType?: 'all' | 'case_law' | 'statute';
    caseLawFilters?: Record<string, unknown>;
    statuteFilters?: Record<string, unknown>;
    limit?: number;
    offset?: number;
    saveToHistory?: boolean;
  }): Promise<CombinedSearchResult> {
    const response = await apiClient.post('/legal-research/search', params);
    return response.data;
  },

  /**
   * Search case law with advanced filters
   */
  async searchCaseLaw(params: {
    query?: string;
    jurisdiction?: string[];
    court?: string[];
    dateFrom?: string;
    dateTo?: string;
    topics?: string[];
    keyNumber?: string;
    isBinding?: boolean;
    sortBy?: 'relevance' | 'date' | 'citations';
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  }): Promise<{
    cases: CaseLaw[];
    total: number;
    page: number;
    pageSize: number;
    executionTimeMs: number;
  }> {
    const response = await apiClient.post('/legal-research/case-law/search', params);
    return response.data;
  },

  /**
   * Get case law by ID
   */
  async getCaseLawById(id: string): Promise<CaseLaw> {
    const response = await apiClient.get(`/legal-research/case-law/${id}`);
    return response.data;
  },

  /**
   * Get case law by citation
   */
  async getCaseLawByCitation(citation: string): Promise<CaseLaw> {
    const response = await apiClient.get(`/legal-research/case-law/citation/${encodeURIComponent(citation)}`);
    return response.data;
  },

  /**
   * Get comprehensive citation analysis (Shepard's-style)
   */
  async getCitationAnalysis(caseId: string): Promise<CitationAnalysis> {
    const response = await apiClient.get(`/legal-research/case-law/${caseId}/citation-analysis`);
    return response.data;
  },

  /**
   * Get cases citing this case
   */
  async getCitingCases(caseId: string, limit = 50): Promise<CitationLink[]> {
    const response = await apiClient.get(`/legal-research/case-law/${caseId}/citing-cases`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get cases cited by this case
   */
  async getCitedCases(caseId: string, limit = 50): Promise<CitationLink[]> {
    const response = await apiClient.get(`/legal-research/case-law/${caseId}/cited-cases`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get similar cases
   */
  async getSimilarCases(caseId: string, limit = 10): Promise<CaseLaw[]> {
    const response = await apiClient.get(`/legal-research/case-law/${caseId}/similar`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get most cited cases
   */
  async getMostCitedCases(jurisdiction?: string, limit = 100): Promise<CaseLaw[]> {
    const response = await apiClient.get('/legal-research/case-law/trending/most-cited', {
      params: { jurisdiction, limit },
    });
    return response.data;
  },

  /**
   * Search statutes
   */
  async searchStatutes(params: {
    query?: string;
    jurisdiction?: string[];
    type?: string[];
    state?: string;
    code?: string;
    section?: string;
    topics?: string[];
    isActive?: boolean;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: 'relevance' | 'date' | 'citations';
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  }): Promise<{
    statutes: Statute[];
    total: number;
    page: number;
    pageSize: number;
    executionTimeMs: number;
  }> {
    const response = await apiClient.post('/legal-research/statutes/search', params);
    return response.data;
  },

  /**
   * Get statute by ID
   */
  async getStatuteById(id: string): Promise<Statute> {
    const response = await apiClient.get(`/legal-research/statutes/${id}`);
    return response.data;
  },

  /**
   * Get statute by code and section
   */
  async getStatuteByCodeSection(code: string, section: string): Promise<Statute> {
    const response = await apiClient.get(`/legal-research/statutes/code/${encodeURIComponent(code)}/section/${encodeURIComponent(section)}`);
    return response.data;
  },

  /**
   * Get statute citation information
   */
  async getStatuteCitationInfo(statuteId: string): Promise<{
    statute: Statute;
    citationCount: number;
    recentCitations: number;
    relatedStatutes: Statute[];
    crossReferences: string[];
  }> {
    const response = await apiClient.get(`/legal-research/statutes/${statuteId}/citations`);
    return response.data;
  },

  /**
   * Get related statutes
   */
  async getRelatedStatutes(statuteId: string, limit = 10): Promise<Statute[]> {
    const response = await apiClient.get(`/legal-research/statutes/${statuteId}/related`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get most cited statutes
   */
  async getMostCitedStatutes(jurisdiction?: string, limit = 100): Promise<Statute[]> {
    const response = await apiClient.get('/legal-research/statutes/trending/most-cited', {
      params: { jurisdiction, limit },
    });
    return response.data;
  },

  /**
   * Search by citation
   */
  async searchByCitation(citation: string): Promise<CombinedSearchResult> {
    const response = await apiClient.get(`/legal-research/citation/${encodeURIComponent(citation)}`);
    return response.data;
  },

  /**
   * Parse citation
   */
  async parseCitation(citation: string): Promise<{
    fullCitation: string;
    caseName?: string;
    volume?: string;
    reporter?: string;
    page?: string;
    court?: string;
    year?: number;
    pincite?: string;
    type: 'case' | 'statute' | 'unknown';
    isValid: boolean;
    errors?: string[];
  }> {
    const response = await apiClient.post('/legal-research/citation/parse', { citation });
    return response.data;
  },

  /**
   * Extract citations from text
   */
  async extractCitations(text: string, analyze = false): Promise<{
    citations?: unknown[];
    total?: number;
    totalCitations?: number;
    foundCitations?: number;
    results?: unknown[];
  }> {
    const response = await apiClient.post('/legal-research/citation/extract', { text, analyze });
    return response.data;
  },

  /**
   * Get research recommendations
   */
  async getResearchRecommendations(
    type: 'case_law' | 'statute',
    id: string,
    limit = 10,
  ): Promise<{
    similarCases?: CaseLaw[];
    citingCases?: CitationLink[];
    citedCases?: CitationLink[];
    relatedStatutes?: Statute[];
    crossReferences?: Statute[];
  }> {
    const response = await apiClient.get(`/legal-research/recommendations/${type}/${id}`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get user research history
   */
  async getResearchHistory(limit = 50, offset = 0): Promise<{
    queries: ResearchQuery[];
    total: number;
  }> {
    const response = await apiClient.get('/legal-research/history', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Get research history statistics
   */
  async getResearchStats(): Promise<ResearchHistoryStats> {
    const response = await apiClient.get('/legal-research/history/stats');
    return response.data;
  },

  /**
   * Get bookmarked queries
   */
  async getBookmarkedQueries(limit = 50): Promise<ResearchQuery[]> {
    const response = await apiClient.get('/legal-research/history/bookmarks', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Update research query
   */
  async updateResearchQuery(
    queryId: string,
    updates: {
      notes?: string;
      isBookmarked?: boolean;
      tags?: string[];
    },
  ): Promise<ResearchQuery> {
    const response = await apiClient.patch(`/legal-research/history/${queryId}`, updates);
    return response.data;
  },

  /**
   * Delete research query
   */
  async deleteResearchQuery(queryId: string): Promise<void> {
    await apiClient.delete(`/legal-research/history/${queryId}`);
  },

  /**
   * Export research history
   */
  async exportResearchHistory(): Promise<ResearchQuery[]> {
    const response = await apiClient.get('/legal-research/history/export');
    return response.data;
  },

  /**
   * Get trending research
   */
  async getTrendingResearch(limit = 10): Promise<{
    mostCitedCases: CaseLaw[];
    mostCitedStatutes: Statute[];
  }> {
    const response = await apiClient.get('/legal-research/trending', {
      params: { limit },
    });
    return response.data;
  },
};
