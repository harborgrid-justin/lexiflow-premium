/**
 * @module utils/templateEngine
 * @description Safe template variable substitution engine
 */

import { Case, PleadingSection } from '../types';

export interface TemplateContext {
  case?: Case;
  [key: string]: unknown;
}

/**
 * Template variable pattern: {{variableName}} or {{object.property}}
 */
const TEMPLATE_VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;

/**
 * Safely gets nested property from object
 */
function getNestedProperty(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.trim().split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Substitutes template variables in content
 */
export function substituteVariables(
  content: string,
  context: TemplateContext
): string {
  return content.replace(TEMPLATE_VARIABLE_PATTERN, (match, variablePath) => {
    const value = getNestedProperty(context, variablePath);

    if (value === undefined || value === null) {
      return `[${variablePath.toUpperCase()}]`;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  });
}

/**
 * Hydrates template sections with case data
 */
export function hydrateTemplateSections(
  sections: Partial<PleadingSection>[],
  context: TemplateContext
): Partial<PleadingSection>[] {
  return sections.map(section => ({
    ...section,
    content: section.content ? substituteVariables(section.content, context) : ''
  }));
}

/**
 * Extracts all variables used in template
 */
export function extractTemplateVariables(content: string): string[] {
  const variables = new Set<string>();
  const matches = content.matchAll(TEMPLATE_VARIABLE_PATTERN);

  for (const match of matches) {
    variables.add(match[1].trim());
  }

  return Array.from(variables);
}

/**
 * Validates that all required variables are present in context
 */
export function validateTemplateContext(
  content: string,
  context: TemplateContext
): { valid: boolean; missingVariables: string[] } {
  const variables = extractTemplateVariables(content);
  const missing: string[] = [];

  for (const variable of variables) {
    const value = getNestedProperty(context, variable);
    if (value === undefined || value === null) {
      missing.push(variable);
    }
  }

  return {
    valid: missing.length === 0,
    missingVariables: missing
  };
}

/**
 * Creates standard template context from case data
 */
export function createTemplateContext(caseData: Case): TemplateContext {
  const plaintiff = caseData.parties?.find(p => 
    p.role.includes('Plaintiff') || p.role.includes('Appellant')
  );
  
  const defendant = caseData.parties?.find(p => 
    p.role.includes('Defendant') || p.role.includes('Appellee')
  );

  return {
    case: caseData,
    Plaintiff: plaintiff?.name || '[PLAINTIFF]',
    Defendant: defendant?.name || '[DEFENDANT]',
    CaseNumber: caseData.id,
    Court: caseData.court || '[COURT]',
    Judge: caseData.judge || '[JUDGE]',
    FilingDate: caseData.filingDate || new Date().toISOString(),
    Title: caseData.title || '[CASE TITLE]',
    // Add all parties as array
    Parties: caseData.parties || [],
    // Add nested access
    'case.id': caseData.id,
    'case.title': caseData.title,
    'case.court': caseData.court,
    'case.judge': caseData.judge
  };
}
