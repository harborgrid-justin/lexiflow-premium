
import { LegalDocument } from '../../types.ts';

export const MOCK_DOCUMENTS: LegalDocument[] = [
    {
      id: 'D-001', caseId: 'C-2024-001', title: 'Plaintiff Initial Complaint', type: 'Pleading', content: 'IN THE SUPERIOR COURT...',
      uploadDate: '2023-11-20', lastModified: '2023-11-25', tags: ['Complaint', 'Critical'],
      versions: [{ id: 'v1', versionNumber: 1, uploadDate: '2023-11-20', uploadedBy: 'Associate J. Doe', contentSnapshot: 'Old content v1...' }]
    },
    {
      id: 'D-002', caseId: 'C-2024-001', title: 'Settlement Offer - Draft v1', type: 'Correspondence', content: 'Offer...',
      uploadDate: '2024-01-15', lastModified: '2024-01-15', tags: ['Settlement'], versions: []
    },
    {
        id: 'D-003', caseId: 'C-2024-112', title: 'Merger Agreement vFinal', type: 'Contract', content: 'AGREEMENT...',
        uploadDate: '2024-02-10', lastModified: '2024-02-12', tags: ['Agreement', 'Executed'], versions: []
    },
    {
        id: 'D-004', caseId: 'C-2023-892', title: 'Environmental Impact Study', type: 'Evidence', content: 'Study Results...',
        uploadDate: '2023-07-01', lastModified: '2023-07-01', tags: ['Evidence', 'External'], versions: []
    },
    // Estate of H. Smith Documents
    {
        id: 'D-S-001', caseId: 'C-2024-004', title: 'Plaintiff Initial Complaint', type: 'Pleading', content: 'PETITION FOR REDETERMINATION OF DEFICIENCY...',
        uploadDate: '2023-11-20', lastModified: '2023-11-20', tags: ['Pleading', 'Tax Court'], 
        sourceModule: 'General', status: 'Final', isEncrypted: true, fileSize: '1.4 MB', folderId: 'pleadings',
        versions: []
    },
    {
        id: 'D-S-002', caseId: 'C-2024-004', title: 'IRS Notice of Deficiency', type: 'Evidence', content: 'NOTICE IS HEREBY GIVEN...',
        uploadDate: '2024-01-15', lastModified: '2024-01-15', tags: ['Notice', 'IRS'], 
        sourceModule: 'Evidence', status: 'Final', fileSize: '0.8 MB', folderId: 'evidence',
        versions: []
    }
];
