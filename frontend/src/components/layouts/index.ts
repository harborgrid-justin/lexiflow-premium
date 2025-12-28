/**
 * Layouts Layer - Re-export from ui/layouts
 * 
 * This is a convenience re-export layer. Actual components live in /components/ui/layouts/
 * 
 * Usage:
 * import { AppShellLayout } from '@/components/layouts';  // ← This works
 * import { AppShellLayout } from '@/components/ui/layouts';  // ← This also works
 */

export * from '../ui/layouts';
export { StackLayout } from './StackLayout';

// ============================================================================
// UTILITY LAYOUTS
// ============================================================================
export { CenteredLayout } from './CenteredLayout';

// ============================================================================
// ADVANCED FEATURES - Performance & Error Handling
// ============================================================================
export * from './withErrorBoundary';
export * from './AsyncBoundary';
export * from './LayoutComposer';
export * from './PerformanceMonitor';

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================
export type { TabConfigItem } from './TabbedPageLayout';
