/**
 * Query Validation Utilities
 * Helps validate and sanitize query parameters for safe database operations
 */

// Define allowed sort fields for each entity type
const ENTITY_SORT_FIELDS: Record<string, string[]> = {
  case: ['id', 'caseNumber', 'title', 'status', 'createdAt', 'updatedAt'],
  document: ['id', 'fileName', 'fileSize', 'createdAt', 'updatedAt'],
  expense: ['id', 'amount', 'expenseDate', 'category', 'createdAt', 'updatedAt'],
  invoice: ['id', 'invoiceNumber', 'amount', 'dueDate', 'status', 'createdAt', 'updatedAt'],
  timeEntry: ['id', 'hours', 'date', 'createdAt', 'updatedAt'],
  project: ['id', 'name', 'status', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
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
