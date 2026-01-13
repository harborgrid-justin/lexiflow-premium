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
 * } from '@/features/navigation';
 * ```
 */

// ============================================================================
// COMPONENTS
// ============================================================================
export * from "./components";

// ============================================================================
// CONTEXT & PROVIDERS
// ============================================================================
export * from "./context";

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================
export { Breadcrumbs } from "./components/Breadcrumbs";
export type {
  BreadcrumbItem,
  BreadcrumbsProps,
} from "./components/Breadcrumbs";

export { CommandPalette } from "./components/CommandPalette";
export type {
  CommandCategory,
  CommandGroup,
  CommandItem,
  CommandPaletteProps,
} from "./components/CommandPalette";

export { MegaMenu } from "./components/MegaMenu";
export type {
  MegaMenuItem,
  MegaMenuLayout,
  MegaMenuProps,
  MegaMenuSection,
} from "./components/MegaMenu";

export { QuickActions } from "./components/QuickActions";
export type {
  QuickAction,
  QuickActionGroup,
  QuickActionsProps,
} from "./components/QuickActions";

export {
  NavigationProvider,
  useNavigation,
  withNavigationContext,
} from "./context";
export type {
  NavigationContextActions,
  NavigationContextState,
  NavigationContextValue,
  NavigationHistoryEntry,
  NavigationItem,
  NavigationProviderProps,
  NavigationStatus,
} from "./context";
