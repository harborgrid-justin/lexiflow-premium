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
export { AppContentRenderer } from "./AppContentRenderer";
export * from "./AppShell";
export { AppShellLayout } from "./AppShellLayout";

// ============================================================================
// PAGE LAYOUTS
// ============================================================================
export { ManagerLayout } from "./ManagerLayout";
export * from "./PageContainer";
export { PageContainerLayout } from "./PageContainerLayout";
export { StickyHeaderLayout } from "./StickyHeaderLayout";
export { TabbedPageLayout } from "./TabbedPageLayout";

// ============================================================================
// CONTENT LAYOUTS
// ============================================================================
export { GridLayout } from "./GridLayout";
export { SplitViewLayout } from "./SplitViewLayout";
export { StackLayout } from "./StackLayout";
export { ThreeColumnLayout } from "./ThreeColumnLayout";
export { TwoColumnLayout } from "./TwoColumnLayout";

// ============================================================================
// UTILITY LAYOUTS
// ============================================================================
export { CenteredLayout } from "./CenteredLayout";

// ============================================================================
// ADVANCED FEATURES - Performance & Error Handling
// ============================================================================
export * from "./AsyncBoundary";
export * from "./LayoutComposer";
export * from "./PerformanceMonitor";
export * from "./withErrorBoundary";

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================
export type { TabConfigItem } from "@/types/layout";
