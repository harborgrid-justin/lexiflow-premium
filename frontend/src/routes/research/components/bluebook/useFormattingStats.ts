import { useMemo } from 'react';

import { ValidationSeverity } from '@/types/bluebook';

import type { FormattingResult, FormatStats } from './types';

export const useFormattingStats = (results: FormattingResult[]): FormatStats => {
  return useMemo<FormatStats>(() => {
    const total = results.length;
    const valid = results.filter(r => r.isValid).length;
    const warnings = results.filter(r =>
      r.citation?.validationErrors.some(e => e.severity === ValidationSeverity.WARNING)
    ).length;
    const errors = results.filter(r => !r.isValid).length;

    return { total, valid, warnings, errors };
  }, [results]);
};
