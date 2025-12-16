import { Module } from '@nestjs/common';
import { TelemetryHealthIndicator } from './telemetry-health.indicator';

/**
 * Telemetry Module (Stub)
 * OpenTelemetry dependencies are not installed.
 * To enable full telemetry, install the required packages:
 * npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
 */
@Module({
  providers: [TelemetryHealthIndicator],
  exports: [TelemetryHealthIndicator],
})
export class TelemetryModule {}
