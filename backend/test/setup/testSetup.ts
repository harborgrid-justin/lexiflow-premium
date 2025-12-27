import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

const logger = new Logger('TestSetup');

let testDataSource: DataSource | null = null;

export const getTestDataSource = (): DataSource | null => testDataSource;

export const setTestDataSource = (dataSource: DataSource): void => {
  testDataSource = dataSource;
};

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_NAME = process.env.TEST_DATABASE_NAME || 'lexiflow_test';
  process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_REFRESH_SECRET = process.env.TEST_JWT_REFRESH_SECRET || 'test-refresh-secret-key-for-testing-only';
  process.env.JWT_EXPIRATION = '900';
  process.env.JWT_REFRESH_EXPIRATION = '604800';
  process.env.REDIS_HOST = process.env.TEST_REDIS_HOST || 'localhost';
  process.env.REDIS_PORT = process.env.TEST_REDIS_PORT || '6379';
  process.env.REDIS_PASSWORD = process.env.TEST_REDIS_PASSWORD || '';
  process.env.ENCRYPTION_KEY = process.env.TEST_ENCRYPTION_KEY || 'test-encryption-key-32-chars!!';
  process.env.ENCRYPTION_ALGORITHM = 'aes-256-gcm';

  logger.log('Test environment initialized');
});

afterAll(async () => {
  if (testDataSource?.isInitialized) {
    try {
      await testDataSource.destroy();
      logger.log('Test data source destroyed');
    } catch (error) {
      logger.error('Error destroying test data source', error instanceof Error ? error.stack : String(error));
    }
  }

  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 100);
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(async () => {
  jest.restoreAllMocks();
});

jest.setTimeout(30000);

export const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

export const createMockRepository = <T>() => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    execute: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
  })),
});

export const createMockConfigService = (config: Record<string, any> = {}) => ({
  get: jest.fn((key: string, defaultValue?: any) => {
    const configMap: Record<string, any> = {
      'jwt.secret': 'test-jwt-secret-key-for-testing-only',
      'jwt.refreshSecret': 'test-refresh-secret-key-for-testing-only',
      'jwt.expiresIn': '900',
      'jwt.refreshExpiresIn': '604800',
      JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
      JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing-only',
      JWT_EXPIRATION: '900',
      JWT_REFRESH_EXPIRATION: '604800',
      REFRESH_TOKEN_TTL_DAYS: '7',
      RESET_TOKEN_TTL_HOURS: '1',
      MFA_TOKEN_TTL_MINUTES: '5',
      ENCRYPTION_KEY: 'test-encryption-key-32-chars!!',
      ENCRYPTION_ALGORITHM: 'aes-256-gcm',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: '5432',
      DATABASE_USER: 'postgres',
      DATABASE_PASSWORD: 'postgres',
      DATABASE_NAME: 'lexiflow_test',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: '',
      ...config,
    };
    return configMap[key] !== undefined ? configMap[key] : defaultValue;
  }),
  getOrThrow: jest.fn((key: string) => {
    const configMap: Record<string, any> = {
      'jwt.secret': 'test-jwt-secret-key-for-testing-only',
      'jwt.refreshSecret': 'test-refresh-secret-key-for-testing-only',
      JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
      JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing-only',
      ...config,
    };
    if (configMap[key] === undefined) {
      throw new Error(`Configuration key "${key}" not found`);
    }
    return configMap[key];
  }),
});

export const createMockJwtService = () => ({
  sign: jest.fn((payload: any) => `mock.jwt.token.${JSON.stringify(payload)}`),
  signAsync: jest.fn((payload: any) => Promise.resolve(`mock.jwt.token.${JSON.stringify(payload)}`)),
  verify: jest.fn((token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length === 3 && parts[0] === 'mock') {
        return JSON.parse(parts[2]);
      }
      return { sub: 'test-user-id', email: 'test@example.com', role: 'CLIENT_USER' };
    } catch {
      throw new Error('Invalid token');
    }
  }),
  verifyAsync: jest.fn((token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length === 3 && parts[0] === 'mock') {
        return Promise.resolve(JSON.parse(parts[2]));
      }
      return Promise.resolve({ sub: 'test-user-id', email: 'test@example.com', role: 'CLIENT_USER' });
    } catch {
      return Promise.reject(new Error('Invalid token'));
    }
  }),
  decode: jest.fn((token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length === 3 && parts[0] === 'mock') {
        return JSON.parse(parts[2]);
      }
      return { sub: 'test-user-id', email: 'test@example.com', role: 'CLIENT_USER' };
    } catch {
      return null;
    }
  }),
});

export const createMockCacheManager = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
  wrap: jest.fn((key: string, fn: () => Promise<any>) => fn()),
  store: {
    keys: jest.fn(() => Promise.resolve([])),
    ttl: jest.fn(() => Promise.resolve(0)),
    mget: jest.fn(() => Promise.resolve([])),
    mset: jest.fn(() => Promise.resolve()),
    mdel: jest.fn(() => Promise.resolve()),
  },
});

export const createMockEventEmitter = () => ({
  emit: jest.fn(),
  emitAsync: jest.fn(() => Promise.resolve([])),
  on: jest.fn(),
  once: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  listeners: jest.fn(() => []),
  listenerCount: jest.fn(() => 0),
});

export const createMockQueue = () => ({
  add: jest.fn((name: string, data: any, opts?: any) =>
    Promise.resolve({
      id: `job-${Date.now()}`,
      name,
      data,
      opts,
      progress: jest.fn(),
      remove: jest.fn(),
      retry: jest.fn(),
      discard: jest.fn(),
      promote: jest.fn(),
      finished: jest.fn(() => Promise.resolve({})),
    })
  ),
  process: jest.fn(),
  getJob: jest.fn(),
  getJobs: jest.fn(() => Promise.resolve([])),
  getJobCounts: jest.fn(() => Promise.resolve({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
  })),
  clean: jest.fn(() => Promise.resolve([])),
  pause: jest.fn(() => Promise.resolve()),
  resume: jest.fn(() => Promise.resolve()),
  empty: jest.fn(() => Promise.resolve()),
  close: jest.fn(() => Promise.resolve()),
  on: jest.fn(),
  removeListener: jest.fn(),
});

export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createTestTransaction = async (callback: (entityManager: any) => Promise<void>) => {
  const mockEntityManager = {
    save: jest.fn((entity: any) => Promise.resolve(entity)),
    remove: jest.fn((entity: any) => Promise.resolve(entity)),
    find: jest.fn(() => Promise.resolve([])),
    findOne: jest.fn(() => Promise.resolve(null)),
    create: jest.fn((entity: any) => entity),
    update: jest.fn(() => Promise.resolve({ affected: 1 })),
    delete: jest.fn(() => Promise.resolve({ affected: 1 })),
    query: jest.fn(() => Promise.resolve([])),
    createQueryBuilder: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn(() => Promise.resolve({ identifiers: [], generatedMaps: [], raw: [] })),
    })),
  };

  try {
    await callback(mockEntityManager);
  } catch (error) {
    throw error;
  }
};

export const suppressConsoleErrors = () => {
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });
};

export const restoreConsole = () => {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.debug,
  };

  return () => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.debug = originalConsole.debug;
  };
};

export default {
  mockLogger,
  createMockRepository,
  createMockConfigService,
  createMockJwtService,
  createMockCacheManager,
  createMockEventEmitter,
  createMockQueue,
  waitFor,
  createTestTransaction,
  suppressConsoleErrors,
  restoreConsole,
  getTestDataSource,
  setTestDataSource,
};
