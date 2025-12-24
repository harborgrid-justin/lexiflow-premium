// =============================================================================
// PAGINATION CONFIGURATION
// =============================================================================
// Default pagination settings for lists and tables

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 1000;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 500];
export const PAGINATION_SHOW_TOTAL = true;
export const PAGINATION_SHOW_SIZE_CHANGER = true;

// Export as object
export const PAGINATION_CONFIG = {
  defaultPageSize: DEFAULT_PAGE_SIZE,
  maxPageSize: MAX_PAGE_SIZE,
  pageSizeOptions: PAGE_SIZE_OPTIONS,
  showTotal: PAGINATION_SHOW_TOTAL,
  showSizeChanger: PAGINATION_SHOW_SIZE_CHANGER,
} as const;
