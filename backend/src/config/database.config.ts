import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as MasterConfig from './master.config';

/**
 * Database configuration factory for TypeORM
 * Uses async configuration with ConfigService for type-safe access
 * @see https://docs.nestjs.com/techniques/database#async-configuration
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('app.database.url');
  const useSqliteFallback = configService.get<boolean>('app.database.fallbackSqlite') || process.env.DB_FALLBACK_SQLITE === 'true';
  const isDemoMode = process.env.DEMO_MODE === 'true';

  // In demo mode or when SQLite fallback is enabled, use SQLite
  if (isDemoMode || useSqliteFallback) {
    console.log('🗄️  Using SQLite database (demo mode or fallback)');
    return {
      type: 'sqlite',
      database: './lexiflow-demo.sqlite',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: configService.get('app.database.logging') || MasterConfig.DB_LOGGING,
      // Enable autoLoadEntities for cleaner module definitions
      // @see https://docs.nestjs.com/techniques/database#auto-load-entities
      autoLoadEntities: true,
    };
  }

  // Use DATABASE_URL if available (for Neon, Heroku, etc.)
  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: MasterConfig.DB_SYNCHRONIZE,
      logging: configService.get('app.database.logging') || MasterConfig.DB_LOGGING,
      migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
      migrationsRun: MasterConfig.DB_MIGRATIONS_RUN,
      autoLoadEntities: true, // Enable auto-load for cleaner code
      ssl: MasterConfig.DB_SSL
        ? { rejectUnauthorized: MasterConfig.DB_SSL_REJECT_UNAUTHORIZED }
        : false,
      extra: {
        max: MasterConfig.DB_POOL_MAX,
        min: MasterConfig.DB_POOL_MIN,
        idleTimeoutMillis: MasterConfig.DB_IDLE_TIMEOUT,
        connectionTimeoutMillis: MasterConfig.DB_CONNECTION_TIMEOUT,
        maxUses: MasterConfig.DB_MAX_USES,
        statement_timeout: MasterConfig.DB_STATEMENT_TIMEOUT,
        query_timeout: MasterConfig.DB_QUERY_TIMEOUT,
      },
      poolSize: MasterConfig.DB_POOL_MAX,
      cache: {
        duration: MasterConfig.DB_CACHE_DURATION,
        type: MasterConfig.DB_CACHE_TYPE as any,
      },
      // Add retry logic for transient connection failures
      retryAttempts: 10,
      retryDelay: 3000,
    };
  }

  // Fallback to individual connection parameters
  return {
    type: 'postgres',
    host: configService.get('app.database.host'),
    port: configService.get('app.database.port'),
    username: configService.get('app.database.user'),
    password: configService.get('app.database.password'),
    database: configService.get('app.database.name'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: MasterConfig.DB_SYNCHRONIZE,
    logging: MasterConfig.DB_LOGGING,
    migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
    migrationsRun: MasterConfig.DB_MIGRATIONS_RUN,
    autoLoadEntities: true, // Enable auto-load for cleaner code
    ssl: MasterConfig.DB_SSL
      ? { rejectUnauthorized: MasterConfig.DB_SSL_REJECT_UNAUTHORIZED }
      : false,
    extra: {
      max: MasterConfig.DB_POOL_MAX,
      min: MasterConfig.DB_POOL_MIN,
      idleTimeoutMillis: MasterConfig.DB_IDLE_TIMEOUT,
      connectionTimeoutMillis: MasterConfig.DB_CONNECTION_TIMEOUT,
      maxUses: MasterConfig.DB_MAX_USES,
      statement_timeout: MasterConfig.DB_STATEMENT_TIMEOUT,
      query_timeout: MasterConfig.DB_QUERY_TIMEOUT,
    },
    poolSize: MasterConfig.DB_POOL_MAX,
    cache: {
      duration: MasterConfig.DB_CACHE_DURATION,
      type: MasterConfig.DB_CACHE_TYPE as any,
    },
    // Add retry logic for transient connection failures
    retryAttempts: 10,
    retryDelay: 3000,
  };
};
