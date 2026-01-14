/**
 * Data Normalization Layer
 * Transform backend shapes to UI-ready formats
 *
 * @module lib/normalization
 * @description Normalization per spec IV & XII:
 * - Backend v1 → Frontend API v3 → UI v7
 * - Backend responses normalized to consistent frontend shapes
 * - Version drift isolated to normalizers
 * - UI receives stable, predictable data
 *
 * RULES:
 * - Normalizers are pure functions
 * - No side effects
 * - No UI/React imports
 * - Idempotent (normalize(normalize(x)) === normalize(x))
 * - Handle missing/null fields gracefully
 * - Provide sensible defaults
 *
 * RESPONSIBILITY:
 * - Map backend field names to frontend names
 * - Coerce types (string dates → Date objects)
 * - Flatten nested structures
 * - Add computed fields
 * - Remove sensitive data
 * - Ensure required fields exist
 *
 * @example
 * ```typescript
 * // Backend shape
 * const backend = {
 *   case_number: '2025-CV-123',
 *   created_at: '2025-01-14T10:00:00Z',
 *   case_status: 'active'
 * };
 *
 * // Frontend shape
 * const frontend = normalizeCase(backend);
 * // {
 * //   caseNumber: '2025-CV-123',
 * //   createdAt: Date,
 * //   status: 'Active'
 * // }
 * ```
 */

export * from "./core";

// Re-export domain-specific normalizers
export * from "./admin";
export * from "./auth";
export * from "./billing";
export * from "./case";
export * from "./communications";
export * from "./discovery";
export * from "./docket";
export * from "./hr";
export * from "./integrations";
export * from "./intelligence";
export * from "./workflow";
