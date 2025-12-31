import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * DatabasePoolConfigService
 *
 * Provides globally injectable access to database pool configuration.
 * Consolidates pool size, timeouts, eviction, and query limits.
 */
/**
 * ╔=================================================================================================================╗
 * ║DATABASEPOOLCONFIG                                                                                               ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class DatabasePoolConfigService {
  // Pool Size
  get poolMax(): number {
    return MasterConfig.DB_POOL_MAX;
  }

  get poolMin(): number {
    return MasterConfig.DB_POOL_MIN;
  }

  // Timeouts
  get idleTimeout(): number {
    return MasterConfig.DB_IDLE_TIMEOUT;
  }

  get connectionTimeout(): number {
    return MasterConfig.DB_CONNECTION_TIMEOUT;
  }

  get statementTimeout(): number {
    return MasterConfig.DB_STATEMENT_TIMEOUT;
  }

  get queryTimeout(): number {
    return MasterConfig.DB_QUERY_TIMEOUT;
  }

  get acquireTimeout(): number {
    return MasterConfig.DB_ACQUIRE_TIMEOUT;
  }

  // Connection Management
  get maxUses(): number {
    return MasterConfig.DB_MAX_USES;
  }

  get evictionRunInterval(): number {
    return MasterConfig.DB_EVICTION_RUN_INTERVAL;
  }

  get keepConnectionAlive(): boolean {
    return MasterConfig.DB_KEEP_CONNECTION_ALIVE;
  }

  // Query Settings
  get maxQueryExecutionTime(): number {
    return MasterConfig.DB_MAX_QUERY_EXECUTION_TIME;
  }

  get enableListeners(): boolean {
    return MasterConfig.DB_ENABLE_LISTENERS;
  }

  get autoLoadEntities(): boolean {
    return MasterConfig.DB_AUTO_LOAD_ENTITIES;
  }

  // Database Behavior
  get synchronize(): boolean {
    return MasterConfig.DB_SYNCHRONIZE;
  }

  get migrationsRun(): boolean {
    return MasterConfig.DB_MIGRATIONS_RUN;
  }

  get logging(): boolean {
    return MasterConfig.DB_LOGGING;
  }

  // SSL
  get ssl(): boolean {
    return MasterConfig.DB_SSL;
  }

  get sslRejectUnauthorized(): boolean {
    return MasterConfig.DB_SSL_REJECT_UNAUTHORIZED;
  }

  /**
   * Get pool configuration
   */
  getPoolConfig(): Record<string, unknown> {
    return {
      max: this.poolMax,
      min: this.poolMin,
      idleTimeout: this.idleTimeout,
      connectionTimeout: this.connectionTimeout,
      acquireTimeout: this.acquireTimeout,
      maxUses: this.maxUses,
      evictionRunInterval: this.evictionRunInterval,
    };
  }

  /**
   * Get timeout configuration
   */
  getTimeoutConfig(): Record<string, number> {
    return {
      idle: this.idleTimeout,
      connection: this.connectionTimeout,
      statement: this.statementTimeout,
      query: this.queryTimeout,
      acquire: this.acquireTimeout,
      maxQueryExecution: this.maxQueryExecutionTime,
    };
  }

  /**
   * Get SSL configuration
   */
  getSslConfig(): Record<string, boolean> {
    return {
      enabled: this.ssl,
      rejectUnauthorized: this.sslRejectUnauthorized,
    };
  }

  /**
   * Get summary of all configurations
   */
  getSummary(): Record<string, unknown> {
    return {
      pool: this.getPoolConfig(),
      timeouts: this.getTimeoutConfig(),
      ssl: this.getSslConfig(),
      behavior: {
        synchronize: this.synchronize,
        migrationsRun: this.migrationsRun,
        logging: this.logging,
        keepAlive: this.keepConnectionAlive,
      },
    };
  }
}
