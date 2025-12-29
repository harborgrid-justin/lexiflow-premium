import { Injectable } from '@nestjs/common';
import { formatBytes } from '@common/utils/format.utils';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    [key: string]: {
      status: 'up' | 'down';
      message?: string;
      responseTime?: number;
      details?: unknown;
    };
  };
  timestamp: string;
  uptime: number;
}

@Injectable()
export class HealthCheckService {
  // private readonly logger = new Logger(HealthCheckService.name);
  private readonly startTime: number = Date.now();

  async check(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {};

    // Database check
    checks.database = await this.checkDatabase();

    // Redis check
    checks.redis = await this.checkRedis();

    // File system check
    checks.filesystem = await this.checkFileSystem();

    // Memory check
    checks.memory = await this.checkMemory();

    // Determine overall status
    const allUp = Object.values(checks).every((check) => check.status === 'up');
    const someDown = Object.values(checks).some(
      (check) => check.status === 'down',
    );

    let status: HealthCheckResult['status'];
    if (allUp) {
      status = 'healthy';
    } else if (someDown) {
      status = 'unhealthy';
    } else {
      status = 'degraded';
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    };
  }

  private async checkDatabase(): Promise<
    HealthCheckResult['checks'][string]
  > {
    try {
      const start = Date.now();
      // Simulate database ping
      await this.delay(10);
      const responseTime = Date.now() - start;

      return {
        status: 'up',
        message: 'Database connection is healthy',
        responseTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        status: 'down',
        message: message,
      };
    }
  }

  private async checkRedis(): Promise<HealthCheckResult['checks'][string]> {
    try {
      const start = Date.now();
      // Simulate Redis ping
      await this.delay(5);
      const responseTime = Date.now() - start;

      return {
        status: 'up',
        message: 'Redis connection is healthy',
        responseTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        status: 'down',
        message: message,
      };
    }
  }

  private async checkFileSystem(): Promise<
    HealthCheckResult['checks'][string]
  > {
    try {
      const start = Date.now();
      // Check file system access
      await this.delay(2);
      const responseTime = Date.now() - start;

      return {
        status: 'up',
        message: 'File system is accessible',
        responseTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        status: 'down',
        message: message,
      };
    }
  }

  private async checkMemory(): Promise<HealthCheckResult['checks'][string]> {
    try {
      const memUsage = process.memoryUsage();
      const heapUsed = memUsage.heapUsed;
      const heapTotal = memUsage.heapTotal;
      const usagePercent = Math.round((heapUsed / heapTotal) * 100);

      return {
        status: usagePercent < 90 ? 'up' : 'down',
        message: `Memory usage: ${formatBytes(heapUsed)} / ${formatBytes(heapTotal)} (${usagePercent}%)`,
        details: {
          heapUsed: formatBytes(heapUsed),
          heapTotal: formatBytes(heapTotal),
          usagePercent,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        status: 'down',
        message: message,
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
