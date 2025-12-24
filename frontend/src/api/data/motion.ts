
import { Motion, MotionId, CaseId, DocumentId, EvidenceId } from '../../types';

export const MOCK_MOTIONS: Motion[] = [
  // CASE: 1:24-cv-01442-LMB-IDD
  {
    id: 'mot-dc-10' as MotionId,
    caseId: '1:24-cv-01442-LMB-IDD' as CaseId,
    title: 'Emergency MOTION for Contempt and Injunction',
    description: 'Emergency motion seeking contempt and injunctive relief',
    type: 'Sanctions',
    status: 'Decided',
    outcome: 'Denied',
    filingDate: '2024-11-15',
    documents: ['doc-dc-10' as DocumentId, 'doc-dc-13' as DocumentId],
    assignedAttorney: 'Justin Saadein-Morales',
    linkedRules: ['FRCP 65']
  },
  {
    id: 'mot-dc-31' as MotionId,
    caseId: '1:24-cv-01442-LMB-IDD' as CaseId,
    title: 'MOTION for Judicial Notice',
    description: 'Motion requesting judicial notice of relevant facts',
    type: 'In Limine',
    status: 'Filed',
    filingDate: '2025-03-26',
    documents: ['doc-dc-31' as DocumentId],
    assignedAttorney: 'Justin Saadein-Morales',
    linkedRules: ['FRE 201']
  },

  // CASE: 25-1229 (Appellate Motions)
  {
    id: 'mot-summary' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Motion for Summary Reversal',
    description: 'Motion for summary reversal of district court decision',
    type: 'Summary Judgment',
    status: 'Withdrawn',
    outcome: 'Withdrawn',
    filingDate: '2025-03-28',
    documents: ['1001744472' as DocumentId],
    assignedAttorney: 'Justin Saadein-Morales'
  },
  {
    id: 'mot-injunct-1' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Emergency Motion for Injunctive Relief',
    description: 'Emergency motion seeking immediate injunctive relief',
    type: 'In Limine',
    status: 'Decided',
    outcome: 'Denied',
    filingDate: '2025-04-18',
    documents: ['1001758998' as DocumentId],
    assignedAttorney: 'Justin Saadein-Morales'
  },
  {
    id: 'mot-injunct-2' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Emergency Motion for Injunctive Relief Pending Appeal',
    description: 'Emergency motion for injunctive relief pending appeal',
    type: 'Continuance',
    status: 'Decided',
    outcome: 'Denied',
    filingDate: '2025-05-09',
    documents: ['doc-dc-31' as DocumentId],
    assignedAttorney: 'Justin Saadein-Morales'
  },
  {
    id: 'mot-affirm' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Motion to Affirm Decision',
    description: 'Motion to affirm the lower court decision',
    type: 'Dismiss',
    status: 'Decided',
    outcome: 'Moot',
    filingDate: '2025-05-30',
    documents: ['1001779538' as DocumentId],
    assignedAttorney: 'Appellee Counsel'
  },
  {
    id: 'mot-sanctions' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Emergency Motion to Enforce/Sanctions',
    description: 'Emergency motion to enforce and request sanctions',
    type: 'Sanctions',
    status: 'Decided',
    outcome: 'Denied',
    filingDate: '2025-07-02',
    documents: ['1001798503' as DocumentId],
    assignedAttorney: 'Justin Saadein-Morales'
  },
  {
    id: 'mot-clarify' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Emergency Motion to Clarify',
    description: 'Emergency motion to clarify previous court order',
    type: 'Continuance',
    status: 'Filed',
    filingDate: '2025-07-08',
    documents: [],
    assignedAttorney: 'Justin Saadein-Morales'
  },
  {
    id: 'mot-withdraw' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Motion to Withdraw Summary Reversal',
    description: 'Motion to withdraw the summary reversal motion',
    type: 'Dismiss',
    status: 'Decided',
    outcome: 'Granted',
    filingDate: '2025-07-17',
    documents: [],
    assignedAttorney: 'Justin Saadein-Morales'
  },
  {
    id: 'mot-judicial' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Motion for Judicial Notice',
    description: 'Motion for judicial notice of relevant facts',
    type: 'In Limine',
    status: 'Decided',
    outcome: 'Denied',
    filingDate: '2025-07-18',
    documents: [],
    assignedAttorney: 'Justin Saadein-Morales'
  },
  {
    id: 'mot-strike' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Motion to Strike',
    description: 'Motion to strike opposing party filing',
    type: 'Dismiss',
    status: 'Decided',
    outcome: 'Denied',
    filingDate: '2025-09-26',
    documents: [],
    assignedAttorney: 'Appellee Counsel'
  },
  {
    id: 'mot-recall' as MotionId,
    caseId: '25-1229' as CaseId,
    title: 'Motion to Recall Mandate',
    description: 'Motion to recall the mandate issued by court',
    type: 'Continuance',
    status: 'Decided',
    outcome: 'Denied',
    filingDate: '2025-11-11',
    documents: ['1001875546' as DocumentId],
    assignedAttorney: 'Justin Saadein-Morales'
  },

  // Existing Mock Motions
  {
    id: 'mot-1' as MotionId,
    caseId: 'C-2024-001' as CaseId,
    title: 'Motion to Dismiss Count II',
    description: 'Motion to dismiss the second count of the complaint',
    type: 'Dismiss',
    status: 'Hearing Set',
    filingDate: '2024-02-15',
    hearingDate: '2024-03-20',
    assignedAttorney: 'James Doe',
    linkedEvidenceIds: ['EV-001' as EvidenceId]
  }
];
