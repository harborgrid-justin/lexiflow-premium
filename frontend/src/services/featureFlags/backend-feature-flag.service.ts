/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║               BACKEND FEATURE FLAG SERVICE                                ║
 * ║           Feature Flags with Backend Sync                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/featureFlags/backend-feature-flag.service
 * @description Feature flag service with backend API support
 *
 * FEATURES:
 * - Fetch flags from backend API
 * - Real-time updates via polling
 * - Local cache with TTL
 * - Fallback to environment variables
 * - User-specific flag overrides
 */

import { BaseService } from "../core/BaseService";
import { apiClient } from "../infrastructure/api-client.service";
import { CacheManager } from "../core/factories/CacheManager";
import { StoragePersistence, TimerManager } from "../core/factories/Utilities";

import type { FeatureFlagService } from "./feature-flag.service";

// ============================================================================
// TYPES
// ============================================================================

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  updatedAt?: string;
}

interface FeatureFlagsResponse {
  flags: FeatureFlag[];
  timestamp: number;
}

/**
 * Backend feature flag configuration
 */
export interface BackendFeatureFlagConfig {
  /** API endpoint for flags */
  endpoint?: string;
  /** Enable auto-refresh */
  autoRefresh?: boolean;
  /** Refresh interval in ms */
  refreshInterval?: number;
  /** Cache TTL in ms */
  cacheTTL?: number;
}

// ============================================================================
// SERVICE
// ============================================================================

/**
 * Feature flag service with backend synchronization.
 * 
 * Fetches flags from backend API and caches locally.
 * Supports real-time updates and user-specific overrides.
 */
export class BackendFeatureFlagService
  extends BaseService
  implements FeatureFlagService
{
  private flags: Map<string, boolean> = new Map();
  private flagsCache: CacheManager<Record<string, boolean>>;
  private lastFetch = 0;
  private readonly timers = new TimerManager();
  private isFetching = false;

  private config: BackendFeatureFlagConfig = {
    endpoint: "/api/feature-flags",
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    cacheTTL: 600000, // 10 minutes
  };

  constructor(config?: BackendFeatureFlagConfig) {
    super("BackendFeatureFlagService");
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.flagsCache = new CacheManager<Record<string, boolean>>({
      defaultTTL: this.config.cacheTTL ?? 600000,
      name: 'FeatureFlagsCache'
    });
  }

  protected override async onStart(): Promise<void> {
    // Load from environment first
    this.loadFromEnvironment();

    // Load from localStorage cache
    this.loadFromCache();

    // Fetch from backend
    try {
      await this.fetchFromBackend();
    } catch (error) {
      this.warn("Failed to fetch flags from backend, using cached/env:", error);
    }

    // Setup auto-refresh
    if (this.config.autoRefresh && this.config.refreshInterval) {
      this.setupAutoRefresh();
    }
  }

  protected override onStop(): void {
    // Stop auto-refresh
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Check if flag is enabled
   */
  isEnabled(flag: string): boolean {
    this.ensureRunning();
    return this.flags.get(flag.toLowerCase()) ?? false;
  }

  /**
   * Get all flags
   */
  getFlags(): Record<string, boolean> {
    this.ensureRunning();
    return Object.fromEntries(this.flags);
  }

  /**
   * Fetch flags from backend
   */
  async fetchFromBackend(): Promise<void> {
    if (this.isFetching) {
      return;
    }

    this.isFetching = true;

    try {
      const response = await apiClient.get<FeatureFlagsResponse>(
        this.config.endpoint!
      );

      // Update flags
      response.flags.forEach((flag) => {
        this.flags.set(flag.key.toLowerCase(), flag.enabled);
      });

      this.lastFetch = Date.now();
      this.log(`Fetched ${response.flags.length} flags from backend`);

      // Save to cache
      this.saveToCache();
    } catch (error) {
      this.error("Failed to fetch flags from backend:", error);
      throw error;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Set flag override (local only)
   */
  setFlagOverride(flag: string, enabled: boolean): void {
    this.flags.set(flag.toLowerCase(), enabled);

    // Save to localStorage for development
    const overrideStorage = new StoragePersistence<Record<string, boolean>>('feature_flag_overrides');
    const overrides = this.getLocalOverrides();
    overrides[flag.toLowerCase()] = enabled;
    overrideStorage.set(overrides);
  }

  /**
   * Clear flag override
   */
  clearFlagOverride(flag: string): void {
    const overrideStorage = new StoragePersistence<Record<string, boolean>>('feature_flag_overrides');
    const overrides = this.getLocalOverrides();
    delete overrides[flag.toLowerCase()];
    overrideStorage.set(overrides);

    // Re-fetch to get original value
    this.fetchFromBackend().catch((error) => {
      this.error("Failed to refresh flag:", error);
    });
  }

  /**
   * Get time since last fetch
   */
  getTimeSinceLastFetch(): number {
    return Date.now() - this.lastFetch;
  }

  /**
   * Check if cache is stale
   */
  isCacheStale(): boolean {
    return !this.flagsCache.has('flags');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Load flags from environment variables
   */
  private loadFromEnvironment(): void {
    Object.keys(import.meta.env).forEach((key) => {
      if (key.startsWith("VITE_FEATURE_")) {
        const flagName = key.replace("VITE_FEATURE_", "").toLowerCase();
        const value = import.meta.env[key];
        this.flags.set(flagName, value === "true" || value === "1");
      }
    });
  }

  /**
   * Load flags from localStorage cache
   */
  private loadFromCache(): void {
    try {
      const cachedFlags = this.flagsCache.get('flags');
      if (cachedFlags) {
        Object.entries(cachedFlags).forEach(([key, value]) => {
          this.flags.set(key.toLowerCase(), value);
        });
        this.log("Loaded flags from cache");
      }
    } catch (error) {
      this.warn("Failed to load flags from cache:", error);
    }

    // Load overrides
    const overrides = this.getLocalOverrides();
    Object.entries(overrides).forEach(([key, value]) => {
      this.flags.set(key.toLowerCase(), value);
    });
  }

  /**
   * Save flags to localStorage cache
   */
  private saveToCache(): void {
    try {
      const flagsData = Object.fromEntries(this.flags);
      this.flagsCache.set('flags', flagsData);
    } catch (error) {
      this.warn("Failed to save flags to cache:", error);
    }
  }

  /**
   * Get local overrides
   */
  private getLocalOverrides(): Record<string, boolean> {
    try {
      const overrideStorage = new StoragePersistence<Record<string, boolean>>('feature_flag_overrides');
      return overrideStorage.getOrDefault({});
    } catch (error) {
      this.warn("Failed to load overrides:", error);
      return {};
    }
  }

  /**
   * Setup auto-refresh interval
   */
  private setupAutoRefresh(): void {
    this.timers.setInterval(() => {
      this.fetchFromBackend().catch((error) => {
        this.error("Auto-refresh failed:", error);
      });
    }, this.config.refreshInterval!);
  }
}
