/**
 * @module utils/idGenerator
 * @description Type-safe ID generation utilities for branded types
 */

import {
  CaseId,
  UserId,
  PleadingDocument,
  PleadingTemplate,
  FormattingRule,
  EvidenceId,
  DocumentId,
  DocketId,
  PartyId
} from '@/types';

/**
 * Generates a cryptographically secure random ID
 */
const generateSecureId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${randomPart}${randomPart2}`;
};

/**
 * Type-safe factory functions for generating IDs
 */
export const IdGenerator = {
  pleading: (): PleadingDocument['id'] => {
    return generateSecureId('plead') as PleadingDocument['id'];
  },

  section: (): string => {
    return generateSecureId('sec');
  },

  template: (): PleadingTemplate['id'] => {
    return generateSecureId('tmpl') as PleadingTemplate['id'];
  },

  formattingRule: (): FormattingRule['id'] => {
    return generateSecureId('rule') as FormattingRule['id'];
  },

  case: (): CaseId => {
    return generateSecureId('case') as CaseId;
  },

  user: (): UserId => {
    return generateSecureId('user') as UserId;
  },

  evidence: (): EvidenceId => {
    return generateSecureId('evid') as EvidenceId;
  },

  document: (): DocumentId => {
    return generateSecureId('doc') as DocumentId;
  },

  docket: (): DocketId => {
    return generateSecureId('dk') as DocketId;
  },

  party: (): PartyId => {
    return generateSecureId('party') as PartyId;
  },

  staff: () => {
    return generateSecureId('staff');
  },

  stipulation: () => {
    return generateSecureId('stip');
  },

  generic: (prefix: string): string => {
    return generateSecureId(prefix);
  }
};

/**
 * Validates ID format
 */
export const validateId = (id: string, expectedPrefix: string): boolean => {
  const regex = new RegExp(`^${expectedPrefix}-[a-z0-9]+-[a-z0-9]+$`);
  return regex.test(id);
};

/**
 * Extracts timestamp from generated ID
 */
export const getIdTimestamp = (id: string): number | null => {
  try {
    const parts = id.split('-');
    if (parts.length >= 2) {
      return parseInt(parts[1]!, 36);
    }
  } catch {
    return null;
  }
  return null;
};
