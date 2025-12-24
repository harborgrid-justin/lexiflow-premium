// Global type declarations for ambient types

/**
 * Database instance type (if using IndexedDB or similar)
 */
declare const db: unknown;

/**
 * Store definitions for state management
 */
declare const STORES: Record<string, unknown>;

/**
 * Query keys registry for data fetching
 */
declare const queryKeys: Record<string, string | string[]>;

/**
 * Debug API simulation delay in milliseconds
 */
declare const DEBUG_API_SIMULATION_DELAY_MS: number;

/**
 * Notification auto-dismiss duration in milliseconds
 */
declare const NOTIFICATION_AUTO_DISMISS_MS: number;

// Process environment
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_API_URL?: string;
    VITE_WS_URL?: string;
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
  }
}

declare const process: NodeJS.Process;
