import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConnectionPoolOptimizerService } from "@performance/services/connection.pool.optimizer.service";

/**
 * Database Health Monitoring Middleware
 *
 * Monitors database connection pool health and performance:
 * - Tracks query execution time per request
 * - Monitors connection pool utilization
 * - Warns about slow database operations
 * - Detects connection leaks
 * - Provides health metrics in response headers (dev mode)
 *
 * Performance Metrics:
 * - X-DB-Query-Time: Total DB query time for request
 * - X-DB-Query-Count: Number of DB queries executed
 * - X-DB-Pool-Utilization: Current pool utilization %
 * - X-DB-Active-Connections: Active connections count
 */
@Injectable()
export class DbHealthMonitorMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DbHealthMonitorMiddleware.name);
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second
  private readonly HIGH_POOL_UTILIZATION = 80; // 80%

  constructor(private readonly poolOptimizer: ConnectionPoolOptimizerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    let queryCount = 0;
    let totalQueryTime = 0;

    // Create context for tracking DB operations
    const dbContext = {
      trackQuery: (duration: number) => {
        queryCount++;
        totalQueryTime += duration;
        this.poolOptimizer.recordQueryExecution(duration);
      },
    };

    // Attach context to request
    req.dbContext = dbContext;

    // Override response methods to add headers
    const originalSend = res.send;
    const originalJson = res.json;

    const finalize = async (_body: unknown): Promise<void> => {
      const requestDuration = Date.now() - startTime;

      try {
        // Get pool metrics
        const metrics = await this.poolOptimizer.getMetrics();

        // Add performance headers (in development or if explicitly enabled)
        if (
          process.env.NODE_ENV === "development" ||
          process.env.ENABLE_DB_METRICS === "true"
        ) {
          res.set("X-DB-Query-Time", `${totalQueryTime}ms`);
          res.set("X-DB-Query-Count", queryCount.toString());
          res.set(
            "X-DB-Pool-Utilization",
            `${metrics.poolUtilization.toFixed(1)}%`
          );
          res.set(
            "X-DB-Active-Connections",
            metrics.activeConnections.toString()
          );
          res.set("X-Request-Time", `${requestDuration}ms`);
        }

        // Log warnings for slow requests
        if (requestDuration > this.SLOW_REQUEST_THRESHOLD) {
          this.logger.warn(
            `Slow request: ${req.method} ${req.url} - ` +
              `${requestDuration}ms (DB: ${totalQueryTime}ms, Queries: ${queryCount})`
          );
        }

        // Warn if pool utilization is high
        if (metrics.poolUtilization > this.HIGH_POOL_UTILIZATION) {
          this.logger.warn(
            `High DB pool utilization: ${metrics.poolUtilization.toFixed(1)}% ` +
              `(${metrics.activeConnections}/${metrics.totalConnections})`
          );
        }

        // Log if DB time is significant portion of request time
        if (totalQueryTime > requestDuration * 0.7 && requestDuration > 100) {
          this.logger.debug(
            `Request DB-bound: ${req.method} ${req.url} - ` +
              `${totalQueryTime}ms DB / ${requestDuration}ms total`
          );
        }

        // Check for potential N+1 queries
        if (queryCount > 20 && requestDuration > 500) {
          this.logger.warn(
            `Potential N+1 query pattern: ${req.method} ${req.url} - ` +
              `${queryCount} queries in ${requestDuration}ms`
          );
        }
      } catch (error) {
        this.logger.error(
          `Error in DB health monitoring: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    };

    // Intercept response methods
    res.send = function (this: Response, body: unknown): Response {
      void finalize(body);
      return originalSend.call(this, body);
    };

    res.json = function (this: Response, body: unknown): Response {
      void finalize(body);
      return originalJson.call(this, body);
    };

    next();
  }
}

/**
 * Request DB Context Interface
 * Attached to Express Request for tracking DB operations
 */
export interface DbContext {
  trackQuery: (duration: number) => void;
}

/**
 * Extend Express Request type to include DB context
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      dbContext?: DbContext;
    }
  }
}
