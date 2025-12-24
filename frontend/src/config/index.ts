// config/index.ts
/**
 * Config Module Barrel Export
 * 
 * Central export point for all configuration modules.
 * Consolidated structure:
 * - master.config.ts - All operational settings
 * - paths.config.ts - Route path definitions
 * - nav.config.ts - Navigation sidebar configuration
 * - tabs.config.ts - Tab configurations for all modules
 */

// Core configuration
export * from './master.config';
export * from './paths.config';
export * from './nav.config';
export * from './tabs.config';

// Module registration & prefetch
export * from './modules';
export * from './prefetchConfig';
