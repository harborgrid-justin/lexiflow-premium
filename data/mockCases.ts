
import { Case, CaseId, UserId, EntityId, CaseStatus, PartyId, OrgId } from '../types';

export const MOCK_CASES: Case[] = [
  // MAIN APPEAL CASE
  {
    // FIX: Cast string to branded type CaseId
    id: '25-1229' as CaseId,
    title: 'Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.',
    client: 'Justin Saadein-Morales (Pro Se)',
    // FIX: Cast string to branded type UserId | EntityId
    clientId: 'usr-admin-justin' as UserId,
    opposingCounsel: 'Thomas Charles Junker (MercerTrigiani)',
    status: CaseStatus.Closed,
    filingDate: '2025-03-12',
    dateTerminated: '2025-09-29',
    description: 'Bankruptcy Appeal from District Court. Nature of Suit: 3422 Bankruptcy Appeals Rule 28 USC 158.',
    natureOfSuit: '3422 Bankruptcy Appeals Rule 28 USC 158',
    value: 0,
    matterType: 'Appeal',
    matterSubType: 'from the district court',
    jurisdiction: 'Federal - 4th Circuit',
    court: 'US Court of Appeals for the Fourth Circuit',
    origCaseNumber: '1:24-cv-01442-LMB-IDD',
    origCourt: 'United States District Court for the Eastern District of Virginia at Alexandria',
    judge: 'Leonie M. Brinkema (Dist. Judge)',
    magistrateJudge: 'Ivan Darnell Davis (Mag. Judge)',
    origJudgmentDate: '2025-02-26',
    noticeOfAppealDate: '2025-03-07',
    // FIX: Cast string to branded type UserId
    ownerId: 'usr-admin-justin' as UserId,
    // FIX: Cast string to branded type CaseId
    linkedCaseIds: ['1:24-cv-01442-LMB-IDD' as CaseId, '24-2160' as CaseId],
    // FIX: Cast string to branded type CaseId
    leadCaseId: '24-2160' as CaseId,
    isConsolidated: true,
    associatedCases: [
        { leadCaseNumber: '24-2160', memberCaseNumber: '25-1229', type: 'Consolidated', startDate: '2025-04-25' }
    ],
    parties: [
        {
          // FIX: Cast string to branded type PartyId
          id: 'p-appellant' as PartyId,
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
          // FIX: Cast string to branded type PartyId
          id: 'p-appellee' as PartyId,
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
            },
            {
              name: 'Richard A. Lash',
              firm: 'BUONASSISSI, HENNING & LASH, PC',
              email: 'rlash@bhlpc.com',
              phone: '703-796-1341',
              address: '12355 Sunrise Valley Drive, Suite 650, Reston, VA 20190',
              type: 'NTC Retained'
            },
            {
              name: 'David Storey Mercer',
              firm: 'MERCERTRIGIANI',
              phone: '202-659-6935',
              address: '112 South Alfred Street, Alexandria, VA 22314',
              type: 'On Filing'
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
    // FIX: Cast string to branded type CaseId
    id: '1:24-cv-01442-LMB-IDD' as CaseId,
    title: 'Saadein-Morales v. Westridge Swim & Racquet Club, Inc.',
    client: 'Justin Saadein-Morales',
    // FIX: Cast string to branded type UserId | EntityId
    clientId: 'usr-admin-justin' as UserId,
    opposingCounsel: 'MercerTrigiani',
    status: CaseStatus.Closed,
    filingDate: '2024-08-16',
    dateTerminated: '2025-02-26',
    description: 'Bankruptcy Appeal from Judgment/Order. Cause: 28:0158. Underlying District Court Civil Action.',
    value: 0,
    matterType: 'Litigation',
    natureOfSuit: '422 Bankruptcy Appeal (801)',
    jurisdiction: 'Federal Question',
    court: 'E.D. Virginia (Alexandria)',
    judge: 'Leonie M. Brinkema',
    magistrateJudge: 'Ivan D. Davis',
    // FIX: Cast string to branded type UserId
    ownerId: 'usr-admin-justin' as UserId,
    // FIX: Cast string to branded type CaseId
    linkedCaseIds: ['25-1229' as CaseId, '24-02160' as CaseId],
    parties: [
        {
            // FIX: Cast string to branded type PartyId
            id: 'p-appellant-dc' as PartyId,
            name: 'Justin Jeffrey Saadein-Morales',
            role: 'Appellant',
            type: 'Individual',
            representationType: 'Pro Se',
            address: '12720 Knightsbridge Drive, Woodbridge, VA 22192',
            email: 'justin.saadein@harborgrid.com',
            contact: 'justin.saadein@harborgrid.com'
        },
        {
            // FIX: Cast string to branded type PartyId
            id: 'p-appellee-dc' as PartyId,
            name: 'Westridge Swim & Racquet Club, Inc.',
            role: 'Appellee',
            type: 'Corporation',
            counsel: 'Richard A. Lash',
            contact: 'info@westridge.org',
            attorneys: [
                { name: 'Richard A. Lash', firm: 'Buonassissi, Henning & Lash, PC', phone: '703-796-1341', email: 'rlash@bhlpc.com' },
                { name: 'Thomas C. Junker', firm: 'MercerTrigiani', phone: '703-837-5000', email: 'thomas.junker@mercertrigiani.com' }
            ]
        }
    ],
    citations: [],
    arguments: [],
    defenses: []
  },

  // Other Mock Cases
  {
    // FIX: Cast string to branded type CaseId
    id: 'C-2024-001' as CaseId,
    title: 'Martinez v. TechCorp Industries',
    client: 'TechCorp Industries',
    // FIX: Cast string to branded type UserId | EntityId
    clientId: '1' as EntityId,
    opposingCounsel: 'Morgan & Morgan',
    status: CaseStatus.Discovery,
    filingDate: '2023-11-15',
    description: 'Employment discrimination class action alleging systemic bias in promotion practices.',
    value: 4500000,
    matterType: 'Litigation',
    jurisdiction: 'CA Superior Court',
    court: 'San Francisco',
    isConsolidated: true,
    // FIX: Cast string to branded type CaseId
    linkedCaseIds: ['C-2024-055' as CaseId, 'C-2024-089' as CaseId],
    // FIX: Cast string to branded type UserId
    ownerId: 'usr-admin-justin' as UserId,
    // FIX: Cast string to branded type OrgId
    ownerOrgId: 'org-1' as OrgId,
    parties: [
        { id: 'p1' as PartyId, name: 'John Doe', role: 'Plaintiff', partyGroup: 'Class Representatives', contact: 'john@email.com', type: 'Individual' },
        { id: 'p2' as PartyId, name: 'Jane Smith', role: 'Plaintiff', partyGroup: 'Class Representatives', contact: 'jane@email.com', type: 'Individual' },
        { id: 'p3' as PartyId, name: 'TechCorp HQ', role: 'Defendant', partyGroup: 'Corporate Entities', contact: 'legal@techcorp.com', type: 'Corporation' },
        { id: 'p4' as PartyId, name: 'TechCorp Labs', role: 'Defendant', partyGroup: 'Corporate Entities', contact: 'legal@techcorp.com', type: 'Corporation' }
    ],
    citations: [],
    arguments: [],
    defenses: []
  }
];