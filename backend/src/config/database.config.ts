import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { registerAs } from '@nestjs/config';
import * as path from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'lexiflow_user'),
  password: configService.get('DB_PASSWORD', 'lexiflow_password'),
  database: configService.get('DB_DATABASE', 'lexiflow_db'),

  // Entity configuration
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],

  // Migration configuration
  migrations: [path.join(__dirname, '../database/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  migrationsRun: configService.get('DB_MIGRATIONS_RUN', false),

  // Synchronization (disable in production)
  synchronize: configService.get('DB_SYNCHRONIZE', false),

  // Logging
  logging: configService.get('DB_LOGGING', false) || configService.get('NODE_ENV') === 'development',
  logger: 'advanced-console',

  // Connection pool settings
  extra: {
    // Connection pool settings
    max: configService.get<number>('DB_POOL_MAX', 20),
    min: configService.get<number>('DB_POOL_MIN', 2),

    // Idle connection timeout (milliseconds)
    idleTimeoutMillis: configService.get<number>('DB_IDLE_TIMEOUT', 30000),

    // Connection timeout
    connectionTimeoutMillis: configService.get<number>('DB_CONNECTION_TIMEOUT', 10000),

    // Query timeout
    query_timeout: configService.get<number>('DB_QUERY_TIMEOUT', 60000),

    // Statement timeout (PostgreSQL specific)
    statement_timeout: configService.get<number>('DB_STATEMENT_TIMEOUT', 60000),

    // Application name (helps identify connections in PostgreSQL)
    application_name: 'lexiflow-backend',
  },

  // SSL configuration
  ssl: configService.get('DB_SSL', false)
    ? {
        rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED', false),
      }
    : false,

  // Automatic transaction support
  autoLoadEntities: true,

  // Keep connection alive
  keepConnectionAlive: true,

  // Retry configuration
  retryAttempts: configService.get<number>('DB_RETRY_ATTEMPTS', 10),
  retryDelay: configService.get<number>('DB_RETRY_DELAY', 3000),

  // Timezone
  timezone: 'Z',
});

// Standalone configuration for direct import
export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'lexiflow_user',
  password: process.env.DB_PASSWORD || 'lexiflow_password',
  database: process.env.DB_DATABASE || 'lexiflow_db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  logging: process.env.DB_LOGGING === 'true' || false,
  ssl: process.env.DB_SSL === 'true',
  poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
}));

export default databaseConfig;
