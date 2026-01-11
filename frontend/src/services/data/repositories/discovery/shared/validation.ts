/**
 * Shared Validation Utilities
 * Provides reusable validation functions for discovery operations
 *
 * @module validation
 */

/**
 * Validate and sanitize case ID parameter
 *
 * @param caseId - Case ID to validate (optional)
 * @param methodName - Name of calling method for error context
 * @throws Error if caseId is invalid (non-string or empty when provided)
 *
 * @example
 * validateCaseId('case-123', 'getCustodians'); // passes
 * validateCaseId(undefined, 'getCustodians'); // passes (optional)
 * validateCaseId('', 'getCustodians'); // throws
 */
export const validateCaseId = (
  caseId: string | undefined,
  methodName: string
): void => {
  if (
    caseId !== undefined &&
    (typeof caseId !== "string" || caseId.trim() === "")
  ) {
    throw new Error(
      `[DiscoveryRepository.${methodName}] Invalid caseId parameter`
    );
  }
};

/**
 * Validate and sanitize ID parameter
 *
 * @param id - ID to validate (required)
 * @param methodName - Name of calling method for error context
 * @throws Error if id is invalid (non-string, empty, or undefined)
 *
 * @example
 * validateId('entity-123', 'getCustodian'); // passes
 * validateId('', 'getCustodian'); // throws
 * validateId(undefined, 'getCustodian'); // throws
 */
export const validateId = (id: string, methodName: string): void => {
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new Error(
      `[DiscoveryRepository.${methodName}] Invalid id parameter`
    );
  }
};
