/**
 * Telemetry Module Exports (Stub)
 * OpenTelemetry dependencies are not installed.
 */

export { TelemetryModule } from './telemetry.module';
export { TelemetryHealthIndicator } from './telemetry-health.indicator';

// Telemetry initialization functions (optional feature)
export async function initTelemetry() {
  if (process.env.NODE_ENV !== 'production') {
     
    console.info('[Telemetry] Running in stub mode - OpenTelemetry dependencies not installed');
     
    console.info('[Telemetry] To enable full telemetry, install: npm install @opentelemetry/api @opentelemetry/sdk-node');
  }
}

export async function shutdownTelemetry() {
  // No-op in stub mode
}
