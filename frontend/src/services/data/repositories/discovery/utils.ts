/**
 * Validate and sanitize case ID parameter
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
 */
export const validateId = (id: string, methodName: string): void => {
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new Error(`[DiscoveryRepository.${methodName}] Invalid id parameter`);
  }
};
