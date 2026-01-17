/**
 * Conflict Check API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.compliance.getConflicts() with queryKeys.compliance.conflicts() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/conflicts/entities/conflict-check.entity.ts
 */

import { type ConflictCheck } from '@/types/compliance-risk';
import { type UUID, type UserId } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.compliance instead
 */
export const MOCK_CONFLICTS: ConflictCheck[] = [
    { id: '1' as UUID, entityName: 'MegaCorp Inc.', date: '2024-03-10', status: 'Cleared', foundIn: [], checkedById: 'system' as UserId, checkedBy: 'System Auto-Check' },
    { id: '2' as UUID, entityName: 'John Smith', date: '2024-03-11', status: 'Flagged', foundIn: ['Former Client (2018)', 'Witness in C-2022-01'], checkedById: 'usr-admin-justin' as UserId, checkedBy: 'Admin User' },
];
