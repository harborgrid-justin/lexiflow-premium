import { useMemo } from 'react';
import { TimeEntry } from '@/types';
import {
  calculateUnbilledTotal,
  calculateBilledTotal,
  calculateTotalHours,
  calculateLedgerTotal
} from '../utils/financialUtils';

export interface UseCaseFinancialsResult {
  unbilledTotal: number;
  billedTotal: number;
  totalHours: number;
  ledgerTotal: number;
}

export function useCaseFinancials(entries: TimeEntry[]): UseCaseFinancialsResult {
  const unbilledTotal = useMemo(() => calculateUnbilledTotal(entries), [entries]);
  const billedTotal = useMemo(() => calculateBilledTotal(entries), [entries]);
  const totalHours = useMemo(() => calculateTotalHours(entries), [entries]);
  const ledgerTotal = useMemo(() => calculateLedgerTotal(entries), [entries]);

  return {
    unbilledTotal,
    billedTotal,
    totalHours,
    ledgerTotal
  };
}
