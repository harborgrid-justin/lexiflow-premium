import { useCallback } from "react";
import type { IService } from "../services/core/ServiceLifecycle";
import { ServiceRegistry } from "../services/core/ServiceRegistry";
import type {
  TelemetryEvent,
  TelemetryService,
} from "../services/telemetry/TelemetryService";

/**
 * HOOK ADAPTER for TelemetryService
 *
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to telemetry capability
 */

export function useTelemetry() {
  const telemetryService = ServiceRegistry.get<IService>(
    "telemetry"
  ) as unknown as TelemetryService;

  const track = useCallback(
    (event: TelemetryEvent) => {
      telemetryService.track(event);
    },
    [telemetryService]
  );

  const startMark = useCallback(
    (name: string) => {
      telemetryService.startMark(name);
    },
    [telemetryService]
  );

  const endMark = useCallback(
    (name: string) => {
      return telemetryService.endMark(name);
    },
    [telemetryService]
  );

  const clearMarks = useCallback(() => {
    telemetryService.clearMarks();
  }, [telemetryService]);

  return { track, startMark, endMark, clearMarks };
}
