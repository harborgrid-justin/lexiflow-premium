/**
 * Ethical Wall API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.compliance.getEthicalWalls() with queryKeys.compliance.walls() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/compliance/entities/ethical-wall.entity.ts
 */

import { type EthicalWall } from '@/types/compliance-risk';
import { type UUID, type CaseId, type GroupId, type UserId } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.compliance instead
 */
export const MOCK_WALLS: EthicalWall[] = [
    { id: 'w1' as UUID, caseId: 'M&A-Project-Blue' as CaseId, title: 'Project Blue Acquisition', restrictedGroups: ['Litigation Team A' as GroupId], authorizedUsers: ['M&A Partners' as UserId, 'Risk Committee' as UserId], status: 'Active' },
    { id: 'w2' as UUID, caseId: 'LIT-Jones-v-Smith' as CaseId, title: 'Jones Conflict Wall', restrictedGroups: ['Partner Sarah Miller' as GroupId], authorizedUsers: ['All Staff' as UserId], status: 'Active' },
];
