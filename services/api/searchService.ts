/**
 * Search Service
 * Handles global search, advanced search, and search suggestions
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';

export interface SearchResult {
  id: string;
  type: 'case' | 'document' | 'client' | 'party' | 'motion' | 'docket' | 'timeEntry' | 'expense' | 'invoice';
  title: string;
  description?: string;
  highlights?: string[];
  score: number;
  metadata: Record<string, any>;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  took: number;
  aggregations?: SearchAggregations;
}

export interface SearchAggregations {
  byType: Record<string, number>;
  byDate: Array<{ date: string; count: number }>;
  byStatus?: Record<string, number>;
  byCaseType?: Record<string, number>;
}

export interface SearchParams {
  query: string;
  type?: SearchResult['type'] | SearchResult['type'][];
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  highlight?: boolean;
  fuzzy?: boolean;
}

export interface SearchFilters {
  caseId?: string;
  clientId?: string;
  status?: string | string[];
  caseType?: string;
  dateFrom?: string;
  dateTo?: string;
  assignedTo?: string;
  createdBy?: string;
  tags?: string[];
  [key: string]: any;
}

export interface SearchSuggestion {
  text: string;
  type: string;
  score: number;
  category?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query: string;
  filters?: SearchFilters;
  type?: SearchResult['type'][];
  isPublic: boolean;
  createdBy: string;
  createdByName?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Global search across all modules
 */
export async function globalSearch(params: SearchParams): Promise<SearchResponse> {
  try {
    const response = await apiClient.post<SearchResponse>(
      API_ENDPOINTS.SEARCH.GLOBAL,
      params
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Search cases
 */
export async function searchCases(
  query: string,
  filters?: SearchFilters,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse> {
  try {
    const response = await apiClient.post<SearchResponse>(
      API_ENDPOINTS.SEARCH.CASES,
      {
        query,
        filters,
        page,
        limit,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Search documents
 */
export async function searchDocuments(
  query: string,
  filters?: SearchFilters,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse> {
  try {
    const response = await apiClient.post<SearchResponse>(
      API_ENDPOINTS.SEARCH.DOCUMENTS,
      {
        query,
        filters,
        page,
        limit,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Search clients
 */
export async function searchClients(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse> {
  try {
    const response = await apiClient.post<SearchResponse>(
      API_ENDPOINTS.SEARCH.CLIENTS,
      {
        query,
        page,
        limit,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 10
): Promise<SearchSuggestion[]> {
  try {
    const response = await apiClient.get<SearchSuggestion[]>(
      API_ENDPOINTS.SEARCH.SUGGESTIONS,
      {
        params: { query, limit },
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Advanced search with complex filters
 */
export async function advancedSearch(params: {
  queries: Array<{
    field: string;
    value: any;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
    condition?: 'AND' | 'OR';
  }>;
  type?: SearchResult['type'][];
  page?: number;
  limit?: number;
}): Promise<SearchResponse> {
  try {
    const response = await apiClient.post<SearchResponse>(
      `${API_ENDPOINTS.SEARCH.GLOBAL}/advanced`,
      params
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get saved searches
 */
export async function getSavedSearches(): Promise<SavedSearch[]> {
  try {
    const response = await apiClient.get<SavedSearch[]>(
      `${API_ENDPOINTS.SEARCH.GLOBAL}/saved`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Save a search
 */
export async function saveSearch(data: {
  name: string;
  description?: string;
  query: string;
  filters?: SearchFilters;
  type?: SearchResult['type'][];
  isPublic?: boolean;
}): Promise<SavedSearch> {
  try {
    const response = await apiClient.post<SavedSearch>(
      `${API_ENDPOINTS.SEARCH.GLOBAL}/saved`,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update saved search
 */
export async function updateSavedSearch(
  id: string,
  data: Partial<SavedSearch>
): Promise<SavedSearch> {
  try {
    const response = await apiClient.put<SavedSearch>(
      `${API_ENDPOINTS.SEARCH.GLOBAL}/saved/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete saved search
 */
export async function deleteSavedSearch(id: string): Promise<void> {
  try {
    await apiClient.delete(`${API_ENDPOINTS.SEARCH.GLOBAL}/saved/${id}`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Execute saved search
 */
export async function executeSavedSearch(
  id: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse> {
  try {
    const response = await apiClient.post<SearchResponse>(
      `${API_ENDPOINTS.SEARCH.GLOBAL}/saved/${id}/execute`,
      { page, limit }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Search within a specific case
 */
export async function searchInCase(
  caseId: string,
  query: string,
  type?: SearchResult['type'][]
): Promise<SearchResponse> {
  try {
    const response = await apiClient.post<SearchResponse>(
      `${API_ENDPOINTS.SEARCH.GLOBAL}/case/${caseId}`,
      {
        query,
        type,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get recent searches
 */
export async function getRecentSearches(limit: number = 10): Promise<Array<{
  query: string;
  timestamp: Date;
  resultCount: number;
}>> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.SEARCH.GLOBAL}/recent`,
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Clear recent searches
 */
export async function clearRecentSearches(): Promise<void> {
  try {
    await apiClient.delete(`${API_ENDPOINTS.SEARCH.GLOBAL}/recent`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get popular searches
 */
export async function getPopularSearches(limit: number = 10): Promise<Array<{
  query: string;
  count: number;
}>> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.SEARCH.GLOBAL}/popular`,
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Reindex search data
 */
export async function reindexSearch(type?: SearchResult['type']): Promise<{
  success: boolean;
  indexed: number;
}> {
  try {
    const response = await apiClient.post(
      `${API_ENDPOINTS.SEARCH.GLOBAL}/reindex`,
      { type }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  globalSearch,
  searchCases,
  searchDocuments,
  searchClients,
  getSearchSuggestions,
  advancedSearch,
  getSavedSearches,
  saveSearch,
  updateSavedSearch,
  deleteSavedSearch,
  executeSavedSearch,
  searchInCase,
  getRecentSearches,
  clearRecentSearches,
  getPopularSearches,
  reindexSearch,
};
