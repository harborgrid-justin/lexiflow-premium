/**
 * Query Validation Utilities
 * Helps validate and sanitize query parameters for safe database operations
 */

// Define allowed sort fields for each entity type
const ENTITY_SORT_FIELDS: Record<string, string[]> = {
  case: ['id', 'caseNumber', 'title', 'status', 'filingDate', 'closeDate', 'trialDate', 'createdAt', 'updatedAt'],
  document: ['id', 'fileName', 'fileSize', 'createdAt', 'updatedAt'],
  expense: ['id', 'amount', 'expenseDate', 'category', 'createdAt', 'updatedAt'],
  invoice: ['id', 'invoiceNumber', 'amount', 'dueDate', 'status', 'createdAt', 'updatedAt'],
  timeEntry: ['id', 'hours', 'date', 'createdAt', 'updatedAt'],
  project: ['id', 'name', 'status', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
  workflow: ['id', 'name', 'usageCount', 'category', 'isActive', 'createdAt', 'updatedAt'],
  task: ['id', 'title', 'dueDate', 'priority', 'status', 'createdAt', 'updatedAt'],
  employee: ['id', 'firstName', 'lastName', 'email', 'department', 'role', 'status', 'createdAt', 'updatedAt'],
  trial: ['id', 'date', 'courtRoom', 'status', 'createdAt', 'updatedAt'],
  risk: ['id', 'riskScore', 'severity', 'category', 'createdAt', 'updatedAt'],
  warRoom: ['id', 'name', 'status', 'createdAt', 'updatedAt'],
  report: ['id', 'name', 'type', 'status', 'createdAt', 'updatedAt'],
  pleading: ['id', 'filedDate', 'hearingDate', 'type', 'status', 'createdAt', 'updatedAt'],
  knowledge: ['id', 'title', 'category', 'views', 'createdAt', 'updatedAt'],
  messenger: ['id', 'lastMessageAt', 'createdAt', 'updatedAt'],
};

/**
 * Validates that a sort field is in the allowed list for an entity
 * @param entityType - The entity type (e.g., 'case', 'document')
 * @param sortBy - The field to sort by
 * @param defaultField - Default field to use if validation fails
 * @returns Validated sort field
 */
export function validateSortField(
  entityType: string,
  sortBy?: string,
  defaultField: string = 'createdAt',
): string {
  const allowedFields = ENTITY_SORT_FIELDS[entityType] || ['id', 'createdAt', 'updatedAt'];

  if (!sortBy) {
    return defaultField;
  }

  const isAllowed = allowedFields.includes(sortBy);
  if (!isAllowed) {
    console.warn(`Invalid sort field "${sortBy}" for entity "${entityType}". Using default "${defaultField}"`);
    return defaultField;
  }

  return sortBy;
}

/**
 * Validates sort order
 * @param sortOrder - The sort order (ASC/DESC)
 * @param defaultOrder - Default order if validation fails
 * @returns Validated sort order
 */
export function validateSortOrder(
  sortOrder: string | undefined,
  defaultOrder: 'ASC' | 'DESC' = 'DESC',
): 'ASC' | 'DESC' {
  if (!sortOrder) {
    return defaultOrder;
  }

  const normalized = sortOrder.toUpperCase();
  if (normalized !== 'ASC' && normalized !== 'DESC') {
    console.warn(`Invalid sort order "${sortOrder}". Using default "${defaultOrder}"`);
    return defaultOrder;
  }

  return normalized as 'ASC' | 'DESC';
}

/**
 * Validates pagination parameters
 * @param page - Current page number
 * @param limit - Items per page
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Validated pagination parameters
 */
export function validatePagination(
  page?: number,
  limit?: number,
  maxLimit: number = 100,
): { page: number; limit: number } {
  const validPage = Math.max(1, Math.floor(page || 1));
  const validLimit = Math.max(1, Math.min(maxLimit, Math.floor(limit || 20)));

  return { page: validPage, limit: validLimit };
}

/**
 * Sanitize search query to prevent SQL injection
 * Escapes special characters used in LIKE queries
 * @param search - Raw search string
 * @returns Sanitized search string
 */
export function sanitizeSearchQuery(search: string | undefined): string | undefined {
  if (!search || typeof search !== 'string') {
    return undefined;
  }

  // Remove null bytes and other control characters
  const cleaned = search.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim and return undefined if empty
  const trimmed = cleaned.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Build a safe LIKE pattern for SQL queries
 * @param search - Search term
 * @param matchType - Type of match: 'contains', 'startsWith', 'endsWith', 'exact'
 * @returns LIKE pattern string
 */
export function buildLikePattern(
  search: string,
  matchType: 'contains' | 'startsWith' | 'endsWith' | 'exact' = 'contains',
): string {
  const sanitized = sanitizeSearchQuery(search) || '';

  switch (matchType) {
    case 'startsWith':
      return `${sanitized}%`;
    case 'endsWith':
      return `%${sanitized}`;
    case 'exact':
      return sanitized;
    case 'contains':
    default:
      return `%${sanitized}%`;
  }
}

/**
 * Validate date range parameters
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Validated date range or undefined if invalid
 */
export function validateDateRange(
  startDate?: string | Date,
  endDate?: string | Date,
): { startDate: Date; endDate: Date } | undefined {
  if (!startDate && !endDate) {
    return undefined;
  }

  try {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid date format in date range');
      return undefined;
    }

    // Ensure start is before end
    if (start > end) {
      console.warn('Start date is after end date, swapping');
      return { startDate: end, endDate: start };
    }

    return { startDate: start, endDate: end };
  } catch (error) {
    console.warn('Error validating date range:', error);
    return undefined;
  }
}

/**
 * Validate and sanitize filter object
 * Removes undefined, null, and empty string values
 * @param filters - Raw filter object
 * @returns Cleaned filter object
 */
export function sanitizeFilters<T extends Record<string, any>>(filters: T): Partial<T> {
  const cleaned: Partial<T> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key as keyof T] = value;
    }
  }

  return cleaned;
}

/**
 * Validate enum value
 * @param value - Value to validate
 * @param allowedValues - Array of allowed enum values
 * @param defaultValue - Default value if validation fails
 * @returns Validated enum value
 */
export function validateEnum<T>(
  value: any,
  allowedValues: T[],
  defaultValue?: T,
): T | undefined {
  if (!value) {
    return defaultValue;
  }

  const isValid = allowedValues.includes(value as T);
  if (!isValid) {
    console.warn(`Invalid enum value "${value}". Allowed: ${allowedValues.join(', ')}`);
    return defaultValue;
  }

  return value as T;
}

/**
 * Validate numeric range
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param defaultValue - Default value if validation fails
 * @returns Validated numeric value
 */
export function validateNumericRange(
  value: any,
  min: number,
  max: number,
  defaultValue?: number,
): number | undefined {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    console.warn(`Invalid numeric value "${value}"`);
    return defaultValue;
  }

  if (numValue < min || numValue > max) {
    console.warn(`Value ${numValue} out of range [${min}, ${max}]`);
    return defaultValue;
  }

  return numValue;
}

/**
 * Build a query builder with validated sort parameters
 * Helper for common sorting pattern
 * @param queryBuilder - TypeORM QueryBuilder
 * @param alias - Entity alias
 * @param entityType - Entity type for validation
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order
 * @returns QueryBuilder with orderBy applied
 */
export function applySafeSort(
  queryBuilder: any,
  alias: string,
  entityType: string,
  sortBy?: string,
  sortOrder?: string,
): any {
  const safeSortField = validateSortField(entityType, sortBy);
  const safeSortOrder = validateSortOrder(sortOrder);

  return queryBuilder.orderBy(`${alias}.${safeSortField}`, safeSortOrder);
}
