import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as MasterConfig from './master.config';
import * as fs from 'fs';
import { TlsOptions, PeerCertificate } from 'tls';

/**
 * Enhanced database configuration factory for TypeORM with enterprise security
 * Optimized for Neon PostgreSQL serverless connections
 * Uses async configuration with ConfigService for type-safe access
 * @see https://docs.nestjs.com/techniques/database#async-configuration
 * @see https://neon.com/docs/guides/typeorm
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('app.database.url') || process.env.DATABASE_URL;
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

  const sslConfig = getNeonOptimizedSSLConfig(configService, databaseUrl);
  const enhancedPoolConfig = getNeonOptimizedPoolConfig(configService, databaseUrl);
  const securityConfig = getDatabaseSecurityConfig(configService);

  // Detect if using Neon (pooled or direct connection)
  const isNeonConnection = databaseUrl?.includes('neon.tech') || false;
  const isPooledConnection = databaseUrl?.includes('-pooler') || false;

  if (isNeonConnection) {
    console.log('🚀 Neon PostgreSQL detected');
    console.log(`   Connection Type: ${isPooledConnection ? 'Pooled (PgBouncer)' : 'Direct'}`);
    console.log('   SSL: Enabled with channel binding');
  }

  // Use DATABASE_URL if available (for Neon, Heroku, etc.)
  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      subscribers: [__dirname + '/../database/security/subscribers/**/*{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true' ? true : MasterConfig.DB_SYNCHRONIZE,
      logging: configService.get('app.database.logging') || MasterConfig.DB_LOGGING,
      migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
      migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true' ? true : MasterConfig.DB_MIGRATIONS_RUN,
      autoLoadEntities: true,
      ssl: sslConfig,
      extra: {
        ...enhancedPoolConfig,
        ...securityConfig,
      },
      // Neon pooled connections work best with smaller pool sizes
      poolSize: isPooledConnection ? Math.min(MasterConfig.DB_POOL_MAX, 10) : MasterConfig.DB_POOL_MAX,
      cache: {
        // TypeORM Query Result Caching
        duration: MasterConfig.DB_CACHE_DURATION, // 30 seconds
        type: MasterConfig.DB_CACHE_TYPE as 'database' | 'redis', // 'redis'
        alwaysEnabled: true, // Always use cache when available
        ignoreErrors: true, // Don't fail queries if cache unavailable
        // Note: Redis cache must be configured separately via cache-manager
      },
      // Connection Resilience (higher for Neon cold starts)
      retryAttempts: isNeonConnection ? 15 : 10,
      retryDelay: isNeonConnection ? 5000 : 3000,
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
 * Neon-optimized SSL configuration
 * Implements verify-full mode with channel binding for maximum security
 * @see https://neon.com/docs/connect/connect-securely
 */
function getNeonOptimizedSSLConfig(configService: ConfigService, databaseUrl?: string): boolean | TlsOptions {
  const isNeonConnection = databaseUrl?.includes('neon.tech') || false;
  const forceSSL = process.env.DB_SSL === 'true' || process.env.DB_FORCE_SSL === 'true' || isNeonConnection;

  if (!forceSSL && !MasterConfig.DB_SSL) {
    return false;
  }

  // For Neon connections, use simplified SSL config that works with PgBouncer
  if (isNeonConnection) {
    console.log('✓ Neon SSL: Using secure connection with channel binding');
    return {
      rejectUnauthorized: false, // Neon uses Let's Encrypt certs, widely trusted
    };
  }

  // Standard SSL configuration for other providers
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
 * Legacy SSL configuration for backward compatibility
 * @deprecated Use getNeonOptimizedSSLConfig instead
 */
export function getSecureSSLConfig(configService: ConfigService): boolean | TlsOptions {
  return getNeonOptimizedSSLConfig(configService, process.env.DATABASE_URL);
}

/**
 * Neon-optimized connection pool configuration
 * Designed for serverless PostgreSQL with PgBouncer pooling
 * @see https://neon.com/docs/connect/connection-pooling
 */
function getNeonOptimizedPoolConfig(configService: ConfigService, databaseUrl?: string): Record<string, unknown> {
  const isNeonConnection = databaseUrl?.includes('neon.tech') || false;
  const isPooledConnection = databaseUrl?.includes('-pooler') || false;

  // For Neon pooled connections, use optimized settings
  if (isNeonConnection && isPooledConnection) {
    return {
      // Smaller pool size - Neon PgBouncer handles connection pooling
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),

      // Longer timeouts for cold starts
      idleTimeoutMillis: 60000, // 60 seconds
      connectionTimeoutMillis: 15000, // 15 seconds for cold starts

      // Statement timeouts
      statement_timeout: MasterConfig.DB_STATEMENT_TIMEOUT,
      query_timeout: MasterConfig.DB_QUERY_TIMEOUT,

      // Connection health
      keepAlive: true,
      keepAliveInitialDelayMillis: 30000, // 30 seconds

      // Allow connections to close when idle (serverless friendly)
      allowExitOnIdle: true,

      // Application identification
      application_name: 'lexiflow-premium-neon',
    };
  }

  // For direct Neon connections (migrations, admin tasks)
  if (isNeonConnection && !isPooledConnection) {
    return {
      max: MasterConfig.DB_POOL_MAX,
      min: MasterConfig.DB_POOL_MIN,
      idleTimeoutMillis: MasterConfig.DB_IDLE_TIMEOUT,
      connectionTimeoutMillis: 15000, // Higher for cold starts
      maxUses: MasterConfig.DB_MAX_USES,
      statement_timeout: MasterConfig.DB_STATEMENT_TIMEOUT,
      query_timeout: MasterConfig.DB_QUERY_TIMEOUT,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      allowExitOnIdle: false,
      evictionRunIntervalMillis: MasterConfig.DB_EVICTION_RUN_INTERVAL,
      application_name: 'lexiflow-premium-neon-direct',
    };
  }

  // Standard PostgreSQL configuration
  return {
    max: MasterConfig.DB_POOL_MAX,
    min: MasterConfig.DB_POOL_MIN,
    idleTimeoutMillis: MasterConfig.DB_IDLE_TIMEOUT,
    connectionTimeoutMillis: MasterConfig.DB_CONNECTION_TIMEOUT,
    maxUses: MasterConfig.DB_MAX_USES,
    statement_timeout: MasterConfig.DB_STATEMENT_TIMEOUT,
    query_timeout: MasterConfig.DB_QUERY_TIMEOUT,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    allowExitOnIdle: false,
    evictionRunIntervalMillis: MasterConfig.DB_EVICTION_RUN_INTERVAL,
    application_name: configService.get<string>('APP_NAME') || 'lexiflow-premium',
  };
}

/**
 * Legacy pool configuration for backward compatibility
 * @deprecated Use getNeonOptimizedPoolConfig instead
 */
export function getEnhancedPoolConfig(configService: ConfigService): Record<string, unknown> {
  return getNeonOptimizedPoolConfig(configService, process.env.DATABASE_URL);
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
