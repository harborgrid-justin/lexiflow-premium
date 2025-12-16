/**
 * Query Validation Utilities
 * Helps validate and sanitize query parameters for safe database operations
 */

/**
 * Validates that a sort field is in the allowed list
 * @param sortBy - The field to sort by
 * @param allowedFields - Array of allowed field names
 * @param defaultField - Default field to use if validation fails
 * @returns Validated sort field
 */
export function validateSortField(
  sortBy: string | undefined,
  allowedFields: string[],
  defaultField: string = 'createdAt',
): string {
  if (!sortBy) {
    return defaultField;
  }

  const isAllowed = allowedFields.includes(sortBy);
  if (!isAllowed) {
    console.warn(`Invalid sort field "${sortBy}". Using default "${defaultField}"`);
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
