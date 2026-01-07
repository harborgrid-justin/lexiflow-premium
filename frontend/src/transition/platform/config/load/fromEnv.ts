/**
 * Load configuration from environment variables
 */

import type { Config } from "../types";

// Declare Vite import.meta.env types
declare global {
  interface ImportMetaEnv {
    readonly MODE?: string;
    readonly VITE_API_URL?: string;
    readonly VITE_FEATURE_ANALYTICS?: string;
    readonly VITE_FEATURE_REMOTE_CONFIG?: string;
    readonly VITE_FEATURE_DARK_MODE?: string;
    readonly VITE_FEATURE_I18N?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export function loadFromEnv(): Partial<Config> {
  return {
    env: (import.meta.env.MODE ||
      process.env.NODE_ENV ||
      "development") as Config["env"],
    apiUrl:
      import.meta.env.VITE_API_URL ||
      process.env.API_URL ||
      "http://localhost:3000",
    features: {
      analytics: import.meta.env.VITE_FEATURE_ANALYTICS === "true",
      remoteConfig: import.meta.env.VITE_FEATURE_REMOTE_CONFIG === "true",
      darkMode: import.meta.env.VITE_FEATURE_DARK_MODE !== "false",
      i18n: import.meta.env.VITE_FEATURE_I18N === "true",
    },
  };
}
