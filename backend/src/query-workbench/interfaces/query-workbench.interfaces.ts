import { QueryRunner } from 'typeorm';

/**
 * Generic database row - represents any row returned from a query
 */
export interface QueryResultRow {
  [key: string]: string | number | boolean | Date | null | undefined | Record<string, unknown>;
}

/**
 * Query execution result from the service
 */
export interface QueryExecutionResult {
  success: boolean;
  data: QueryResultRow[] | null;
  executionTimeMs: number;
  rowsAffected: number;
  error: string | null;
  historyId: string;
}

/**
 * Query execution result with caching info (optimized service)
 */
export interface OptimizedQueryExecutionResult {
  data: QueryResultRow[];
  rowCount: number;
  duration: number;
  cached: boolean;
}

/**
 * Query plan result from EXPLAIN
 */
export interface QueryPlan {
  'QUERY PLAN': Array<{
    Plan?: {
      'Node Type'?: string;
      'Startup Cost'?: number;
      'Total Cost'?: number;
      'Plan Rows'?: number;
      'Plan Width'?: number;
      [key: string]: string | number | boolean | undefined | Record<string, unknown>;
    };
    'Planning Time'?: number;
    'Execution Time'?: number;
    [key: string]: string | number | boolean | undefined | Record<string, unknown> | Array<unknown>;
  }>;
}

/**
 * Explain query result
 */
export interface ExplainQueryResult {
  success: boolean;
  plan?: QueryPlan;
  error?: string;
}

/**
 * Request user object
 */
export interface RequestUser {
  id: string;
  email?: string;
  role?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Authenticated request
 */
export interface AuthenticatedRequest {
  user?: RequestUser;
  [key: string]: unknown;
}

/**
 * Result cache entry
 */
export interface ResultCacheEntry {
  data: QueryResultRow[];
  timestamp: number;
  rowCount: number;
}

/**
 * Query plan cache entry
 */
export interface QueryPlanCacheEntry {
  plan: QueryPlan;
  timestamp: number;
}

/**
 * Active query info
 */
export interface ActiveQueryInfo {
  queryRunner: QueryRunner;
  startTime: number;
}

/**
 * Query history entry (in-memory)
 */
export interface QueryHistoryEntry {
  query: string;
  timestamp: number;
  duration: number;
  rows: number;
}

/**
 * Active query status
 */
export interface ActiveQueryStatus {
  id: string;
  startTime: number;
  duration: number;
}

/**
 * Batch query input
 */
export interface BatchQueryInput {
  sql: string;
  params?: (string | number | boolean | null)[];
}

/**
 * Batch query result
 */
export interface BatchQueryResult {
  success: boolean;
  data?: OptimizedQueryExecutionResult;
  error?: string;
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  resultsCached: number;
  historyEntries: number;
  plansCached: number;
  activeQueries: number;
  memoryUsage: {
    heapUsedMB: string;
    heapTotalMB: string;
  };
}
