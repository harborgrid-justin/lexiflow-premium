
import { DocketEntry, DocketId, CaseId, DocumentId } from '../../types';

export const MOCK_DOCKET_ENTRIES: DocketEntry[] = [
  // CASE: 1:24-cv-01442-LMB-IDD
  {
    id: 'dk-dc-10' as DocketId, 
    sequenceNumber: 10, 
    pacerSequenceNumber: 10,
    caseId: '1:24-cv-01442-LMB-IDD' as CaseId, 
    date: '2024-11-15', 
    type: 'Filing',
    title: 'Emergency MOTION for Contempt and Injunction to Protect Automatic Stay',
    description: 'by Justin Jeffrey Saadein-Morales. Attachments: Exhibits A-O, Affidavit, Proposed Orders.', 
    filedBy: 'Justin Jeffrey Saadein-Morales', 
    isSealed: false, 
    documentId: 'doc-dc-10' as DocumentId,
    structuredData: {
        actionType: 'Motion',
        actionVerb: 'filed',
        documentTitle: 'Emergency Motion for Contempt',
        filer: 'Justin Jeffrey Saadein-Morales',
        additionalText: 'Includes Exhibits A-O and Affidavit'
    }
  },
  {
    id: 'dk-dc-13' as DocketId, 
    sequenceNumber: 13, 
    pacerSequenceNumber: 13,
    caseId: '1:24-cv-01442-LMB-IDD' as CaseId, 
    date: '2024-11-15', 
    type: 'Order',
    title: 'ORDER DENYING Emergency Motion [10]',
    description: 'Signed by District Judge Leonie M. Brinkema.', 
    filedBy: 'Court', 
    isSealed: false, 
    documentId: 'doc-dc-13' as DocumentId
  },
  {
    id: 'dk-dc-31' as DocketId, 
    sequenceNumber: 31, 
    pacerSequenceNumber: 31,
    caseId: '1:24-cv-01442-LMB-IDD' as CaseId, 
    date: '2025-03-26', 
    type: 'Filing',
    title: 'MOTION for Judicial Notice',
    description: 'of Pending Appeals No. 24-2160 and No. 25-1229. Filed by Justin Jeffrey Saadein-Morales.', 
    filedBy: 'Justin Jeffrey Saadein-Morales', 
    isSealed: false, 
    documentId: 'doc-dc-31' as DocumentId
  },
  
  // CASE: 25-1229 (Appellate)
  {
    id: 'dk-25-1' as DocketId, 
    sequenceNumber: 1, 
    pacerSequenceNumber: 1,
    caseId: '25-1229' as CaseId, 
    date: '2025-03-12', 
    type: 'Notice',
    title: 'Case docketed. Originating case: 1:24-cv-01442-LMB-IDD',
    description: 'Case manager: AWalker. [1001734848]', 
    filedBy: 'Court', 
    isSealed: false
  },
  {
    id: 'dk-25-6' as DocketId, 
    sequenceNumber: 6, 
    pacerSequenceNumber: 6,
    caseId: '25-1229' as CaseId, 
    date: '2025-03-28', 
    type: 'Filing',
    title: 'MOTION to GRANT Summary Reversal',
    description: 'EXERCISE its supervisory authority; CONSIDER transfer... [1001744472]', 
    filedBy: 'Justin Jeffrey Saadein-Morales', 
    isSealed: false, 
    documentId: '1001744472' as DocumentId
  },
  {
    id: 'dk-25-8' as DocketId,
    sequenceNumber: 8,
    pacerSequenceNumber: 8,
    caseId: '25-1229' as CaseId,
    date: '2025-04-18',
    type: 'Filing',
    title: 'Emergency MOTION for Injunctive Relief',
    description: 'Filed by Justin Jeffrey Saadein-Morales. [1001758998]',
    filedBy: 'Justin Jeffrey Saadein-Morales',
    isSealed: false
  },
  {
    id: 'dk-25-30' as DocketId,
    sequenceNumber: 30,
    pacerSequenceNumber: 30,
    caseId: '25-1229' as CaseId,
    date: '2025-05-30',
    type: 'Filing',
    title: 'MOTION to Affirm Decision',
    description: 'Filed by Appellee Westridge Swim & Racquet Club. [1001779538]',
    filedBy: 'Appellee Counsel',
    isSealed: false
  },
  {
    id: 'dk-25-119' as DocketId, 
    sequenceNumber: 119, 
    pacerSequenceNumber: 119,
    caseId: '25-1229' as CaseId, 
    date: '2025-09-29', 
    type: 'Order',
    title: 'JUDGMENT ORDER: Dismissed',
    description: 'Entered on 09/29/2025. [1001850048]', 
    filedBy: 'Court', 
    isSealed: false, 
    documentId: '1001850048' as DocumentId
  }
];
