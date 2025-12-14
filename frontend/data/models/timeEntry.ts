
import { TimeEntry, UUID, CaseId, UserId } from '../../types';

export const MOCK_TIME_ENTRIES: TimeEntry[] = [
    { 
      id: '1' as UUID, 
      caseId: 'C-2024-001' as CaseId, userId: 'usr-admin-justin' as UserId, 
      date: '2024-03-01', duration: 30, description: 'Initial review of complaint', rate: 450, total: 225, status: 'Billed' 
    },
    { 
      id: '2' as UUID, 
      caseId: 'C-2024-001' as CaseId, userId: 'usr-admin-justin' as UserId,
      date: '2024-03-02', duration: 60, description: 'Drafting response strategy', rate: 450, total: 450, status: 'Unbilled' 
    },
    { 
      id: '3' as UUID, 
      caseId: 'C-2024-112' as CaseId, userId: 'usr-partner-alex' as UserId,
      date: '2024-03-05', duration: 120, description: 'Due diligence review', rate: 550, total: 1100, status: 'Unbilled' 
    }
];
