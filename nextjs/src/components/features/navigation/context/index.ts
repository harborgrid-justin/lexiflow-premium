/**
 * @module components/navigation/context
 * @category Navigation - Context
 * @description Barrel export for navigation context
 */

export {
  NavigationProvider,
  useNavigation,
  withNavigationContext
} from './NavigationContext';

export type {
  NavigationContextValue,
  NavigationContextState,
  NavigationContextActions,
  NavigationItem,
  NavigationHistoryEntry,
  NavigationProviderProps
} from './NavigationContext';
