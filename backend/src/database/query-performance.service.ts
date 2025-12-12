import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthCheckService } from './health-check.service';

/**
 * Query Performance Logging Service for LexiFlow AI Legal Suite
 *
 * Provides intelligent query performance tracking:
 * - Automatic slow query detection
 * - Query execution timing
 * - Query plan analysis
 * - Performance recommendations
 * - Query statistics aggregation
 * - N+1 query detection
 */

export interface QueryLog {
  id: string;
  query: string;
  parameters?: any[];
  duration: number;
  timestamp: Date;
  stackTrace?: string;
  queryPlan?: any;
  rowsAffected?: number;
  warning?: string;
}

export interface QueryStatistics {
  totalQueries: number;
  slowQueries: number;
  fastQueries: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  queriesByType: Record<string, number>;
  mostFrequentQueries: Array<{ query: string; count: number; avgDuration: number }>;
}

export interface QueryRecommendation {
  query: string;
  issue: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  estimatedImpact: string;
}

@Injectable()
export class QueryPerformanceService {
  private queryLog: QueryLog[] = [];
  private queryFrequency: Map<string, { count: number; totalDuration: number }> = new Map();
  private readonly MAX_LOG_SIZE = 1000;
  private readonly SLOW_QUERY_THRESHOLD = 1000; // ms
  private readonly VERY_SLOW_QUERY_THRESHOLD = 5000; // ms

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private healthCheckService: HealthCheckService,
  ) {
    this.setupQueryLogging();
  }

  /**
   * Set up automatic query logging with TypeORM
   */
  private setupQueryLogging(): void {
    // Enable query logging in TypeORM
    if (this.dataSource.options.logging) {
      console.log('Query Performance: Query logging is enabled');
    }
  }

  /**
   * Log a query execution
   */
  logQuery(
    query: string,
    duration: number,
    parameters?: any[],
    rowsAffected?: number,
    stackTrace?: string,
  ): void {
    const queryLog: QueryLog = {
      id: this.generateLogId(),
      query: this.sanitizeQuery(query),
      parameters,
      duration,
      timestamp: new Date(),
      stackTrace,
      rowsAffected,
    };

    // Add warning for slow queries
    if (duration > this.VERY_SLOW_QUERY_THRESHOLD) {
      queryLog.warning = `CRITICAL: Query took ${duration}ms`;
      console.error(`🐌 VERY SLOW QUERY (${duration}ms):`, query.substring(0, 100));
    } else if (duration > this.SLOW_QUERY_THRESHOLD) {
      queryLog.warning = `WARNING: Query took ${duration}ms`;
      console.warn(`⚠️ SLOW QUERY (${duration}ms):`, query.substring(0, 100));
    }

    // Log to health check service if slow
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      this.healthCheckService.logSlowQuery(query, duration);
    }

    // Update frequency map
    this.updateQueryFrequency(query, duration);

    // Add to log
    this.queryLog.unshift(queryLog);

    // Maintain log size
    if (this.queryLog.length > this.MAX_LOG_SIZE) {
      this.queryLog = this.queryLog.slice(0, this.MAX_LOG_SIZE);
    }
  }

  /**
   * Execute query with performance tracking
   */
  async executeWithTracking<T>(
    queryFn: () => Promise<T>,
    queryName: string = 'custom',
  ): Promise<T> {
    const startTime = Date.now();
    let error: Error | null = null;

    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      this.logQuery(queryName, duration);

      return result;

    } catch (err) {
      error = err as Error;
      const duration = Date.now() - startTime;

      this.logQuery(queryName, duration);
      console.error(`Query failed after ${duration}ms:`, error.message);

      throw error;
    }
  }

  /**
   * Get query execution plan
   */
  async getQueryPlan(query: string): Promise<any> {
    try {
      // Remove trailing semicolon if present
      const cleanQuery = query.trim().replace(/;$/, '');

      const result = await this.dataSource.query(`EXPLAIN (FORMAT JSON, ANALYZE) ${cleanQuery}`);
      return result[0]['QUERY PLAN'][0];

    } catch (error) {
      console.error('Query Performance: Error getting query plan:', error.message);
      return null;
    }
  }

  /**
   * Analyze query for performance issues
   */
  async analyzeQuery(query: string): Promise<QueryRecommendation[]> {
    const recommendations: QueryRecommendation[] = [];

    try {
      const plan = await this.getQueryPlan(query);

      if (!plan) {
        return recommendations;
      }

      // Check for sequential scans on large tables
      if (this.hasSequentialScan(plan)) {
        recommendations.push({
          query: query.substring(0, 100),
          issue: 'Sequential scan detected',
          recommendation: 'Consider adding an index to improve query performance',
          severity: 'high',
          estimatedImpact: 'Could improve query speed by 10-100x',
        });
      }

      // Check for missing indexes
      if (this.hasMissingIndex(plan)) {
        recommendations.push({
          query: query.substring(0, 100),
          issue: 'Query may benefit from additional indexes',
          recommendation: 'Analyze the WHERE and JOIN clauses to identify indexing opportunities',
          severity: 'medium',
          estimatedImpact: 'Could improve query speed by 2-10x',
        });
      }

      // Check for expensive sorts
      if (this.hasExpensiveSort(plan)) {
        recommendations.push({
          query: query.substring(0, 100),
          issue: 'Expensive sort operation detected',
          recommendation: 'Consider adding an index on the sorted columns or limiting result set',
          severity: 'medium',
          estimatedImpact: 'Could reduce memory usage and improve speed',
        });
      }

      // Check for high row estimates vs actual
      if (this.hasEstimationError(plan)) {
        recommendations.push({
          query: query.substring(0, 100),
          issue: 'Query planner estimation error detected',
          recommendation: 'Run ANALYZE on involved tables to update statistics',
          severity: 'low',
          estimatedImpact: 'Could improve query planning accuracy',
        });
      }

    } catch (error) {
      console.error('Query Performance: Error analyzing query:', error.message);
    }

    return recommendations;
  }

  /**
   * Get query statistics
   */
  getStatistics(): QueryStatistics {
    if (this.queryLog.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        fastQueries: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        queriesByType: {},
        mostFrequentQueries: [],
      };
    }

    const durations = this.queryLog.map(log => log.duration);
    const slowQueries = this.queryLog.filter(log => log.duration > this.SLOW_QUERY_THRESHOLD);
    const fastQueries = this.queryLog.filter(log => log.duration <= this.SLOW_QUERY_THRESHOLD);

    // Analyze query types
    const queriesByType: Record<string, number> = {};
    this.queryLog.forEach(log => {
      const type = this.getQueryType(log.query);
      queriesByType[type] = (queriesByType[type] || 0) + 1;
    });

    // Get most frequent queries
    const frequentQueries = Array.from(this.queryFrequency.entries())
      .map(([query, stats]) => ({
        query: query.substring(0, 100),
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalQueries: this.queryLog.length,
      slowQueries: slowQueries.length,
      fastQueries: fastQueries.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      queriesByType,
      mostFrequentQueries: frequentQueries,
    };
  }

  /**
   * Get recent queries
   */
  getRecentQueries(limit: number = 50): QueryLog[] {
    return this.queryLog.slice(0, limit);
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit: number = 50): QueryLog[] {
    return this.queryLog
      .filter(log => log.duration > this.SLOW_QUERY_THRESHOLD)
      .slice(0, limit);
  }

  /**
   * Clear query log
   */
  clearLog(): void {
    this.queryLog = [];
    this.queryFrequency.clear();
    console.log('Query Performance: Log cleared');
  }

  /**
   * Detect N+1 queries
   */
  detectNPlusOneQueries(): Array<{ pattern: string; count: number; avgDuration: number }> {
    const patterns: Map<string, { count: number; totalDuration: number }> = new Map();

    // Look for similar queries executed multiple times in short succession
    for (let i = 0; i < this.queryLog.length - 1; i++) {
      const current = this.queryLog[i];
      const next = this.queryLog[i + 1];

      const timeDiff = current.timestamp.getTime() - next.timestamp.getTime();

      // If queries are within 100ms and similar, it might be N+1
      if (timeDiff < 100) {
        const pattern = this.extractQueryPattern(current.query);
        const existing = patterns.get(pattern) || { count: 0, totalDuration: 0 };

        patterns.set(pattern, {
          count: existing.count + 1,
          totalDuration: existing.totalDuration + current.duration,
        });
      }
    }

    // Return patterns that occurred more than 5 times
    return Array.from(patterns.entries())
      .filter(([_, stats]) => stats.count > 5)
      .map(([pattern, stats]) => ({
        pattern: pattern.substring(0, 100),
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): any {
    const stats = this.getStatistics();
    const nPlusOne = this.detectNPlusOneQueries();
    const slowQueries = this.getSlowQueries(10);

    return {
      summary: {
        totalQueries: stats.totalQueries,
        avgDuration: Math.round(stats.avgDuration * 100) / 100,
        slowQueryPercentage: Math.round((stats.slowQueries / stats.totalQueries) * 100 * 100) / 100,
      },
      statistics: stats,
      nPlusOneDetection: nPlusOne,
      topSlowQueries: slowQueries.map(log => ({
        query: log.query.substring(0, 150),
        duration: log.duration,
        timestamp: log.timestamp,
        warning: log.warning,
      })),
      timestamp: new Date(),
    };
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private generateLogId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private sanitizeQuery(query: string): string {
    // Remove excessive whitespace and newlines
    return query.replace(/\s+/g, ' ').trim();
  }

  private updateQueryFrequency(query: string, duration: number): void {
    const pattern = this.extractQueryPattern(query);
    const existing = this.queryFrequency.get(pattern) || { count: 0, totalDuration: 0 };

    this.queryFrequency.set(pattern, {
      count: existing.count + 1,
      totalDuration: existing.totalDuration + duration,
    });
  }

  private extractQueryPattern(query: string): string {
    // Remove parameter values to get query pattern
    return query
      .replace(/\b\d+\b/g, '?')                    // Numbers
      .replace(/'[^']*'/g, '?')                     // String literals
      .replace(/\$\d+/g, '?')                       // PostgreSQL parameters
      .substring(0, 200);
  }

  private getQueryType(query: string): string {
    const upperQuery = query.trim().toUpperCase();

    if (upperQuery.startsWith('SELECT')) return 'SELECT';
    if (upperQuery.startsWith('INSERT')) return 'INSERT';
    if (upperQuery.startsWith('UPDATE')) return 'UPDATE';
    if (upperQuery.startsWith('DELETE')) return 'DELETE';
    if (upperQuery.startsWith('CREATE')) return 'CREATE';
    if (upperQuery.startsWith('ALTER')) return 'ALTER';
    if (upperQuery.startsWith('DROP')) return 'DROP';

    return 'OTHER';
  }

  private hasSequentialScan(plan: any): boolean {
    if (!plan) return false;

    if (plan['Node Type'] === 'Seq Scan') {
      return true;
    }

    if (plan.Plans) {
      return plan.Plans.some((p: any) => this.hasSequentialScan(p));
    }

    return false;
  }

  private hasMissingIndex(plan: any): boolean {
    if (!plan) return false;

    // Check for index scan opportunities that are using sequential scans
    if (plan['Node Type'] === 'Seq Scan' && plan['Relation Name']) {
      const rowsEstimate = plan['Plan Rows'] || 0;
      return rowsEstimate > 1000; // Heuristic: large table scan might benefit from index
    }

    if (plan.Plans) {
      return plan.Plans.some((p: any) => this.hasMissingIndex(p));
    }

    return false;
  }

  private hasExpensiveSort(plan: any): boolean {
    if (!plan) return false;

    if (plan['Node Type'] === 'Sort') {
      const rows = plan['Actual Rows'] || plan['Plan Rows'] || 0;
      return rows > 10000; // Heuristic: sorting many rows is expensive
    }

    if (plan.Plans) {
      return plan.Plans.some((p: any) => this.hasExpensiveSort(p));
    }

    return false;
  }

  private hasEstimationError(plan: any): boolean {
    if (!plan) return false;

    const estimated = plan['Plan Rows'] || 0;
    const actual = plan['Actual Rows'] || 0;

    if (estimated > 0 && actual > 0) {
      const ratio = Math.max(estimated, actual) / Math.min(estimated, actual);
      // If estimate is off by more than 10x, there's a problem
      return ratio > 10;
    }

    if (plan.Plans) {
      return plan.Plans.some((p: any) => this.hasEstimationError(p));
    }

    return false;
  }
}
