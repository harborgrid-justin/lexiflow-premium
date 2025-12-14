
import { Clause, UUID, UserId } from '../../types';

export const MOCK_CLAUSES: Clause[] = [
    {
      id: '1' as UUID, name: 'Indemnification (Pro-Buyer)', category: 'Liability',
      content: 'The Seller shall indemnify, defend and hold harmless the Buyer from and against any and all losses...',
      version: 2, usageCount: 45, lastUpdated: '2024-02-10', riskRating: 'Low',
      versions: [
        { id: 'v2' as UUID, version: 2, content: 'The Seller shall indemnify, defend and hold harmless the Buyer from and against any and all losses...', authorId: 'usr-partner-alex' as UserId, author: 'Partner A.', updatedAt: '2024-02-10' },
        { id: 'v1' as UUID, version: 1, content: 'Seller indemnifies Buyer against losses.', authorId: 'usr-assoc-james' as UserId, author: 'Associate B.', updatedAt: '2023-01-15' }
      ]
    },
    {
      id: '2' as UUID, name: 'Non-Compete (Strict)', category: 'Employment',
      content: 'Employee agrees not to engage in any business competing with the Company for a period of 24 months...',
      version: 1, usageCount: 12, lastUpdated: '2023-11-05', riskRating: 'High',
      versions: [
        { id: 'v1' as UUID, version: 1, content: 'Employee agrees not to engage in any business competing with the Company for a period of 24 months...', authorId: 'usr-partner-alex' as UserId, author: 'Partner A.', updatedAt: '2023-11-05' }
      ]
    },
    {
      id: '3' as UUID, name: 'Governing Law (Delaware)', category: 'General',
      content: 'This Agreement shall be governed by and construed in accordance with the internal laws of the State of Delaware.',
      version: 3, usageCount: 89, lastUpdated: '2024-01-15', riskRating: 'Low',
      versions: [
        { id: 'v3' as UUID, version: 3, content: 'This Agreement shall be governed by and construed in accordance with the internal laws of the State of Delaware.', authorId: 'usr-admin-justin' as UserId, author: 'Admin', updatedAt: '2024-01-15' },
        { id: 'v2' as UUID, version: 2, content: 'Governed by Delaware law.', authorId: 'usr-admin-justin' as UserId, author: 'Admin', updatedAt: '2023-06-01' }
      ]
    },
];