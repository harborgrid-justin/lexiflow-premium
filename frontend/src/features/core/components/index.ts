/**
 * @module components/organisms/core
 * @category Organisms - Core
 * @description Essential infrastructure and foundational UI components used throughout the application.
 *
 * CORE COMPONENTS:
 * - ErrorBoundary: React error boundary for graceful error handling
 * - PageHeader: Standardized page header with breadcrumbs and actions
 * - ConnectionStatus: Backend connectivity monitoring
 * - BackendHealthMonitor: System health status tracking
 * - Table: Enterprise data table with sorting, filtering, pagination
 * - SplitView: Resizable split-pane layout
 * - TabbedView: Generic tabbed interface
 * - VirtualGrid/VirtualList: Performance-optimized virtualized rendering
 * - InfiniteScrollTrigger: Infinite scroll implementation
 * - SwipeableItem: Mobile-friendly swipeable list items
 * - ChartHelpers: Reusable chart utilities
 *
 * USAGE:
 * ```tsx
 * import { ErrorBoundary, Table, PageHeader } from '@/shared/ui/organisms/core';
 * ```
 */

// Infrastructure & Monitoring
export * from './ErrorBoundary';
export * from './PageHeader';
export * from './ConnectionStatus';
export * from './BackendHealthMonitor';
export * from './BackendStatusIndicator';
export * from './ConnectivityHUD';
export * from './SystemHealthDisplay';

// Data Display & Interaction
export * from './Table';
export * from './SplitView';
export * from './TabbedView';
export * from './VirtualGrid';
export * from './VirtualList';
export * from './InfiniteScrollTrigger';
export * from './SwipeableItem';
export * from './ChartHelpers';
