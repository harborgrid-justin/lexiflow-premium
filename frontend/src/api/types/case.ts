
import { Case, CaseStatus, CaseId, UserId, EntityId, OrgId, PartyId, MatterType } from '@/types';

export const MOCK_CASES: Case[] = [
  // MAIN APPEAL CASE
  {
    id: '25-1229' as CaseId,
    title: 'Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.',
    client: 'Justin Saadein-Morales (Pro Se)',
    clientId: 'usr-admin-justin' as UserId, 
    opposingCounsel: 'Thomas Charles Junker (MercerTrigiani)',
    status: CaseStatus.Appeal,
    filingDate: '2025-03-12',
    description: 'Bankruptcy Appeal from District Court. Nature of Suit: 3422 Bankruptcy Appeals Rule 28 USC 158.',
    natureOfSuit: '3422 Bankruptcy Appeals Rule 28 USC 158',
    value: 0,
    matterType: MatterType.LITIGATION,
    matterSubType: 'from the district court',
    jurisdiction: 'Federal - 4th Circuit',
    court: 'US Court of Appeals for the Fourth Circuit',
    origCaseNumber: '1:24-cv-01442-LMB-IDD',
    origCourt: 'United States District Court for the Eastern District of Virginia at Alexandria',
    judge: 'Leonie M. Brinkema (Dist. Judge)',
    magistrateJudge: 'Ivan Darnell Davis (Mag. Judge)',
    origJudgmentDate: '2025-02-26',
    noticeOfAppealDate: '2025-03-07',
    ownerId: 'usr-admin-justin' as UserId,
    linkedCaseIds: ['1:24-cv-01442-LMB-IDD' as CaseId],
    leadCaseId: '25-1229' as CaseId,
    isConsolidated: false,
    isArchived: false,
    parties: [
        {
          id: 'p-appellant' as PartyId,
          caseId: '25-1229' as CaseId,
          name: 'Justin Jeffrey Saadein-Morales',
          role: 'Debtor - Appellant',
          type: 'Individual',
          contact: 'justin.saadein@harborgrid.com',
          address: 'P. O. Box 55268, Washington, DC 20040',
          phone: '678-650-6400',
          email: 'justin.saadein@harborgrid.com',
          representationType: 'Pro Se',
          partyGroup: 'Debtor'
        },
        {
          id: 'p-appellee' as PartyId,
          caseId: '25-1229' as CaseId,
          name: 'Westridge Swim & Racquet Club, Inc.',
          role: 'Creditor - Appellee',
          type: 'Corporation',
          contact: 'info@westridge.org',
          counsel: 'Thomas Charles Junker',
          partyGroup: 'Creditor',
          attorneys: [
            {
              name: 'Thomas Charles Junker',
              firm: 'MERCERTRIGIANI',
              email: 'thomas.junker@mercertrigiani.com',
              phone: '703-837-5000',
              address: '112 South Alfred Street, Alexandria, VA 22314',
              type: 'COR NTC Retained'
            }
          ]
        }
    ],
    citations: [],
    arguments: [],
    defenses: []
  },

  // ORIGINATING DISTRICT COURT CASE
  {
    id: '1:24-cv-01442-LMB-IDD' as CaseId,
    title: 'Saadein-Morales v. Westridge Swim & Racquet Club, Inc.',
    client: 'Justin Saadein-Morales',
    clientId: 'usr-admin-justin' as UserId,
    opposingCounsel: 'MercerTrigiani',
    status: CaseStatus.Closed,
    filingDate: '2024-08-16',
    dateTerminated: '2025-02-26',
    description: 'Bankruptcy Appeal from Judgment/Order. Cause: 28:0158. Underlying District Court Civil Action.',
    value: 0,
    matterType: MatterType.LITIGATION,
    natureOfSuit: '422 Bankruptcy Appeal (801)',
    jurisdiction: 'Federal Question',
    court: 'E.D. Virginia (Alexandria)',
    judge: 'Leonie M. Brinkema',
    magistrateJudge: 'Ivan D. Davis',
    ownerId: 'usr-admin-justin' as UserId,
    linkedCaseIds: ['25-1229' as CaseId],
    isArchived: false,
    parties: [],
    citations: [],
    arguments: [],
    defenses: []
  },

  // Active Litigation
  {
    id: 'C-2025-001' as CaseId, 
    title: 'Martinez v. TechCorp Industries', 
    client: 'TechCorp Industries',
    clientId: '1' as EntityId, 
    opposingCounsel: 'Morgan & Morgan',
    status: CaseStatus.Discovery, 
    filingDate: '2025-01-15', 
    description: 'Employment discrimination class action alleging systemic bias in promotion practices.',
    value: 4500000,
    matterType: MatterType.LITIGATION, 
    jurisdiction: 'CA Superior Court', 
    court: 'San Francisco',
    isConsolidated: false,
    isArchived: false,
    ownerId: 'usr-admin-justin' as UserId,
    ownerOrgId: 'org-1' as OrgId,
    parties: [
        { id: 'p1' as PartyId, caseId: 'C-2025-001' as CaseId, name: 'John Doe', role: 'Plaintiff', partyGroup: 'Class Representatives', contact: 'john@email.com', type: 'Individual' }
    ],
    citations: [],
    arguments: [],
    defenses: []
  },
  
  // Pending M&A
  {
    id: 'MA-2025-042' as CaseId,
    title: 'Project Blue Sky Acquisition',
    client: 'OmniGlobal',
    clientId: '2' as EntityId,
    opposingCounsel: 'N/A',
    status: CaseStatus.PreFiling,
    filingDate: '2025-04-01',
    description: 'Strategic acquisition of mid-market logistics competitor.',
    value: 12500000,
    matterType: MatterType.TRANSACTIONAL,
    jurisdiction: 'Delaware',
    court: 'Chancery',
    isArchived: false,
    ownerId: 'usr-partner-alex' as UserId,
    parties: [],
    citations: [],
    arguments: [],
    defenses: []
  }
];
