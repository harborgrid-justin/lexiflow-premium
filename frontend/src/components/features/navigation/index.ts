/**
 * @module components/features/navigation
 * @category Navigation
 * @description Enterprise navigation system with comprehensive routing, breadcrumbs,
 * command palette, mega menus, and quick actions.
 *
 * EXPORTS:
 * - Components: All navigation UI components
 * - Context: Navigation context and providers
 * - Hooks: Navigation-related hooks
 * - Types: TypeScript type definitions
 *
 * USAGE:
 * ```tsx
 * import {
 *   NavigationProvider,
 *   useNavigation,
 *   Breadcrumbs,
 *   CommandPalette,
 *   MegaMenu,
 *   QuickActions
 * } from '@/components/features/navigation';
 * ```
 */

// ============================================================================
// COMPONENTS
// ============================================================================
export * from './components';

// ============================================================================
// CONTEXT & PROVIDERS
// ============================================================================
export * from './context';

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================
export { Breadcrumbs } from './components/Breadcrumbs';
export type { BreadcrumbsProps, BreadcrumbItem } from './components/Breadcrumbs';

export { CommandPalette } from './components/CommandPalette';
export type {
  CommandPaletteProps,
  CommandItem,
  CommandGroup,
  CommandCategory,
} from './components/CommandPalette';

export { MegaMenu } from './components/MegaMenu';
export type {
  MegaMenuProps,
  MegaMenuItem,
  MegaMenuSection,
  MegaMenuLayout,
} from './components/MegaMenu';

export { QuickActions } from './components/QuickActions';
export type {
  QuickActionsProps,
  QuickAction,
  QuickActionGroup,
} from './components/QuickActions';

export {
  NavigationProvider,
  useNavigation,
  withNavigationContext,
} from './context';
export type {
  NavigationContextValue,
  NavigationContextState,
  NavigationContextActions,
  NavigationItem,
  NavigationHistoryEntry,
  NavigationProviderProps,
} from './context';
