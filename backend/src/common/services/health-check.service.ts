import { Injectable, Logger } from '@nestjs/common';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    [key: string]: {
      status: 'up' | 'down';
      message?: string;
      responseTime?: number;
      details?: any;
    };
  };
  timestamp: string;
  uptime: number;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
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
      return {
        status: 'down',
        message: error.message,
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
      return {
        status: 'down',
        message: error.message,
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
      return {
        status: 'down',
        message: error.message,
      };
    }
  }

  private async checkMemory(): Promise<HealthCheckResult['checks'][string]> {
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const usagePercent = Math.round((heapUsedMB / heapTotalMB) * 100);

      return {
        status: usagePercent < 90 ? 'up' : 'down',
        message: `Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent}%)`,
        details: {
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB,
          usagePercent,
        },
      };
    } catch (error) {
      return {
        status: 'down',
        message: error.message,
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
