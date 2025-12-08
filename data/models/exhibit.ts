import { TrialExhibit, CaseId } from '../../types';

export const MOCK_EXHIBITS: TrialExhibit[] = [
    {
        id: 'ex-1',
        caseId: 'C-2024-001' as CaseId,
        exhibitNumber: 'PX-101',
        title: 'Termination Letter',
        dateMarked: '2024-04-01',
        party: 'Plaintiff',
        status: 'Admitted',
        fileType: 'PDF',
        description: 'Original termination letter provided to plaintiff.',
        witness: 'Jane Smith (HR)',
        tags: ['Key Document', 'HR']
    },
    {
        id: 'ex-2',
        caseId: 'C-2024-001' as CaseId,
        exhibitNumber: 'DX-201',
        title: 'Performance Improvement Plan',
        dateMarked: '2024-04-02',
        party: 'Defense',
        status: 'Marked',
        fileType: 'DOCX',
        description: 'PIP issued to plaintiff three months prior to termination.',
        tags: ['Performance']
    },
    {
        id: 'ex-3',
        caseId: 'C-2024-001' as CaseId,
        exhibitNumber: 'PX-102',
        title: 'Email: Complaint to HR',
        dateMarked: '2024-04-03',
        party: 'Plaintiff',
        status: 'Admitted',
        fileType: 'Email',
        description: 'Email from plaintiff to HR detailing alleged harassment.',
        witness: 'John Doe',
        tags: ['Key Document', 'Communication']
    },
    {
        id: 'ex-4',
        caseId: 'C-2024-001' as CaseId,
        exhibitNumber: 'JX-01',
        title: 'Employee Handbook',
        dateMarked: '2024-04-01',
        party: 'Joint',
        status: 'Admitted',
        fileType: 'PDF',
        description: 'Company employee handbook, version 3.2, effective Jan 2023.',
        tags: []
    }
];
