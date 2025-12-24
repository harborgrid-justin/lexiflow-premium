// =============================================================================
// UI/UX CONFIGURATION
// =============================================================================
// User interface layout, animations, and visual preferences

// Animation & Transitions
export const ANIMATION_DURATION_MS = 200;
export const ANIMATION_EASING = 'ease-in-out';
export const ENABLE_ANIMATIONS = true;
export const ENABLE_PAGE_TRANSITIONS = true;

// Layout
export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const SIDEBAR_DEFAULT_COLLAPSED = false;
export const TOPBAR_HEIGHT = 64;
export const FOOTER_HEIGHT = 48;

// Modal/Dialog
export const MODAL_MAX_WIDTH = 1200;
export const MODAL_BACKDROP_BLUR = true;
export const MODAL_CLOSE_ON_ESCAPE = true;
export const MODAL_CLOSE_ON_BACKDROP = true;

// Tooltips
export const TOOLTIP_DELAY_MS = 500;
export const TOOLTIP_MAX_WIDTH = 300;

// Tables
export const TABLE_ROW_HEIGHT = 48;
export const TABLE_HEADER_HEIGHT = 56;
export const TABLE_ENABLE_VIRTUALIZATION = true;
export const TABLE_VIRTUAL_THRESHOLD = 100; // Use virtual scrolling if > 100 rows

// Notifications
export const NOTIFICATION_MAX_DISPLAY = 5;
export const NOTIFICATION_AUTO_DISMISS_MS = 5000;
export const NOTIFICATION_SUCCESS_DISMISS_MS = 3000;
export const NOTIFICATION_ERROR_DISMISS_MS = 10000;
export const NOTIFICATION_POSITION: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
export const NOTIFICATION_ENABLE_SOUND = false;
export const NOTIFICATION_MAX_STACK = 3;

// Export as object
export const UI_CONFIG = {
  animation: {
    durationMs: ANIMATION_DURATION_MS,
    easing: ANIMATION_EASING,
    enabled: ENABLE_ANIMATIONS,
    pageTransitions: ENABLE_PAGE_TRANSITIONS,
  },
  layout: {
    sidebar: {
      width: SIDEBAR_WIDTH,
      collapsedWidth: SIDEBAR_COLLAPSED_WIDTH,
      defaultCollapsed: SIDEBAR_DEFAULT_COLLAPSED,
    },
    topbar: {
      height: TOPBAR_HEIGHT,
    },
    footer: {
      height: FOOTER_HEIGHT,
    },
  },
  modal: {
    maxWidth: MODAL_MAX_WIDTH,
    backdropBlur: MODAL_BACKDROP_BLUR,
    closeOnEscape: MODAL_CLOSE_ON_ESCAPE,
    closeOnBackdrop: MODAL_CLOSE_ON_BACKDROP,
  },
  tooltip: {
    delayMs: TOOLTIP_DELAY_MS,
    maxWidth: TOOLTIP_MAX_WIDTH,
  },
  table: {
    rowHeight: TABLE_ROW_HEIGHT,
    headerHeight: TABLE_HEADER_HEIGHT,
    enableVirtualization: TABLE_ENABLE_VIRTUALIZATION,
    virtualThreshold: TABLE_VIRTUAL_THRESHOLD,
  },
  notification: {
    maxDisplay: NOTIFICATION_MAX_DISPLAY,
    autoDismissMs: NOTIFICATION_AUTO_DISMISS_MS,
    successDismissMs: NOTIFICATION_SUCCESS_DISMISS_MS,
    errorDismissMs: NOTIFICATION_ERROR_DISMISS_MS,
    position: NOTIFICATION_POSITION,
    enableSound: NOTIFICATION_ENABLE_SOUND,
    maxStack: NOTIFICATION_MAX_STACK,
  },
} as const;
