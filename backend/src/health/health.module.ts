import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';

import { HealthController } from './health.controller';

import { RedisHealthIndicator } from './indicators/redis.health';
import { DiskHealthIndicator } from './indicators/disk.health';
import { MemoryHealthIndicator } from './indicators/memory.health';
import { TelemetryHealthIndicator } from './indicators/telemetry.health';

/* ------------------------------------------------------------------ */
/* Health Module                                                       */
/* ------------------------------------------------------------------ */
/*
 * Provides comprehensive system health reporting.
 *
 * This module is responsible ONLY for:
 * - Liveness checks
 * - Readiness checks
 * - Dependency health indicators
 *
 * It must NOT:
 * - Contain business logic
 * - Perform startup reporting
 * - Duplicate AppService health endpoints
 *
 * @see https://docs.nestjs.com/recipes/terminus
 */

@Module({
  imports: [
    TerminusModule,
    ConfigModule,
  ],
  controllers: [
    HealthController,
  ],
  providers: [
    RedisHealthIndicator,
    DiskHealthIndicator,
    MemoryHealthIndicator,
    TelemetryHealthIndicator,
  ],
  exports: [
    RedisHealthIndicator,
    DiskHealthIndicator,
    MemoryHealthIndicator,
    TelemetryHealthIndicator,
  ],
})
export class HealthModule {}
