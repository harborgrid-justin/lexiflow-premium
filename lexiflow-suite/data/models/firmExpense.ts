
import { FirmExpense } from '../../types.ts';

export const MOCK_EXPENSES: FirmExpense[] = [
  { id: 'ex-1', date: '2024-03-15', category: 'Rent', description: 'Office Lease - Q1', amount: 12500, status: 'Paid', vendor: 'Tower Management LLC' },
  { id: 'ex-2', date: '2024-03-18', category: 'Software', description: 'LexisNexis Subscription', amount: 4500, status: 'Paid', vendor: 'LexisNexis' },
  { id: 'ex-3', date: '2024-03-20', category: 'Marketing', description: 'LinkedIn Ads Campaign', amount: 1200, status: 'Pending', vendor: 'LinkedIn' },
];
