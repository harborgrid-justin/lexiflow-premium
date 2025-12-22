// Global type declarations for ambient types

declare const db: any;
declare const STORES: any;
declare const queryKeys: any;
declare const DEBUG_API_SIMULATION_DELAY_MS: number;
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

// Common missing types
type RateTable = any;
type FeeAgreement = any;
type Examination = any;
type WebhookConfig = any;
type AIValidationService = any;
