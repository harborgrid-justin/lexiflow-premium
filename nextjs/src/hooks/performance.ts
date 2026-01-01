/**
 * Performance & Optimization Hooks Barrel Export
 * 
 * React 18 optimizations, code splitting, and performance monitoring.
 * Import from '@/hooks/performance' for better tree-shaking.
 */

// React 18 Optimizations
export { useFormId, useFormIds, useAriaIds } from './useFormId';
export { useOptimizedFilter, useMultiFilter, useOptimizedSort } from './useOptimizedFilter';
export type { OptimizedFilterConfig, OptimizedFilterReturn } from './useOptimizedFilter';

// Code Splitting & Loading
// useCodeSplitting doesn't exist as a single export - use individual hooks from './useCodeSplitting'
export * from './useCodeSplitting';
export { useAdaptiveLoading } from './useAdaptiveLoading';
// useImageOptimization doesn't exist as a single export - use individual hooks from './useImageOptimization'
export * from './useImageOptimization';

// Performance Monitoring
export { usePerformanceTracking } from './usePerformanceTracking';
export { useGlobalQueryStatus } from './useGlobalQueryStatus';

// Virtual Lists
export { useVirtualList } from './useVirtualList';
export { useVirtualizedDocket } from './useVirtualizedDocket';

// Workers
export { useWorkerSearch } from './useWorkerSearch';
