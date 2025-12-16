/**
 * Type Mappings and Guards
 *
 * This file provides mapping utilities between frontend and backend types,
 * and type guards to ensure type safety when converting between systems.
 */

import { MatterType } from './enums';

/**
 * Backend CaseType enum (from backend/src/cases/entities/case.entity.ts)
 * Values match the backend database enum
 */
export enum BackendCaseType {
  CIVIL = 'Civil',
  CRIMINAL = 'Criminal',
  FAMILY = 'Family',
  BANKRUPTCY = 'Bankruptcy',
  IMMIGRATION = 'Immigration',
  INTELLECTUAL_PROPERTY = 'Intellectual Property',
  CORPORATE = 'Corporate',
  REAL_ESTATE = 'Real Estate',
  LABOR = 'Labor',
  ENVIRONMENTAL = 'Environmental',
  TAX = 'Tax',
}

/**
 * Maps frontend MatterType to backend CaseType
 *
 * Note: Some mappings are not 1:1 and require business logic:
 * - 'General' can map to multiple backend types depending on context
 * - 'Appeal' is a process stage, not a case type, so it maps to CIVIL by default
 */
export const MATTER_TYPE_TO_CASE_TYPE: Record<MatterType, BackendCaseType> = {
  'Litigation': BackendCaseType.CIVIL,
  'M&A': BackendCaseType.CORPORATE,
  'IP': BackendCaseType.INTELLECTUAL_PROPERTY,
  'Real Estate': BackendCaseType.REAL_ESTATE,
  'General': BackendCaseType.CIVIL, // Default mapping, may need context-specific override
  'Appeal': BackendCaseType.CIVIL, // Appeals can be any type, defaulting to Civil
};

/**
 * Reverse mapping: backend CaseType to frontend MatterType
 *
 * Note: Multiple backend types can map to the same frontend type
 */
export const CASE_TYPE_TO_MATTER_TYPE: Partial<Record<BackendCaseType, MatterType>> = {
  [BackendCaseType.CIVIL]: 'Litigation',
  [BackendCaseType.CRIMINAL]: 'Litigation',
  [BackendCaseType.FAMILY]: 'Litigation',
  [BackendCaseType.BANKRUPTCY]: 'General',
  [BackendCaseType.IMMIGRATION]: 'General',
  [BackendCaseType.INTELLECTUAL_PROPERTY]: 'IP',
  [BackendCaseType.CORPORATE]: 'M&A',
  [BackendCaseType.REAL_ESTATE]: 'Real Estate',
  [BackendCaseType.LABOR]: 'Litigation',
  [BackendCaseType.ENVIRONMENTAL]: 'General',
  [BackendCaseType.TAX]: 'General',
};

/**
 * Convert frontend MatterType to backend CaseType
 */
export function matterTypeToCaseType(matterType: MatterType): BackendCaseType {
  return MATTER_TYPE_TO_CASE_TYPE[matterType];
}

/**
 * Convert backend CaseType to frontend MatterType
 */
export function caseTypeToMatterType(caseType: BackendCaseType | string): MatterType {
  // Handle string values from backend
  const mappedType = CASE_TYPE_TO_MATTER_TYPE[caseType as BackendCaseType];
  return mappedType || 'General'; // Default to 'General' if no mapping found
}

/**
 * Type guard to check if a value is a valid BackendCaseType
 */
export function isBackendCaseType(value: unknown): value is BackendCaseType {
  return typeof value === 'string' && Object.values(BackendCaseType).includes(value as BackendCaseType);
}

/**
 * Type guard to check if a value is a valid MatterType
 */
export function isMatterType(value: unknown): value is MatterType {
  const validTypes: MatterType[] = ['Litigation', 'M&A', 'IP', 'Real Estate', 'General', 'Appeal'];
  return typeof value === 'string' && validTypes.includes(value as MatterType);
}

/**
 * Transform case data from backend to frontend format
 * Automatically converts CaseType to MatterType
 */
export function transformCaseFromBackend<T extends { type?: string | BackendCaseType }>(
  backendCase: T
): T & { matterType?: MatterType } {
  if (!backendCase.type) return backendCase as T & { matterType?: MatterType };

  return {
    ...backendCase,
    matterType: caseTypeToMatterType(backendCase.type),
  };
}

/**
 * Transform case data from frontend to backend format
 * Automatically converts MatterType to CaseType
 */
export function transformCaseToBackend<T extends { matterType?: MatterType }>(
  frontendCase: T
): Omit<T, 'matterType'> & { type?: BackendCaseType } {
  if (!frontendCase.matterType) {
    const { matterType, ...rest } = frontendCase;
    return rest as Omit<T, 'matterType'> & { type?: BackendCaseType };
  }

  const { matterType, ...rest } = frontendCase;
  return {
    ...rest,
    type: matterTypeToCaseType(matterType),
  };
}
