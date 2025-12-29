import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';

import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator as TerminusMemoryHealthIndicator,
} from '@nestjs/terminus';

import { RedisHealthIndicator } from './indicators/redis.health';
import { DiskHealthIndicator } from './indicators/disk.health';
import { MemoryHealthIndicator } from './indicators/memory.health';
import { TelemetryHealthIndicator } from './indicators/telemetry.health';

import * as MasterConfig from '@config/master.config';

/* ------------------------------------------------------------------ */
/* Health Controller                                                   */
/* ------------------------------------------------------------------ */
/*
 * Exposes liveness and readiness probes suitable for:
 * - Kubernetes
 * - systemd
 * - load balancers
 * - monitoring systems
 *
 * Health semantics:
 * - /health/live   -> process is alive (no dependencies)
 * - /health/ready  -> critical dependencies are ready
 * - /health        -> full diagnostic surface (operators only)
 */

@ApiTags('system')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: TypeOrmHealthIndicator,
    private readonly terminusMemory: TerminusMemoryHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly telemetry: TelemetryHealthIndicator,
  ) {}

  /* ------------------------------------------------------------------ */
  /* Comprehensive Health                                               */
  /* ------------------------------------------------------------------ */

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Comprehensive health check',
    description: 'Returns full system and dependency health diagnostics',
  })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  @ApiResponse({ status: 503, description: 'System is unhealthy' })
  check() {
    return this.health.check([
      /* Database */
      () =>
        this.database.pingCheck('database', {
          timeout: MasterConfig.HEALTH_CHECK_TIMEOUT_MS,
        }),

      /* Redis / Queue */
      () => this.redis.isHealthy('redis'),

      /* Memory (custom, detailed) */
      () => this.memory.isHealthy('memory'),

      /* Disk */
      () => this.disk.isHealthy('disk'),

      /* Telemetry */
      () => this.telemetry.isHealthy('telemetry'),

      /* Terminus memory guards (cheap safety rails) */
      () =>
        this.terminusMemory.checkHeap(
          'heap',
          1024 * 1024 * 1024, // 1 GB
        ),

      () =>
        this.terminusMemory.checkRSS(
          'rss',
          1536 * 1024 * 1024, // 1.5 GB
        ),
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* Liveness                                                          */
  /* ------------------------------------------------------------------ */

  @Public()
  @Get('live')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Indicates whether the process is alive',
  })
  @ApiResponse({ status: 200, description: 'Process is alive' })
  live() {
    return this.health.check([
      () =>
        this.terminusMemory.checkHeap(
          'heap',
          2048 * 1024 * 1024, // 2 GB (very tolerant)
        ),
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* Readiness                                                          */
  /* ------------------------------------------------------------------ */

  @Public()
  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Indicates whether the application is ready to receive traffic',
  })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  ready() {
    return this.health.check([
      () =>
        this.database.pingCheck('database', {
          timeout: MasterConfig.HEALTH_CHECK_TIMEOUT_MS,
        }),

      () => this.redis.isHealthy('redis'),
    ]);
  }
}
