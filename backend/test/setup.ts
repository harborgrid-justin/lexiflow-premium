import { DataSource } from 'typeorm';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_NAME = 'lexiflow_test';
});

afterAll(async () => {
  // Cleanup after all tests
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'lexiflow_test',
  });

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

// Increase timeout for E2E tests
jest.setTimeout(30000);
