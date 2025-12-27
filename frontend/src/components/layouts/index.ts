/**
 * @module components/layouts
 * @category Layouts
 * @description Comprehensive collection of reusable layout components for enterprise applications.
 * 
 * LAYOUT ARCHITECTURE:
 * Layouts are structural components that define the spatial arrangement and behavior of content.
 * They are purely presentational and do not contain business logic.
 * 
 * CATEGORIES:
 * - Application Shells: Full-page layouts with navigation
 * - Page Layouts: Content-focused layouts for pages
 * - Content Layouts: Flexible layouts for arranging content
 * - Utility Layouts: Helper layouts for common patterns
 */

// ============================================================================
// APPLICATION SHELLS
// ============================================================================
export { AppShellLayout } from './AppShellLayout';

// ============================================================================
// PAGE LAYOUTS
// ============================================================================
export { PageContainerLayout } from './PageContainerLayout';
export { TabbedPageLayout } from './TabbedPageLayout';
export { ManagerLayout } from './ManagerLayout';
export { StickyHeaderLayout } from './StickyHeaderLayout';

// ============================================================================
// CONTENT LAYOUTS
// ============================================================================
export { SplitViewLayout } from './SplitViewLayout';
export { TwoColumnLayout } from './TwoColumnLayout';
export { ThreeColumnLayout } from './ThreeColumnLayout';
export { GridLayout } from './GridLayout';
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
