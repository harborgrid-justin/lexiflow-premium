// ================================================================================
// FEATURE FLAGS SERVICE - DOMAIN SERVICE LAYER
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context (state) → Service (effects) → Frontend API (HTTP)
//
// PURPOSE:
//   - Fetches feature flags from backend
//   - Provides fallback to config defaults
//   - Manages flag caching strategy
//   - Never called by views directly (only by FlagsContext)
//
// ================================================================================

import { FEATURES_CONFIG } from "@/config/features/features.config";
import { apiClient } from "@/services/infrastructure/apiClient";

export interface Flags {
  enableNewDashboard: boolean;
  enableAdminTools: boolean;
  ocr: boolean;
  aiAssistant: boolean;
  realTimeSync: boolean;
}

const DEFAULT_FLAGS: Flags = {
  enableNewDashboard: true,
  enableAdminTools: false,
  ocr: FEATURES_CONFIG.documentComparison,
  aiAssistant: FEATURES_CONFIG.aiAssistance,
  realTimeSync: FEATURES_CONFIG.realtimeCollaboration,
};

export class FeatureFlagsService {
  /**
   * Fetch feature flags from backend
   * Falls back to config defaults if endpoint doesn't exist
   */
  static async fetchFlags(): Promise<Flags> {
    try {
      const response = await apiClient.get<Partial<Flags>>("/api/features");

      // Merge with defaults to ensure all flags are present
      return {
        ...DEFAULT_FLAGS,
        ...response,
      };
    } catch (err) {
      console.warn(
        "Failed to fetch feature flags from backend, using config defaults",
        err
      );

      // Fallback to config-based defaults
      return DEFAULT_FLAGS;
    }
  }

  /**
   * Check if a specific feature is enabled
   * Useful for one-off checks without context
   */
  static async isFeatureEnabled(featureName: keyof Flags): Promise<boolean> {
    try {
      const flags = await this.fetchFlags();
      return flags[featureName] === true;
    } catch (err) {
      console.error(`Failed to check feature flag: ${featureName}`, err);
      return DEFAULT_FLAGS[featureName];
    }
  }

  /**
   * Get default flags from config
   * Used for SSR or initial state
   */
  static getDefaults(): Flags {
    return { ...DEFAULT_FLAGS };
  }
}
