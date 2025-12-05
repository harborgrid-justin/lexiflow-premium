
import { EthicalWall } from '../../types';

export const MOCK_WALLS: EthicalWall[] = [
    { id: 'w1', caseId: 'M&A-Project-Blue', title: 'Project Blue Acquisition', restrictedGroups: ['Litigation Team A'], authorizedUsers: ['M&A Partners', 'Risk Committee'], status: 'Active' },
    { id: 'w2', caseId: 'LIT-Jones-v-Smith', title: 'Jones Conflict Wall', restrictedGroups: ['Partner Sarah Miller'], authorizedUsers: ['All Staff'], status: 'Active' },
];
