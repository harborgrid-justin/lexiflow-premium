import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

/* ------------------------------------------------------------------ */
/* Telemetry Health Indicator                                          */
/* ------------------------------------------------------------------ */
/*
 * Reports the health of application telemetry.
 *
 * This indicator DOES NOT:
 * - Initialize telemetry
 * - Send spans
 * - Depend on OpenTelemetry SDK internals
 *
 * It ONLY reports whether telemetry is:
 * - Enabled via configuration
 * - Initialized at runtime (best-effort)
 *
 * This keeps health checks safe, fast, and non-invasive.
 */

@Injectable()
export class TelemetryHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const enabled = process.env.OTEL_ENABLED === 'true';

      if (!enabled) {
        return this.getStatus(key, true, {
          enabled: false,
          status: 'disabled',
        });
      }

      const initialized = this.isTelemetryInitialized();

      if (!initialized) {
        throw new HealthCheckError(
          'Telemetry enabled but not initialized',
          this.getStatus(key, false, {
            enabled: true,
            initialized: false,
            status: 'error',
          }),
        );
      }

      return this.getStatus(key, true, {
        enabled: true,
        initialized: true,
        status: 'healthy',
      });
    } catch (error) {
      if (error instanceof HealthCheckError) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Unknown telemetry error';

      throw new HealthCheckError(
        'Telemetry health check failed',
        this.getStatus(key, false, {
          error: message,
        }),
      );
    }
  }

  /* ------------------------------------------------------------------ */
  /* Internal Checks                                                    */
  /* ------------------------------------------------------------------ */

  private isTelemetryInitialized(): boolean {
    /*
     * We intentionally avoid importing OpenTelemetry SDK symbols here.
     *
     * Initialization responsibility belongs to bootstrap code (main.ts).
     * This check simply verifies that telemetry left a runtime signal.
     *
     * If you later change how telemetry is initialized, you only update
     * this method — nothing else depends on it.
     */

    return Boolean(
      (global as any).__OTEL_INITIALIZED__ === true ||
      process.env.OTEL_INITIALIZED === 'true',
    );
  }
}
