/**
 * Configuration Provider Types
 * Type definitions for configuration context
 *
 * @module lib/config/types
 */

export interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  maxUploadSize: number;
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  environment: "development" | "staging" | "production";
  version: string;
  features: Record<string, boolean>;
  limits: {
    maxFileSize: number;
    maxFilesPerUpload: number;
    maxConcurrentUploads: number;
  };
  integrations: {
    googleDrive: boolean;
    dropbox: boolean;
    onedrive: boolean;
  };
}

export interface ConfigStateValue {
  config: AppConfig;
  isLoading: boolean;
  error: Error | null;
}

export interface ConfigActionsValue {
  loadConfig: () => Promise<void>;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  resetConfig: () => void;
  isFeatureEnabled: (featureName: string) => boolean;
}

export interface ConfigProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<AppConfig>;
}
