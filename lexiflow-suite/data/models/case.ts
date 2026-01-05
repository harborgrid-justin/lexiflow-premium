
import { Case, CaseStatus } from '../../types.ts';

export const MOCK_CASES: Case[] = [
  {
    id: 'C-2024-001', 
    title: 'Martinez v. TechCorp Industries', 
    client: 'TechCorp Industries', 
    opposingCounsel: 'Morgan & Morgan',
    status: CaseStatus.Discovery, 
    filingDate: '2023-11-15', 
    description: 'Employment discrimination class action alleging systemic bias in promotion practices.', 
    value: 4500000,
    matterType: 'Litigation', 
    jurisdiction: 'CA Superior Court', 
    court: 'San Francisco',
    isConsolidated: true,
    linkedCaseIds: ['C-2024-055', 'C-2024-089'],
    parties: [
        { id: 'p1', name: 'John Doe', role: 'Plaintiff', partyGroup: 'Class Representatives', contact: 'john@email.com', type: 'Individual' },
        { id: 'p2', name: 'Jane Smith', role: 'Plaintiff', partyGroup: 'Class Representatives', contact: 'jane@email.com', type: 'Individual' },
        { id: 'p3', name: 'TechCorp HQ', role: 'Defendant', partyGroup: 'Corporate Entities', contact: 'legal@techcorp.com', type: 'Corporation' },
        { id: 'p4', name: 'TechCorp Labs', role: 'Defendant', partyGroup: 'Corporate Entities', contact: 'legal@techcorp.com', type: 'Corporation' }
    ],
    citations: [
        { id: 'cit1', citation: '411 U.S. 792', title: 'McDonnell Douglas Corp. v. Green', type: 'Case Law', relevance: 'High', description: 'Burden shifting framework for discrimination.', shepardsSignal: 'Positive' },
        { id: 'cit2', citation: 'Cal. Gov. Code § 12940', title: 'FEHA', type: 'Statute', relevance: 'High', description: 'Statutory basis for state law claims.' }
    ],
    arguments: [
        { id: 'arg1', title: 'Lack of Statistical Significance', description: 'Plaintiff sample size (n=12) is too small to infer systemic bias per Ninth Circuit precedent.', strength: 85, relatedCitationIds: ['cit1'], status: 'Active' },
        { id: 'arg2', title: 'Legitimate Business Reason', description: 'Promotions were frozen due to Q3 fiscal restructuring, not discriminatory intent.', strength: 70, relatedCitationIds: [], status: 'Draft' }
    ],
    defenses: [
        { id: 'def1', title: 'Failure to Exhaust Administrative Remedies', type: 'Procedural', description: 'Plaintiff did not file DFEH complaint within 1 year.', status: 'Asserted' },
        { id: 'def2', title: 'Laches', type: 'Affirmative', description: 'Unreasonable delay in filing caused prejudice to evidence preservation.', status: 'Withdrawn' }
    ]
  },
  {
    id: 'C-2024-112', title: 'In Re: OmniGlobal Merger', client: 'OmniGlobal Inc.', opposingCounsel: 'FTC',
    status: CaseStatus.Discovery, filingDate: '2024-02-01', description: 'Antitrust review of proposed acquisition.', value: 85000000,
    matterType: 'M&A', jurisdiction: 'Federal', court: 'FTC Review', parties: [],
    linkedCaseIds: [],
    citations: [],
    arguments: [],
    defenses: []
  },
  {
    id: 'C-2023-892', title: 'State v. GreenEnergy', client: 'GreenEnergy Corp', opposingCounsel: 'State AG',
    status: CaseStatus.Trial, filingDate: '2023-06-10', description: 'Environmental compliance dispute.', value: 1200000,
    matterType: 'Litigation', jurisdiction: 'State', court: 'Nevada District', parties: [],
    linkedCaseIds: [],
    citations: [],
    arguments: [],
    defenses: []
  },
  {
     id: 'C-2024-004', title: 'Estate of H. Smith', client: 'Smith Family', opposingCounsel: 'IRS',
     status: CaseStatus.Discovery, filingDate: '2024-01-20', description: 'Tax dispute regarding estate valuation and asset classification.', value: 500000,
     matterType: 'General', jurisdiction: 'Federal', court: 'Tax Court', 
     parties: [
        { id: 'p-s1', name: 'Smith Family Trust', role: 'Petitioner', partyGroup: 'Estate', type: 'Individual' },
        { id: 'p-s2', name: 'Internal Revenue Service', role: 'Respondent', partyGroup: 'Government', type: 'Government' },
        { id: 'p-s3', name: 'H. Smith (Deceased)', role: 'Decedent', partyGroup: 'Estate', type: 'Individual' }
     ],
     linkedCaseIds: [],
     citations: [
         { id: 'cit-s1', citation: '26 U.S.C. § 2031', title: 'Definition of Gross Estate', type: 'Statute', relevance: 'High', description: 'Valuation of unlisted stock and securities.' }
     ],
     arguments: [],
     defenses: []
  },
  // Mock Linked Cases
  {
    id: 'C-2024-055', title: 'Chen v. TechCorp', client: 'TechCorp Industries', opposingCounsel: 'Morgan & Morgan',
    status: CaseStatus.Discovery, filingDate: '2023-12-01', description: 'Related action consolidated for discovery.', value: 0,
    matterType: 'Litigation', jurisdiction: 'CA Superior', court: 'San Francisco', leadCaseId: 'C-2024-001'
  },
  {
    id: 'C-2024-089', title: 'Davis v. TechCorp', client: 'TechCorp Industries', opposingCounsel: 'Morgan & Morgan',
    status: CaseStatus.Discovery, filingDate: '2024-01-10', description: 'Related action consolidated for discovery.', value: 0,
    matterType: 'Litigation', jurisdiction: 'CA Superior', court: 'San Francisco', leadCaseId: 'C-2024-001'
  }
];
