/**
 * Filter Builders for API Requests
 *
 * @module filters
 * @description Helper functions for building API filter parameters
 * Provides:
 * - Type-safe filter builders
 * - Query parameter sanitization
 * - Date range filters
 * - Search filters
 * - Multi-value filters
 * - Filter validation
 */

/**
 * Base filter interface
 */
export interface BaseFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Status filter
 */
export interface StatusFilter {
  status?: string | string[];
}

/**
 * Tag filter
 */
export interface TagFilter {
  tags?: string | string[];
}

/**
 * Filter builder result
 */
export type FilterParams = Record<
  string,
  string | number | boolean | undefined
>;

/**
 * Remove undefined and null values from object
 *
 * @param obj - Object with potential undefined/null values
 * @returns Cleaned object
 */
export function cleanFilterParams<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  const cleaned: Partial<T> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key as keyof T] = value as T[keyof T];
    }
  });

  return cleaned;
}

/**
 * Build search filter parameter
 *
 * @param search - Search query string
 * @returns Filter parameters
 */
export function buildSearchFilter(search?: string): FilterParams {
  if (!search || search.trim().length === 0) {
    return {};
  }

  return {
    search: search.trim(),
  };
}

/**
 * Build sort filter parameters
 *
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort direction ('asc' or 'desc')
 * @returns Filter parameters
 */
export function buildSortFilter(
  sortBy?: string,
  sortOrder: "asc" | "desc" = "asc",
): FilterParams {
  if (!sortBy) {
    return {};
  }

  return {
    sortBy,
    sortOrder,
  };
}

/**
 * Build date range filter parameters
 *
 * @param dateFrom - Start date (ISO string or Date)
 * @param dateTo - End date (ISO string or Date)
 * @returns Filter parameters
 */
export function buildDateRangeFilter(
  dateFrom?: string | Date,
  dateTo?: string | Date,
): FilterParams {
  const params: FilterParams = {};

  if (dateFrom) {
    params["dateFrom"] =
      dateFrom instanceof Date ? dateFrom.toISOString() : dateFrom;
  }

  if (dateTo) {
    params["dateTo"] = dateTo instanceof Date ? dateTo.toISOString() : dateTo;
  }

  return params;
}

/**
 * Build status filter parameters
 *
 * @param status - Status value or array of statuses
 * @returns Filter parameters
 */
export function buildStatusFilter(status?: string | string[]): FilterParams {
  if (!status) {
    return {};
  }

  if (Array.isArray(status)) {
    return status.length > 0 ? { status: status.join(",") } : {};
  }

  return { status };
}

/**
 * Build tag filter parameters
 *
 * @param tags - Tag value or array of tags
 * @returns Filter parameters
 */
export function buildTagFilter(tags?: string | string[]): FilterParams {
  if (!tags) {
    return {};
  }

  if (Array.isArray(tags)) {
    return tags.length > 0 ? { tags: tags.join(",") } : {};
  }

  return { tags };
}

/**
 * Build boolean filter parameters
 *
 * @param key - Filter key
 * @param value - Boolean value
 * @returns Filter parameters
 */
export function buildBooleanFilter(key: string, value?: boolean): FilterParams {
  if (value === undefined) {
    return {};
  }

  return { [key]: value };
}

/**
 * Build enum filter parameters
 *
 * @param key - Filter key
 * @param value - Enum value or array of values
 * @returns Filter parameters
 */
export function buildEnumFilter(
  key: string,
  value?: string | string[],
): FilterParams {
  if (!value) {
    return {};
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? { [key]: value.join(",") } : {};
  }

  return { [key]: value };
}

/**
 * Merge multiple filter objects
 *
 * @param filters - Array of filter objects
 * @returns Merged and cleaned filter parameters
 */
export function mergeFilters(...filters: FilterParams[]): FilterParams {
  const merged = Object.assign({}, ...filters);
  return cleanFilterParams(merged);
}

/**
 * Build complete filter parameters from individual filters
 *
 * @param filters - Object containing various filter types
 * @returns Complete filter parameters
 *
 * @example
 * ```ts
 * const params = buildFilters({
 *   search: 'case',
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-12-31',
 *   status: ['open', 'pending'],
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 * });
 * ```
 */
export function buildFilters(filters: {
  search?: string;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  status?: string | string[];
  tags?: string | string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}): FilterParams {
  const {
    search,
    dateFrom,
    dateTo,
    status,
    tags,
    sortBy,
    sortOrder,
    ...customFilters
  } = filters;

  return mergeFilters(
    buildSearchFilter(search),
    buildDateRangeFilter(dateFrom, dateTo),
    buildStatusFilter(status),
    buildTagFilter(tags),
    buildSortFilter(sortBy, sortOrder),
    cleanFilterParams(customFilters as FilterParams),
  );
}

/**
 * Parse filter string to array
 * Handles comma-separated values
 *
 * @param value - Filter value (string or array)
 * @returns Array of values
 */
export function parseFilterArray(value?: string | string[]): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Validate date range
 *
 * @param dateFrom - Start date
 * @param dateTo - End date
 * @returns True if valid range
 */
export function isValidDateRange(
  dateFrom?: string | Date,
  dateTo?: string | Date,
): boolean {
  if (!dateFrom || !dateTo) {
    return true; // Allow partial ranges
  }

  const from = dateFrom instanceof Date ? dateFrom : new Date(dateFrom);
  const to = dateTo instanceof Date ? dateTo : new Date(dateTo);

  return from <= to;
}

/**
 * Build URL query string from filters
 *
 * @param filters - Filter parameters
 * @returns URL query string
 *
 * @example
 * ```ts
 * buildFilterQuery({ search: 'test', status: 'active' });
 * // "search=test&status=active"
 * ```
 */
export function buildFilterQuery(filters: FilterParams): string {
  const params = new URLSearchParams();

  Object.entries(cleanFilterParams(filters)).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

/**
 * Parse URL query string to filters
 *
 * @param queryString - URL query string
 * @returns Filter parameters
 */
export function parseFilterQuery(queryString: string): FilterParams {
  const params = new URLSearchParams(queryString);
  const filters: FilterParams = {};

  params.forEach((value, key) => {
    // Parse boolean values
    if (value === "true") {
      filters[key] = true;
    } else if (value === "false") {
      filters[key] = false;
    }
    // Parse numeric values
    else if (!isNaN(Number(value))) {
      filters[key] = Number(value);
    }
    // Keep as string
    else {
      filters[key] = value;
    }
  });

  return filters;
}

/**
 * Compare two filter objects
 *
 * @param filters1 - First filter object
 * @param filters2 - Second filter object
 * @returns True if filters are equal
 */
export function areFiltersEqual(
  filters1: FilterParams,
  filters2: FilterParams,
): boolean {
  const clean1 = cleanFilterParams(filters1);
  const clean2 = cleanFilterParams(filters2);

  const keys1 = Object.keys(clean1).sort();
  const keys2 = Object.keys(clean2).sort();

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => clean1[key] === clean2[key]);
}

/**
 * Create filter preset
 *
 * @param name - Preset name
 * @param filters - Filter parameters
 * @returns Filter preset object
 */
export interface FilterPreset {
  name: string;
  filters: FilterParams;
  createdAt: string;
}

export function createFilterPreset(
  name: string,
  filters: FilterParams,
): FilterPreset {
  return {
    name,
    filters: cleanFilterParams(filters),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Common filter presets for legal platform
 */
export const COMMON_FILTER_PRESETS = {
  activeCases: createFilterPreset("Active Cases", { status: "active" }),
  openCases: createFilterPreset("Open Cases", { status: "open" }),
  closedCases: createFilterPreset("Closed Cases", { status: "closed" }),
  recentCases: createFilterPreset("Recent Cases", {
    sortBy: "createdAt",
    sortOrder: "desc",
  }),
  highPriority: createFilterPreset("High Priority", { priority: "high" }),
  overdueItems: createFilterPreset("Overdue", { overdue: true }),
  thisMonth: createFilterPreset("This Month", {
    dateFrom: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString(),
    dateTo: new Date().toISOString(),
  }),
} as const;
