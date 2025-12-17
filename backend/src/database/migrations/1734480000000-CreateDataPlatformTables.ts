import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDataPlatformTables1734480000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ETL Pipelines
    await queryRunner.createTable(
      new Table({
        name: 'etl_pipelines',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'type', type: 'enum', enum: ['ETL', 'ELT', 'Streaming', 'Batch'], default: "'ETL'" },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'sourceConnector', type: 'varchar', length: '255' },
          { name: 'targetConnector', type: 'varchar', length: '255' },
          { name: 'configuration', type: 'jsonb' },
          { name: 'schedule', type: 'varchar', length: '255', isNullable: true },
          { name: 'status', type: 'enum', enum: ['Active', 'Paused', 'Failed', 'Draft'], default: "'Draft'" },
          { name: 'recordsProcessed', type: 'bigint', default: 0 },
          { name: 'lastRun', type: 'timestamp', isNullable: true },
          { name: 'lastRunStatus', type: 'varchar', length: '50', isNullable: true },
          { name: 'failureCount', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'varchar', length: '255', isNullable: true },
        ],
      }),
      true,
    );

    // Sync Queue
    await queryRunner.createTable(
      new Table({
        name: 'sync_queue',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'operation', type: 'varchar', length: '50' },
          { name: 'entityType', type: 'varchar', length: '100' },
          { name: 'entityId', type: 'varchar', length: '255' },
          { name: 'payload', type: 'jsonb' },
          { name: 'status', type: 'enum', enum: ['pending', 'syncing', 'completed', 'failed', 'conflict'], default: "'pending'" },
          { name: 'retryCount', type: 'int', default: 0 },
          { name: 'error', type: 'text', isNullable: true },
          { name: 'userId', type: 'varchar', length: '255', isNullable: true },
          { name: 'syncedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'sync_queue',
      new TableIndex({ name: 'IDX_SYNC_QUEUE_STATUS', columnNames: ['status'] }),
    );

    // Sync Conflicts
    await queryRunner.createTable(
      new Table({
        name: 'sync_conflicts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'entityType', type: 'varchar', length: '100' },
          { name: 'entityId', type: 'varchar', length: '255' },
          { name: 'localVersion', type: 'jsonb' },
          { name: 'remoteVersion', type: 'jsonb' },
          { name: 'conflictType', type: 'varchar', length: '50' },
          { name: 'resolved', type: 'boolean', default: false },
          { name: 'resolution', type: 'varchar', length: '50', isNullable: true },
          { name: 'resolvedBy', type: 'varchar', length: '255', isNullable: true },
          { name: 'resolvedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Backup Snapshots
    await queryRunner.createTable(
      new Table({
        name: 'backup_snapshots',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'type', type: 'varchar', length: '50' },
          { name: 'size', type: 'bigint' },
          { name: 'location', type: 'varchar', length: '500' },
          { name: 'status', type: 'varchar', length: '50', default: "'completed'" },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdBy', type: 'varchar', length: '255', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'expiresAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Backup Schedules
    await queryRunner.createTable(
      new Table({
        name: 'backup_schedules',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'cronExpression', type: 'varchar', length: '100' },
          { name: 'type', type: 'varchar', length: '50' },
          { name: 'databases', type: 'text', isNullable: true },
          { name: 'enabled', type: 'boolean', default: true },
          { name: 'retentionDays', type: 'int', default: 7 },
          { name: 'lastRun', type: 'timestamp', isNullable: true },
          { name: 'nextRun', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Performance Metrics
    await queryRunner.createTable(
      new Table({
        name: 'performance_metrics',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'metricName', type: 'varchar', length: '100' },
          { name: 'value', type: 'float' },
          { name: 'unit', type: 'varchar', length: '50', isNullable: true },
          { name: 'tags', type: 'jsonb', isNullable: true },
          { name: 'timestamp', type: 'timestamp' },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'performance_metrics',
      new TableIndex({ name: 'IDX_PERF_METRICS_NAME_TIME', columnNames: ['metricName', 'timestamp'] }),
    );

    // System Alerts
    await queryRunner.createTable(
      new Table({
        name: 'system_alerts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'message', type: 'text' },
          { name: 'severity', type: 'enum', enum: ['info', 'warning', 'error', 'critical'], default: "'info'" },
          { name: 'source', type: 'varchar', length: '100' },
          { name: 'acknowledged', type: 'boolean', default: false },
          { name: 'acknowledgedBy', type: 'varchar', length: '255', isNullable: true },
          { name: 'acknowledgedAt', type: 'timestamp', isNullable: true },
          { name: 'resolved', type: 'boolean', default: false },
          { name: 'resolvedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Vector Embeddings
    await queryRunner.createTable(
      new Table({
        name: 'vector_embeddings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'entityType', type: 'varchar', length: '100' },
          { name: 'entityId', type: 'varchar', length: '255' },
          { name: 'embedding', type: 'float[]' },
          { name: 'model', type: 'varchar', length: '100' },
          { name: 'content', type: 'text' },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'vector_embeddings',
      new TableIndex({ name: 'IDX_VECTOR_ENTITY', columnNames: ['entityType', 'entityId'] }),
    );

    // AI Models
    await queryRunner.createTable(
      new Table({
        name: 'ai_models',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'type', type: 'varchar', length: '50' },
          { name: 'provider', type: 'varchar', length: '50' },
          { name: 'version', type: 'varchar', length: '50' },
          { name: 'configuration', type: 'jsonb' },
          { name: 'active', type: 'boolean', default: true },
          { name: 'usageCount', type: 'bigint', default: 0 },
          { name: 'lastUsed', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Data Versions
    await queryRunner.createTable(
      new Table({
        name: 'data_versions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'entityType', type: 'varchar', length: '100' },
          { name: 'entityId', type: 'varchar', length: '255' },
          { name: 'version', type: 'int' },
          { name: 'data', type: 'jsonb' },
          { name: 'branch', type: 'varchar', length: '100', isNullable: true },
          { name: 'tag', type: 'varchar', length: '100', isNullable: true },
          { name: 'commitMessage', type: 'text', isNullable: true },
          { name: 'createdBy', type: 'varchar', length: '255', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'data_versions',
      new TableIndex({
        name: 'IDX_DATA_VERSIONS_ENTITY',
        columnNames: ['entityType', 'entityId', 'version'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('data_versions');
    await queryRunner.dropTable('ai_models');
    await queryRunner.dropTable('vector_embeddings');
    await queryRunner.dropTable('system_alerts');
    await queryRunner.dropTable('performance_metrics');
    await queryRunner.dropTable('backup_schedules');
    await queryRunner.dropTable('backup_snapshots');
    await queryRunner.dropTable('sync_conflicts');
    await queryRunner.dropTable('sync_queue');
    await queryRunner.dropTable('etl_pipelines');
  }
}
