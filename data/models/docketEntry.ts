
import { DocketEntry } from '../../types';

export const MOCK_DOCKET_ENTRIES: DocketEntry[] = [
  // CASE: 1:24-cv-01442-LMB-IDD
  {
    id: 'dk-dc-1', 
    sequenceNumber: 1, 
    pacerSequenceNumber: 1,
    caseId: '1:24-cv-01442-LMB-IDD', 
    date: '2024-08-16', 
    type: 'Notice',
    title: 'Notice of APPEAL FROM BANKRUPTCY COURT',
    description: 'Bankruptcy Court case number 24-11119-BFK, filed by Justin Jeffrey Saadein-Morales.', 
    filedBy: 'Justin Jeffrey Saadein-Morales', 
    isSealed: false, 
    documentId: 'doc-dc-1',
    structuredData: {
        actionType: 'Notice',
        actionVerb: 'filed',
        documentTitle: 'Appeal from Bankruptcy Court',
        filer: 'Justin Jeffrey Saadein-Morales',
        additionalText: 'Bankruptcy Case #24-11119-BFK'
    }
  },
  {
    id: 'dk-dc-2', 
    sequenceNumber: 2, 
    pacerSequenceNumber: 2,
    caseId: '1:24-cv-01442-LMB-IDD', 
    date: '2024-08-19', 
    type: 'Order',
    title: 'Order Denying Debtor\'s Application to Proceed in Forma Pauperis',
    description: 'The Debtor must pay the appeal fee of $298.00 within 14 days. Signed by Brian F. Kenney.', 
    filedBy: 'Court', 
    isSealed: false,
    structuredData: {
        actionType: 'Order',
        actionVerb: 'denying',
        documentTitle: 'Application to Proceed IFP',
        filer: 'Court',
        additionalText: 'Debtor must pay $298.00 within 14 days.'
    }
  },
  {
    id: 'dk-dc-10', 
    sequenceNumber: 10, 
    pacerSequenceNumber: 10,
    caseId: '1:24-cv-01442-LMB-IDD', 
    date: '2024-11-15', 
    type: 'Filing',
    title: 'Emergency MOTION for Contempt and Injunction to Protect Automatic Stay',
    description: 'by Justin Jeffrey Saadein-Morales. Attachments: Exhibits A-O, Affidavit, Proposed Orders.', 
    filedBy: 'Justin Jeffrey Saadein-Morales', 
    isSealed: false, 
    documentId: 'doc-dc-10',
    structuredData: {
        actionType: 'Motion',
        actionVerb: 'filed',
        documentTitle: 'Emergency Motion for Contempt',
        filer: 'Justin Jeffrey Saadein-Morales',
        additionalText: 'Includes Exhibits A-O and Affidavit'
    }
  },
  {
    id: 'dk-dc-13', 
    sequenceNumber: 13, 
    pacerSequenceNumber: 13,
    caseId: '1:24-cv-01442-LMB-IDD', 
    date: '2024-11-15', 
    type: 'Order',
    title: 'ORDER DENYING Emergency Motion [10]',
    description: 'Signed by District Judge Leonie M. Brinkema.', 
    filedBy: 'Court', 
    isSealed: false, 
    documentId: 'doc-dc-13',
    structuredData: {
        actionType: 'Order',
        actionVerb: 'denying',
        documentTitle: 'Emergency Motion [10]',
        filer: 'Court',
        additionalText: 'Signed by Judge Brinkema'
    }
  },
  {
    id: 'dk-dc-31', 
    sequenceNumber: 31, 
    pacerSequenceNumber: 31,
    caseId: '1:24-cv-01442-LMB-IDD', 
    date: '2025-03-26', 
    type: 'Filing',
    title: 'MOTION for Judicial Notice',
    description: 'of Pending Appeals No. 24-2160 and No. 25-1229. Filed by Justin Jeffrey Saadein-Morales.', 
    filedBy: 'Justin Jeffrey Saadein-Morales', 
    isSealed: false, 
    documentId: 'doc-dc-31',
    structuredData: {
        actionType: 'Motion',
        actionVerb: 'requesting',
        documentTitle: 'Judicial Notice',
        filer: 'Justin Jeffrey Saadein-Morales',
        additionalText: 're: Pending Appeals 24-2160 & 25-1229'
    }
  },
  
  // CASE: 25-1229 (Appellate)
  {
    id: 'dk-25-1', 
    sequenceNumber: 1, 
    pacerSequenceNumber: 1,
    caseId: '25-1229', 
    date: '2025-03-12', 
    type: 'Notice',
    title: 'Case docketed. Originating case: 1:24-cv-01442-LMB-IDD',
    description: 'Case manager: AWalker. [1001734848]', 
    filedBy: 'Court', 
    isSealed: false
  },
  {
    id: 'dk-25-6', 
    sequenceNumber: 6, 
    pacerSequenceNumber: 6,
    caseId: '25-1229', 
    date: '2025-03-28', 
    type: 'Filing',
    title: 'MOTION to GRANT Summary Reversal',
    description: 'EXERCISE its supervisory authority; CONSIDER transfer... [1001744472]', 
    filedBy: 'Justin Jeffrey Saadein-Morales', 
    isSealed: false, 
    documentId: '1001744472',
    structuredData: {
        actionType: 'Motion',
        actionVerb: 'submitted',
        documentTitle: 'Motion for Summary Reversal',
        filer: 'Appellant',
        additionalText: 'Requesting supervisory authority exercise'
    }
  },
  {
    id: 'dk-25-119', 
    sequenceNumber: 119, 
    pacerSequenceNumber: 119,
    caseId: '25-1229', 
    date: '2025-09-29', 
    type: 'Order',
    title: 'JUDGMENT ORDER: Dismissed',
    description: 'Entered on 09/29/2025. [1001850048]', 
    filedBy: 'Court', 
    isSealed: false, 
    documentId: '1001850048',
    structuredData: {
        actionType: 'Judgment',
        actionVerb: 'dismissing',
        documentTitle: 'Case',
        filer: 'Court',
        additionalText: 'Mandate to issue.'
    }
  }
];
