import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

/**
 * Telemetry Health Indicator (Stub)
 * Returns basic health status without OpenTelemetry dependencies
 */
@Injectable()
export class TelemetryHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const result = this.getStatus(key, true, {
      message: 'Telemetry module is running in stub mode (OpenTelemetry not installed)',
      enabled: false,
    });
    return result;
  }

  async getBasicStatus(key: string): Promise<HealthIndicatorResult> {
    return this.isHealthy(key);
  }
}
