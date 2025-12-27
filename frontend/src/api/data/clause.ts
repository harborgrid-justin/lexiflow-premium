
import { Clause, UUID, UserId } from '@/types';

export const MOCK_CLAUSES: Clause[] = [
    {
      id: '1' as UUID, title: 'Indemnification (Pro-Buyer)', name: 'Indemnification (Pro-Buyer)', category: 'Liability',
      content: 'The Seller shall indemnify, defend and hold harmless the Buyer from and against any and all losses...',
      version: 2, usageCount: 45, lastUpdated: '2024-02-10', riskRating: 'Low',
      versions: [
        { version: 2, content: 'The Seller shall indemnify, defend and hold harmless the Buyer from and against any and all losses...', author: 'Sarah Chen', updatedAt: '2024-02-10', createdAt: '2024-02-10' },
        { version: 1, content: 'Seller indemnifies Buyer against losses.', author: 'John Smith', updatedAt: '2023-01-15', createdAt: '2023-01-15' }
      ]
    },
    {
      id: '2' as UUID, title: 'Non-Compete (Strict)', name: 'Non-Compete (Strict)', category: 'Employment',
      content: 'Employee agrees not to engage in any business competing with the Company for a period of 24 months...',
      version: 1, usageCount: 12, lastUpdated: '2023-11-05', riskRating: 'High',
      versions: [
        { version: 1, content: 'Employee agrees not to engage in any business competing with the Company for a period of 24 months...', author: 'David Martinez', updatedAt: '2023-11-05', createdAt: '2023-11-05' }
      ]
    },
    {
      id: '3' as UUID, title: 'Governing Law (Delaware)', name: 'Governing Law (Delaware)', category: 'General',
      content: 'This Agreement shall be governed by and construed in accordance with the internal laws of the State of Delaware.',
      version: 3, usageCount: 89, lastUpdated: '2024-01-15', riskRating: 'Low',
      versions: [
        { version: 3, content: 'This Agreement shall be governed by and construed in accordance with the internal laws of the State of Delaware.', author: 'Emily Rodriguez', updatedAt: '2024-01-15', createdAt: '2024-01-15' },
        { version: 2, content: 'Governed by Delaware law.', author: 'Michael Johnson', updatedAt: '2023-06-01', createdAt: '2023-06-01' }
      ]
    },
];
