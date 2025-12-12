/**
 * Context Index
 * Central export for all context providers and hooks
 */

// Root Provider
export { RootProvider } from './RootProvider';
export type { RootProviderProps } from './RootProvider';

// Individual Providers
export { AppProvider, useAppContext } from './AppContext';
export type { AppSettings, AppState } from './AppContext';

export { AuthProvider, useAuth } from './AuthContext';

export { ThemeProvider, useTheme } from './ThemeContext';

export { ToastProvider, useToast } from './ToastContext';

export { NotificationProvider, useNotifications } from './NotificationContext';
export type { Notification } from './NotificationContext';

export { DataProvider, useDataContext } from './DataContext';
export type { CacheEntry, CacheConfig } from './DataContext';

export { SearchProvider, useSearchContext } from './SearchContext';
export type { SearchScope, SearchFilter, SearchResult, SearchHistoryItem } from './SearchContext';

export { BreadcrumbProvider, useBreadcrumbContext } from './BreadcrumbContext';
export type { Breadcrumb } from './BreadcrumbContext';

export { LoadingProvider, useLoadingContext } from './LoadingContext';
export type { LoadingState, LoadingType } from './LoadingContext';

export { PermissionProvider, usePermissionContext } from './PermissionContext';
export type { Permission, Role, PermissionRule, RolePermissions } from './PermissionContext';

export { ModalProvider, useModal } from './ModalContext';

export { SidebarProvider, useSidebar } from './SidebarContext';

export { WebSocketProvider, useWebSocket } from './WebSocketContext';

export { CaseProvider, useCase } from './CaseContext';

export { FilterProvider, useFilter } from './FilterContext';

export { SelectionProvider, useSelection } from './SelectionContext';

export { CacheProvider, useCache } from './CacheContext';

export { SyncProvider, useSync } from './SyncContext';

export { WindowProvider, useWindow } from './WindowContext';
