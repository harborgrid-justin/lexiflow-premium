import { type TimeEntry } from '@/types';

export const calculateUnbilledTotal = (entries: TimeEntry[]): number => {
  return entries
    .filter(e => e.status === 'Unbilled')
    .reduce((sum, e) => sum + e.total, 0);
};

export const calculateBilledTotal = (entries: TimeEntry[]): number => {
  return entries
    .filter(e => e.status === 'Billed')
    .reduce((sum, e) => sum + e.total, 0);
};

export const calculateTotalHours = (entries: TimeEntry[]): number => {
  return entries.reduce((sum, e) => sum + (e.duration / 60), 0);
};

export const calculateLedgerTotal = (entries: TimeEntry[]): number => {
  return calculateUnbilledTotal(entries) + calculateBilledTotal(entries);
};
