
import { EvidenceItem } from '../../types.ts';

export const MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: 'EV-001',
    trackingUuid: '123e4567-e89b-12d3-a456-426614174000',
    caseId: 'C-2024-001',
    title: 'Termination Letter',
    type: 'Document',
    description: 'Original letter of termination signed by HR Director.',
    collectionDate: '2023-11-15',
    collectedBy: 'Alexandra H.',
    custodian: 'HR Dept',
    location: 'Digital Secure Storage / DocMan',
    admissibility: 'Admissible',
    tags: ['Key Doc', 'HR'],
    blockchainHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    chunks: [
        { id: 'c1', pageNumber: 1, contentPreview: 'Dear Mr. Martinez, This letter serves as formal notice of...', hash: '0xa1b2...c3d4' },
        { id: 'c2', pageNumber: 2, contentPreview: '...severance package details as outlined in Article 4...', hash: '0xe5f6...g7h8' }
    ],
    chainOfCustody: [
      { id: 'cc1', date: '2023-11-15', action: 'Collected from Client', actor: 'Alexandra H.' },
      { id: 'cc2', date: '2023-11-16', action: 'Uploaded to Evidence Vault', actor: 'System' }
    ]
  },
  {
    id: 'EV-002',
    trackingUuid: '123e4567-e89b-12d3-a456-426614174001',
    caseId: 'C-2023-892',
    title: 'Soil Samples - Site B',
    type: 'Physical',
    description: 'Jar containing soil samples from the northern perimeter.',
    collectionDate: '2023-06-12',
    collectedBy: 'Forensic Team A',
    custodian: 'Evidence Locker #4',
    location: 'Physical Archive Room B',
    admissibility: 'Pending',
    tags: ['Forensic', 'Physical'],
    chainOfCustody: [
      { id: 'cc3', date: '2023-06-12', action: 'Collected at Scene', actor: 'Dr. Aris' },
      { id: 'cc4', date: '2023-06-12', action: 'Transferred to Lab', actor: 'Courier S.' },
      { id: 'cc5', date: '2023-06-15', action: 'Received at Firm Storage', actor: 'Paralegal Jenkins' }
    ]
  },
  {
    id: 'EV-003',
    trackingUuid: '123e4567-e89b-12d3-a456-426614174002',
    caseId: 'C-2024-001',
    title: 'Server Logs 2023-Oct',
    type: 'Digital',
    description: 'Access logs for the HR portal during the incident window.',
    collectionDate: '2024-01-10',
    collectedBy: 'IT Forensics',
    custodian: 'Legal Hold Server',
    location: 'Cold Storage / AWS S3',
    admissibility: 'Challenged',
    tags: ['Metadata', 'Logs'],
    blockchainHash: '0x99a8b7...12c3',
    chunks: [
        { id: 'l1', pageNumber: 1, contentPreview: '[2023-10-01 08:00:01] User login success...', hash: '0x1122...3344' },
        { id: 'l2', pageNumber: 2, contentPreview: '[2023-10-01 09:15:22] ACCESS DENIED...', hash: '0x5566...7788' },
        { id: 'l3', pageNumber: 3, contentPreview: '[2023-10-01 10:00:00] System Backup Start...', hash: '0x9900...aabb' }
    ],
    chainOfCustody: [
      { id: 'cc6', date: '2024-01-10', action: 'Extracted from Server', actor: 'IT Admin' },
      { id: 'cc7', date: '2024-01-11', action: 'Hash Verified', actor: 'Forensic Tool v4' }
    ]
  },
  // Estate of H. Smith (Original Will)
  {
    id: 'EV-S-001',
    trackingUuid: 'uuid-smith-001',
    caseId: 'C-2024-004',
    title: 'Original Will (2018)',
    type: 'Physical',
    description: 'Original Last Will and Testament of H. Smith, dated Aug 4, 2018.',
    collectionDate: '2024-01-22',
    collectedBy: 'Partner Alex',
    custodian: 'Firm Safe',
    location: 'Safe #2',
    admissibility: 'Admissible',
    tags: ['Will', 'Original'],
    chainOfCustody: [
        { id: 'cc-s1', date: '2024-01-22', action: 'Received from Executor', actor: 'Partner Alex' },
        { id: 'cc-s2', date: '2024-01-22', action: 'Placed in Safe', actor: 'Partner Alex' }
    ]
  },
  // Estate of H. Smith (IRS Notice) - Added for Prompt
  {
    id: 'D-S-002',
    trackingUuid: 'uuid-irs-002',
    caseId: 'C-2024-004',
    title: 'IRS Notice of Deficiency',
    type: 'Document', // Mapped to Document to match allowed types
    description: 'NOTICE IS HEREBY GIVEN that the Internal Revenue Service has determined a deficiency in your income tax liability for the tax year 2023. You have 90 days to file a petition with the United States Tax Court.',
    collectionDate: '2024-01-15',
    collectedBy: 'System Import',
    custodian: 'IRS',
    location: 'Digital Secure Storage / DocMan',
    admissibility: 'Admissible',
    tags: ['Notice', 'IRS'],
    blockchainHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    frcpStatus: 'Included in Initial Disclosures Packet v2 sent on 2024-02-01. Bates Range: 00145-00152.',
    chunks: [
        { id: 'irs-1', pageNumber: 1, contentPreview: 'Department of the Treasury... Notice of Deficiency...', hash: '0x88a2...b4d1' },
        { id: 'irs-2', pageNumber: 2, contentPreview: 'Deficiency Amount: $45,200.00. Penalty: $9,040.00...', hash: '0x99c3...e5f2' }
    ],
    chainOfCustody: [
        { id: 'cc-irs-1', date: '2024-01-15', action: 'Received via Certified Mail', actor: 'Mailroom' },
        { id: 'cc-irs-2', date: '2024-01-15', action: 'Scanned & Uploaded', actor: 'Clerk' },
        { id: 'cc-irs-3', date: '2024-01-16', action: 'Hashed & Anchored', actor: 'System' }
    ]
  }
];
