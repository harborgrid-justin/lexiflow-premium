import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { CacheStrategyService } from './cache.strategy.service';

/**
 * Query Analysis Result
 */
export interface QueryAnalysis {
  sql: string;
  parameters: any[];
  estimatedCost: number;
  warnings: QueryWarning[];
  recommendations: string[];
  hasNPlusOne: boolean;
  shouldCache: boolean;
  suggestedIndexes: string[];
}

/**
 * Query Warning
 */
export interface QueryWarning {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  type: 'performance' | 'n+1' | 'missing-index' | 'full-scan' | 'large-result';
}

/**
 * Query Optimization Options
 */
export interface QueryOptimizationOptions {
  enableCaching?: boolean;
  cacheTtl?: number;
  maxResults?: number;
  timeout?: number;
  enableEagerLoading?: boolean;
  detectNPlusOne?: boolean;
}

/**
 * Query Performance Metrics
 */
export interface QueryMetrics {
  queryCount: number;
  totalDuration: number;
  averageDuration: number;
  slowQueries: SlowQuery[];
  nplusOneDetected: number;
}

/**
 * Slow Query Information
 */
export interface SlowQuery {
  sql: string;
  duration: number;
  timestamp: number;
  stackTrace?: string;
}

/**
 * Query Optimizer Service with Memory Optimizations
 *
 * MEMORY OPTIMIZATIONS:
 * - LRU cache with 1K query limit
 * - Sliding window for metrics (1 hour)
 * - Bounded slow queries array (100 max)
 * - Proper cleanup on module destroy
 */
@Injectable()
export class QueryOptimizerService implements OnModuleDestroy {
  private readonly logger = new Logger(QueryOptimizerService.name);
  private readonly queryMetrics = new Map<string, QueryExecutionMetric>();
  private readonly slowQueries: SlowQuery[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private readonly MAX_SLOW_QUERIES = 100;
  private readonly MAX_QUERY_METRICS = 1000; // LRU limit
  private queryExecutionCount = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly cacheStrategy: CacheStrategyService,
  ) {
    this.initializeQueryLogging();
  }

  onModuleDestroy() {
    this.logger.log('Cleaning up query optimizer...');
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.queryMetrics.clear();
    this.slowQueries.length = 0;
    
    this.logger.log('Query optimizer cleanup complete');
  }

  /**
   * Analyze query for performance issues
   */
  async analyzeQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
  ): Promise<QueryAnalysis> {
    const [sql, parameters] = queryBuilder.getQueryAndParameters();
    const warnings: QueryWarning[] = [];
    const recommendations: string[] = [];
    const suggestedIndexes: string[] = [];

    // Check for SELECT *
    if (sql.toLowerCase().includes('select *')) {
      warnings.push({
        severity: 'medium',
        message: 'SELECT * detected - specify only required columns',
        type: 'performance',
      });
      recommendations.push('Use .select() to specify only required columns');
    }

    // Check for missing WHERE clause
    if (!sql.toLowerCase().includes(' where ')) {
      warnings.push({
        severity: 'high',
        message: 'Query without WHERE clause - full table scan',
        type: 'full-scan',
      });
      recommendations.push('Add WHERE clause to filter results');
    }

    // Check for missing LIMIT
    if (!sql.toLowerCase().includes(' limit ')) {
      warnings.push({
        severity: 'medium',
        message: 'Query without LIMIT - potentially large result set',
        type: 'large-result',
      });
      recommendations.push('Add .take() or .limit() to control result size');
    }

    // Detect potential N+1 queries
    const hasNPlusOne = await this.detectNPlusOne(queryBuilder);
    if (hasNPlusOne) {
      warnings.push({
        severity: 'critical',
        message: 'N+1 query pattern detected',
        type: 'n+1',
      });
      recommendations.push('Use leftJoinAndSelect() for eager loading');
    }

    // Get query execution plan (PostgreSQL specific)
    const estimatedCost = await this.estimateQueryCost(sql, parameters);

    // Suggest indexes based on WHERE and JOIN columns
    const indexes = this.suggestIndexes(sql);
    suggestedIndexes.push(...indexes);

    // Determine if query should be cached
    const shouldCache = this.shouldCacheQuery(sql, warnings);

    return {
      sql,
      parameters,
      estimatedCost,
      warnings,
      recommendations,
      hasNPlusOne,
      shouldCache,
      suggestedIndexes,
    };
  }

  /**
   * Optimize query execution with caching and eager loading
   */
  async optimizeQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: QueryOptimizationOptions = {},
  ): Promise<T[]> {
    const analysis = await this.analyzeQuery(queryBuilder);

    // Log warnings
    for (const warning of analysis.warnings) {
      if (warning.severity === 'critical' || warning.severity === 'high') {
        this.logger.warn(`Query Warning [${warning.severity}]: ${warning.message}`);
      }
    }

    // Apply optimizations
    if (options.maxResults) {
      queryBuilder.take(options.maxResults);
    }

    if (options.timeout) {
      queryBuilder.setQueryRunner(queryBuilder.connection.createQueryRunner());
    }

    // Execute with caching if enabled
    if (options.enableCaching && analysis.shouldCache) {
      const cacheKey = this.cacheStrategy.generateKey('query', {
        sql: analysis.sql,
        params: analysis.parameters,
      });

      return await this.cacheStrategy.get(
        cacheKey,
        async () => {
          const startTime = Date.now();
          const results = await queryBuilder.getMany();
          this.recordQueryExecution(analysis.sql, Date.now() - startTime);
          return results;
        },
        {
          ttl: options.cacheTtl || 300,
          namespace: 'query-cache',
          tags: ['queries'],
        },
      );
    }

    // Execute without caching
    const startTime = Date.now();
    const results = await queryBuilder.getMany();
    this.recordQueryExecution(analysis.sql, Date.now() - startTime);

    return results;
  }

  /**
   * Detect N+1 query patterns with LRU eviction
   */
  async detectNPlusOne<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
  ): Promise<boolean> {
    const [sql] = queryBuilder.getQueryAndParameters();
    const queryHash = this.hashQuery(sql);

    // Track query execution
    const metric = this.queryMetrics.get(queryHash);
    if (metric) {
      metric.count++;
      metric.lastExecuted = Date.now();

      // If same query executed multiple times in short period, likely N+1
      if (metric.count > 10 && Date.now() - metric.firstExecuted < 1000) {
        this.logger.warn(`Potential N+1 query detected: ${sql.substring(0, 100)}...`);
        return true;
      }
    } else {
      this.queryMetrics.set(queryHash, {
        query: sql,
        count: 1,
        firstExecuted: Date.now(),
        lastExecuted: Date.now(),
        totalDuration: 0,
      });
      
      // Enforce LRU limit
      this.enforceLRULimit();
    }

    return false;
  }

  /**
   * Enforce LRU eviction on queryMetrics Map
   */
  private enforceLRULimit(): void {
    if (this.queryMetrics.size > this.MAX_QUERY_METRICS) {
      const toRemove = Math.floor(this.MAX_QUERY_METRICS * 0.1);
      const iterator = this.queryMetrics.keys();
      for (let i = 0; i < toRemove; i++) {
        const key = iterator.next().value;
        if (key !== undefined) {
          this.queryMetrics.delete(key);
        }
      }
      this.logger.warn(`LRU eviction: removed ${toRemove} query metrics (size: ${this.queryMetrics.size})`);
    }
  }

  /**
   * Apply eager loading recommendations
   */
  applyEagerLoading<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    relations: string[],
  ): SelectQueryBuilder<T> {
    for (const relation of relations) {
      const alias = queryBuilder.alias;
      queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
    }

    this.logger.debug(`Applied eager loading for relations: ${relations.join(', ')}`);
    return queryBuilder;
  }

  /**
   * Get query performance metrics
   */
  getMetrics(): QueryMetrics {
    let totalDuration = 0;
    let queryCount = 0;
    let nplusOneCount = 0;

    for (const metric of this.queryMetrics.values()) {
      queryCount += metric.count;
      totalDuration += metric.totalDuration;

      if (metric.count > 10) {
        nplusOneCount++;
      }
    }

    const averageDuration = queryCount > 0 ? totalDuration / queryCount : 0;

    return {
      queryCount,
      totalDuration,
      averageDuration,
      slowQueries: [...this.slowQueries],
      nplusOneDetected: nplusOneCount,
    };
  }

  /**
   * Clear query metrics
   */
  clearMetrics(): void {
    this.queryMetrics.clear();
    this.slowQueries.length = 0;
    this.queryExecutionCount = 0;
    this.logger.log('Query metrics cleared');
  }

  /**
   * Get slow query report
   */
  getSlowQueryReport(): SlowQuery[] {
    return this.slowQueries
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 20);
  }

  // Private helper methods

  private async estimateQueryCost(
    sql: string,
    parameters: any[],
  ): Promise<number> {
    try {
      // Use EXPLAIN for PostgreSQL
      const explainSql = `EXPLAIN (FORMAT JSON) ${sql}`;
      const result = await this.dataSource.query(explainSql, parameters);

      if (result && result[0] && result[0]['QUERY PLAN']) {
        const plan = result[0]['QUERY PLAN'][0];
        return plan['Plan']?.['Total Cost'] || 0;
      }
    } catch (error) {
      this.logger.debug('Could not estimate query cost:', error);
    }

    return 0;
  }

  private suggestIndexes(sql: string): string[] {
    const suggestions: string[] = [];
    const whereMatch = sql.match(/WHERE\s+(\w+)\.(\w+)/i);

    if (whereMatch) {
      const [, table, column] = whereMatch;
      suggestions.push(`CREATE INDEX idx_${table}_${column} ON ${table}(${column})`);
    }

    const joinMatch = sql.match(/JOIN\s+(\w+)\s+\w+\s+ON\s+\w+\.(\w+)/gi);
    if (joinMatch) {
      for (const match of joinMatch) {
        const parts = match.match(/JOIN\s+(\w+)\s+\w+\s+ON\s+\w+\.(\w+)/i);
        if (parts) {
          const [, table, column] = parts;
          suggestions.push(`CREATE INDEX idx_${table}_${column} ON ${table}(${column})`);
        }
      }
    }

    return suggestions;
  }

  private shouldCacheQuery(sql: string, warnings: QueryWarning[]): boolean {
    // Don't cache if query has critical warnings
    const hasCriticalWarnings = warnings.some(w => w.severity === 'critical');
    if (hasCriticalWarnings) {
      return false;
    }

    // Don't cache write operations
    const isWrite = /^(INSERT|UPDATE|DELETE)/i.test(sql);
    if (isWrite) {
      return false;
    }

    // Cache read-only queries
    return /^SELECT/i.test(sql);
  }

  private recordQueryExecution(sql: string, duration: number): void {
    this.queryExecutionCount++;

    // Record slow queries
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      const slowQuery: SlowQuery = {
        sql: sql.substring(0, 500),
        duration,
        timestamp: Date.now(),
        stackTrace: new Error().stack,
      };

      this.slowQueries.push(slowQuery);

      // Keep only last N slow queries
      if (this.slowQueries.length > this.MAX_SLOW_QUERIES) {
        this.slowQueries.shift();
      }

      this.logger.warn(`Slow query detected (${duration}ms): ${sql.substring(0, 100)}...`);
    }

    // Update metrics
    const queryHash = this.hashQuery(sql);
    const metric = this.queryMetrics.get(queryHash);
    if (metric) {
      metric.totalDuration += duration;
    }
  }

  private hashQuery(sql: string): string {
    return sql.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  private initializeQueryLogging(): void {
    if (process.env.NODE_ENV === 'development') {
      this.logger.log('Query optimizer initialized with performance monitoring');
    }

    // Clean up old metrics every hour (sliding window)
    this.cleanupInterval = setInterval(() => {
      const oneHourAgo = Date.now() - 3600000;
      let removedCount = 0;
      
      for (const [hash, metric] of this.queryMetrics.entries()) {
        if (metric.lastExecuted < oneHourAgo) {
          this.queryMetrics.delete(hash);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        this.logger.log(`Cleaned up ${removedCount} stale query metrics`);
      }
    }, 3600000);
  }
}

// Private interfaces

interface QueryExecutionMetric {
  query: string;
  count: number;
  firstExecuted: number;
  lastExecuted: number;
  totalDuration: number;
}
