import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis-health.indicator';
import { TelemetryHealthIndicator } from '../telemetry/telemetry-health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, TelemetryHealthIndicator],
})
export class HealthModule {}
