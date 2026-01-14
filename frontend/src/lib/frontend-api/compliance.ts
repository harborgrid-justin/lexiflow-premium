/**
 * Compliance Frontend API
 * Domain contract for compliance monitoring and conflict checks
 */

import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export async function runConflictCheck(
  clientId: string,
  partyNames: string[]
): Promise<Result<unknown>> {
  if (!clientId) return failure(new ValidationError("Client ID is required"));
  if (!partyNames || partyNames.length === 0) {
    return failure(new ValidationError("At least one party name is required"));
  }

  const result = await client.post<unknown>("/compliance/conflict-check", {
    clientId,
    partyNames,
  });

  if (!result.ok) return result;

  return success(result.data);
}

export async function getComplianceReports(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown>("/compliance/reports");

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items);
}

export async function getEthicalWalls(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown>("/compliance/ethical-walls");

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items);
}

export const complianceApi = {
  runConflictCheck,
  getComplianceReports,
  getEthicalWalls,
};
