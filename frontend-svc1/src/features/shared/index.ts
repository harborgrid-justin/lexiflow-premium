/**
 * Shared Feature Layer
 * 
 * This module contains cross-cutting concerns used by multiple features.
 * Features should import from here rather than directly from each other.
 */

// Re-export all shared modules
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';
