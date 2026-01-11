/**
 * Clause Validator
 * Validates clause combinations and generates document previews
 */

import type { DraftingTemplate } from "./types";
import type { ClauseValidationResult, ClauseConflict } from "./validation-types";

interface ClauseWithMetadata {
  id: string;
  title: string;
  category: string;
  tags?: string[];
  metadata?: {
    conflictsWith?: string[];
  };
}

/**
 * Check for conflicts between selected clauses
 */
export function validateClauses(clauses: unknown[]): ClauseValidationResult {
  const conflicts: ClauseConflict[] = [];

  // Check for mutual exclusivity
  for (let i = 0; i < clauses.length; i++) {
    for (let j = i + 1; j < clauses.length; j++) {
      const clause1 = clauses[i] as ClauseWithMetadata;
      const clause2 = clauses[j] as ClauseWithMetadata;

      // Check if clauses have incompatible categories
      if (
        clause1.category === clause2.category &&
        clause1.category !== "general" &&
        clause1.category !== "boilerplate"
      ) {
        conflicts.push({
          clauseId1: clause1.id,
          clauseId2: clause2.id,
          reason: `Clauses "${clause1.title}" and "${clause2.title}" are both ${clause1.category} clauses and may conflict`,
          severity: "warning",
        });
      }

      // Check for explicit conflicts in metadata
      if (clause1.metadata?.conflictsWith?.includes(clause2.id)) {
        conflicts.push({
          clauseId1: clause1.id,
          clauseId2: clause2.id,
          reason: `Clause "${clause1.title}" is incompatible with "${clause2.title}"`,
          severity: "error",
        });
      }

      if (clause2.metadata?.conflictsWith?.includes(clause1.id)) {
        conflicts.push({
          clauseId1: clause1.id,
          clauseId2: clause2.id,
          reason: `Clause "${clause2.title}" is incompatible with "${clause1.title}"`,
          severity: "error",
        });
      }

      // Check for tag-based conflicts
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
 * Generate preview of document with variable interpolation
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
    if (value !== undefined && value !== null) {
      return value.toString();
    }
    return match;
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
