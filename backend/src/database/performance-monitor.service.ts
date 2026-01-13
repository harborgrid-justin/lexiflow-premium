import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

/**
 * Query Performance Statistics
 */
export interface QueryStats {
  query: string;
  executionTime: number;
  rowsAffected?: number;
  timestamp: Date;
  parameters?: unknown[];
}

/**
 * Slow Query Information
 */
export interface SlowQuery {
  query: string;
  calls: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
}

/**
 * Database Connection Pool Statistics
 */
export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
}

/**
 * Table Statistics
 */
export interface TableStats {
  tableName: string;
  rowCount: number;
  totalSize: string;
  indexSize: string;
  tableSize: string;
}

/**
 * Index Usage Statistics
 */
export interface IndexStats {
  schemaName: string;
  tableName: string;
  indexName: string;
  indexScans: number;
  tuplesRead: number;
  tuplesFetched: number;
}

/**
 * Database Performance Monitor Service
 *
 * Monitors and analyzes database performance including:
 * - Query execution times
 * - Slow query detection
 * - Connection pool monitoring
 * - Table and index statistics
 * - Query plan analysis
 */
/**
 * ╔=================================================================================================================╗
 * ║DATABASEPERFORMANCEMONITOR                                                                                       ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class DatabasePerformanceMonitor {
  private readonly logger = new Logger(DatabasePerformanceMonitor.name);
  private queryStats: QueryStats[] = [];
  private slowQueryThreshold = 1000; // milliseconds
  private maxStoredQueries = 1000;

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Set the slow query threshold in milliseconds
   */
  setSlowQueryThreshold(milliseconds: number): void {
    this.slowQueryThreshold = milliseconds;
    this.logger.log(`Slow query threshold set to ${milliseconds}ms`);
  }

  /**
   * Record a query execution
   */
  recordQuery(
    query: string,
    executionTime: number,
    parameters?: unknown[]
  ): void {
    const stats: QueryStats = {
      query: this.normalizeQuery(query),
      executionTime,
      timestamp: new Date(),
      parameters,
    };

    this.queryStats.push(stats);

    // Keep only recent queries to prevent memory issues
    if (this.queryStats.length > this.maxStoredQueries) {
      this.queryStats.shift();
    }

    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      this.logger.warn(
        `Slow query detected (${executionTime}ms): ${query.substring(0, 200)}...`
      );
    }
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit: number = 10): SlowQuery[] {
    const queryMap = new Map<string, SlowQuery>();

    this.queryStats
      .filter((stat) => stat.executionTime > this.slowQueryThreshold)
      .forEach((stat) => {
        const existing = queryMap.get(stat.query);
        if (existing) {
          existing.calls++;
          existing.totalTime += stat.executionTime;
          existing.avgTime = existing.totalTime / existing.calls;
          existing.minTime = Math.min(existing.minTime, stat.executionTime);
          existing.maxTime = Math.max(existing.maxTime, stat.executionTime);
        } else {
          queryMap.set(stat.query, {
            query: stat.query,
            calls: 1,
            totalTime: stat.executionTime,
            avgTime: stat.executionTime,
            minTime: stat.executionTime,
            maxTime: stat.executionTime,
          });
        }
      });

    return Array.from(queryMap.values())
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }

  /**
   * Get query statistics summary
   */
  getQueryStatsSummary(): {
    totalQueries: number;
    slowQueries: number;
    avgExecutionTime: number;
    maxExecutionTime: number;
    minExecutionTime: number;
  } {
    if (this.queryStats.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        avgExecutionTime: 0,
        maxExecutionTime: 0,
        minExecutionTime: 0,
      };
    }

    const executionTimes = this.queryStats.map((s) => s.executionTime);
    const slowQueries = this.queryStats.filter(
      (s) => s.executionTime > this.slowQueryThreshold
    ).length;

    return {
      totalQueries: this.queryStats.length,
      slowQueries,
      avgExecutionTime:
        executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
      maxExecutionTime: Math.max(...executionTimes),
      minExecutionTime: Math.min(...executionTimes),
    };
  }

  /**
   * Get connection pool statistics (PostgreSQL specific)
   */
  async getPoolStats(): Promise<PoolStats> {
    try {
      const query = `
        SELECT
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) FILTER (WHERE wait_event IS NOT NULL) as waiting_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      interface PoolQueryResult {
        total_connections: string;
        active_connections: string;
        idle_connections: string;
        waiting_connections: string;
      }

      const [result] = await this.dataSource.query<PoolQueryResult[]>(query);
      if (!result) {
        throw new Error("Failed to retrieve pool stats");
      }

      return {
        totalConnections: parseInt(result.total_connections),
        activeConnections: parseInt(result.active_connections),
        idleConnections: parseInt(result.idle_connections),
        waitingConnections: parseInt(result.waiting_connections),
      };
    } catch (error) {
      this.logger.error("Failed to get pool stats", error);
      throw error;
    }
  }

  /**
   * Get table statistics
   */
  async getTableStats(schemaName: string = "public"): Promise<TableStats[]> {
    try {
      const query = `
        SELECT
          schemaname || '.' || tablename AS table_name,
          n_live_tup AS row_count,
          pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
          pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) AS index_size,
          pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size
        FROM pg_stat_user_tables
        WHERE schemaname = $1
        ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
      `;

      interface TableQueryResult {
        table_name: string;
        row_count: string;
        total_size: string;
        index_size: string;
        table_size: string;
      }

      const results = await this.dataSource.query<TableQueryResult[]>(query, [
        schemaName,
      ]);

      return results.map((row) => ({
        tableName: String(row.table_name),
        rowCount: parseInt(String(row.row_count)),
        totalSize: String(row.total_size),
        indexSize: String(row.index_size),
        tableSize: String(row.table_size),
      }));
    } catch (error) {
      this.logger.error("Failed to get table stats", error);
      throw error;
    }
  }

  /**
   * Get index usage statistics
   */
  async getIndexStats(schemaName: string = "public"): Promise<IndexStats[]> {
    try {
      const query = `
        SELECT
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE schemaname = $1
        ORDER BY idx_scan DESC
      `;

      interface IndexQueryResult {
        schemaname: string;
        tablename: string;
        indexname: string;
        idx_scan: string;
        idx_tup_read: string;
        idx_tup_fetch: string;
      }

      const results = await this.dataSource.query<IndexQueryResult[]>(query, [
        schemaName,
      ]);

      return results.map((row) => ({
        schemaName: String(row.schemaname),
        tableName: String(row.tablename),
        indexName: String(row.indexname),
        indexScans: parseInt(String(row.idx_scan)),
        tuplesRead: parseInt(String(row.idx_tup_read)),
        tuplesFetched: parseInt(String(row.idx_tup_fetch)),
      }));
    } catch (error) {
      this.logger.error("Failed to get index stats", error);
      throw error;
    }
  }

  /**
   * Find unused indexes
   */
  async findUnusedIndexes(schemaName: string = "public"): Promise<string[]> {
    try {
      const query = `
        SELECT
          schemaname || '.' || tablename || '.' || indexname AS index_name
        FROM pg_stat_user_indexes
        WHERE schemaname = $1
          AND idx_scan = 0
          AND indexname NOT LIKE '%_pkey'
        ORDER BY pg_relation_size(indexrelid) DESC
      `;

      interface UnusedIndexResult {
        index_name: string;
      }

      const results = await this.dataSource.query<UnusedIndexResult[]>(query, [
        schemaName,
      ]);
      return results.map((row) => String(row.index_name));
    } catch (error) {
      this.logger.error("Failed to find unused indexes", error);
      throw error;
    }
  }

  /**
   * Get query execution plan
   */
  async explainQuery(
    query: string,
    analyze: boolean = false
  ): Promise<Record<string, unknown>[]> {
    try {
      const explainQuery = analyze
        ? `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`
        : `EXPLAIN (FORMAT JSON) ${query}`;

      const result = await this.dataSource.query(explainQuery) as any[];
      return result[0]["QUERY PLAN"] as Record<string, unknown>[];
    } catch (error) {
      this.logger.error("Failed to explain query", error);
      throw error;
    }
  }

  /**
   * Analyze query for missing indexes
   */
  async analyzeQuery(query: string): Promise<{
    executionTime: number;
    plan: Record<string, unknown>[];
    suggestions: string[];
  }> {
    const startTime = Date.now();

    try {
      const plan = await this.explainQuery(query, true);
      const executionTime = Date.now() - startTime;

      const suggestions: string[] = [];

      // Analyze plan for sequential scans
      const planStr = JSON.stringify(plan);
      if (planStr.includes("Seq Scan")) {
        suggestions.push(
          "Query contains sequential scans. Consider adding indexes."
        );
      }

      // Check for full table scans on large tables
      if (planStr.includes("Rows Removed by Filter")) {
        suggestions.push(
          "Query is filtering many rows. Consider adding a more selective index."
        );
      }

      // Check for nested loops on large datasets
      if (planStr.includes("Nested Loop") && planStr.includes("rows=")) {
        suggestions.push(
          "Nested loop detected. Consider optimizing join conditions or adding indexes."
        );
      }

      return {
        executionTime,
        plan,
        suggestions,
      };
    } catch (error) {
      this.logger.error("Failed to analyze query", error);
      throw error;
    }
  }

  /**
   * Get database cache hit ratio
   */
  async getCacheHitRatio(): Promise<number> {
    try {
      const query = `
        SELECT
          sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100 AS cache_hit_ratio
        FROM pg_statio_user_tables
      `;

      const [result] = await this.dataSource.query(query) as [{ cache_hit_ratio: string }];
      return parseFloat(result.cache_hit_ratio) || 0;
    } catch (error) {
      this.logger.error("Failed to get cache hit ratio", error);
      throw error;
    }
  }

  /**
   * Get bloat information for tables
   */
  async getTableBloat(schemaName: string = "public"): Promise<
    Array<{
      tableName: string;
      bloatPercent: number;
      bloatSize: string;
    }>
  > {
    try {
      const query = `
        SELECT
          schemaname || '.' || tablename AS table_name,
          ROUND(CASE WHEN otta=0 OR sml.relpages=0 OR sml.relpages=otta THEN 0.0
            ELSE sml.relpages/otta::numeric END, 1) AS bloat_ratio,
          CASE WHEN relpages < otta THEN 0
            ELSE pg_size_pretty((bs*(sml.relpages-otta)::bigint)::bigint)
          END AS bloat_size
        FROM (
          SELECT
            schemaname, tablename, cc.relpages, bs,
            CEIL((cc.reltuples*((datahdr+ma-
              (CASE WHEN datahdr%ma=0 THEN ma ELSE datahdr%ma END))+nullhdr2+4))/(bs-20::float)) AS otta
          FROM (
            SELECT
              ma,bs,schemaname,tablename,
              (datawidth+(hdr+ma-(case when hdr%ma=0 THEN ma ELSE hdr%ma END)))::numeric AS datahdr,
              (maxfracsum*(nullhdr+ma-(case when nullhdr%ma=0 THEN ma ELSE nullhdr%ma END))) AS nullhdr2
            FROM (
              SELECT
                schemaname, tablename, hdr, ma, bs,
                SUM((1-null_frac)*avg_width) AS datawidth,
                MAX(null_frac) AS maxfracsum,
                hdr+(
                  SELECT 1+count(*)/8
                  FROM pg_stats s2
                  WHERE null_frac<>0 AND s2.schemaname = s.schemaname AND s2.tablename = s.tablename
                ) AS nullhdr
              FROM pg_stats s, (
                SELECT
                  (SELECT current_setting('block_size')::numeric) AS bs,
                  CASE WHEN substring(v,12,3) IN ('8.0','8.1','8.2') THEN 27 ELSE 23 END AS hdr,
                  CASE WHEN v ~ 'mingw32' THEN 8 ELSE 4 END AS ma
                FROM (SELECT version() AS v) AS foo
              ) AS constants
              WHERE schemaname = $1
              GROUP BY 1,2,3,4,5
            ) AS foo
          ) AS rs
          JOIN pg_class cc ON cc.relname = rs.tablename
          JOIN pg_namespace nn ON cc.relnamespace = nn.oid AND nn.nspname = rs.schemaname
        ) AS sml
        WHERE sml.relpages - otta > 0
        ORDER BY bloat_ratio DESC
      `;

      const results = await this.dataSource.query(query, [schemaName]) as BloatResult[];

      interface BloatResult {
        table_name: string;
        bloat_ratio: string;
        bloat_size: string;
      }

      const typedResults = results as BloatResult[];

      return typedResults.map((row) => ({
        tableName: String(row.table_name),
        bloatPercent: parseFloat(String(row.bloat_ratio)),
        bloatSize: String(row.bloat_size),
      }));
    } catch (error) {
      this.logger.error("Failed to get table bloat", error);
      return [];
    }
  }

  /**
   * Get active long-running queries
   */
  async getLongRunningQueries(thresholdSeconds: number = 30): Promise<
    Array<{
      pid: number;
      duration: string;
      query: string;
      state: string;
    }>
  > {
    try {
      const query = `
        SELECT
          pid,
          now() - pg_stat_activity.query_start AS duration,
          query,
          state
        FROM pg_stat_activity
        WHERE state = 'active'
          AND now() - pg_stat_activity.query_start > interval '${thresholdSeconds} seconds'
        ORDER BY duration DESC
      `;

      interface LongRunningQueryResult {
        pid: number;
        duration: string;
        query: string;
        state: string;
      }

      const results =
        await this.dataSource.query<LongRunningQueryResult[]>(query);

      return results.map((row) => ({
        pid: Number(row.pid),
        duration: String(row.duration),
        query: String(row.query),
        state: String(row.state),
      }));
    } catch (error) {
      this.logger.error("Failed to get long running queries", error);
      throw error;
    }
  }

  /**
   * Vacuum analyze a table
   */
  async vacuumAnalyze(tableName: string): Promise<void> {
    try {
      await this.dataSource.query(`VACUUM ANALYZE ${tableName}`);
      this.logger.log(`VACUUM ANALYZE completed for ${tableName}`);
    } catch (error) {
      this.logger.error(`Failed to VACUUM ANALYZE ${tableName}`, error);
      throw error;
    }
  }

  /**
   * Clear query statistics
   */
  clearStats(): void {
    this.queryStats = [];
    this.logger.log("Query statistics cleared");
  }

  /**
   * Normalize query for grouping (remove parameter values)
   */
  private normalizeQuery(query: string): string {
    return query
      .replace(/\$\d+/g, "$?") // Replace $1, $2 with $?
      .replace(/'[^']*'/g, "'?'") // Replace string literals
      .replace(/\d+/g, "?") // Replace numbers
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }
}
