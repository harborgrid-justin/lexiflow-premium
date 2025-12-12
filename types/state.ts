/**
 * State Management Types
 * Comprehensive type definitions for global state management
 */

// ============================================================================
// App State Types
// ============================================================================

export interface AppSettings {
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  display: {
    density: 'comfortable' | 'compact' | 'spacious';
    animations: boolean;
    reducedMotion: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
  };
}

export interface AppState {
  isOnline: boolean;
  lastSyncTime: number | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  updateAvailable: boolean;
  maintenanceMode: boolean;
  featureFlags: Record<string, boolean>;
}

// ============================================================================
// Auth State Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  mfaEnabled: boolean;
  avatar?: string;
  permissions?: string[];
  organizationId?: string;
  metadata?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  requiresMfa?: boolean;
  mfaToken?: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Data Cache Types
// ============================================================================

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
  tags?: string[];
}

export interface CacheConfig {
  defaultTtl?: number;
  maxSize?: number;
  enablePersistence?: boolean;
  persistenceKey?: string;
}

// ============================================================================
// Search Types
// ============================================================================

export type SearchScope = 'all' | 'cases' | 'documents' | 'clients' | 'contacts' | 'tasks' | 'billing';

export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: any;
}

export interface SearchResult {
  id: string;
  type: SearchScope;
  title: string;
  subtitle?: string;
  url: string;
  highlight?: string;
  metadata?: Record<string, any>;
  score?: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  scope: SearchScope;
  timestamp: number;
  resultsCount?: number;
}

// ============================================================================
// Breadcrumb Types
// ============================================================================

export interface Breadcrumb {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
  onClick?: () => void;
}

// ============================================================================
// Loading Types
// ============================================================================

export type LoadingType = 'spinner' | 'progress' | 'skeleton' | 'overlay';

export interface LoadingState {
  id: string;
  message?: string;
  progress?: number;
  type: LoadingType;
  priority?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// Permission Types
// ============================================================================

export type Permission = string;
export type Role = string;

export interface PermissionRule {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
  inherits?: Role[];
}

// ============================================================================
// Theme Types
// ============================================================================

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// ============================================================================
// Modal Types
// ============================================================================

export interface ModalConfig {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  options?: {
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
    showCloseButton?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    centered?: boolean;
  };
}

// ============================================================================
// WebSocket Types
// ============================================================================

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  id?: string;
}

export interface WebSocketSubscription {
  channel: string;
  callback: (message: any) => void;
}

// ============================================================================
// Filter Types
// ============================================================================

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null';

export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface FilterGroup {
  id: string;
  name: string;
  filters: Filter[];
  operator: 'AND' | 'OR';
}

// ============================================================================
// Selection Types
// ============================================================================

export interface SelectionState<T = any> {
  selectedItems: Set<string>;
  items: Map<string, T>;
  allSelected: boolean;
  mode: 'single' | 'multiple';
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

// ============================================================================
// Sort Types
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// ============================================================================
// Async State Types
// ============================================================================

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  called: boolean;
}

export interface AsyncOptions<T> {
  initialData?: T;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// Form State Types
// ============================================================================

export interface FormField<T = any> {
  name: string;
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any> = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  submitting: boolean;
  submitCount: number;
}

// ============================================================================
// Toast Types
// ============================================================================

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// Case Management Types
// ============================================================================

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  clientId: string;
  assignedTo?: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface CaseFilter extends Filter {
  field: 'status' | 'priority' | 'assignedTo' | 'clientId' | 'createdAt';
}
