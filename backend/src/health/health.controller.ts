import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiOperation , ApiResponse }from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  // DiskHealthIndicator, // Disabled due to Windows path issues
} from '@nestjs/terminus';
// import { RedisHealthIndicator } from './redis-health.indicator'; // Disabled due to connection issues
import * as MasterConfig from '../config/master.config';
// Note: OpenTelemetry telemetry health checks are available but optional
// Uncomment to enable: import { TelemetryHealthIndicator } from '../telemetry/telemetry-health.indicator';

/**
 * Health Check Controller
 * Provides comprehensive health checks for monitoring and orchestration
 * Compatible with Kubernetes liveness/readiness probes
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    // private disk: DiskHealthIndicator, // Disabled due to Windows path issues
    // private redis: RedisHealthIndicator, // Disabled due to connection issues
    // private telemetry: TelemetryHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database', { timeout: MasterConfig.HEALTH_CHECK_TIMEOUT_MS }),

      // Redis health (if enabled) - Commented out due to connection issues
      // () => this.redis.isHealthy('redis'),

      // Telemetry health - disabled until OpenTelemetry dependencies are installed
      // () => this.telemetry.isHealthy('telemetry'),

      // Memory health (max 800MB heap)
      () => this.memory.checkHeap('memory_heap', 800 * 1024 * 1024),

      // Memory RSS (max 1GB)
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),

      // Disk health (min 10% free) - disabled on Windows due to path issues
      // () =>
      //   this.disk.checkStorage('disk', {
      //     path: process.platform === 'win32' ? 'C:\\' : '/',
      //     thresholdPercent: 0.9,
      //   }),
    ]);
  }

  @Public()
  @Get('liveness')
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  checkLiveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 400 * 1024 * 1024),
    ]);
  }

  @Public()
  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  checkReadiness() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: MasterConfig.HEALTH_CHECK_TIMEOUT_MS }),
      // () => this.redis.isHealthy('redis'), // Commented out due to connection issues
      // () => this.telemetry.getBasicStatus('telemetry'),
    ]);
  }

  // Telemetry endpoint disabled until OpenTelemetry dependencies are installed
  // @Get('telemetry')
  // @HealthCheck()
  // @ApiOperation({ summary: 'Telemetry and observability status' })
  // @ApiResponse({ status: 200, description: 'Telemetry details' })
  // checkTelemetry() {
  //   return this.health.check([
  //     () => this.telemetry.isHealthy('telemetry'),
  //   ]);
  // }
}

