import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Database Health Check Service for LexiFlow AI Legal Suite
 *
 * Provides comprehensive database monitoring:
 * - Connection health checks
 * - Query performance monitoring
 * - Deadlock detection
 * - Connection pool monitoring
 * - Slow query logging
 * - Database size tracking
 * - Table statistics
 */

export interface DatabaseHealthStatus {
  isHealthy: boolean;
  timestamp: Date;
  latency: number;
  connections: ConnectionPoolStats;
  performance: PerformanceMetrics;
  issues: HealthIssue[];
}

export interface ConnectionPoolStats {
  active: number;
  idle: number;
  waiting: number;
  total: number;
  maxConnections: number;
  utilizationPercentage: number;
}

export interface PerformanceMetrics {
  avgQueryTime: number;
  slowQueries: number;
  totalQueries: number;
  cacheHitRatio: number;
  deadlocks: number;
  activeTransactions: number;
}

export interface HealthIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  message: string;
  timestamp: Date;
  details?: any;
}

export interface SlowQuery {
  query: string;
  duration: number;
  timestamp: Date;
  user: string;
  database: string;
}

export interface TableStats {
  tableName: string;
  rowCount: number;
  tableSize: string;
  indexSize: string;
  totalSize: string;
  lastVacuum: Date | null;
  lastAnalyze: Date | null;
}

@Injectable()
export class HealthCheckService implements OnModuleInit {
  private healthHistory: DatabaseHealthStatus[] = [];
  private slowQueryLog: SlowQuery[] = [];
  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly MAX_SLOW_QUERY_LOG_SIZE = 500;
  private readonly SLOW_QUERY_THRESHOLD_MS = 1000;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    console.log('Database Health Check Service: Initializing...');
    await this.performHealthCheck();
    console.log('✓ Database Health Check Service: Initialized');
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<DatabaseHealthStatus> {
    const startTime = Date.now();
    const issues: HealthIssue[] = [];

    try {
      // Test database connection
      const isConnected = this.dataSource.isInitialized;

      if (!isConnected) {
        issues.push({
          severity: 'critical',
          category: 'connection',
          message: 'Database connection is not initialized',
          timestamp: new Date(),
        });

        return {
          isHealthy: false,
          timestamp: new Date(),
          latency: -1,
          connections: this.getEmptyConnectionStats(),
          performance: this.getEmptyPerformanceMetrics(),
          issues,
        };
      }

      // Measure latency with a simple query
      const latency = await this.measureLatency();

      if (latency > 1000) {
        issues.push({
          severity: 'high',
          category: 'performance',
          message: `High database latency: ${latency}ms`,
          timestamp: new Date(),
          details: { latency },
        });
      } else if (latency > 500) {
        issues.push({
          severity: 'medium',
          category: 'performance',
          message: `Elevated database latency: ${latency}ms`,
          timestamp: new Date(),
          details: { latency },
        });
      }

      // Get connection pool stats
      const connections = await this.getConnectionPoolStats();

      if (connections.utilizationPercentage > 90) {
        issues.push({
          severity: 'critical',
          category: 'connections',
          message: `Connection pool near capacity: ${connections.utilizationPercentage}%`,
          timestamp: new Date(),
          details: connections,
        });
      } else if (connections.utilizationPercentage > 75) {
        issues.push({
          severity: 'high',
          category: 'connections',
          message: `High connection pool utilization: ${connections.utilizationPercentage}%`,
          timestamp: new Date(),
          details: connections,
        });
      }

      // Get performance metrics
      const performance = await this.getPerformanceMetrics();

      if (performance.slowQueries > 10) {
        issues.push({
          severity: 'medium',
          category: 'performance',
          message: `High number of slow queries: ${performance.slowQueries}`,
          timestamp: new Date(),
          details: { slowQueries: performance.slowQueries },
        });
      }

      if (performance.deadlocks > 0) {
        issues.push({
          severity: 'high',
          category: 'concurrency',
          message: `Deadlocks detected: ${performance.deadlocks}`,
          timestamp: new Date(),
          details: { deadlocks: performance.deadlocks },
        });
      }

      const healthStatus: DatabaseHealthStatus = {
        isHealthy: issues.filter(i => i.severity === 'critical').length === 0,
        timestamp: new Date(),
        latency,
        connections,
        performance,
        issues,
      };

      // Store in history
      this.addToHistory(healthStatus);

      return healthStatus;

    } catch (error) {
      console.error('Health Check: Error during health check:', error);

      const criticalIssue: HealthIssue = {
        severity: 'critical',
        category: 'system',
        message: `Health check failed: ${error.message}`,
        timestamp: new Date(),
        details: { error: error.stack },
      };

      const failedStatus: DatabaseHealthStatus = {
        isHealthy: false,
        timestamp: new Date(),
        latency: -1,
        connections: this.getEmptyConnectionStats(),
        performance: this.getEmptyPerformanceMetrics(),
        issues: [criticalIssue],
      };

      this.addToHistory(failedStatus);
      return failedStatus;
    }
  }

  /**
   * Measure database latency with a simple query
   */
  async measureLatency(): Promise<number> {
    const startTime = Date.now();

    try {
      await this.dataSource.query('SELECT 1');
      return Date.now() - startTime;
    } catch (error) {
      console.error('Health Check: Error measuring latency:', error);
      return -1;
    }
  }

  /**
   * Get connection pool statistics
   */
  async getConnectionPoolStats(): Promise<ConnectionPoolStats> {
    try {
      // Get PostgreSQL connection stats
      const result = await this.dataSource.query(`
        SELECT
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle,
          (SELECT count(*) FROM pg_stat_activity WHERE wait_event_type = 'Client') as waiting,
          (SELECT count(*) FROM pg_stat_activity) as total,
          (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      `);

      const stats = result[0];
      const utilizationPercentage = (stats.total / stats.max_connections) * 100;

      return {
        active: parseInt(stats.active),
        idle: parseInt(stats.idle),
        waiting: parseInt(stats.waiting),
        total: parseInt(stats.total),
        maxConnections: parseInt(stats.max_connections),
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
      };

    } catch (error) {
      console.error('Health Check: Error getting connection stats:', error);
      return this.getEmptyConnectionStats();
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      // Get query statistics
      const queryStats = await this.dataSource.query(`
        SELECT
          COALESCE(SUM(calls), 0) as total_queries,
          COALESCE(AVG(mean_exec_time), 0) as avg_query_time,
          COALESCE(SUM(CASE WHEN mean_exec_time > ${this.SLOW_QUERY_THRESHOLD_MS} THEN 1 ELSE 0 END), 0) as slow_queries
        FROM pg_stat_statements
        WHERE queryid IS NOT NULL
      `);

      // Get cache hit ratio
      const cacheStats = await this.dataSource.query(`
        SELECT
          CASE
            WHEN (blks_hit + blks_read) = 0 THEN 100
            ELSE ROUND((blks_hit::numeric / (blks_hit + blks_read)) * 100, 2)
          END as cache_hit_ratio
        FROM pg_stat_database
        WHERE datname = current_database()
      `);

      // Get deadlock count
      const deadlockStats = await this.dataSource.query(`
        SELECT COALESCE(deadlocks, 0) as deadlocks
        FROM pg_stat_database
        WHERE datname = current_database()
      `);

      // Get active transactions
      const transactionStats = await this.dataSource.query(`
        SELECT COUNT(*) as active_transactions
        FROM pg_stat_activity
        WHERE state IN ('active', 'idle in transaction')
          AND backend_type = 'client backend'
      `);

      return {
        avgQueryTime: parseFloat(queryStats[0]?.avg_query_time || 0),
        slowQueries: parseInt(queryStats[0]?.slow_queries || 0),
        totalQueries: parseInt(queryStats[0]?.total_queries || 0),
        cacheHitRatio: parseFloat(cacheStats[0]?.cache_hit_ratio || 100),
        deadlocks: parseInt(deadlockStats[0]?.deadlocks || 0),
        activeTransactions: parseInt(transactionStats[0]?.active_transactions || 0),
      };

    } catch (error) {
      console.error('Health Check: Error getting performance metrics:', error);
      return this.getEmptyPerformanceMetrics();
    }
  }

  /**
   * Get table statistics
   */
  async getTableStats(limit: number = 20): Promise<TableStats[]> {
    try {
      const result = await this.dataSource.query(`
        SELECT
          schemaname || '.' || tablename as table_name,
          n_live_tup as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
          pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
          pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
          last_vacuum,
          last_analyze
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT $1
      `, [limit]);

      return result.map((row: any) => ({
        tableName: row.table_name,
        rowCount: parseInt(row.row_count || 0),
        tableSize: row.table_size,
        indexSize: row.index_size,
        totalSize: row.total_size,
        lastVacuum: row.last_vacuum,
        lastAnalyze: row.last_analyze,
      }));

    } catch (error) {
      console.error('Health Check: Error getting table stats:', error);
      return [];
    }
  }

  /**
   * Get database size information
   */
  async getDatabaseSize(): Promise<any> {
    try {
      const result = await this.dataSource.query(`
        SELECT
          pg_database.datname as database_name,
          pg_size_pretty(pg_database_size(pg_database.datname)) as size,
          pg_database_size(pg_database.datname) as size_bytes
        FROM pg_database
        WHERE datname = current_database()
      `);

      return result[0];

    } catch (error) {
      console.error('Health Check: Error getting database size:', error);
      return null;
    }
  }

  /**
   * Get slow queries from log
   */
  getSlowQueries(limit: number = 50): SlowQuery[] {
    return this.slowQueryLog.slice(0, limit);
  }

  /**
   * Log slow query
   */
  logSlowQuery(query: string, duration: number, user: string = 'unknown'): void {
    if (duration < this.SLOW_QUERY_THRESHOLD_MS) {
      return;
    }

    const slowQuery: SlowQuery = {
      query: query.substring(0, 500), // Truncate long queries
      duration,
      timestamp: new Date(),
      user,
      database: this.dataSource.options.database as string,
    };

    this.slowQueryLog.unshift(slowQuery);

    // Maintain log size
    if (this.slowQueryLog.length > this.MAX_SLOW_QUERY_LOG_SIZE) {
      this.slowQueryLog = this.slowQueryLog.slice(0, this.MAX_SLOW_QUERY_LOG_SIZE);
    }

    console.warn(`Slow Query Alert: ${duration}ms - ${query.substring(0, 100)}...`);
  }

  /**
   * Get health history
   */
  getHealthHistory(limit: number = 100): DatabaseHealthStatus[] {
    return this.healthHistory.slice(0, limit);
  }

  /**
   * Get current health status (latest from history)
   */
  getCurrentHealthStatus(): DatabaseHealthStatus | null {
    return this.healthHistory[0] || null;
  }

  /**
   * Add health status to history
   */
  private addToHistory(status: DatabaseHealthStatus): void {
    this.healthHistory.unshift(status);

    // Maintain history size
    if (this.healthHistory.length > this.MAX_HISTORY_SIZE) {
      this.healthHistory = this.healthHistory.slice(0, this.MAX_HISTORY_SIZE);
    }
  }

  /**
   * Scheduled health check - runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledHealthCheck(): Promise<void> {
    console.log('Health Check: Running scheduled health check...');

    const status = await this.performHealthCheck();

    if (!status.isHealthy) {
      console.error('Health Check: Database health issues detected:', status.issues);
    } else {
      console.log(`Health Check: Database is healthy (latency: ${status.latency}ms)`);
    }
  }

  /**
   * Helper methods for empty stats
   */
  private getEmptyConnectionStats(): ConnectionPoolStats {
    return {
      active: 0,
      idle: 0,
      waiting: 0,
      total: 0,
      maxConnections: 0,
      utilizationPercentage: 0,
    };
  }

  private getEmptyPerformanceMetrics(): PerformanceMetrics {
    return {
      avgQueryTime: 0,
      slowQueries: 0,
      totalQueries: 0,
      cacheHitRatio: 0,
      deadlocks: 0,
      activeTransactions: 0,
    };
  }

  /**
   * Get comprehensive database diagnostics
   */
  async getDiagnostics(): Promise<any> {
    const [
      healthStatus,
      tableStats,
      databaseSize,
      slowQueries,
    ] = await Promise.all([
      this.performHealthCheck(),
      this.getTableStats(20),
      this.getDatabaseSize(),
      Promise.resolve(this.getSlowQueries(10)),
    ]);

    return {
      health: healthStatus,
      tables: tableStats,
      size: databaseSize,
      slowQueries,
      timestamp: new Date(),
    };
  }

  /**
   * Run database vacuum analyze (maintenance)
   */
  async runVacuumAnalyze(tableName?: string): Promise<void> {
    try {
      if (tableName) {
        console.log(`Health Check: Running VACUUM ANALYZE on ${tableName}...`);
        await this.dataSource.query(`VACUUM ANALYZE ${tableName}`);
      } else {
        console.log('Health Check: Running VACUUM ANALYZE on all tables...');
        await this.dataSource.query('VACUUM ANALYZE');
      }
      console.log('✓ Health Check: VACUUM ANALYZE completed');
    } catch (error) {
      console.error('Health Check: Error running VACUUM ANALYZE:', error);
      throw error;
    }
  }
}
