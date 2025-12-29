import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as MasterConfig from './master.config';
import * as fs from 'fs';
import { TlsOptions, PeerCertificate } from 'tls';

/**
 * Database configuration factory
 * Hardened for Neon PostgreSQL (DIRECT connections only)
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl =
    configService.get<string>('app.database.url') ||
    process.env.DATABASE_URL;

  const useSqliteFallback =
    configService.get<boolean>('app.database.fallbackSqlite') ||
    process.env.DB_FALLBACK_SQLITE === 'true';

  const isDemoMode = process.env.DEMO_MODE === 'true';

  /* ------------------------------------------------------------------ */
  /* SQLite fallback (demo / emergency)                                  */
  /* ------------------------------------------------------------------ */

  if (isDemoMode || useSqliteFallback) {
    console.log('🗄️  Using SQLite database (demo mode / fallback)');
    return {
      type: 'sqlite',
      database: './lexiflow-demo.sqlite',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
      logging:
        configService.get('app.database.logging') ||
        MasterConfig.DB_LOGGING,
    };
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for PostgreSQL');
  }

  /* ------------------------------------------------------------------ */
  /* Neon detection (FORCED DIRECT MODE)                                 */
  /* ------------------------------------------------------------------ */

  const isNeon = databaseUrl.includes('neon.tech');

  if (isNeon) {
    console.log('🚀 Neon PostgreSQL detected');
    console.log('   Connection Mode: DIRECT (PgBouncer disabled)');
    console.log('   SSL: Enabled');
  }

  /* ------------------------------------------------------------------ */
  /* SSL configuration                                                   */
  /* ------------------------------------------------------------------ */

  const sslConfig: boolean | TlsOptions = isNeon
    ? {
        rejectUnauthorized: false,
      }
    : buildStandardSSLConfig(configService);

  /* ------------------------------------------------------------------ */
  /* TypeORM configuration                                               */
  /* ------------------------------------------------------------------ */

  return {
    type: 'postgres',
    url: databaseUrl,

    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    subscribers: [
      __dirname + '/../database/security/subscribers/**/*{.ts,.js}',
    ],
    migrations: [
      __dirname + '/../database/migrations/**/*{.ts,.js}',
    ],

    autoLoadEntities: true,

    synchronize:
      process.env.DB_SYNCHRONIZE === 'true'
        ? true
        : MasterConfig.DB_SYNCHRONIZE,

    migrationsRun:
      process.env.DB_MIGRATIONS_RUN === 'true'
        ? true
        : MasterConfig.DB_MIGRATIONS_RUN,

    logging:
      configService.get('app.database.logging') ||
      MasterConfig.DB_LOGGING,

    ssl: sslConfig,

    /**
     * IMPORTANT:
     * - NO PgBouncer
     * - NO prepared statement caching
     * - NO maxUses
     * - NO eviction timers
     * - NO idle transaction timeouts
     */
    extra: {
      application_name: 'lexiflow-premium-neon-direct',
      connect_timeout: 10,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },

    /**
     * Conservative pool for Neon DIRECT
     */
    poolSize: 5,

    /**
     * Retry logic (Neon cold starts)
     */
    retryAttempts: 10,
    retryDelay: 5000,

    /**
     * Safety
     */
    dropSchema: false,
    installExtensions: false,

    /**
     * Query limits
     */
    maxQueryExecutionTime:
      MasterConfig.DB_MAX_QUERY_EXECUTION_TIME,
  };
};

/* ------------------------------------------------------------------ */
/* Standard SSL (non-Neon)                                             */
/* ------------------------------------------------------------------ */

function buildStandardSSLConfig(
  configService: ConfigService,
): boolean | TlsOptions {
  const forceSSL =
    process.env.DB_SSL === 'true' || MasterConfig.DB_SSL;

  if (!forceSSL) {
    return false;
  }

  const sslConfig: TlsOptions = {
    rejectUnauthorized:
      MasterConfig.DB_SSL_REJECT_UNAUTHORIZED,
  };

  const caPath =
    process.env.DB_SSL_CA_CERT_PATH ||
    configService.get<string>('DB_SSL_CA_CERT_PATH');

  if (caPath && fs.existsSync(caPath)) {
    sslConfig.ca = fs.readFileSync(caPath).toString();
  }

  (sslConfig as TlsOptions & {
    checkServerIdentity?: (
      host: string,
      cert: PeerCertificate,
    ) => Error | undefined;
  }).checkServerIdentity = (host, cert) => {
    const expected =
      process.env.DB_SSL_SERVER_NAME || host;
    if (
      cert.subject.CN !== expected &&
      !cert.subjectaltname?.includes(expected)
    ) {
      return new Error(`SSL identity mismatch: ${expected}`);
    }
    return undefined;
  };

  return sslConfig;
}

/* ------------------------------------------------------------------ */
/* Health helpers                                                      */
/* ------------------------------------------------------------------ */

export function getHealthCheckQuery(): string {
  return 'SELECT 1';
}

export function getDatabaseVersionQuery(): string {
  return 'SELECT version()';
}
