import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Database test utilities for managing test database
 */
export class DatabaseTestUtils {
  /**
   * Create a test database connection
   */
  static async createTestDataSource(
    configService?: ConfigService,
  ): Promise<DataSource> {
    const dataSource = new DataSource({
      type: 'postgres',
      host: configService?.get('DATABASE_HOST') || 'localhost',
      port: configService?.get('DATABASE_PORT') || 5432,
      username: configService?.get('DATABASE_USER') || 'postgres',
      password: configService?.get('DATABASE_PASSWORD') || 'postgres',
      database: configService?.get('DATABASE_NAME') || 'lexiflow_test',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      dropSchema: true,
      logging: false,
    });

    await dataSource.initialize();
    return dataSource;
  }

  /**
   * Clean all tables in the test database
   */
  static async cleanDatabase(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(
        `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`,
      );
    }
  }

  /**
   * Close database connection
   */
  static async closeTestDataSource(dataSource: DataSource): Promise<void> {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }

  /**
   * Seed database with test data
   */
  static async seedDatabase(
    dataSource: DataSource,
    seedData: Record<string, any[]>,
  ): Promise<void> {
    for (const [entityName, records] of Object.entries(seedData)) {
      const repository = dataSource.getRepository(entityName);
      await repository.save(records);
    }
  }

  /**
   * Create a test transaction for isolated tests
   */
  static async withTransaction<T>(
    dataSource: DataSource,
    callback: (queryRunner: any) => Promise<T>,
  ): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Wait for database to be ready
   */
  static async waitForDatabase(
    dataSource: DataSource,
    maxRetries = 10,
    delayMs = 1000,
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await dataSource.query('SELECT 1');
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw new Error('Database connection timeout');
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}

/**
 * Helper to create a test repository
 */
export function createTestRepository<T>(dataSource: DataSource, entity: any) {
  return dataSource.getRepository<T>(entity);
}

/**
 * Helper to count records in a table
 */
export async function countRecords(
  dataSource: DataSource,
  entityName: string,
): Promise<number> {
  const repository = dataSource.getRepository(entityName);
  return repository.count();
}

/**
 * Helper to find one record by criteria
 */
export async function findOneRecord<T>(
  dataSource: DataSource,
  entityName: string,
  criteria: any,
): Promise<T | null> {
  const repository = dataSource.getRepository(entityName);
  return repository.findOne({ where: criteria }) as Promise<T | null>;
}

/**
 * Helper to find all records by criteria
 */
export async function findRecords<T>(
  dataSource: DataSource,
  entityName: string,
  criteria?: any,
): Promise<T[]> {
  const repository = dataSource.getRepository(entityName);
  return (criteria ? repository.find({ where: criteria }) : repository.find()) as Promise<T[]>;
}
