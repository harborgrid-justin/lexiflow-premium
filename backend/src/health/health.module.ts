import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
// import { HttpModule } from '@nestjs/axios'; // Module not installed
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis-health.indicator';
import { TelemetryHealthIndicator } from '@telemetry/telemetry-health.indicator';
import { RedisHealthIndicator as ImprovedRedisHealthIndicator } from './indicators/redis.health';
import { DiskHealthIndicator } from './indicators/disk.health';
import { MemoryHealthIndicator } from './indicators/memory.health';

/**
 * Health Module
 * Provides comprehensive health checks for the application
 * Includes database, Redis, memory, disk, and HTTP endpoints monitoring
 * @see https://docs.nestjs.com/recipes/terminus
 */
@Module({
  imports: [
    TerminusModule,
    HttpModule, // For HTTP health checks
    ConfigModule,
  ],
  controllers: [HealthController],
  providers: [
    RedisHealthIndicator, // Legacy
    ImprovedRedisHealthIndicator, // New improved version
    TelemetryHealthIndicator,
    DiskHealthIndicator,
    MemoryHealthIndicator,
  ],
})
export class HealthModule {}
