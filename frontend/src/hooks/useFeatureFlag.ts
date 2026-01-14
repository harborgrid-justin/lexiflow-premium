import { useCallback } from "react";
import type { IService } from "../services/core/ServiceLifecycle";
import { ServiceRegistry } from "../services/core/ServiceRegistry";
import type { FeatureFlagService } from "../services/featureFlags/FeatureFlagService";

/**
 * HOOK ADAPTER for FeatureFlagService
 *
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to feature flag capability
 */

export function useFeatureFlag(flag: string): boolean {
  const featureFlagService = ServiceRegistry.get<IService>(
    "FeatureFlagService"
  ) as unknown as FeatureFlagService;
  return featureFlagService.isEnabled(flag);
}

export function useFeatureFlags(): Record<string, boolean> {
  const featureFlagService = ServiceRegistry.get<IService>(
    "FeatureFlagService"
  ) as unknown as FeatureFlagService;
  return featureFlagService.getFlags();
}

export function useFeatureEnabled(flag: string) {
  const isEnabled = useFeatureFlag(flag);

  const check = useCallback(() => isEnabled, [isEnabled]);

  return { isEnabled, check };
}
