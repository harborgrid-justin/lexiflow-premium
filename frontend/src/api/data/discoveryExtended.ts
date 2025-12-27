
import { Deposition, ESISource, ProductionSet, CustodianInterview, UUID, CaseId } from '@/types';

export const MOCK_DEPOSITIONS: Deposition[] = [
    {
        id: 'DEP-001' as UUID,
        caseId: 'C-2024-001' as CaseId,
        witnessName: 'John Doe',
        date: '2024-04-15',
        location: 'LexiFlow NY Office - Conf Room A',
        status: 'Scheduled',
        courtReporter: 'Precision Reporting Inc.',
        prepNotes: 'Focus on timeline of events in Q3 2023.'
    },
    {
        id: 'DEP-002' as UUID,
        caseId: 'C-2024-001' as CaseId,
        witnessName: 'Jane Smith (HR Director)',
        date: '2024-04-18',
        location: 'Zoom (Remote)',
        status: 'Scheduled',
        courtReporter: 'Veritext',
        prepNotes: 'Review employee handbook updates.'
    }
];

export const MOCK_ESI_SOURCES: ESISource[] = [
    {
        id: 'ESI-001' as UUID,
        caseId: 'C-2024-001' as CaseId,
        name: 'Corporate Exchange Server',
        type: 'Email',
        custodian: 'IT Dept',
        status: 'Preserved',
        size: '1.5 TB',
        notes: 'Legal Hold applied 11/01/2023.'
    },
    {
        id: 'ESI-002' as UUID,
        caseId: 'C-2024-001' as CaseId,
        name: 'John Doe Laptop',
        type: 'Device',
        custodian: 'John Doe',
        status: 'Collected',
        size: '500 GB',
        notes: 'Forensic image created.'
    },
    {
        id: 'ESI-003' as UUID,
        caseId: 'C-2024-001' as CaseId,
        name: 'Slack Workspace',
        type: 'Slack',
        custodian: 'IT Dept',
        status: 'Identified',
        size: 'Unknown',
        notes: 'Pending API access token.'
    }
];

export const MOCK_PRODUCTIONS: ProductionSet[] = [
    {
        id: 'PROD-001' as UUID,
        caseId: 'C-2024-001' as CaseId,
        name: 'Vol 001 - Initial Disclosures',
        date: '2023-12-01',
        batesRange: 'DEF-000001 - DEF-000450',
        docCount: 450,
        size: '1.2 GB',
        format: 'PDF',
        status: 'Delivered'
    },
    {
        id: 'PROD-002' as UUID,
        caseId: 'C-2024-001' as CaseId,
        name: 'Vol 002 - Email Batch 1',
        date: '2024-03-20',
        batesRange: 'DEF-000451 - DEF-001200',
        docCount: 750,
        size: '2.8 GB',
        format: 'TIFF+Load',
        status: 'Staging'
    }
];

export const MOCK_INTERVIEWS: CustodianInterview[] = [
    {
        id: 'INT-001' as UUID,
        caseId: 'C-2024-001' as CaseId,
        custodianName: 'John Doe',
        department: 'Engineering',
        status: 'Completed',
        interviewDate: '2023-11-05',
        notes: 'Confirmed use of personal device for work email. Added to collection list.',
        relevantSources: ['ESI-002'],
        legalHoldId: 'LH-01' as UUID
    },
    {
        id: 'INT-002' as UUID,
        caseId: 'C-2024-001' as CaseId,
        custodianName: 'Jane Smith',
        department: 'HR',
        status: 'Scheduled',
        interviewDate: '2024-03-25',
        legalHoldId: 'LH-02' as UUID
    }
];
