import { LegalDocument } from '../../types';

export const MOCK_DOCUMENTS: LegalDocument[] = [
    // Documents from Case 1:24-cv-01442-LMB-IDD
    {
        id: 'doc-dc-10', caseId: '1:24-cv-01442-LMB-IDD', title: 'Emergency Motion for Contempt and Injunction', type: 'Motion', 
        content: 'Emergency MOTION for Contempt and Injunction to Protect Automatic Stay by Justin Jeffrey Saadein-Morales. Includes Exhibits A-O and Affidavit.',
        uploadDate: '2024-11-15', lastModified: '2024-11-15', tags: ['Emergency', 'Contempt', 'Injunction'],
        versions: [], status: 'Filed', fileSize: '1.7 MB', authorId: 'usr-admin-justin'
    },
    {
        id: 'doc-dc-13', caseId: '1:24-cv-01442-LMB-IDD', title: 'Order Denying Emergency Motion', type: 'Order', 
        content: 'ORDERED that the Emergency Motion 10 be and is DENIED. Signed by District Judge Leonie M. Brinkema.',
        uploadDate: '2024-11-15', lastModified: '2024-11-18', tags: ['Order', 'Denied'],
        versions: [], status: 'Signed', fileSize: '150 KB', authorId: 'court'
    },
    {
        id: 'doc-dc-26', caseId: '1:24-cv-01442-LMB-IDD', title: 'Order Affirming Bankruptcy Court', type: 'Order', 
        content: 'ORDERED that the decision of the United States Bankruptcy Court for the Eastern District of Virginia be and is AFFIRMED.',
        uploadDate: '2025-02-26', lastModified: '2025-02-26', tags: ['Order', 'Judgment', 'Affirmed'],
        versions: [], status: 'Signed', fileSize: '220 KB', authorId: 'court'
    },
    {
        id: 'doc-dc-31', caseId: '1:24-cv-01442-LMB-IDD', title: 'Motion for Judicial Notice', type: 'Motion', 
        content: 'MOTION for Judicial Notice of Pending Appeals No. 24-2160 and No. 25-1229 Pursuant to Federal Rule of Evidence 201.',
        uploadDate: '2025-03-26', lastModified: '2025-03-26', tags: ['Motion', 'Judicial Notice'],
        versions: [], status: 'Filed', fileSize: '5.7 MB', authorId: 'usr-admin-justin'
    },

    // Documents from Case 25-1229
    {
        id: '1001744472', caseId: '25-1229', title: 'Motion for Summary Reversal', type: 'Motion', 
        content: 'MOTION by Justin Jeffrey Saadein-Morales to GRANT Summary Reversal; EXERCISE its supervisory authority...',
        uploadDate: '2025-03-28', lastModified: '2025-03-28', tags: ['Motion', 'Summary Reversal'],
        versions: [], status: 'Filed', authorId: 'usr-admin-justin'
    },
    {
        id: '1001758998', caseId: '25-1229', title: 'Emergency Motion for Injunctive Relief', type: 'Motion', 
        content: 'Emergency MOTION by Justin Jeffrey Saadein-Morales to expedite decision, for injunctive relief pending appeal...',
        uploadDate: '2025-04-18', lastModified: '2025-04-18', tags: ['Emergency', 'Injunction'],
        versions: [], status: 'Filed', authorId: 'usr-admin-justin'
    },
    {
        id: '1001779538', caseId: '25-1229', title: 'Motion to Affirm Decision', type: 'Motion', 
        content: 'MOTION by Westridge Swim & Racquet Club, Inc. to affirm decision on appeal.',
        uploadDate: '2025-05-30', lastModified: '2025-05-30', tags: ['Affirmation', 'Defense'],
        versions: [], status: 'Filed', authorId: 'external'
    },
    {
        id: '1001850048', caseId: '25-1229', title: 'Judgment Order - Dismissed', type: 'Order', 
        content: 'JUDGMENT ORDER filed. Decision: Dismissed. Originating case number: 1:24-cv-01442-LMB-IDD.',
        uploadDate: '2025-09-29', lastModified: '2025-09-29', tags: ['Order', 'Judgment', 'Dismissal'],
        versions: [], status: 'Signed', authorId: 'court'
    }
];