/**
 * @module services/api/data-platform/query-workbench-api
 * @description Query workbench API service
 * Handles SQL query execution, history, and saved queries
 * 
 * @responsibility Execute and manage SQL queries
 */

import { apiClient } from '@/services/infrastructure/apiClient';

/**
 * Query execution result interface
 */
export interface QueryResult {
  success: boolean;
  data: Record<string, unknown>[];
  executionTimeMs: number;
  rowsAffected: number;
  error?: string;
  historyId: string;
}

/**
 * Query history item interface
 */
export interface QueryHistoryItem {
  id: string;
  query: string;
  executionTimeMs?: number;
  rowsAffected?: number;
  successful: boolean;
  error?: string;
  executedAt: string;
}

/**
 * Saved query interface
 */
export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  description?: string;
  tags?: string[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query workbench API service class
 * Provides methods for executing queries and managing query history
 */
export class QueryWorkbenchApiService {
  /**
   * Execute a SQL query
   */
  async executeQuery(query: string): Promise<QueryResult> {
    try {
      return await apiClient.post<QueryResult>('/query-workbench/execute', { query });
    } catch (error) {
      console.error('[QueryWorkbenchApi] Error executing query:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        data: [],
        executionTimeMs: 0,
        rowsAffected: 0,
        error: errorMessage,
        historyId: '',
      };
    }
  }

  /**
   * Explain a SQL query (get execution plan)
   */
  async explainQuery(query: string): Promise<{ success: boolean; plan?: unknown; error?: string }> {
    try {
      return await apiClient.post('/query-workbench/explain', { query });
    } catch (error) {
      console.error('[QueryWorkbenchApi] Error explaining query:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get query execution history
   */
  async getHistory(limit = 100): Promise<QueryHistoryItem[]> {
    try {
      return await apiClient.get<QueryHistoryItem[]>('/query-workbench/history', { limit });
    } catch (error) {
      console.error('[QueryWorkbenchApi] Error fetching history:', error);
      return [];
    }
  }

  /**
   * Get all saved queries
   */
  async getSavedQueries(): Promise<SavedQuery[]> {
    try {
      return await apiClient.get<SavedQuery[]>('/query-workbench/saved');
    } catch (error) {
      console.error('[QueryWorkbenchApi] Error fetching saved queries:', error);
      return [];
    }
  }

  /**
   * Save a query for reuse
   */
  async saveQuery(data: {
    name: string;
    query: string;
    description?: string;
    tags?: string[];
    isShared?: boolean;
  }): Promise<SavedQuery> {
    return await apiClient.post<SavedQuery>('/query-workbench/saved', data);
  }

  /**
   * Delete a saved query
   */
  async deleteSavedQuery(id: string): Promise<void> {
    await apiClient.delete(`/query-workbench/saved/${id}`);
  }
}
