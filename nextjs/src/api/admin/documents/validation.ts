/**
 * Documents API Validation
 * @module api/admin/documents/validation
 */

/** Validate and sanitize ID parameter */
export function validateId(id: string, methodName: string): void {
  if (!id || id.trim() === '') {
    throw new Error(`[DocumentsApiService.${methodName}] Invalid id parameter`);
  }
}

/** Validate and sanitize file parameter */
export function validateFile(file: File, methodName: string): void {
  if (!file || !(file instanceof File)) {
    throw new Error(`[DocumentsApiService.${methodName}] Invalid file parameter`);
  }
  if (file.size === 0) {
    throw new Error(`[DocumentsApiService.${methodName}] File cannot be empty`);
  }
}

/** Validate and sanitize object parameter */
export function validateObject(obj: unknown, paramName: string, methodName: string): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error(`[DocumentsApiService.${methodName}] Invalid ${paramName} parameter`);
  }
}

/** Validate and sanitize array parameter */
export function validateArray(arr: unknown[], paramName: string, methodName: string): void {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    throw new Error(`[DocumentsApiService.${methodName}] Invalid ${paramName} parameter`);
  }
}
