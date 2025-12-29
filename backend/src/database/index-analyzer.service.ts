import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Index recommendation
 */
export interface IndexRecommendation {
  tableName: string;
  columnNames: string[];
  reason: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  createStatement: string;
}

/**
 * Index analysis result
 */
export interface IndexAnalysis {
  indexName: string;
  tableName: string;
  columns: string[];
  indexType: string;
  sizeBytes: number;
  scansCount: number;
  rowsRead: number;
  rowsFetched: number;
  isUnique: boolean;
  isPrimaryKey: boolean;
  recommendation: 'keep' | 'consider_dropping' | 'optimize';
  reason: string;
}

/**
 * Missing index detection result
 */
export interface MissingIndexInfo {
  tableName: string;
  columnName: string;
  seqScans: number;
  seqTupRead: number;
  reason: string;
}

/**
 * Duplicate index information
 */
export interface DuplicateIndexInfo {
  tableName: string;
  indexes: Array<{
    indexName: string;
    definition: string;
  }>;
  reason: string;
}

/**
 * Database Index Analyzer Service
 *
 * Analyzes database indexes and provides recommendations for:
 * - Missing indexes
 * - Unused indexes
 * - Duplicate indexes
 * - Index optimization opportunities
 */
@Injectable()
export class IndexAnalyzerService {
  private readonly logger = new Logger(IndexAnalyzerService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Analyze all indexes and provide recommendations
   */
  async analyzeIndexes(schemaName: string = 'public'): Promise<IndexAnalysis[]> {
    try {
      const query = `
        SELECT
          i.schemaname,
          i.tablename,
          i.indexname,
          ix.indisunique AS is_unique,
          ix.indisprimary AS is_primary,
          pg_relation_size(i.indexrelid) AS size_bytes,
          i.idx_scan AS scans_count,
          i.idx_tup_read AS rows_read,
          i.idx_tup_fetch AS rows_fetched,
          pg_get_indexdef(i.indexrelid) AS index_def,
          array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) AS columns
        FROM pg_stat_user_indexes i
        JOIN pg_index ix ON i.indexrelid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = i.indexrelid
        WHERE i.schemaname = $1
          AND a.attnum > 0
        GROUP BY
          i.schemaname,
          i.tablename,
          i.indexname,
          ix.indisunique,
          ix.indisprimary,
          i.indexrelid,
          i.idx_scan,
          i.idx_tup_read,
          i.idx_tup_fetch
        ORDER BY i.tablename, i.indexname
      `;

      const results = await this.dataSource.query(query, [schemaName]);

      return results.map((row: Record<string, unknown>) => {
        const scans = parseInt(String(row.scans_count));
        const sizeBytes = parseInt(String(row.size_bytes));
        const isPrimary = Boolean(row.is_primary);
        const isUnique = Boolean(row.is_unique);

        let recommendation: 'keep' | 'consider_dropping' | 'optimize' = 'keep';
        let reason = 'Index is being used effectively';

        // Analyze unused indexes
        if (!isPrimary && scans === 0 && sizeBytes > 1024 * 1024) {
          // > 1MB
          recommendation = 'consider_dropping';
          reason = `Index has never been scanned and uses ${this.formatBytes(sizeBytes)}`;
        } else if (!isPrimary && scans < 10 && sizeBytes > 10 * 1024 * 1024) {
          // > 10MB
          recommendation = 'consider_dropping';
          reason = `Index is rarely used (${scans} scans) but uses ${this.formatBytes(sizeBytes)}`;
        }

        // Analyze index efficiency
        const rowsRead = parseInt(String(row.rows_read));
        const rowsFetched = parseInt(String(row.rows_fetched));
        if (rowsRead > 0 && rowsFetched / rowsRead < 0.1) {
          recommendation = 'optimize';
          reason = `Index read efficiency is low (${((rowsFetched / rowsRead) * 100).toFixed(1)}%)`;
        }

        return {
          indexName: String(row.indexname),
          tableName: String(row.tablename),
          columns: Array.isArray(row.columns) ? row.columns.map(String) : [],
          indexType: this.extractIndexType(String(row.index_def)),
          sizeBytes,
          scansCount: scans,
          rowsRead,
          rowsFetched,
          isUnique,
          isPrimaryKey: isPrimary,
          recommendation,
          reason,
        };
      });
    } catch (error) {
      this.logger.error('Failed to analyze indexes', error);
      throw error;
    }
  }

  /**
   * Find missing indexes based on sequential scans
   */
  async findMissingIndexes(
    schemaName: string = 'public',
    seqScanThreshold: number = 1000,
  ): Promise<MissingIndexInfo[]> {
    try {
      const query = `
        SELECT
          schemaname,
          tablename,
          seq_scan,
          seq_tup_read,
          idx_scan,
          n_live_tup
        FROM pg_stat_user_tables
        WHERE schemaname = $1
          AND seq_scan > $2
          AND n_live_tup > 1000
        ORDER BY seq_scan DESC
      `;

      const results = await this.dataSource.query(query, [
        schemaName,
        seqScanThreshold,
      ]);

      const missingIndexes: MissingIndexInfo[] = [];

      for (const row of results) {
        // Get columns that might benefit from indexes
        const columnsQuery = `
          SELECT
            attname AS column_name,
            n_distinct,
            correlation
          FROM pg_stats
          WHERE schemaname = $1
            AND tablename = $2
            AND n_distinct > 10
          ORDER BY n_distinct DESC
          LIMIT 5
        `;

        const columns = await this.dataSource.query(columnsQuery, [
          schemaName,
          row.tablename,
        ]);

        columns.forEach((col: Record<string, unknown>) => {
          missingIndexes.push({
            tableName: String(row.tablename),
            columnName: String(col.column_name),
            seqScans: parseInt(String(row.seq_scan)),
            seqTupRead: parseInt(String(row.seq_tup_read)),
            reason: `Table has ${row.seq_scan} sequential scans. Column '${col.column_name}' has ${col.n_distinct} distinct values`,
          });
        });
      }

      return missingIndexes;
    } catch (error) {
      this.logger.error('Failed to find missing indexes', error);
      throw error;
    }
  }

  /**
   * Find duplicate or redundant indexes
   */
  async findDuplicateIndexes(
    schemaName: string = 'public',
  ): Promise<DuplicateIndexInfo[]> {
    try {
      const query = `
        SELECT
          tablename,
          array_agg(indexname) AS index_names,
          array_agg(indexdef) AS index_defs,
          string_agg(indexdef, ' | ') AS all_defs
        FROM pg_indexes
        WHERE schemaname = $1
        GROUP BY tablename, indexdef
        HAVING count(*) > 1
      `;

      const results = await this.dataSource.query(query, [schemaName]);

      return results.map((row: Record<string, unknown>) => ({
        tableName: String(row.tablename),
        indexes: (row.index_names as string[]).map((name: string, idx: number) => ({
          indexName: name,
          definition: (row.index_defs as string[])[idx],
        })),
        reason: 'Identical index definitions found',
      }));
    } catch (error) {
      this.logger.error('Failed to find duplicate indexes', error);
      throw error;
    }
  }

  /**
   * Generate index recommendations
   */
  async generateRecommendations(
    schemaName: string = 'public',
  ): Promise<IndexRecommendation[]> {
    const recommendations: IndexRecommendation[] = [];

    try {
      // Find tables with high sequential scans
      const missingIndexes = await this.findMissingIndexes(schemaName, 100);

      missingIndexes.forEach((missing) => {
        const impact =
          missing.seqScans > 10000
            ? 'high'
            : missing.seqScans > 1000
              ? 'medium'
              : 'low';

        recommendations.push({
          tableName: missing.tableName,
          columnNames: [missing.columnName],
          reason: missing.reason,
          estimatedImpact: impact,
          createStatement: `CREATE INDEX idx_${missing.tableName}_${missing.columnName} ON ${missing.tableName}(${missing.columnName});`,
        });
      });

      // Find foreign key columns without indexes
      const fkQuery = `
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = $1
          AND NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = tc.table_schema
              AND tablename = tc.table_name
              AND indexdef LIKE '%' || kcu.column_name || '%'
          )
      `;

      const fkResults = await this.dataSource.query(fkQuery, [schemaName]);

      fkResults.forEach((row: Record<string, unknown>) => {
        recommendations.push({
          tableName: String(row.table_name),
          columnNames: [String(row.column_name)],
          reason: `Foreign key column referencing ${row.foreign_table_name} lacks an index`,
          estimatedImpact: 'high',
          createStatement: `CREATE INDEX idx_${row.table_name}_${row.column_name}_fk ON ${row.table_name}(${row.column_name});`,
        });
      });

      // Recommend composite indexes based on query patterns
      const compositeQuery = `
        SELECT
          schemaname,
          tablename,
          attname
        FROM pg_stats
        WHERE schemaname = $1
          AND n_distinct > 10
          AND correlation < 0.1
        ORDER BY tablename, n_distinct DESC
      `;

      const compositeResults = await this.dataSource.query(compositeQuery, [
        schemaName,
      ]);

      // Group by table and recommend composite indexes
      const tableColumns = new Map<string, string[]>();
      compositeResults.forEach((row: Record<string, unknown>) => {
        const tableName = String(row.tablename);
        if (!tableColumns.has(tableName)) {
          tableColumns.set(tableName, []);
        }
        const cols = tableColumns.get(tableName)!;
        if (cols.length < 3) {
          // Max 3 columns per composite index
          cols.push(String(row.attname));
        }
      });

      tableColumns.forEach((columns, tableName) => {
        if (columns.length >= 2) {
          recommendations.push({
            tableName,
            columnNames: columns,
            reason: 'Columns frequently queried together could benefit from a composite index',
            estimatedImpact: 'medium',
            createStatement: `CREATE INDEX idx_${tableName}_${columns.join('_')} ON ${tableName}(${columns.join(', ')});`,
          });
        }
      });

      return recommendations.sort((a, b) => {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        return impactOrder[a.estimatedImpact] - impactOrder[b.estimatedImpact];
      });
    } catch (error) {
      this.logger.error('Failed to generate recommendations', error);
      throw error;
    }
  }

  /**
   * Get index fragmentation information
   */
  async getIndexFragmentation(
    schemaName: string = 'public',
  ): Promise<
    Array<{
      tableName: string;
      indexName: string;
      bloatPercent: number;
      recommendation: string;
    }>
  > {
    try {
      // This is a simplified bloat check
      const query = `
        SELECT
          schemaname,
          tablename,
          indexname,
          idx_scan,
          pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
          pg_relation_size(indexrelid) AS size_bytes
        FROM pg_stat_user_indexes
        WHERE schemaname = $1
        ORDER BY pg_relation_size(indexrelid) DESC
      `;

      const results = await this.dataSource.query(query, [schemaName]);

      return results.map((row: Record<string, unknown>) => {
        const sizeBytes = parseInt(String(row.size_bytes));
        const scans = parseInt(String(row.idx_scan));

        // Simple heuristic: large indexes with few scans might be fragmented
        const bloatPercent =
          scans > 0 ? Math.min((sizeBytes / scans / 1000) * 100, 100) : 0;

        let recommendation = 'No action needed';
        if (bloatPercent > 50) {
          recommendation = `Consider REINDEXing. Index size: ${row.index_size}`;
        }

        return {
          tableName: String(row.tablename),
          indexName: String(row.indexname),
          bloatPercent: Math.round(bloatPercent),
          recommendation,
        };
      });
    } catch (error) {
      this.logger.error('Failed to get index fragmentation', error);
      throw error;
    }
  }

  /**
   * Suggest covering indexes for common queries
   */
  async suggestCoveringIndexes(
    tableName: string,
    queryColumns: string[],
    whereColumns: string[],
  ): Promise<string> {
    // Covering index includes all columns needed by the query
    const includeColumns = queryColumns.filter((c) => !whereColumns.includes(c));

    return `CREATE INDEX idx_${tableName}_covering ON ${tableName}(${whereColumns.join(', ')}) INCLUDE (${includeColumns.join(', ')});`;
  }

  /**
   * Extract index type from index definition
   */
  private extractIndexType(indexDef: string): string {
    if (indexDef.includes('USING btree')) return 'btree';
    if (indexDef.includes('USING hash')) return 'hash';
    if (indexDef.includes('USING gin')) return 'gin';
    if (indexDef.includes('USING gist')) return 'gist';
    if (indexDef.includes('USING spgist')) return 'spgist';
    if (indexDef.includes('USING brin')) return 'brin';
    return 'btree'; // default
  }

  /**
   * Format bytes to human-readable size
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
