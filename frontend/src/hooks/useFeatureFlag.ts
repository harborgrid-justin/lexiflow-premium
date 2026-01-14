import { useCallback } from "react";
import type { FeatureFlagService } from "../services/featureFlags/FeatureFlagService";
import { useService } from "./useService";

/**
 * HOOK ADAPTER for FeatureFlagService
 *
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to feature flag capability
 */

export function useFeatureFlag(flag: string): boolean {
  const featureFlagService =
    useService<FeatureFlagService>("FeatureFlagService");
  return featureFlagService.isEnabled(flag);
}

export function useFeatureFlags(): Record<string, boolean> {
  const featureFlagService =
    useService<FeatureFlagService>("FeatureFlagService");
  return featureFlagService.getFlags();
}

export function useFeatureEnabled(flag: string) {
  const isEnabled = useFeatureFlag(flag);

  const check = useCallback(() => isEnabled, [isEnabled]);

  return { isEnabled, check };
}
