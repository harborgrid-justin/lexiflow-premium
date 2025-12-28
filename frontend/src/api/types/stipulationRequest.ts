/**
 * Stipulation Request API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.pleadings.getStipulations() instead.
 * This constant is only for seeding and testing purposes.
 */

import { StipulationRequest } from '@/types';

/**
 * @deprecated MOCK DATA - Use DataService.pleadings instead
 */
export const MOCK_STIPULATIONS: StipulationRequest[] = [
  {
    id: 'stip-1',
    title: 'Extension to Respond to ROGs Set 1',
    requestingParty: 'Opposing Counsel',
    proposedDate: '2024-04-10',
    status: 'Pending',
    reason: 'Key witness unavailable for verification due to medical leave.'
  }
];
