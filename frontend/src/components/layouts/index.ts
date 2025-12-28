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

// Re-export from ui/layouts - these are already exported via the wildcard above
// export { StackLayout } from '../ui/layouts/StackLayout';
// export { CenteredLayout } from '../ui/layouts/CenteredLayout';
// export * from '../ui/layouts/withErrorBoundary';
// export * from '../ui/layouts/AsyncBoundary';
// export * from '../ui/layouts/LayoutComposer';
// export * from '../ui/layouts/PerformanceMonitor';

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================
export type { TabConfigItem } from './TabbedPageLayout';
