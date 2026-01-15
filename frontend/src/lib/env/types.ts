/**
 * Environment Type Definitions
 *
 * Shared types for environment configuration system.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/env/types
 */

export interface EnvConfig {
  // API Configuration
  apiUrl: string;
  wsUrl: string;

  // Environment Detection
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // Feature Flags (from env)
  features: {
    enableAnalytics: boolean;
    enableDebugTools: boolean;
    enableExperimentalFeatures: boolean;
  };

  // App Metadata
  version: string;
  buildDate: string;
}
