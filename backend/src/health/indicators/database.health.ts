import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private dataSource: DataSource) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if database connection is established
      if (!this.dataSource.isInitialized) {
        throw new Error('Database not initialized');
      }

      // Execute a simple query to verify connection
      await this.dataSource.query('SELECT 1');

      // Get connection pool statistics
      const driver = this.dataSource.driver as any;
      const poolSize = driver.master?.totalCount || 0;
      const idleCount = driver.master?.idleCount || 0;
      const waitingCount = driver.master?.waitingCount || 0;

      const result = this.getStatus(key, true, {
        status: 'up',
        message: 'Database connection is healthy',
        pool: {
          total: poolSize,
          idle: idleCount,
          waiting: waitingCount,
          active: poolSize - idleCount,
        },
      });

      return result;
    } catch (error) {
      const result = this.getStatus(key, false, {
        status: 'down',
        message: error.message || 'Database connection failed',
      });
      throw new HealthCheckError('Database health check failed', result);
    }
  }

  async checkTables(key: string): Promise<HealthIndicatorResult> {
    try {
      // Get list of tables
      const tables = await this.dataSource.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      `);

      const tableCount = tables.length;

      if (tableCount === 0) {
        throw new Error('No tables found in database');
      }

      const result = this.getStatus(key, true, {
        status: 'up',
        message: `Database has ${tableCount} tables`,
        tableCount,
      });

      return result;
    } catch (error) {
      const result = this.getStatus(key, false, {
        status: 'down',
        message: error.message || 'Failed to check database tables',
      });
      throw new HealthCheckError('Database tables check failed', result);
    }
  }

  async checkMigrations(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if migrations table exists and has records
      const migrations = await this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM migrations
      `);

      const migrationCount = parseInt(migrations[0].count, 10);

      const result = this.getStatus(key, true, {
        status: 'up',
        message: `Database has ${migrationCount} migrations`,
        migrationCount,
      });

      return result;
    } catch (error) {
      const result = this.getStatus(key, false, {
        status: 'down',
        message: error.message || 'Failed to check database migrations',
      });
      throw new HealthCheckError('Database migrations check failed', result);
    }
  }
}
