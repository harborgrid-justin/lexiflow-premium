/**
 * +---------------------------------------------------------------------------+
 * �                     LEXIFLOW SEARCH DOMAIN SERVICE                        �
 * �                  Enterprise Search & Indexing Layer v2.0                  �
 * �                       PhD-Level Systems Architecture                      �
 * +---------------------------------------------------------------------------+
 * 
 * @module services/domain/SearchDomain
 * @architecture Backend-First Full-Text Search with Elasticsearch
 * @author LexiFlow Engineering Team
 * @since 2025-12-22
 * @status PRODUCTION READY
 * 
 * Provides global search across all entities with backend-powered indexing
 * and relevance scoring.
 */

import { analyticsApi } from '@/api/domains/analytics.api';
import { delay } from '@/utils/async';
import { isBackendApiEnabled } from '@/api';
import { apiClient } from '@/services/infrastructure/apiClient';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  score: number;
  metadata?: unknown;
}

const RECENT_SEARCHES_KEY = 'lexiflow_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const SearchService = {
  getAll: async () => [], // Not applicable for search service
  getById: async (id: string) => null,
  add: async (item: unknown) => item,
  update: async (id: string, updates: unknown) => updates,
  delete: async (id: string) => true,
  
  /**
   * Global search across all entities using backend Elasticsearch
   * 
   * @param query - Search query string
   * @param filters - Optional filters for entity types and case context
   * @returns Promise<SearchResult[]> - Ranked search results
   */
  search: async (query: string, filters?: { types?: string[]; caseId?: string }): Promise<SearchResult[]> => {
    if (isBackendApiEnabled()) {
      try {
        const params: Record<string, any> = { q: query };
        if (filters?.types) params.types = filters.types.join(',');
        if (filters?.caseId) params.caseId = filters.caseId;

        return await apiClient.get<SearchResult[]>('/search', params);
      } catch (error) {
        console.error('[SearchService.search] Backend error:', error);
      }
    }

    // Fallback: Return empty results when backend unavailable
    console.warn('[SearchService] Backend search unavailable, returning empty results');
    return [];
  },
  
  searchGlobal: async (query: string): Promise<SearchResult[]> => {
    // Search across all entity types
    return SearchService.search(query);
  },
  
  getRecentSearches: async (): Promise<string[]> => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  
  saveSearch: async (query: string): Promise<boolean> => {
    try {
      const recent = await SearchService.getRecentSearches();
      const updated = [query, ...recent.filter(q => q !== query)].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },
  
  indexDocument: async (documentId: string): Promise<boolean> => {
    if (isBackendApiEnabled()) {
      try {
        await apiClient.post(`/search/index/document/${documentId}`, {});
        console.log(`[SearchService] Document ${documentId} indexed successfully`);
        return true;
      } catch (error) {
        console.error('[SearchService.indexDocument] Backend error:', error);
        return false;
      }
    }
    
    console.warn('[SearchService] Backend indexing unavailable');
    return false;
  },
};
