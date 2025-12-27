import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

/**
 * Enterprise Database Configuration
 *
 * CRITICAL: synchronize is set to false for production safety
 * Use migrations for all schema changes in production environments
 *
 * @see https://typeorm.io/data-source-options#common-data-source-options
 */

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// SECURITY: Never use synchronize:true in production
// This can cause data loss and bypasses migration control
const shouldSynchronize = isDevelopment && process.env.DB_SYNCHRONIZE === 'true';

export const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      // PRODUCTION SAFETY: synchronize disabled by default - use migrations
      synchronize: shouldSynchronize,
      // Enable automatic migration execution on startup
      migrationsRun: process.env.DB_MIGRATIONS_RUN !== 'false',
      logging: process.env.DB_LOGGING === 'true' || isDevelopment,
      maxQueryExecutionTime: 1000, // Log queries taking longer than 1 second
      ssl: {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      },
      // Enterprise connection pooling configuration
      extra: {
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        min: parseInt(process.env.DB_POOL_MIN || '5'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        // Statement timeout to prevent long-running queries
        statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
      },
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'lexiflow_user',
      password: process.env.DB_PASSWORD || 'lexiflow_password',
      database: process.env.DB_DATABASE || 'lexiflow_db',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      // PRODUCTION SAFETY: synchronize disabled by default - use migrations
      synchronize: shouldSynchronize,
      // Enable automatic migration execution on startup
      migrationsRun: process.env.DB_MIGRATIONS_RUN !== 'false',
      logging: process.env.DB_LOGGING === 'true' || isDevelopment,
      maxQueryExecutionTime: 1000, // Log queries taking longer than 1 second
      ssl: process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,
      // Enterprise connection pooling configuration
      extra: {
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        min: parseInt(process.env.DB_POOL_MIN || '5'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        // Statement timeout to prevent long-running queries
        statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
      },
    };

// Log configuration warning if synchronize is enabled
if (shouldSynchronize) {
  console.warn('⚠️  WARNING: Database synchronize is enabled. This should NEVER be used in production!');
}

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
