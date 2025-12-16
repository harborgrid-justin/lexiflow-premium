/**
 * Telemetry Module Exports (Stub)
 * OpenTelemetry dependencies are not installed.
 */

export { TelemetryModule } from './telemetry.module';
export { TelemetryHealthIndicator } from './telemetry-health.indicator';

// Stub functions for telemetry initialization
export async function initTelemetry() {
  console.log('[Telemetry] Running in stub mode - OpenTelemetry dependencies not installed');
  console.log('[Telemetry] To enable full telemetry, install: npm install @opentelemetry/api @opentelemetry/sdk-node');
}

export async function shutdownTelemetry() {
  // No-op in stub mode
}
