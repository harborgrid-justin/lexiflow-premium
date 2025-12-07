import { EvidenceItem } from '../types';

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
  }
];