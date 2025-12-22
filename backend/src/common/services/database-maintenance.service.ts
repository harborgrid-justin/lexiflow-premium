import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DatabaseMaintenanceService {
  private readonly logger = new Logger(DatabaseMaintenanceService.name);

  constructor(private dataSource: DataSource) {}

  /**
   * Run VACUUM ANALYZE on all tables nightly
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async vacuumAnalyze(): Promise<void> {
    this.logger.log('Starting VACUUM ANALYZE maintenance...');
    
    try {
      const tables = await this.dataSource.query(`
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      `);

      for (const table of tables) {
        const fullTableName = `"${table.schemaname}"."${table.tablename}"`;
        this.logger.debug(`VACUUM ANALYZE ${fullTableName}`);
        
        await this.dataSource.query(`VACUUM ANALYZE ${fullTableName}`);
      }

      this.logger.log('VACUUM ANALYZE completed successfully');
    } catch (error) {
      this.logger.error('VACUUM ANALYZE failed', error);
      throw error;
    }
  }

  /**
   * Update index statistics weekly
   */
  @Cron(CronExpression.EVERY_WEEK)
  async updateIndexStatistics(): Promise<void> {
    this.logger.log('Updating index statistics...');

    try {
      await this.dataSource.query(`
        INSERT INTO index_usage_stats (
          schema_name, table_name, index_name, scans, 
          tuples_read, tuples_fetched, index_size_bytes, last_used, updated_at
        )
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch,
          pg_relation_size(indexrelid),
          CASE WHEN idx_scan > 0 THEN now() ELSE NULL END,
          now()
        FROM pg_stat_user_indexes
        ON CONFLICT (schema_name, table_name, index_name) 
        DO UPDATE SET
          scans = EXCLUDED.scans,
          tuples_read = EXCLUDED.tuples_read,
          tuples_fetched = EXCLUDED.tuples_fetched,
          index_size_bytes = EXCLUDED.index_size_bytes,
          last_used = CASE WHEN EXCLUDED.scans > index_usage_stats.scans 
                      THEN now() 
                      ELSE index_usage_stats.last_used END,
          updated_at = now()
      `);

      this.logger.log('Index statistics updated successfully');
    } catch (error) {
      this.logger.error('Failed to update index statistics', error);
      throw error;
    }
  }

  /**
   * Refresh materialized views daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async refreshMaterializedViews(): Promise<void> {
    this.logger.log('Refreshing materialized views...');

    const views = [
      'client_statistics',
      'case_statistics',
      'billing_summary',
    ];

    try {
      for (const view of views) {
        this.logger.debug(`Refreshing ${view}...`);
        await this.dataSource.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`);
      }

      this.logger.log('Materialized views refreshed successfully');
    } catch (error) {
      this.logger.error('Failed to refresh materialized views', error);
      throw error;
    }
  }

  /**
   * Check for table bloat and recommend reindexing
   */
  @Cron(CronExpression.EVERY_WEEK)
  async checkTableBloat(): Promise<void> {
    this.logger.log('Checking table bloat...');

    try {
      const bloatedTables = await this.dataSource.query(`
        SELECT 
          schemaname || '.' || tablename AS table_name,
          n_dead_tup,
          n_live_tup,
          ROUND(100 * n_dead_tup / GREATEST(n_live_tup, 1)::numeric, 2) AS bloat_pct
        FROM pg_stat_user_tables
        WHERE n_dead_tup > 1000
          AND n_dead_tup > n_live_tup * 0.2
        ORDER BY n_dead_tup DESC
      `);

      if (bloatedTables.length > 0) {
        this.logger.warn(
          `Found ${bloatedTables.length} bloated tables:`,
          bloatedTables.map((t: any) => `${t.table_name} (${t.bloat_pct}% bloat)`),
        );

        // Insert recommendations
        await this.dataSource.query(`
          INSERT INTO schema_health (
            table_name, dead_tuples, live_tuples, bloat_percentage, 
            health_score, recommendations
          )
          SELECT 
            schemaname || '.' || tablename,
            n_dead_tup,
            n_live_tup,
            ROUND(100 * n_dead_tup / GREATEST(n_live_tup, 1)::numeric, 2),
            CASE 
              WHEN n_dead_tup > n_live_tup * 0.5 THEN 30
              WHEN n_dead_tup > n_live_tup * 0.2 THEN 60
              ELSE 90
            END,
            ARRAY[
              'Run VACUUM FULL on ' || schemaname || '.' || tablename,
              'Consider running REINDEX on indexes'
            ]
          FROM pg_stat_user_tables
          WHERE n_dead_tup > 1000
            AND n_dead_tup > n_live_tup * 0.2
        `);
      }

      this.logger.log('Table bloat check completed');
    } catch (error) {
      this.logger.error('Failed to check table bloat', error);
      throw error;
    }
  }

  /**
   * Clean old audit logs (keep last 6 months)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanOldAuditLogs(): Promise<void> {
    this.logger.log('Cleaning old audit logs...');

    try {
      const result = await this.dataSource.query(`
        DELETE FROM audit_logs
        WHERE timestamp < NOW() - INTERVAL '6 months'
      `);

      this.logger.log(`Deleted ${result[1]} old audit log records`);
    } catch (error) {
      this.logger.error('Failed to clean audit logs', error);
      throw error;
    }
  }

  /**
   * Generate slow query report
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async generateSlowQueryReport(): Promise<void> {
    this.logger.log('Generating slow query report...');

    try {
      const slowQueries = await this.dataSource.query(`
        SELECT * FROM get_top_slow_queries(20, NOW() - INTERVAL '24 hours')
      `);

      if (slowQueries.length > 0) {
        this.logger.warn(
          `Found ${slowQueries.length} slow queries in the last 24 hours`,
        );
        
        for (const query of slowQueries.slice(0, 5)) {
          this.logger.warn(
            `Slow query: ${query.query_text.substring(0, 100)}... ` +
            `Avg: ${query.avg_time_ms}ms, Count: ${query.execution_count}`,
          );
        }
      }

      this.logger.log('Slow query report completed');
    } catch (error) {
      this.logger.error('Failed to generate slow query report', error);
      throw error;
    }
  }

  /**
   * Check for unused indexes
   */
  @Cron(CronExpression.EVERY_WEEK)
  async checkUnusedIndexes(): Promise<void> {
    this.logger.log('Checking for unused indexes...');

    try {
      const unusedIndexes = await this.dataSource.query(`
        SELECT * FROM find_unused_indexes()
        WHERE scans = 0
          AND pg_size_pretty(index_size::bigint) != '0 bytes'
      `);

      if (unusedIndexes.length > 0) {
        this.logger.warn(
          `Found ${unusedIndexes.length} unused indexes`,
          unusedIndexes.map(
            (idx: any) => `${idx.schema_name}.${idx.index_name} (${idx.index_size})`,
          ),
        );
      }

      this.logger.log('Unused index check completed');
    } catch (error) {
      this.logger.error('Failed to check unused indexes', error);
      throw error;
    }
  }
}
