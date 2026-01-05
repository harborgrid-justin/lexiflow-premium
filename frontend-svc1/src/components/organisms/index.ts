/**
 * @module components/organisms
 * @category Organisms
 * @description Complex composed components organized by business domain.
 *
 * ARCHITECTURE PRINCIPLES:
 * 1. Organisms are complex components composed of molecules and atoms
 * 2. Domain-organized for better discoverability and maintenance
 * 3. Components are feature-rich and business-focused
 *
 * USAGE:
 * ```tsx
 * import { Table, ErrorBoundary, Sidebar } from '@/components/organisms';
 * ```
 */

// ============================================================================
// CORE INFRASTRUCTURE
// ============================================================================
export * from './Table';
export * from './ErrorBoundary';
export * from './BackendHealthMonitor';
export * from './BackendStatusIndicator';
export * from './ConnectionStatus';
export * from './ConnectivityHUD';
export * from './SystemHealthDisplay';
export * from './PageHeader';

// ============================================================================
// NAVIGATION & INTERACTION
// ============================================================================
export * from './Sidebar';
export * from './NeuralCommandBar';
export * from './FilterPanel';
export * from './discovery';
export * from './GlobalHotkeys';
export * from './HolographicDock';
export * from './TabNavigation';
// export * from './MobileBottomNav'; // In features/navigation
export * from './AppHeader';
export * from './ChartHelpers';
export * from './SearchToolbar';

// ============================================================================
// LAYOUT & VIEWS
// ============================================================================
export * from './SplitView';
export * from './TabbedView';
export * from './VirtualList';
export * from './VirtualGrid';
export * from './SwipeableItem';
export * from './InfiniteScrollTrigger';

// ============================================================================
// DOMAIN COMPONENTS
// ============================================================================
export * from './cases';
// Note: discovery is already exported above
