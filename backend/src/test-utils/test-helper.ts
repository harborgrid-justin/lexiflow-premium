import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getDatabaseConfig } from '../config/database.config';
import configuration from '../config/configuration';

export class TestHelper {
  static app: INestApplication;
  static module: TestingModule;

  /**
   * Create a test application
   */
  static async createTestApp(
    imports: any[] = [],
    providers: any[] = [],
  ): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            ...getDatabaseConfig(),
            database: ':memory:',
            synchronize: true,
            dropSchema: true,
          }),
        }),
        ...imports,
      ],
      providers,
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    TestHelper.app = app;
    TestHelper.module = moduleFixture;

    return app;
  }

  /**
   * Close test application
   */
  static async closeTestApp(): Promise<void> {
    if (TestHelper.app) {
      await TestHelper.app.close();
    }
  }

  /**
   * Get service from test module
   */
  static getService<T>(token: any): T {
    return TestHelper.module.get<T>(token);
  }

  /**
   * Create mock repository
   */
  static createMockRepository() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
        getManyAndCount: jest.fn(),
      })),
    };
  }

  /**
   * Create mock event emitter
   */
  static createMockEventEmitter() {
    return {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
    };
  }

  /**
   * Create mock queue
   */
  static createMockQueue() {
    return {
      add: jest.fn(),
      process: jest.fn(),
      getJob: jest.fn(),
      getJobs: jest.fn(),
      clean: jest.fn(),
      empty: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
    };
  }

  /**
   * Create mock logger
   */
  static createMockLogger() {
    return {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };
  }

  /**
   * Create mock config service
   */
  static createMockConfigService(config: Record<string, any> = {}) {
    return {
      get: jest.fn((key: string, defaultValue?: any) => {
        return config[key] || defaultValue;
      }),
    };
  }

  /**
   * Wait for async operations
   */
  static async wait(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
