import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export interface ConnectionPoolMetrics {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  waitingRequests: number;
  averageAcquireTime: number;
  averageQueryTime: number;
  totalQueries: number;
  failedQueries: number;
  leakedConnections: number;
}

export interface ConnectionHealthStatus {
  isHealthy: boolean;
  poolSize: number;
  activeConnections: number;
  idleConnections: number;
  errors: string[];
  lastCheck: Date;
}

interface ConnectionInfo {
  acquiredAt: Date;
  stackTrace: string;
  queryCount: number;
  lastActivity: Date;
}

/**
 * ╔=================================================================================================================╗
 * ║CONNECTIONPOOL                                                                                                   ║
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
export class ConnectionPoolService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConnectionPoolService.name);
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsCollectionInterval?: NodeJS.Timeout;
  private leakDetectionInterval?: NodeJS.Timeout;

  private metrics: ConnectionPoolMetrics = {
    activeConnections: 0,
    idleConnections: 0,
    totalConnections: 0,
    waitingRequests: 0,
    averageAcquireTime: 0,
    averageQueryTime: 0,
    totalQueries: 0,
    failedQueries: 0,
    leakedConnections: 0,
  };

  private acquireTimes: number[] = [];
  private queryTimes: number[] = [];
  private activeConnections: Map<unknown, ConnectionInfo> = new Map();

  private readonly healthCheckIntervalMs: number;
  private readonly metricsIntervalMs: number;
  private readonly leakDetectionIntervalMs: number;
  private readonly idleTimeoutMs: number;
  private readonly maxConnectionAge: number;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService
  ) {
    this.healthCheckIntervalMs =
      this.configService.get<number>("DB_HEALTH_CHECK_INTERVAL") || 30000;
    this.metricsIntervalMs =
      this.configService.get<number>("DB_METRICS_INTERVAL") || 60000;
    this.leakDetectionIntervalMs =
      this.configService.get<number>("DB_LEAK_DETECTION_INTERVAL") || 120000;
    this.idleTimeoutMs =
      this.configService.get<number>("DB_IDLE_TIMEOUT") || 30000;
    this.maxConnectionAge =
      this.configService.get<number>("DB_MAX_CONNECTION_AGE") || 3600000;
  }

  async onModuleInit(): Promise<void> {
    this.logger.log("Initializing connection pool monitoring");

    this.startHealthCheck();
    this.startMetricsCollection();
    this.startLeakDetection();

    await this.validatePoolConfiguration();
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log("Shutting down connection pool monitoring");

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
    }

    if (this.leakDetectionInterval) {
      clearInterval(this.leakDetectionInterval);
    }

    await this.gracefulShutdown();
  }

  private async validatePoolConfiguration(): Promise<void> {
    const driver = this.dataSource.driver;
    const options = this.dataSource.options as {
      extra?: {
        max?: number;
        min?: number;
        idleTimeoutMillis?: number;
        connectionTimeoutMillis?: number;
      };
      poolSize?: number;
    };

    this.logger.log("Connection pool configuration:", {
      type: driver.options.type,
      poolSize: options.extra?.max || options.poolSize,
      minConnections: options.extra?.min,
      idleTimeout: options.extra?.idleTimeoutMillis,
      connectionTimeout: options.extra?.connectionTimeoutMillis,
    });

    if (!this.dataSource.isInitialized) {
      throw new Error("DataSource is not initialized");
    }
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        this.logger.error("Health check failed", error);
      }
    }, this.healthCheckIntervalMs);
  }

  private startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(() => {
      try {
        this.collectMetrics();
      } catch (error) {
        this.logger.error("Metrics collection failed", error);
      }
    }, this.metricsIntervalMs);
  }

  private startLeakDetection(): void {
    this.leakDetectionInterval = setInterval(() => {
      try {
        this.detectLeakedConnections();
      } catch (error) {
        this.logger.error("Leak detection failed", error);
      }
    }, this.leakDetectionIntervalMs);
  }

  async performHealthCheck(): Promise<ConnectionHealthStatus> {
    const errors: string[] = [];
    let isHealthy = true;

    try {
      const startTime = Date.now();
      await this.dataSource.query("SELECT 1");
      const queryTime = Date.now() - startTime;

      if (queryTime > 1000) {
        errors.push(`Slow health check query: ${queryTime}ms`);
        isHealthy = false;
      }

      if (!this.dataSource.isInitialized) {
        errors.push("DataSource is not initialized");
        isHealthy = false;
      }

      const poolMetrics = await this.getPoolMetrics();

      if (poolMetrics.activeConnections === poolMetrics.totalConnections) {
        errors.push("Connection pool is fully utilized");
        isHealthy = false;
      }

      return {
        isHealthy,
        poolSize: poolMetrics.totalConnections,
        activeConnections: poolMetrics.activeConnections,
        idleConnections: poolMetrics.idleConnections,
        errors,
        lastCheck: new Date(),
      };
    } catch (error) {
      this.logger.error("Health check error", error);
      errors.push(`Health check failed: ${(error as Error).message}`);

      return {
        isHealthy: false,
        poolSize: 0,
        activeConnections: 0,
        idleConnections: 0,
        errors,
        lastCheck: new Date(),
      };
    }
  }

  private collectMetrics(): void {
    if (this.acquireTimes.length > 0) {
      const sum = this.acquireTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageAcquireTime = sum / this.acquireTimes.length;
      this.acquireTimes = [];
    }

    if (this.queryTimes.length > 0) {
      const sum = this.queryTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageQueryTime = sum / this.queryTimes.length;
      this.queryTimes = [];
    }

    this.logger.debug("Connection pool metrics", this.metrics);
  }

  private detectLeakedConnections(): void {
    const now = Date.now();
    let leakedCount = 0;

    for (const [_connection, info] of this.activeConnections.entries()) {
      const age = now - info.acquiredAt.getTime();
      const idleTime = now - info.lastActivity.getTime();

      if (age > this.maxConnectionAge) {
        this.logger.warn("Potential connection leak detected", {
          age: age / 1000,
          idleTime: idleTime / 1000,
          queryCount: info.queryCount,
          stackTrace: info.stackTrace.substring(0, 500),
        });
        leakedCount++;
      }
    }

    if (leakedCount > 0) {
      this.metrics.leakedConnections += leakedCount;
    }
  }

  async getPoolMetrics(): Promise<ConnectionPoolMetrics> {
    return { ...this.metrics };
  }

  async reconnectWithBackoff(
    maxRetries: number = 5,
    baseDelay: number = 1000
  ): Promise<void> {
    let retries = 0;

    while (retries < maxRetries) {
      try {
        if (!this.dataSource.isInitialized) {
          await this.dataSource.initialize();
          this.logger.log("Database connection re-established");
          return;
        }

        await this.dataSource.query("SELECT 1");
        this.logger.log("Database connection verified");
        return;
      } catch (error) {
        retries++;
        const delay = baseDelay * Math.pow(2, retries - 1);

        this.logger.error(
          `Connection attempt ${retries} failed. Retrying in ${delay}ms`,
          error
        );

        if (retries >= maxRetries) {
          throw new Error(
            "Failed to reconnect to database after maximum retries"
          );
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  trackConnectionAcquire(connection: unknown, acquireTime: number): void {
    this.acquireTimes.push(acquireTime);

    const info: ConnectionInfo = {
      acquiredAt: new Date(),
      stackTrace: new Error().stack || "",
      queryCount: 0,
      lastActivity: new Date(),
    };

    this.activeConnections.set(connection, info);
    this.metrics.activeConnections = this.activeConnections.size;
  }

  trackConnectionRelease(connection: unknown): void {
    this.activeConnections.delete(connection);
    this.metrics.activeConnections = this.activeConnections.size;
  }

  trackQuery(connection: unknown, queryTime: number, success: boolean): void {
    this.queryTimes.push(queryTime);
    this.metrics.totalQueries++;

    if (!success) {
      this.metrics.failedQueries++;
    }

    const info = this.activeConnections.get(connection);
    if (info) {
      info.queryCount++;
      info.lastActivity = new Date();
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const result = await this.dataSource.query("SELECT 1");
      return result !== null && result !== undefined;
    } catch (error) {
      this.logger.error("Connection validation failed", error);
      return false;
    }
  }

  async closeIdleConnections(): Promise<number> {
    this.logger.log("Closing idle connections");
    let closedCount = 0;

    try {
      const now = Date.now();

      for (const [connection, info] of this.activeConnections.entries()) {
        const idleTime = now - info.lastActivity.getTime();

        if (idleTime > this.idleTimeoutMs && info.queryCount === 0) {
          this.activeConnections.delete(connection);
          closedCount++;
        }
      }

      this.logger.log(`Closed ${closedCount} idle connections`);
      return closedCount;
    } catch (error) {
      this.logger.error("Failed to close idle connections", error);
      return closedCount;
    }
  }

  private async gracefulShutdown(): Promise<void> {
    this.logger.log("Initiating graceful connection pool shutdown");

    const timeout = 10000;
    const startTime = Date.now();

    while (
      this.activeConnections.size > 0 &&
      Date.now() - startTime < timeout
    ) {
      this.logger.log(
        `Waiting for ${this.activeConnections.size} active connections to close`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (this.activeConnections.size > 0) {
      this.logger.warn(
        `Forcefully closing ${this.activeConnections.size} remaining connections`
      );
    }

    this.activeConnections.clear();
    this.logger.log("Connection pool shutdown complete");
  }

  getHealthStatus(): string {
    const health =
      this.metrics.failedQueries / Math.max(this.metrics.totalQueries, 1);

    if (health < 0.01) return "healthy";
    if (health < 0.05) return "degraded";
    return "unhealthy";
  }
}
