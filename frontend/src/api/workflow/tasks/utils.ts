/**
 * Task Validation Utilities
 */

export function validateId(id: string, methodName: string): void {
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new Error(`[TasksApiService.${methodName}] Invalid id parameter`);
  }
}

export function validateObject(
  obj: unknown,
  paramName: string,
  methodName: string
): void {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error(
      `[TasksApiService.${methodName}] Invalid ${paramName} parameter`
    );
  }
}

export function validateContent(content: string, methodName: string): void {
  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new Error(`[TasksApiService.${methodName}] content is required`);
  }
}

export function validatePercentage(value: number, methodName: string): void {
  if (typeof value !== "number" || value < 0 || value > 100) {
    throw new Error(
      `[TasksApiService.${methodName}] value must be between 0 and 100`
    );
  }
}

export function validateArray(arr: unknown[], methodName: string): void {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(
      `[TasksApiService.${methodName}] must be a non-empty array`
    );
  }
}
