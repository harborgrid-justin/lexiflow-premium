import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as MasterConfig from './master.config';
import * as fs from 'fs';
import { TlsOptions, PeerCertificate } from 'tls';

/**
 * Enhanced database configuration factory for TypeORM with enterprise security
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
      autoLoadEntities: true,
    };
  }

  const sslConfig = getSecureSSLConfig(configService);
  const enhancedPoolConfig = getEnhancedPoolConfig(configService);
  const securityConfig = getDatabaseSecurityConfig(configService);

  // Use DATABASE_URL if available (for Neon, Heroku, etc.)
  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      subscribers: [__dirname + '/../database/security/subscribers/**/*{.ts,.js}'],
      synchronize: MasterConfig.DB_SYNCHRONIZE,
      logging: configService.get('app.database.logging') || MasterConfig.DB_LOGGING,
      migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
      migrationsRun: MasterConfig.DB_MIGRATIONS_RUN,
      autoLoadEntities: true,
      ssl: sslConfig,
      extra: {
        ...enhancedPoolConfig,
        ...securityConfig,
      },
      poolSize: MasterConfig.DB_POOL_MAX,
      cache: {
        // TypeORM Query Result Caching
        duration: MasterConfig.DB_CACHE_DURATION, // 30 seconds
        type: MasterConfig.DB_CACHE_TYPE as 'database' | 'redis', // 'redis'
        alwaysEnabled: true, // Always use cache when available
        ignoreErrors: true, // Don't fail queries if cache unavailable
        // Note: Redis cache must be configured separately via cache-manager
      },
      // Connection Resilience
      retryAttempts: 10,
      retryDelay: 3000,
      // Query Performance Limits
      maxQueryExecutionTime: MasterConfig.DB_MAX_QUERY_EXECUTION_TIME, // 60 seconds
      // Security: Prevent dangerous operations
      dropSchema: false,
      installExtensions: false,
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
    subscribers: [__dirname + '/../database/security/subscribers/**/*{.ts,.js}'],
    synchronize: MasterConfig.DB_SYNCHRONIZE,
    logging: MasterConfig.DB_LOGGING,
    migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
    migrationsRun: MasterConfig.DB_MIGRATIONS_RUN,
    autoLoadEntities: true,
    ssl: sslConfig,
    extra: {
      ...enhancedPoolConfig,
      ...securityConfig,
    },
    poolSize: MasterConfig.DB_POOL_MAX,
    cache: {
      // TypeORM Query Result Caching
      duration: MasterConfig.DB_CACHE_DURATION, // 30 seconds
      type: MasterConfig.DB_CACHE_TYPE as 'database' | 'redis', // 'redis'
      alwaysEnabled: true, // Always use cache when available
      ignoreErrors: true, // Don't fail queries if cache unavailable
      // Note: Redis cache must be configured separately via cache-manager
    },
    // Connection Resilience
    retryAttempts: 10,
    retryDelay: 3000,
    // Query Performance Limits
    maxQueryExecutionTime: MasterConfig.DB_MAX_QUERY_EXECUTION_TIME, // 60 seconds
    // Security: Prevent dangerous operations
    dropSchema: false,
    installExtensions: false,
  };
};

/**
 * Enhanced SSL configuration with certificate validation
 * Supports custom CA certificates for enterprise deployments
 */
function getSecureSSLConfig(configService: ConfigService): boolean | TlsOptions {
  if (!MasterConfig.DB_SSL) {
    return false;
  }

  const sslConfig: TlsOptions = {
    rejectUnauthorized: MasterConfig.DB_SSL_REJECT_UNAUTHORIZED,
  };

  const caCertPath = configService.get<string>('DB_SSL_CA_CERT_PATH') || process.env.DB_SSL_CA_CERT_PATH;
  if (caCertPath && fs.existsSync(caCertPath)) {
    sslConfig.ca = fs.readFileSync(caCertPath).toString();
    console.log('✓ Loaded custom CA certificate for database SSL');
  }

  const clientCertPath = configService.get<string>('DB_SSL_CLIENT_CERT_PATH') || process.env.DB_SSL_CLIENT_CERT_PATH;
  const clientKeyPath = configService.get<string>('DB_SSL_CLIENT_KEY_PATH') || process.env.DB_SSL_CLIENT_KEY_PATH;

  if (clientCertPath && fs.existsSync(clientCertPath)) {
    sslConfig.cert = fs.readFileSync(clientCertPath).toString();
    console.log('✓ Loaded client certificate for database SSL');
  }

  if (clientKeyPath && fs.existsSync(clientKeyPath)) {
    sslConfig.key = fs.readFileSync(clientKeyPath).toString();
    console.log('✓ Loaded client key for database SSL');
  }

  // Type assertion needed because TypeScript's TlsOptions definition doesn't include checkServerIdentity
  // but it's a valid property according to Node.js documentation
  (sslConfig as TlsOptions & {
    checkServerIdentity?: (host: string, cert: PeerCertificate) => Error | undefined;
  }).checkServerIdentity = (host: string, cert: PeerCertificate) => {
    const serverName = configService.get<string>('DB_SSL_SERVER_NAME') || host;
    if (cert.subject.CN !== serverName && !cert.subjectaltname?.includes(serverName)) {
      return new Error(`Server identity check failed: ${serverName}`);
    }
    return undefined;
  };

  return sslConfig;
}

/**
 * Enhanced connection pool configuration with performance & security settings
 * Optimized for enterprise-scale legal document management
 */
function getEnhancedPoolConfig(configService: ConfigService): Record<string, unknown> {
  return {
    // Connection Pool Settings - Optimized for High Concurrency
    max: MasterConfig.DB_POOL_MAX, // 20 connections max
    min: MasterConfig.DB_POOL_MIN, // 5 connections min
    idleTimeoutMillis: MasterConfig.DB_IDLE_TIMEOUT, // 30 seconds
    connectionTimeoutMillis: MasterConfig.DB_CONNECTION_TIMEOUT, // 10 seconds
    maxUses: MasterConfig.DB_MAX_USES, // Rotate after 7500 uses
    statement_timeout: MasterConfig.DB_STATEMENT_TIMEOUT, // 60 seconds
    query_timeout: MasterConfig.DB_QUERY_TIMEOUT, // 60 seconds

    // Connection Health & Lifecycle
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000, // 10 seconds

    // Prevent pool shutdown on low activity
    allowExitOnIdle: false,

    // Regular connection health checks
    evictionRunIntervalMillis: MasterConfig.DB_EVICTION_RUN_INTERVAL, // 10 seconds

    // Application identification
    application_name: configService.get<string>('APP_NAME') || 'lexiflow-premium',

    // PostgreSQL Performance Tuning - Disabled for Neon compatibility
    // Neon doesn't support these startup parameters in pooled connections
    // For unpooled connections, you can enable these options
    // See: https://neon.tech/docs/connect/connection-errors#unsupported-startup-parameter
    
    // Note: If using a different PostgreSQL provider or unpooled Neon connection,
    // you can uncomment the options below for performance optimization
    /*
    options: [
      // Memory Settings (adjust based on available RAM)
      '-c shared_buffers=1GB', // Shared buffer cache
      '-c effective_cache_size=4GB', // Available OS cache
      '-c work_mem=256MB', // Memory for complex sorts/joins
      '-c maintenance_work_mem=512MB', // Memory for maintenance operations

      // Query Planning & Execution
      '-c random_page_cost=1.1', // SSD optimization
      '-c effective_io_concurrency=200', // Concurrent I/O operations
      '-c default_statistics_target=100', // Query planner statistics

      // Write-Ahead Log (WAL) Performance
      '-c wal_buffers=16MB',
      '-c checkpoint_completion_target=0.9',
      '-c max_wal_size=4GB',
      '-c min_wal_size=1GB',

      // Connection & Resource Limits
      '-c max_connections=100',
      '-c max_locks_per_transaction=64',

      // Parallel Query Execution
      '-c max_parallel_workers_per_gather=4',
      '-c max_parallel_workers=8',
      '-c max_worker_processes=8',

      // Logging (disable in production for performance)
      '-c log_statement=none',
      '-c log_duration=off',
    ].join(' '),
    */
  };
}

/**
 * Database security configuration
 * Enforces prepared statements, query timeouts, and connection encryption
 */
function getDatabaseSecurityConfig(configService: ConfigService): Record<string, unknown> {
  const securityConfig: Record<string, unknown> = {
    preparedStatementCacheSize: configService.get<number>('DB_PREPARED_STATEMENT_CACHE') || 100,

    ssl_min_protocol_version: 'TLSv1.2',

    connect_timeout: 10,

    lock_timeout: configService.get<number>('DB_LOCK_TIMEOUT') || 30000,

    idle_in_transaction_session_timeout: configService.get<number>('DB_IDLE_TRANSACTION_TIMEOUT') || 60000,
  };

  const forceSSL = configService.get<boolean>('DB_FORCE_SSL');
  if (forceSSL) {
    securityConfig.sslmode = 'require';
  }

  const enableRowLevelSecurity = configService.get<boolean>('DB_ENABLE_RLS');
  if (enableRowLevelSecurity) {
    securityConfig.row_security = 'on';
  }

  return securityConfig;
}

/**
 * Validate database configuration on startup
 */
export function validateDatabaseConfig(config: TypeOrmModuleOptions): void {
  if (config.type === 'postgres') {
    const extra = (config as { extra?: Record<string, unknown> }).extra || {};

    if (MasterConfig.DB_SSL && !config.ssl) {
      console.warn('⚠️  WARNING: SSL is disabled but DB_SSL is true in configuration');
    }

    if (typeof extra.max === 'number' && typeof extra.min === 'number' && extra.max < extra.min) {
      throw new Error('Database pool max connections cannot be less than min connections');
    }

    if (typeof extra.connectionTimeoutMillis === 'number' && extra.connectionTimeoutMillis > 60000) {
      console.warn('⚠️  WARNING: Connection timeout is very high (>60s)');
    }

    if (config.synchronize && process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: synchronize must be false in production to prevent data loss');
    }
  }

  console.log('✓ Database configuration validated successfully');
}

/**
 * Get connection health check query
 */
export function getHealthCheckQuery(): string {
  return 'SELECT 1';
}

/**
 * Get database version query
 */
export function getDatabaseVersionQuery(): string {
  return 'SELECT version()';
}
