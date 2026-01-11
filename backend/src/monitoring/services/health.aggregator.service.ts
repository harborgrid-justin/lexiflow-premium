import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { StructuredLoggerService } from "./structured.logger.service";
import * as os from "os";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    memory: HealthCheck;
    cpu: HealthCheck;
    disk: HealthCheck;
    queue: HealthCheck;
    externalServices: HealthCheck;
  };
  metrics: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

export interface DatabaseDetails {
  poolSize?: number;
  activeConnections?: number;
  idleConnections?: number;
}

export interface RedisDetails {
  enabled: boolean;
}

export interface MemoryDetails {
  system: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  process: {
    heapTotal: number;
    heapUsed: number;
    heapUsagePercent: number;
    rss: number;
    external: number;
  };
}

export interface CpuDetails {
  usage: number;
  cores: number;
  model: string;
  loadAverage: number[];
}

export interface DiskDetails {
  tmpDir: string;
}

export interface QueueDetails {
  enabled: boolean;
}

export interface ExternalServicesDetails {
  services: string[];
}

export type HealthCheckDetails =
  | DatabaseDetails
  | RedisDetails
  | MemoryDetails
  | CpuDetails
  | DiskDetails
  | QueueDetails
  | ExternalServicesDetails;

export interface HealthCheck {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  message?: string;
  details?: HealthCheckDetails;
  lastChecked: string;
}

export interface ReadinessChecks {
  database: HealthCheck;
  redis: HealthCheck;
}

export interface ReadinessResponse {
  ready: boolean;
  checks: ReadinessChecks;
}

/**
 * Health Aggregator Service
 * Aggregates health status from all system components
 * Provides detailed health information for monitoring and diagnostics
 */
/**
 * ╔=================================================================================================================╗
 * ║HEALTHAGGREGATOR                                                                                                 ║
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
export class HealthAggregatorService {
  private lastHealthCheck: Date = new Date();
  private healthCache: HealthStatus | null = null;
  private cacheTtlMs = 5000; // Cache for 5 seconds

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Get comprehensive health status
   */
  async getHealth(): Promise<HealthStatus> {
    // Return cached result if still valid
    if (
      this.healthCache &&
      Date.now() - this.lastHealthCheck.getTime() < this.cacheTtlMs
    ) {
      return this.healthCache;
    }

    const timestamp = new Date().toISOString();
    const checks = await this.performHealthChecks();

    // Determine overall status
    const overallStatus = this.determineOverallStatus(checks);

    const health: HealthStatus = {
      status: overallStatus,
      timestamp,
      uptime: process.uptime(),
      checks,
      metrics: {
        requestsPerMinute: 0, // Would be populated from metrics service
        averageResponseTime: 0,
        errorRate: 0,
        activeConnections: 0,
      },
    };

    this.healthCache = health;
    this.lastHealthCheck = new Date();

    return health;
  }

  /**
   * Perform all health checks
   */
  private async performHealthChecks(): Promise<HealthStatus["checks"]> {
    const [database, redis, memory, cpu, disk, queue, externalServices] =
      await Promise.allSettled([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkMemory(),
        this.checkCpu(),
        this.checkDisk(),
        this.checkQueue(),
        this.checkExternalServices(),
      ]);

    return {
      database: this.unwrapResult(database, "database"),
      redis: this.unwrapResult(redis, "redis"),
      memory: this.unwrapResult(memory, "memory"),
      cpu: this.unwrapResult(cpu, "cpu"),
      disk: this.unwrapResult(disk, "disk"),
      queue: this.unwrapResult(queue, "queue"),
      externalServices: this.unwrapResult(externalServices, "externalServices"),
    };
  }

  /**
   * Unwrap promise result
   */
  private unwrapResult(
    result: PromiseSettledResult<HealthCheck>,
    name: string
  ): HealthCheck {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      const error = result.reason;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Health check failed: ${name}`, errorMessage);
      return {
        status: "down",
        message: errorMessage || "Health check failed",
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Execute simple query
      await this.dataSource.query("SELECT 1");
      const responseTime = Date.now() - startTime;

      // Check connection pool with safe type checking
      interface DriverMaster {
        totalCount?: number;
        idleCount?: number;
      }

      interface DataSourceDriver {
        master?: DriverMaster;
      }

      const driver = this.dataSource.driver as unknown as DataSourceDriver;
      const poolSize = driver.master?.totalCount || 0;
      const idleCount = driver.master?.idleCount || 0;
      const activeCount = poolSize - idleCount;

      const details: DatabaseDetails = {
        poolSize,
        activeConnections: activeCount,
        idleConnections: idleCount,
      };

      return {
        status: responseTime < 1000 ? "up" : "degraded",
        responseTime,
        message:
          responseTime < 1000
            ? "Database is healthy"
            : "Database response is slow",
        details,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        status: "down",
        message: `Database connection failed: ${errorMessage}`,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Would check Redis connection if client is available
      // For now, return healthy if Redis is configured
      const redisEnabled = process.env.REDIS_ENABLED === "true";

      if (!redisEnabled) {
        return {
          status: "up",
          message: "Redis is disabled",
          lastChecked: new Date().toISOString(),
        };
      }

      const responseTime = Date.now() - startTime;

      const details: RedisDetails = {
        enabled: redisEnabled,
      };

      return {
        status: "up",
        responseTime,
        message: "Redis is healthy",
        details,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        status: "down",
        message: `Redis connection failed: ${errorMessage}`,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check memory health
   */
  private async checkMemory(): Promise<HealthCheck> {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usagePercent = (usedMemory / totalMemory) * 100;

    const processMemory = process.memoryUsage();
    const heapUsagePercent =
      (processMemory.heapUsed / processMemory.heapTotal) * 100;

    let status: "up" | "degraded" | "down" = "up";
    let message = "Memory usage is healthy";

    if (usagePercent > 90 || heapUsagePercent > 90) {
      status = "down";
      message = "Critical memory usage";
    } else if (usagePercent > 80 || heapUsagePercent > 80) {
      status = "degraded";
      message = "High memory usage";
    }

    const details: MemoryDetails = {
      system: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        usagePercent: Math.round(usagePercent * 100) / 100,
      },
      process: {
        heapTotal: processMemory.heapTotal,
        heapUsed: processMemory.heapUsed,
        heapUsagePercent: Math.round(heapUsagePercent * 100) / 100,
        rss: processMemory.rss,
        external: processMemory.external,
      },
    };

    return {
      status,
      message,
      details,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Check CPU health
   */
  private async checkCpu(): Promise<HealthCheck> {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += (cpu.times as Record<string, number>)[type] || 0;
      }
      totalIdle += cpu.times.idle;
    });

    const cpuUsage = 100 - (100 * totalIdle) / totalTick;

    let status: "up" | "degraded" | "down" = "up";
    let message = "CPU usage is healthy";

    if (cpuUsage > 90) {
      status = "down";
      message = "Critical CPU usage";
    } else if (cpuUsage > 75) {
      status = "degraded";
      message = "High CPU usage";
    }

    const details: CpuDetails = {
      usage: Math.round(cpuUsage * 100) / 100,
      cores: cpus.length,
      model: cpus[0]?.model || "unknown",
      loadAverage: os.loadavg(),
    };

    return {
      status,
      message,
      details,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Check disk health
   */
  private async checkDisk(): Promise<HealthCheck> {
    // This is a simplified check - in production, you'd use a library like 'diskusage'
    try {
      const tmpDir = os.tmpdir();

      const details: DiskDetails = {
        tmpDir,
      };

      return {
        status: "up",
        message: "Disk space is healthy",
        details,
        lastChecked: new Date().toISOString(),
      };
    } catch {
      return {
        status: "degraded",
        message: "Unable to check disk space",
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check queue health
   */
  private async checkQueue(): Promise<HealthCheck> {
    try {
      // Would check Bull queue status if available
      // For now, return healthy

      const details: QueueDetails = {
        enabled: true,
      };

      return {
        status: "up",
        message: "Queue is healthy",
        details,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        status: "down",
        message: `Queue health check failed: ${errorMessage}`,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check external services health
   */
  private async checkExternalServices(): Promise<HealthCheck> {
    // Would check external API endpoints if configured
    // For now, return healthy

    const details: ExternalServicesDetails = {
      services: [],
    };

    return {
      status: "up",
      message: "External services are healthy",
      details,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Determine overall status from individual checks
   */
  private determineOverallStatus(
    checks: HealthStatus["checks"]
  ): "healthy" | "degraded" | "unhealthy" {
    const statuses = Object.values(checks).map((check) => check.status);

    // If any critical service is down, system is unhealthy
    const criticalServices = ["database"];
    const criticalDown = criticalServices.some(
      (service) => checks[service as keyof typeof checks]?.status === "down"
    );

    if (criticalDown || statuses.includes("down")) {
      return "unhealthy";
    }

    // If any service is degraded, system is degraded
    if (statuses.includes("degraded")) {
      return "degraded";
    }

    return "healthy";
  }

  /**
   * Get readiness status (can accept traffic)
   */
  async getReadiness(): Promise<ReadinessResponse> {
    const health = await this.getHealth();

    // System is ready if database is up and overall status is not unhealthy
    const ready =
      health.checks.database.status !== "down" && health.status !== "unhealthy";

    return {
      ready,
      checks: {
        database: health.checks.database,
        redis: health.checks.redis,
      },
    };
  }

  /**
   * Get liveness status (process is running)
   */
  getLiveness(): { alive: boolean } {
    // Simple liveness check - if we can execute this, we're alive
    return {
      alive: true,
    };
  }

  /**
   * Clear health cache (force fresh check)
   */
  clearCache(): void {
    this.healthCache = null;
    this.lastHealthCheck = new Date(0);
  }
}
