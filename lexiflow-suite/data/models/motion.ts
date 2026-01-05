
import { Motion } from '../../types.ts';

export const MOCK_MOTIONS: Motion[] = [
  { 
    id: 'mot-1', 
    caseId: 'C-2024-001', 
    title: 'Motion to Dismiss Count II (Retaliation)', 
    type: 'Dismiss', 
    status: 'Hearing Set', 
    filingDate: '2024-02-15', 
    hearingDate: '2024-03-20', 
    documents: ['D-001'],
    assignedAttorney: 'Alexandra H.'
  },
  { 
    id: 'mot-2', 
    caseId: 'C-2024-001', 
    title: 'Motion to Compel Further Responses to ROGs Set 1', 
    type: 'Compel Discovery', 
    status: 'Draft', 
    assignedAttorney: 'James Doe'
  },
  { 
    id: 'mot-3', 
    caseId: 'C-2023-892', 
    title: 'Motion for Summary Judgment', 
    type: 'Summary Judgment', 
    status: 'Submitted', 
    filingDate: '2023-12-10', 
    hearingDate: '2024-01-15', 
    outcome: 'Pending Ruling',
    assignedAttorney: 'Alexandra H.'
  },
  { 
    id: 'mot-4', 
    caseId: 'C-2024-112', 
    title: 'Motion In Limine to Exclude Expert Testimony', 
    type: 'In Limine', 
    status: 'Filed', 
    filingDate: '2024-03-01',
    hearingDate: '2024-04-10',
    assignedAttorney: 'James Doe'
  },
  // Estate of H. Smith
  {
    id: 'mot-s1',
    caseId: 'C-2024-004',
    title: 'Motion to Extend Time to File Response',
    type: 'Summary Judgment', // Reusing type for demo
    status: 'Filed',
    filingDate: '2024-02-15',
    hearingDate: '2024-03-05',
    assignedAttorney: 'Partner Alex'
  }
];
