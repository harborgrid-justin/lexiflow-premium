/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { complianceApi } from "@/lib/frontend-api";

export async function complianceLoader() {
  const [checksResult, conflictsResult] = await Promise.all([
    complianceApi.conflictChecks.getAll(),
    complianceApi.conflictChecks.getAll(),
  ]);

  const checks = Array.isArray(checksResult) ? checksResult : [];
  const conflicts = Array.isArray(conflictsResult) ? conflictsResult : [];
  const deadlines: unknown[] = [];

  return { checks, conflicts, deadlines };
}

// React Router loader alias for client bundle
export const loader = complianceLoader;
