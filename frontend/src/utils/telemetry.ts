/**
 * @module utils/telemetry
 * @description Implements Principle XXIX: Telemetric Audit.
 * Instruments the Profiler API to collect RUM metrics.
 */
import { ProfilerOnRenderCallback } from 'react';

export const onRenderCallback: ProfilerOnRenderCallback = (
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) => {
  // In a real app, send this to an analytics endpoint (e.g. Application Insights, Datadog)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Telemetry] ${id} (${phase}) took ${actualDuration.toFixed(2)}ms`);
    
    if (actualDuration > 16) {
      console.warn(`[Telemetry] Slow render detected in ${id}: ${actualDuration.toFixed(2)}ms`);
    }
  }
};

export const logMetric = (name: string, value: number, tags?: Record<string, string>) => {
    // Placeholder for RUM logging
    // console.log(`[Metric] ${name}: ${value}`, tags);
};
