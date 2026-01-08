/**
 * [PROTOCOL 04] PURE FUNCTION HOISTING
 * Utility functions for drafting domain - stateless and testable
 */

import type { ClauseValidationResult, DraftingTemplate } from "./types";

/**
 * Validate template variable requirements
 */
export function validateVariableValues(
  template: DraftingTemplate,
  values: Record<string, unknown>
): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const variable of template.variables) {
    if (variable.required && !values[variable.name]) {
      missing.push(variable.name);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Check clause compatibility
 */
export function validateClauseCompatibility(
  clauses: Array<{
    id: string;
    category?: string;
    title?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
  }>
): ClauseValidationResult {
  const conflicts: ClauseValidationResult["conflicts"] = [];

  for (let i = 0; i < clauses.length; i++) {
    for (let j = i + 1; j < clauses.length; j++) {
      const clause1 = clauses[i];
      const clause2 = clauses[j];

      if (!clause1 || !clause2) continue;

      // Category conflict check
      if (
        clause1.category &&
        clause2.category &&
        clause1.category === clause2.category
      ) {
        conflicts.push({
          clauseId1: clause1.id,
          clauseId2: clause2.id,
          reason: `Clauses "${clause1.title}" and "${clause2.title}" are both ${clause1.category} clauses and may conflict`,
          severity: "warning",
        });
      }

      // Explicit metadata conflicts
      if (
        Array.isArray(clause1.metadata?.conflictsWith) &&
        clause1.metadata.conflictsWith.includes(clause2.id)
      ) {
        conflicts.push({
          clauseId1: clause1.id,
          clauseId2: clause2.id,
          reason: `Clause "${clause1.title}" is incompatible with "${clause2.title}"`,
          severity: "error",
        });
      }

      if (
        Array.isArray(clause2.metadata?.conflictsWith) &&
        clause2.metadata.conflictsWith.includes(clause1.id)
      ) {
        conflicts.push({
          clauseId1: clause1.id,
          clauseId2: clause2.id,
          reason: `Clause "${clause2.title}" is incompatible with "${clause1.title}"`,
          severity: "error",
        });
      }

      // Tag-based exclusivity
      if (clause1.tags && clause2.tags) {
        const clause1Tags = Array.isArray(clause1.tags) ? clause1.tags : [];
        const clause2Tags = Array.isArray(clause2.tags) ? clause2.tags : [];

        const isMutuallyExclusive =
          clause1Tags.some((tag: string) => tag.startsWith("exclude:")) &&
          clause2Tags.some((tag: string) => {
            const excludeTag = clause1Tags.find((t: string) =>
              t.startsWith("exclude:")
            );
            return excludeTag && tag === excludeTag.replace("exclude:", "");
          });

        if (isMutuallyExclusive) {
          conflicts.push({
            clauseId1: clause1.id,
            clauseId2: clause2.id,
            reason: `Clauses "${clause1.title}" and "${clause2.title}" are mutually exclusive`,
            severity: "error",
          });
        }
      }
    }
  }

  return {
    isValid: conflicts.filter((c) => c.severity === "error").length === 0,
    conflicts,
  };
}

/**
 * Generate document preview with variable interpolation
 */
export function generatePreview(
  template: DraftingTemplate,
  variableValues: Record<string, unknown>,
  clauseContent?: Record<string, string>
): string {
  let content = template.content;

  // Replace variable placeholders: {{variable_name}}
  content = content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variableValues[varName];
    return value !== undefined && value !== null ? value.toString() : match;
  });

  // Replace case data placeholders: {{case.field}}
  content = content.replace(/\{\{case.(\w+)\}\}/g, (match, field) => {
    const caseData = variableValues["case"] as
      | Record<string, unknown>
      | undefined;
    if (caseData && caseData[field] !== undefined) {
      return caseData[field]?.toString() || match;
    }
    return match;
  });

  // Replace party placeholders: {{party.plaintiff}}, {{party.defendant}}
  content = content.replace(/\{\{party.(\w+)\}\}/g, (match, role) => {
    const parties = variableValues["parties"] as
      | Record<string, unknown>
      | undefined;
    if (parties && parties[role] !== undefined) {
      return parties[role]?.toString() || match;
    }
    return match;
  });

  // Insert clauses at designated positions: {{clause:position}}
  if (clauseContent) {
    content = content.replace(/\{\{clause:(\d+)\}\}/g, (match, position) => {
      const pos = parseInt(position);
      const clauseRef = template.clauseReferences?.find(
        (ref) => ref.position === pos
      );
      if (clauseRef && clauseContent[clauseRef.clauseId]) {
        return `\n\n${clauseContent[clauseRef.clauseId]}\n\n`;
      }
      return match;
    });
  }

  return content;
}

/**
 * Build query string from filter object
 */
export function buildFilterQuery(filters?: {
  category?: string;
  jurisdiction?: string;
  practiceArea?: string;
  search?: string;
  status?: string;
  caseId?: string;
}): string {
  if (!filters) return "";

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}
