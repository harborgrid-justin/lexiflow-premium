import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

const logger = new Logger('TestDatabase');

export interface TestDatabaseConfig {
  type: 'postgres' | 'sqlite' | 'mysql';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  synchronize?: boolean;
  dropSchema?: boolean;
  logging?: boolean;
}

export class TestDatabaseHelper {
  private dataSource: DataSource | null = null;
  private queryRunner: QueryRunner | null = null;

  async createTestDataSource(config: TestDatabaseConfig): Promise<DataSource> {
    const defaultConfig: TestDatabaseConfig = {
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'lexiflow_test',
      synchronize: true,
      dropSchema: true,
      logging: false,
    };

    const finalConfig = { ...defaultConfig, ...config };

    this.dataSource = new DataSource({
      type: finalConfig.type,
      host: finalConfig.host,
      port: finalConfig.port,
      username: finalConfig.username,
      password: finalConfig.password,
      database: finalConfig.database,
      entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
      synchronize: finalConfig.synchronize,
      dropSchema: finalConfig.dropSchema,
      logging: finalConfig.logging,
    });

    await this.dataSource.initialize();
    logger.log(`Test database initialized: ${finalConfig.database}`);
    return this.dataSource;
  }

  async getDataSource(): Promise<DataSource> {
    if (!this.dataSource) {
      throw new Error('DataSource not initialized. Call createTestDataSource first.');
    }
    return this.dataSource;
  }

  async closeConnection(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      logger.log('Test database connection closed');
      this.dataSource = null;
    }
  }

  async cleanDatabase(): Promise<void> {
    if (!this.dataSource?.isInitialized) {
      return;
    }

    const entities = this.dataSource.entityMetadatas;
    const tableNames = entities.map((entity) => `"${entity.tableName}"`).join(', ');

    if (tableNames) {
      await this.dataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
      logger.log('Database cleaned');
    }
  }

  async dropAllTables(): Promise<void> {
    if (!this.dataSource?.isInitialized) {
      return;
    }

    await this.dataSource.dropDatabase();
    await this.dataSource.synchronize();
    logger.log('All tables dropped and recreated');
  }

  async startTransaction(): Promise<QueryRunner> {
    if (!this.dataSource?.isInitialized) {
      throw new Error('DataSource not initialized');
    }

    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    logger.log('Transaction started');
    return this.queryRunner;
  }

  async commitTransaction(): Promise<void> {
    if (!this.queryRunner) {
      throw new Error('No active transaction');
    }

    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
    logger.log('Transaction committed');
    this.queryRunner = null;
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.queryRunner) {
      return;
    }

    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
    logger.log('Transaction rolled back');
    this.queryRunner = null;
  }

  async runInTransaction<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
    const queryRunner = await this.startTransaction();
    try {
      const result = await callback(queryRunner.manager);
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  getRepository<T>(entity: new () => T): Repository<T> {
    if (!this.dataSource?.isInitialized) {
      throw new Error('DataSource not initialized');
    }

    if (this.queryRunner) {
      return this.queryRunner.manager.getRepository(entity);
    }

    return this.dataSource.getRepository(entity);
  }

  async seedData<T>(entity: new () => T, data: Partial<T>[]): Promise<T[]> {
    const repository = this.getRepository(entity);
    const entities = repository.create(data as any);
    return await repository.save(entities as any);
  }

  async clearTable(tableName: string): Promise<void> {
    if (!this.dataSource?.isInitialized) {
      return;
    }

    await this.dataSource.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    logger.log(`Table ${tableName} cleared`);
  }

  async countRecords(tableName: string): Promise<number> {
    if (!this.dataSource?.isInitialized) {
      return 0;
    }

    const result = await this.dataSource.query(`SELECT COUNT(*) as count FROM "${tableName}";`);
    return parseInt(result[0].count, 10);
  }

  async executeRawQuery(query: string, parameters?: any[]): Promise<any> {
    if (!this.dataSource?.isInitialized) {
      throw new Error('DataSource not initialized');
    }

    return await this.dataSource.query(query, parameters);
  }

  async waitForConnection(maxRetries: number = 10, retryDelay: number = 1000): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (this.dataSource?.isInitialized) {
          await this.dataSource.query('SELECT 1');
          logger.log('Database connection verified');
          return;
        }
      } catch (error) {
        if (i === maxRetries - 1) {
          throw new Error(`Failed to connect to database after ${maxRetries} retries`);
        }
        logger.warn(`Database connection attempt ${i + 1} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
}

export class TestTransactionWrapper {
  constructor(private readonly dataSource: DataSource) {}

  async wrap<T>(testFn: (manager: EntityManager) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await testFn(queryRunner.manager);
      await queryRunner.rollbackTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

export const createTestDatabaseHelper = (): TestDatabaseHelper => {
  return new TestDatabaseHelper();
};

export const withTestTransaction = async <T>(
  dataSource: DataSource,
  callback: (manager: EntityManager) => Promise<T>
): Promise<T> => {
  const wrapper = new TestTransactionWrapper(dataSource);
  return wrapper.wrap(callback);
};

export const mockEntityManager = {
  save: jest.fn((entity: any) => Promise.resolve(entity)),
  remove: jest.fn((entity: any) => Promise.resolve(entity)),
  find: jest.fn(() => Promise.resolve([])),
  findOne: jest.fn(() => Promise.resolve(null)),
  findOneBy: jest.fn(() => Promise.resolve(null)),
  create: jest.fn((entityData: any) => entityData),
  update: jest.fn(() => Promise.resolve({ affected: 1, raw: [], generatedMaps: [] })),
  delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] })),
  count: jest.fn(() => Promise.resolve(0)),
  query: jest.fn(() => Promise.resolve([])),
  transaction: jest.fn((cb: any) => cb(mockEntityManager)),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(() => Promise.resolve(null)),
    getMany: jest.fn(() => Promise.resolve([])),
    getManyAndCount: jest.fn(() => Promise.resolve([[], 0])),
    getCount: jest.fn(() => Promise.resolve(0)),
    execute: jest.fn(() => Promise.resolve({ affected: 0, raw: [], generatedMaps: [] })),
  })),
};

export const createMockDataSource = (): DataSource => {
  return {
    isInitialized: true,
    initialize: jest.fn(() => Promise.resolve({} as DataSource)),
    destroy: jest.fn(() => Promise.resolve()),
    synchronize: jest.fn(() => Promise.resolve()),
    dropDatabase: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => Promise.resolve([])),
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(() => Promise.resolve()),
      startTransaction: jest.fn(() => Promise.resolve()),
      commitTransaction: jest.fn(() => Promise.resolve()),
      rollbackTransaction: jest.fn(() => Promise.resolve()),
      release: jest.fn(() => Promise.resolve()),
      manager: mockEntityManager,
    })),
    getRepository: jest.fn(() => ({
      find: jest.fn(() => Promise.resolve([])),
      findOne: jest.fn(() => Promise.resolve(null)),
      findOneBy: jest.fn(() => Promise.resolve(null)),
      save: jest.fn((entity: any) => Promise.resolve(entity)),
      create: jest.fn((entityData: any) => entityData),
      update: jest.fn(() => Promise.resolve({ affected: 1 })),
      delete: jest.fn(() => Promise.resolve({ affected: 1 })),
      remove: jest.fn((entity: any) => Promise.resolve(entity)),
      count: jest.fn(() => Promise.resolve(0)),
    })),
    manager: mockEntityManager,
    entityMetadatas: [],
  } as any;
};

export default {
  TestDatabaseHelper,
  TestTransactionWrapper,
  createTestDatabaseHelper,
  withTestTransaction,
  mockEntityManager,
  createMockDataSource,
};
