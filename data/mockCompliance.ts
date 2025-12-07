import { ConflictCheck } from '../types';
import { EthicalWall } from '../types';

export const MOCK_CONFLICTS: ConflictCheck[] = [
    { id: '1', entityName: 'MegaCorp Inc.', date: '2024-03-10', status: 'Cleared', foundIn: [], checkedById: 'system', checkedBy: 'System Auto-Check' },
    { id: '2', entityName: 'John Smith', date: '2024-03-11', status: 'Flagged', foundIn: ['Former Client (2018)', 'Witness in C-2022-01'], checkedById: 'usr-admin-justin', checkedBy: 'Admin User' },
];

export const MOCK_WALLS: EthicalWall[] = [
    { id: 'w1', caseId: 'M&A-Project-Blue', title: 'Project Blue Acquisition', restrictedGroups: ['Litigation Team A'], authorizedUsers: ['M&A Partners', 'Risk Committee'], status: 'Active' },
    { id: 'w2', caseId: 'LIT-Jones-v-Smith', title: 'Jones Conflict Wall', restrictedGroups: ['Partner Sarah Miller'], authorizedUsers: ['All Staff'], status: 'Active' },
];