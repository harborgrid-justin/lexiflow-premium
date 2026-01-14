/**
 * Compliance Frontend API
 * Enterprise-grade API layer for compliance monitoring and conflict checks
 *
 * @module lib/frontend-api/compliance
 * @description Domain-level contract for compliance operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * Covers:
 * - Conflict of interest checks
 * - Ethical wall management
 * - Compliance reporting
 * - Matter review
 * - Engagement letter tracking
 */

import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export interface ConflictCheckInput {
  clientId: string;
  partyNames: string[];
  opposingCounsel?: string[];
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    affectedParties: string[];
  }>;
  recommendations: string[];
  timestamp: string;
}

/**
 * Run conflict of interest check
 */
export async function runConflictCheck(
  input: ConflictCheckInput
): Promise<Result<ConflictCheckResult>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Conflict check input is required"));
  }

  if (!input.clientId || typeof input.clientId !== "string") {
    return failure(new ValidationError("Client ID is required"));
  }

  if (!Array.isArray(input.partyNames) || input.partyNames.length === 0) {
    return failure(new ValidationError("At least one party name is required"));
  }

  const result = await client.post<ConflictCheckResult>(
    "/compliance/conflict-check",
    input
  );

  return result;
}

/**
 * Get all compliance reports
 */
export async function getComplianceReports(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown>("/compliance/reports");

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items);
}

/**
 * Get ethical walls
 */
export async function getEthicalWalls(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown>("/compliance/ethical-walls");

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items);
}

/**
 * Create ethical wall
 */
export async function createEthicalWall(input: {
  name: string;
  description?: string;
  memberIds: string[];
}): Promise<Result<unknown>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Ethical wall input is required"));
  }

  if (!input.name || typeof input.name !== "string") {
    return failure(new ValidationError("Ethical wall name is required"));
  }

  if (!Array.isArray(input.memberIds) || input.memberIds.length === 0) {
    return failure(new ValidationError("At least one member is required"));
  }

  const result = await client.post<unknown>("/compliance/ethical-walls", input);

  return result;
}

/**
 * Compliance API module
 */
export const complianceApi = {
  runConflictCheck,
  getComplianceReports,
  getEthicalWalls,
  createEthicalWall,
} as const;
