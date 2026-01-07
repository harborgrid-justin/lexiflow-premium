/**
 * Validation and helper utilities for billing operations
 */

/**
 * Validate and sanitize ID parameter
 */
export function validateId(id: string, methodName: string): void {
  if (!id || id.trim() === "") {
    throw new Error(`[BillingApiService.${methodName}] Invalid id parameter`);
  }
}

/**
 * Validate and sanitize object parameter
 */
export function validateObject(
  obj: unknown,
  paramName: string,
  methodName: string
): void {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error(
      `[BillingApiService.${methodName}] Invalid ${paramName} parameter`
    );
  }
}

/**
 * Validate and sanitize array parameter
 */
export function validateArray(
  arr: unknown[],
  paramName: string,
  methodName: string
): void {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    throw new Error(
      `[BillingApiService.${methodName}] Invalid ${paramName} parameter`
    );
  }
}

/**
 * Transform frontend TimeEntry to backend CreateTimeEntryDto
 */
export function transformTimeEntryForCreate(entry: Record<string, unknown>) {
  const createDto = {
    caseId: entry.caseId,
    userId: entry.userId || entry.createdBy,
    date: entry.date,
    duration: entry.duration,
    description: entry.description,
    activity: entry.activity,
    ledesCode: entry.ledesCode,
    rate: entry.rate || 0,
    status: entry.status,
    billable: entry.billable,
    rateTableId: entry.rateTableId,
    internalNotes: entry.internalNotes,
    taskCode: entry.taskCode,
  };

  // Remove undefined values
  Object.keys(createDto).forEach((key) => {
    if ((createDto as Record<string, unknown>)[key] === undefined) {
      delete (createDto as Record<string, unknown>)[key];
    }
  });

  return createDto;
}

/**
 * Extract data from nested paginated response
 */
export function extractPaginatedData<T>(response: unknown): T[] {
  // Handle nested paginated response
  const wrappedResponse = response as { data: { data: T[] } };
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    wrappedResponse.data &&
    typeof wrappedResponse.data === "object" &&
    "data" in wrappedResponse.data &&
    Array.isArray(wrappedResponse.data.data)
  ) {
    return wrappedResponse.data.data;
  }

  // Handle standard paginated response
  const paginatedResponse = response as { data: T[] };
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray(paginatedResponse.data)
  ) {
    return paginatedResponse.data;
  }

  // Handle direct array response
  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

/**
 * Get default realization stats for fallback
 */
export function getDefaultRealizationStats() {
  return [
    { name: "Billed", value: 0, color: "#10b981" },
    { name: "Write-off", value: 100, color: "#ef4444" },
  ];
}

/**
 * Get default overview stats for fallback
 */
export function getDefaultOverviewStats() {
  return {
    realization: 0,
    totalBilled: 0,
    month: new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    }),
  };
}
