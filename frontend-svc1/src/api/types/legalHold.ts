/**
 * Legal Hold API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.discovery.getLegalHolds() with queryKeys.discovery.legalHolds() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/discovery/entities/legal-hold.entity.ts
 */

import { LegalHold } from '@/types/discovery';
import { UUID } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.discovery instead
 */
export const MOCK_LEGAL_HOLDS: LegalHold[] = [
  { id: 'LH-01' as UUID, custodian: 'John Doe', dept: 'Engineering', issued: '2023-11-01', status: 'Acknowledged' },
  { id: 'LH-02' as UUID, custodian: 'Jane Smith', dept: 'HR', issued: '2023-11-01', status: 'Pending' },
  { id: 'LH-03' as UUID, custodian: 'IT Director', dept: 'IT Infrastructure', issued: '2023-11-01', status: 'Acknowledged' },
];
