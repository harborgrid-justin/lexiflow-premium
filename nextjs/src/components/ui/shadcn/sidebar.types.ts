/**
 * Sidebar Component Types
 * Complete type definitions for the sidebar system
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Sidebar state - expanded or collapsed
 */
export type SidebarState = "expanded" | "collapsed"

/**
 * Sidebar variant - visual appearance
 */
export type SidebarVariant = "sidebar" | "floating" | "inset"

/**
 * Sidebar side - position on screen
 */
export type SidebarSide = "left" | "right"

/**
 * Collapsible mode - how the sidebar collapses
 */
export type SidebarCollapsible = "offcanvas" | "icon" | "none"

/**
 * Menu button size variants
 */
export type SidebarMenuButtonSize = "default" | "sm" | "lg"

/**
 * Menu button style variants
 */
export type SidebarMenuButtonVariant = "default" | "outline"

// ============================================================================
// Context Types
// ============================================================================

/**
 * Sidebar context value
 * Provides sidebar state and controls throughout the component tree
 */
export interface SidebarContextValue {
  /** Current sidebar state */
  state: SidebarState
  /** Whether sidebar is open (desktop) */
  open: boolean
  /** Set sidebar open state (desktop) */
  setOpen: (open: boolean) => void
  /** Whether mobile sidebar is open */
  openMobile: boolean
  /** Set mobile sidebar open state */
  setOpenMobile: (open: boolean) => void
  /** Whether currently on mobile device */
  isMobile: boolean
  /** Toggle sidebar (mobile or desktop depending on screen size) */
  toggleSidebar: () => void
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for SidebarProvider component
 */
export interface SidebarProviderProps {
  /** Default open state */
  defaultOpen?: boolean
  /** Controlled open state */
  open?: boolean
  /** Controlled open state change handler */
  onOpenChange?: (open: boolean) => void
  /** Child components */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Additional inline styles */
  style?: React.CSSProperties
}

/**
 * Props for Sidebar component
 */
export interface SidebarProps {
  /** Visual variant */
  variant?: SidebarVariant
  /** Position side */
  side?: SidebarSide
  /** Collapsible behavior */
  collapsible?: SidebarCollapsible
  /** Child components */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Props for SidebarTrigger component
 */
export interface SidebarTriggerProps {
  /** Render as child component */
  asChild?: boolean
  /** Additional CSS classes */
  className?: string
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

/**
 * Props for SidebarMenuButton component
 */
export interface SidebarMenuButtonProps {
  /** Render as child component */
  asChild?: boolean
  /** Whether this menu item is active */
  isActive?: boolean
  /** Visual variant */
  variant?: SidebarMenuButtonVariant
  /** Size variant */
  size?: SidebarMenuButtonSize
  /** Tooltip content (shown when collapsed) */
  tooltip?: string | React.ComponentProps<"div">
  /** Child components */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Props for SidebarMenuAction component
 */
export interface SidebarMenuActionProps {
  /** Render as child component */
  asChild?: boolean
  /** Only show on hover */
  showOnHover?: boolean
  /** Child components */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Props for SidebarMenuSkeleton component
 */
export interface SidebarMenuSkeletonProps {
  /** Show icon skeleton */
  showIcon?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Props for SidebarMenuSubButton component
 */
export interface SidebarMenuSubButtonProps {
  /** Render as child component */
  asChild?: boolean
  /** Size variant */
  size?: "sm" | "md"
  /** Whether this menu item is active */
  isActive?: boolean
  /** Child components */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Props for SidebarGroupLabel component
 */
export interface SidebarGroupLabelProps {
  /** Render as child component */
  asChild?: boolean
  /** Child components */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Sidebar configuration options
 */
export interface SidebarConfig {
  /** Cookie name for state persistence */
  cookieName: string
  /** Cookie max age in seconds */
  cookieMaxAge: number
  /** Default sidebar width */
  width: string
  /** Sidebar width when collapsed to icon mode */
  widthIcon: string
  /** Sidebar width on mobile */
  widthMobile: string
  /** Keyboard shortcut key */
  keyboardShortcut: string
  /** Mobile breakpoint in pixels */
  mobileBreakpoint: number
}

/**
 * Default sidebar configuration
 */
export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  cookieName: "sidebar:state",
  cookieMaxAge: 60 * 60 * 24 * 7, // 7 days
  width: "16rem",
  widthIcon: "3rem",
  widthMobile: "18rem",
  keyboardShortcut: "b",
  mobileBreakpoint: 768,
}

// ============================================================================
// Menu Item Types
// ============================================================================

/**
 * Sidebar menu item data structure
 */
export interface SidebarMenuItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>
  /** Navigation URL */
  href?: string
  /** Click handler */
  onClick?: () => void
  /** Whether item is active */
  isActive?: boolean
  /** Badge content */
  badge?: string | number
  /** Sub menu items */
  items?: SidebarMenuItem[]
  /** Whether item is disabled */
  disabled?: boolean
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Sidebar group data structure
 */
export interface SidebarGroup {
  /** Unique identifier */
  id: string
  /** Group label */
  label: string
  /** Menu items in this group */
  items: SidebarMenuItem[]
  /** Whether group is collapsible */
  collapsible?: boolean
  /** Default collapsed state */
  defaultCollapsed?: boolean
}

/**
 * Complete sidebar navigation structure
 */
export interface SidebarNavigation {
  /** Navigation groups */
  groups: SidebarGroup[]
  /** Header content */
  header?: React.ReactNode
  /** Footer content */
  footer?: React.ReactNode
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Sidebar state change event
 */
export interface SidebarStateChangeEvent {
  /** New state */
  state: SidebarState
  /** Whether open */
  open: boolean
  /** Timestamp */
  timestamp: number
}

/**
 * Sidebar menu item click event
 */
export interface SidebarMenuItemClickEvent {
  /** Item that was clicked */
  item: SidebarMenuItem
  /** Original event */
  event: React.MouseEvent
  /** Timestamp */
  timestamp: number
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract component props type
 */
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * CSS custom properties for sidebar
 */
export interface SidebarCSSProperties extends React.CSSProperties {
  "--sidebar-width"?: string
  "--sidebar-width-icon"?: string
  "--sidebar-width-mobile"?: string
}
