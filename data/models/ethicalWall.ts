
import { EthicalWall, UUID, CaseId, GroupId, UserId } from '../../types';

export const MOCK_WALLS: EthicalWall[] = [
    { id: 'w1' as UUID, caseId: 'M&A-Project-Blue' as CaseId, title: 'Project Blue Acquisition', restrictedGroups: ['Litigation Team A' as GroupId], authorizedUsers: ['M&A Partners' as UserId, 'Risk Committee' as UserId], status: 'Active' },
    { id: 'w2' as UUID, caseId: 'LIT-Jones-v-Smith' as CaseId, title: 'Jones Conflict Wall', restrictedGroups: ['Partner Sarah Miller' as GroupId], authorizedUsers: ['All Staff' as UserId], status: 'Active' },
];
