
import { DocketEntry } from '../../types.ts';

export const MOCK_DOCKET_ENTRIES: DocketEntry[] = [
  // In Re: OmniGlobal Merger
  {
    id: 'dk-201',
    sequenceNumber: 12,
    caseId: 'C-2024-112',
    date: '2024-03-12',
    type: 'Filing',
    title: 'Administrative Record Filed',
    description: 'Volume 1 of 4. Agency record under review.',
    filedBy: 'Defendant',
    isSealed: true,
    tags: ['Confidential']
  },
  
  // State v. GreenEnergy
  {
    id: 'dk-101',
    sequenceNumber: 89,
    caseId: 'C-2023-892',
    date: '2024-03-10',
    type: 'Order',
    title: 'ORDER Setting Pretrial Conference',
    description: 'Pretrial Conference set for 4/15/2024 at 09:00 AM.',
    filedBy: 'Court',
    documentId: 'D-ORD-892',
    isSealed: false
  },

  // Martinez v. TechCorp Industries
  {
    id: 'dk-007',
    sequenceNumber: 7,
    caseId: 'C-2024-001',
    date: '2024-02-15',
    type: 'Minute Entry',
    title: 'MINUTE ENTRY for Case Management Conference',
    description: 'Held before Judge Miller. Discovery plan adopted. Bench trial set for Nov 2024.',
    filedBy: 'Court',
    isSealed: false
  },
  {
    id: 'dk-006',
    sequenceNumber: 6,
    caseId: 'C-2024-001',
    date: '2024-02-01',
    type: 'Filing',
    title: 'ANSWER to Complaint by TechCorp Industries',
    filedBy: 'Defendant',
    documentId: 'D-ANS-001',
    pageCount: 15,
    isSealed: false
  },
  {
    id: 'dk-005',
    sequenceNumber: 5,
    caseId: 'C-2024-001',
    date: '2024-01-15',
    type: 'Order',
    title: 'ORDER Granting in Part and Denying in Part Motion to Dismiss',
    description: 'Signed by Judge Sarah Miller. Count II Dismissed without prejudice. Answer due in 14 days.',
    filedBy: 'Court',
    documentId: 'D-ORD-001',
    pageCount: 8,
    isSealed: false,
    linkedEntryId: 'dk-003',
    triggersDeadlines: [
      { id: 'dl-4', title: 'Answer Due', date: '2024-01-29', ruleReference: 'FRCP 12(a)(4)', status: 'Pending' }
    ]
  },
  {
    id: 'dk-004',
    sequenceNumber: 4,
    caseId: 'C-2024-001',
    date: '2023-12-19',
    type: 'Filing',
    title: 'OPPOSITION to Motion to Dismiss filed by Plaintiffs',
    filedBy: 'Plaintiff',
    documentId: 'D-OPP-001',
    pageCount: 18,
    isSealed: false,
    linkedEntryId: 'dk-003'
  },
  {
    id: 'dk-003',
    sequenceNumber: 3,
    caseId: 'C-2024-001',
    date: '2023-12-05',
    type: 'Filing',
    title: 'MOTION to Dismiss by TechCorp Industries',
    description: 'Motion to Dismiss Count II (Retaliation) for Failure to State a Claim.',
    filedBy: 'Defendant',
    documentId: 'D-MOT-001',
    pageCount: 22,
    isSealed: false,
    triggersDeadlines: [
      { id: 'dl-2', title: 'Opposition to MTD Due', date: '2023-12-19', ruleReference: 'Local Rule 7-3', status: 'Satisfied' },
      { id: 'dl-3', title: 'Reply to Opposition Due', date: '2023-12-26', ruleReference: 'Local Rule 7-3', status: 'Satisfied' }
    ]
  },
  {
    id: 'dk-002',
    sequenceNumber: 2,
    caseId: 'C-2024-001',
    date: '2023-11-16',
    type: 'Notice',
    title: 'NOTICE of Case Assignment',
    description: 'Case assigned to Judge Sarah Miller. Magistrate Judge Robert Chen assigned for discovery.',
    filedBy: 'Court',
    isSealed: false,
  },
  {
    id: 'dk-001',
    sequenceNumber: 1,
    caseId: 'C-2024-001',
    date: '2023-11-15',
    type: 'Filing',
    title: 'COMPLAINT filed by John Doe, Jane Smith against TechCorp Industries',
    description: 'Class Action Complaint for Employment Discrimination. Filing Fee $402.00 paid.',
    filedBy: 'Plaintiff',
    documentId: 'D-001',
    pageCount: 45,
    isSealed: false,
    triggersDeadlines: [
      { id: 'dl-1', title: 'Answer Due', date: '2023-12-06', ruleReference: 'FRCP 12(a)', status: 'Satisfied' }
    ]
  }
];
