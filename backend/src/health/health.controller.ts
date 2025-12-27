import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator as TerminusMemoryHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator as ImprovedRedisHealthIndicator } from './indicators/redis.health';
import { DiskHealthIndicator } from './indicators/disk.health';
import { MemoryHealthIndicator } from './indicators/memory.health';
import * as MasterConfig from '../config/master.config';

/**
 * Health Check Controller
 * Provides comprehensive health checks for monitoring and orchestration
 * Compatible with Kubernetes liveness/readiness probes
 * @see https://docs.nestjs.com/recipes/terminus
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private terminusMemory: TerminusMemoryHealthIndicator,
    private redis: ImprovedRedisHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  /**
   * Comprehensive health check endpoint
   * Returns detailed status of all system components
   */
  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  check() {
    return this.health.check([
      // Database health
      () =>
        this.db.pingCheck('database', {
          timeout: MasterConfig.HEALTH_CHECK_TIMEOUT_MS,
        }),

      // Redis health (if enabled)
      () => this.redis.isHealthy('redis'),

      // Memory health (comprehensive)
      () => this.memory.isHealthy('memory'),

      // Disk space health
      () => this.disk.isHealthy('disk'),

      // Terminus memory check (heap size limit: 800MB)
      () =>
        this.terminusMemory.checkHeap('memoryHeap', 800 * 1024 * 1024),

      // RSS memory check (1.5GB limit)
      () =>
        this.terminusMemory.checkRSS('memoryRSS', 1.5 * 1024 * 1024 * 1024),
    ]);
  }

  /**
   * Liveness probe for Kubernetes
   * Returns 200 if the application is running
   */
  @Public()
  @Get('live')
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  live() {
    return this.health.check([
      // Minimal checks - just verify the app is responsive
      () =>
        this.terminusMemory.checkHeap('heap', 1024 * 1024 * 1024), // 1GB
    ]);
  }

  /**
   * Readiness probe for Kubernetes
   * Returns 200 when the application is ready to receive traffic
   */
  @Public()
  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  ready() {
    return this.health.check([
      // Check critical dependencies
      () =>
        this.db.pingCheck('database', {
          timeout: MasterConfig.HEALTH_CHECK_TIMEOUT_MS,
        }),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}

