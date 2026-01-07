/**
 * Configuration types
 */

export interface Config {
  env: "development" | "staging" | "production";
  apiUrl: string;
  features: FeatureFlags;
}

export interface FeatureFlags {
  analytics?: boolean;
  remoteConfig?: boolean;
  darkMode?: boolean;
  i18n?: boolean;
  [key: string]: boolean | undefined;
}
