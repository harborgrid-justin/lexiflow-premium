import { LegalHold, UUID } from '@/types';

export const MOCK_LEGAL_HOLDS: LegalHold[] = [
  { id: 'LH-01' as UUID, custodian: 'John Doe', dept: 'Engineering', issued: '2023-11-01', status: 'Acknowledged' },
  { id: 'LH-02' as UUID, custodian: 'Jane Smith', dept: 'HR', issued: '2023-11-01', status: 'Pending' },
  { id: 'LH-03' as UUID, custodian: 'IT Director', dept: 'IT Infrastructure', issued: '2023-11-01', status: 'Acknowledged' },
];
