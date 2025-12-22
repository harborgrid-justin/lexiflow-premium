
import { Client, EntityId, CaseId, ClientStatus } from '../../types';

export const MOCK_CLIENTS: Client[] = [
    { id: '1' as EntityId, name: 'TechCorp Industries', industry: 'Technology', status: ClientStatus.ACTIVE, totalBilled: 1250000, matters: ['C-2024-001' as CaseId] },
    { id: '2' as EntityId, name: 'OmniGlobal', industry: 'Manufacturing', status: ClientStatus.ACTIVE, totalBilled: 850000, matters: ['C-2024-112' as CaseId] },
];
