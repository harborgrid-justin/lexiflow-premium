import { BaseService } from "../core/BaseService";

/**
 * ENTERPRISE REACT SERVICE: FeatureFlagService
 *
 * ROLE: Feature flag evaluation capability
 * SCOPE: Environment-aware feature detection
 * STATE: Stateless (reads from environment)
 * DEPENDENCIES: Environment variables, localStorage
 */

export interface FeatureFlagService {
  isEnabled(flag: string): boolean;
  getFlags(): Record<string, boolean>;
}

export class EnvironmentFeatureFlagService
  extends BaseService
  implements FeatureFlagService
{
  private flags: Map<string, boolean> = new Map();

  constructor() {
    super("FeatureFlagService");
  }

  override async configure(): Promise<void> {
    // Load from environment
    const envFlags = this.loadFromEnvironment();

    // Override with localStorage (for development)
    const localFlags = this.loadFromLocalStorage();

    // Merge (localStorage takes precedence)
    this.flags = new Map([...envFlags, ...localFlags]);
  }

  isEnabled(flag: string): boolean {
    this.ensureStarted();
    return this.flags.get(flag) ?? false;
  }

  getFlags(): Record<string, boolean> {
    this.ensureStarted();
    return Object.fromEntries(this.flags);
  }

  private loadFromEnvironment(): Map<string, boolean> {
    const flags = new Map<string, boolean>();

    // Parse VITE_FEATURE_* environment variables
    Object.keys(import.meta.env).forEach((key) => {
      if (key.startsWith("VITE_FEATURE_")) {
        const flagName = key.replace("VITE_FEATURE_", "").toLowerCase();
        const value = import.meta.env[key];
        flags.set(flagName, value === "true" || value === "1");
      }
    });

    return flags;
  }

  private loadFromLocalStorage(): Map<string, boolean> {
    const flags = new Map<string, boolean>();

    try {
      const stored = localStorage.getItem("feature_flags");
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, boolean>;
        Object.entries(parsed).forEach(([key, value]) => {
          flags.set(key.toLowerCase(), value);
        });
      }
    } catch (error) {
      console.warn(
        "[FeatureFlagService] Failed to load from localStorage:",
        error
      );
    }

    return flags;
  }
}
