


import { DiscoveryRequest, UUID, CaseId } from '../../types';

export const MOCK_DISCOVERY: DiscoveryRequest[] = [
  {
    // FIX: Cast string to branded type UUID and CaseId
    id: 'DR-001' as UUID,
    caseId: 'C-2024-001' as CaseId,
    type: 'Production',
    propoundingParty: 'TechCorp Industries',
    respondingParty: 'Martinez (Plaintiff)',
    serviceDate: '2024-03-01',
    dueDate: '2024-03-31',
    status: 'Served',
    title: 'RFP Set One - Employment Records',
    description: 'Request for production of all performance reviews, email communications regarding termination, and payroll records.',
  },
  {
    // FIX: Cast string to branded type UUID and CaseId
    id: 'DR-002' as UUID,
    caseId: 'C-2024-001' as CaseId,
    type: 'Interrogatory',
    propoundingParty: 'Martinez (Plaintiff)',
    respondingParty: 'TechCorp Industries',
    serviceDate: '2024-03-05',
    dueDate: '2024-04-04',
    status: 'Overdue',
    title: 'Special Interrogatories - Set 1',
    description: 'Identify all individuals involved in the decision to terminate Plaintiff.',
  },
  {
    // FIX: Cast string to branded type UUID and CaseId
    id: 'DR-003' as UUID,
    caseId: 'C-2024-112' as CaseId,
    type: 'Admission',
    propoundingParty: 'FTC',
    respondingParty: 'OmniGlobal Inc.',
    serviceDate: '2024-02-15',
    dueDate: '2024-03-16',
    status: 'Responded',
    title: 'RFA - Market Share Data',
    description: 'Admit that OmniGlobal controls >40% of the widget market in the Northeast region.',
  },
  {
    // FIX: Cast string to branded type UUID and CaseId
    id: 'DR-004' as UUID,
    caseId: 'C-2024-001' as CaseId,
    type: 'Deposition',
    propoundingParty: 'Martinez (Plaintiff)',
    respondingParty: 'CEO of TechCorp',
    serviceDate: '2024-03-10',
    dueDate: '2024-04-10',
    status: 'Draft',
    title: 'Notice of Deposition - CEO',
    description: 'Deposition of TechCorp CEO regarding corporate culture and hiring practices.',
  }
];