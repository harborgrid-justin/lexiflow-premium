/**
 * Time Entry API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.billing.getTimeEntries() with queryKeys.billing.timeEntries() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/billing/entities/time-entry.entity.ts
 */

import { TimeEntry } from '@/types/financial';
import { UUID, CaseId, UserId } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.billing instead
 */
export const MOCK_TIME_ENTRIES: TimeEntry[] = [
    {
      id: '1' as UUID,
      caseId: 'C-2024-001' as CaseId, userId: 'usr-admin-justin' as UserId,
      date: '2024-03-01', duration: 30, description: 'Initial review of complaint', rate: 450, total: 225, status: 'Billed', billable: true
    },
    {
      id: '2' as UUID,
      caseId: 'C-2024-001' as CaseId, userId: 'usr-admin-justin' as UserId,
      date: '2024-03-02', duration: 60, description: 'Drafting response strategy', rate: 450, total: 450, status: 'Unbilled', billable: true
    },
    {
      id: '3' as UUID,
      caseId: 'C-2024-112' as CaseId, userId: 'usr-partner-alex' as UserId,
      date: '2024-03-05', duration: 120, description: 'Due diligence review', rate: 550, total: 1100, status: 'Unbilled', billable: true
    }
];
