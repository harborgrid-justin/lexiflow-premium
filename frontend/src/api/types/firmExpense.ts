/**
 * Firm Expense API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.operations.getExpenses() with queryKeys.operations.expenses() instead.
 * This constant is only for seeding and testing purposes.
 */

import { type FirmExpense } from '@/types/financial';
import { type UUID } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.operations instead
 */
export const MOCK_EXPENSES: FirmExpense[] = [
  { id: 'ex-1' as UUID, date: '2024-03-15', category: 'Rent', description: 'Office Lease - Q1', amount: 12500, status: 'Paid', vendor: 'Tower Management LLC' },
  { id: 'ex-2' as UUID, date: '2024-03-18', category: 'Software', description: 'LexisNexis Subscription', amount: 4500, status: 'Paid', vendor: 'LexisNexis' },
  { id: 'ex-3' as UUID, date: '2024-03-20', category: 'Marketing', description: 'LinkedIn Ads Campaign', amount: 1200, status: 'Pending', vendor: 'LinkedIn' },
];
