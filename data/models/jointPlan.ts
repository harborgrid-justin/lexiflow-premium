
import { JointPlan } from '../../types';

export const MOCK_JOINT_PLANS: JointPlan[] = [
  {
    id: 'plan-1',
    caseId: 'C-2024-001',
    title: 'Joint Rule 26(f) Discovery Plan',
    lastUpdated: '2023-11-01',
    status: 'In Review',
    sections: [
      { id: 's1', title: '1. Changes to Discovery Rules', content: 'The parties propose no changes to the Federal Rules regarding limitations on depositions.', status: 'Agreed' },
      { id: 's2', title: '2. Subjects of Discovery', content: 'Discovery will be needed on the following subjects: Employment history, internal communications, financial damages.', status: 'Agreed' },
      { id: 's3', title: '3. ESI Protocol', content: 'Parties agree to produce in TIFF format with load files. Metadata fields to include: Date, Author, Recipient, CC, Subject.', status: 'Disputed', opposingComments: 'Defendant requests Native format for all spreadsheets.' },
      { id: 's4', title: '4. Deadlines', content: 'Initial Disclosures: Nov 14. Fact Discovery Cutoff: June 1. Expert Discovery: Aug 1.', status: 'Agreed' }
    ]
  }
];
