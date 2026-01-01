/**
 * Client API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.crm.getClients() with queryKeys.crm.clients() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/clients/entities/client.entity.ts
 */

import { Client, ClientStatus, PaymentTerms } from '@/types/financial';
import { EntityId, CaseId } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.crm instead
 */
export const MOCK_CLIENTS: Client[] = [
    {
        id: '1' as EntityId,
        clientNumber: 'CLT-2024-001',
        name: 'TechCorp Industries',
        industry: 'Technology',
        status: ClientStatus.ACTIVE,
        paymentTerms: PaymentTerms.NET_30,
        creditLimit: 100000,
        currentBalance: 15450,
        totalBilled: 1250000,
        totalPaid: 1234550,
        totalCases: 12,
        activeCases: 3,
        isVip: true,
        requiresConflictCheck: true,
        hasRetainer: false,
        matters: ['C-2024-001' as CaseId]
    },
    {
        id: '2' as EntityId,
        clientNumber: 'CLT-2024-002',
        name: 'OmniGlobal',
        industry: 'Manufacturing',
        status: ClientStatus.ACTIVE,
        paymentTerms: PaymentTerms.NET_15,
        creditLimit: 250000,
        currentBalance: 0,
        totalBilled: 850000,
        totalPaid: 850000,
        totalCases: 8,
        activeCases: 2,
        isVip: true,
        requiresConflictCheck: true,
        hasRetainer: true,
        retainerAmount: 50000,
        retainerBalance: 25000,
        matters: ['C-2024-112' as CaseId]
    },
];
