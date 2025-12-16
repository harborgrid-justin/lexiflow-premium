import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get('database.url');
  const useSqliteFallback = configService.get('database.fallbackSqlite') || process.env.DB_FALLBACK_SQLITE === 'true';
  const isDemoMode = process.env.DEMO_MODE === 'true';

  // In demo mode or when SQLite fallback is enabled, use SQLite
  if (isDemoMode || useSqliteFallback) {
    console.log('🗄️  Using SQLite database (demo mode or fallback)');
    return {
      type: 'sqlite',
      database: './lexiflow-demo.sqlite',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-create tables in demo mode
      logging: configService.get('database.logging') || configService.get('nodeEnv') === 'development',
    };
  }

  // Use DATABASE_URL if available (for Neon, Heroku, etc.)
  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: configService.get('nodeEnv') !== 'production',
      logging: configService.get('database.logging') || configService.get('nodeEnv') === 'development',
      migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
      migrationsRun: false,
      ssl: configService.get('database.ssl')
        ? { rejectUnauthorized: configService.get('database.sslRejectUnauthorized') }
        : false,
      // Enhanced connection pooling for production stability
      extra: {
        max: 20, // Maximum pool size (increased from 10)
        min: 5,  // Minimum pool size (new)
        idleTimeoutMillis: 30000, // Close idle connections after 30s
        connectionTimeoutMillis: 10000, // Connection timeout
        maxUses: 7500, // Rotate connections after 7500 uses (prevents memory leaks)
        // Statement timeout for long-running queries
        statement_timeout: 60000, // 60 seconds
        // Query timeout
        query_timeout: 60000,
      },
      // Additional performance optimizations
      poolSize: 20,
      cache: {
        duration: 30000, // Cache query results for 30 seconds
        type: 'database', // Use database-level caching
      },
    };
  }

  // Fallback to individual connection parameters
  return {
    type: 'postgres',
    host: configService.get('database.host'),
    port: configService.get('database.port'),
    username: configService.get('database.user'),
    password: configService.get('database.password'),
    database: configService.get('database.name'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get('nodeEnv') !== 'production',
    logging: configService.get('nodeEnv') === 'development',
    migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
    migrationsRun: false,
    ssl: configService.get('database.ssl')
      ? { rejectUnauthorized: configService.get('database.sslRejectUnauthorized') }
      : false,
    // Enhanced connection pooling for production stability
    extra: {
      max: 20, // Maximum pool size
      min: 5,  // Minimum pool size
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Connection timeout (10s)
      maxUses: 7500, // Rotate connections after 7500 uses (prevents memory leaks)
      // Statement timeout for long-running queries
      statement_timeout: 60000, // 60 seconds
      // Query timeout
      query_timeout: 60000,
    },
    // Additional performance optimizations
    poolSize: 20,
    cache: {
      duration: 30000, // Cache query results for 30 seconds
      type: 'database', // Use database-level caching
    },
  };
};
