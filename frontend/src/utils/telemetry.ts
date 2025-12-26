/**
 * @module utils/telemetry
 * @description Implements Principle XXIX: Telemetric Audit.
 * Instruments the Profiler API to collect RUM metrics.
 */

/**
 * Performance metric interface for telemetry
 */
interface PerformanceMetric {
  componentId: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactionCount: number;
}

/**
 * Type for React Profiler onRender callback
 */
type ProfilerOnRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<{
    id: number;
    name: string;
    timestamp: number;
  }>
) => void;

/**
 * Profiler callback that collects comprehensive render metrics
 * All parameters are utilized for complete performance monitoring
 */
const onRenderCallbackImpl: ProfilerOnRenderCallback = function (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) {
  const metric: PerformanceMetric = {
    componentId: id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactionCount: interactions.size,
  };

  // In production, send to analytics endpoint (e.g. Application Insights, Datadog)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Telemetry] ${id} (${phase}) took ${actualDuration.toFixed(2)}ms`);

    if (actualDuration > 16) {
      console.warn(
        `[Telemetry] Slow render detected in ${id}: ${actualDuration.toFixed(2)}ms ` +
        `(base: ${baseDuration.toFixed(2)}ms, interactions: ${interactions.size})`
      );
    }

    // Log optimization opportunities
    if (baseDuration > 0 && actualDuration > baseDuration * 1.5) {
      console.warn(
        `[Telemetry] Performance degradation in ${id}: ` +
        `actual ${actualDuration.toFixed(2)}ms vs base ${baseDuration.toFixed(2)}ms`
      );
    }
  }

  // Send metric to monitoring service
  sendMetricToMonitoring(metric);
};

export const onRenderCallback = onRenderCallbackImpl;

/**
 * Send performance metric to external monitoring service
 */
function sendMetricToMonitoring(metric: PerformanceMetric): void {
  // Integration point for external monitoring - metric contains all performance data
  // In production, this would send to Application Insights/Datadog:
  // applicationInsights.trackMetric({
  //   name: 'ComponentRender',
  //   value: metric.actualDuration,
  //   properties: {
  //     componentId: metric.componentId,
  //     phase: metric.phase,
  //     baseDuration: metric.baseDuration,
  //     startTime: metric.startTime,
  //     commitTime: metric.commitTime,
  //     interactionCount: metric.interactionCount
  //   }
  // });

  if (process.env.NODE_ENV === 'development' && metric.actualDuration > 100) {
    console.debug('[Telemetry] Would send metric:', {
      component: metric.componentId,
      duration: metric.actualDuration,
      phase: metric.phase
    });
  }
}

/**
 * Log custom metric with optional tags
 */
export const logMetric = (name: string, value: number, tags?: Record<string, string>): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Metric] ${name}: ${value}`, tags);
  }

  // Send to monitoring service
  // Example: applicationInsights.trackMetric({ name, value, properties: tags });
};
