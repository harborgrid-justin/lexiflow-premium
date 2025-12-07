
import { LegalDocument, DocumentId, CaseId, UserId } from '../types';

export const MOCK_DOCUMENTS: LegalDocument[] = [
    // NEW FORM DOCS
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: 'doc-form-nda' as DocumentId, caseId: 'General' as CaseId, title: 'Standard NDA Template.pdf', type: 'PDF',
        content: 'This Non-Disclosure Agreement is entered into...',
        uploadDate: '2024-03-01', lastModified: '2024-03-10', tags: ['Template', 'Form', 'Local'],
        versions: [], status: 'Final', fileSize: '128 KB', 
        // FIX: Cast string to branded type UserId
        authorId: 'usr-admin-justin' as UserId,
        formFields: [
            { id: 'f-1', type: 'text', x: 100, y: 150, value: 'TechCorp Industries' },
            { id: 'f-2', type: 'date', x: 400, y: 150, value: '03/15/2024' },
            { id: 'f-3', type: 'signature', x: 350, y: 500, value: '' }
        ]
    },
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: 'doc-form-draft' as DocumentId, caseId: 'C-2024-001' as CaseId, title: 'Engagement Letter - Martinez.pdf', type: 'PDF',
        content: 'This letter confirms that Martinez has retained LexiFlow...',
        uploadDate: '2024-03-12', lastModified: '2024-03-14', tags: ['Form', 'Local'],
        versions: [], status: 'Draft', fileSize: '256 KB', 
        // FIX: Cast string to branded type UserId
        authorId: 'usr-assoc-james' as UserId,
        formFields: []
    },
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: 'doc-form-sent' as DocumentId, caseId: 'C-2024-112' as CaseId, title: 'OmniGlobal Merger Agreement - Signature Packet.pdf', type: 'PDF',
        content: 'Merger agreement details...',
        uploadDate: '2024-03-15', lastModified: '2024-03-15', tags: ['Form', 'Local'],
        versions: [], status: 'Sent' as any, fileSize: '1.2 MB', 
        // FIX: Cast string to branded type UserId
        authorId: 'usr-partner-alex' as UserId,
        formFields: []
    },
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: 'doc-form-signed' as DocumentId, caseId: 'C-2023-892' as CaseId, title: 'Settlement Agreement - GreenEnergy.pdf', type: 'PDF',
        content: 'Settlement details...',
        uploadDate: '2024-02-20', lastModified: '2024-02-21', tags: ['Form', 'Local'],
        versions: [], status: 'Signed' as any, fileSize: '800 KB', 
        // FIX: Cast string to branded type UserId
        authorId: 'usr-partner-alex' as UserId,
        formFields: []
    },
    // Documents from Case 1:24-cv-01442-LMB-IDD
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: 'doc-dc-10' as DocumentId, caseId: '1:24-cv-01442-LMB-IDD' as CaseId, title: 'Emergency Motion for Contempt and Injunction', type: 'Motion',
        content: 'Emergency MOTION for Contempt and Injunction to Protect Automatic Stay by Justin Jeffrey Saadein-Morales. Includes Exhibits A-O and Affidavit.',
        uploadDate: '2024-11-15', lastModified: '2024-11-15', tags: ['Emergency', 'Contempt', 'Injunction', 'Local'],
        versions: [], status: 'Filed', fileSize: '1.7 MB', 
        // FIX: Cast string to branded type UserId
        authorId: 'usr-admin-justin' as UserId
    },
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: 'doc-dc-13' as DocumentId, caseId: '1:24-cv-01442-LMB-IDD' as CaseId, title: 'Order Denying Emergency Motion', type: 'Order',
        content: 'ORDERED that the Emergency Motion 10 be and is DENIED. Signed by District Judge Leonie M. Brinkema.',
        uploadDate: '2024-11-15', lastModified: '2024-11-18', tags: ['Order', 'Denied', 'Local'],
        versions: [], status: 'Signed', fileSize: '150 KB', 
        // FIX: Cast string to branded type UserId
        authorId: 'court' as UserId
    },
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: 'doc-dc-26' as DocumentId, caseId: '1:24-cv-01442-LMB-IDD' as CaseId, title: 'Order Affirming Bankruptcy Court', type: 'Order',
        content: 'ORDERED that the decision of the United States Bankruptcy Court for the Eastern District of Virginia be and is AFFIRMED.',
        uploadDate: '2025-02-26', lastModified: '2025-02-26', tags: ['Order', 'Judgment', 'Affirmed', 'Local'],
        versions: [], status: 'Signed', fileSize: '220 KB', 
        // FIX: Cast string to branded type UserId
        authorId: 'court' as UserId
    },
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: 'doc-dc-31' as DocumentId, caseId: '1:24-cv-01442-LMB-IDD' as CaseId, title: 'Motion for Judicial Notice', type: 'Motion',
        content: 'MOTION for Judicial Notice of Pending Appeals No. 24-2160 and No. 25-1229 Pursuant to Federal Rule of Evidence 201.',
        uploadDate: '2025-03-26', lastModified: '2025-03-26', tags: ['Motion', 'Judicial Notice', 'Local'],
        versions: [], status: 'Filed', fileSize: '5.7 MB', 
        // FIX: Cast string to branded type UserId
        authorId: 'usr-admin-justin' as UserId
    },

    // Documents from Case 25-1229
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: '1001744472' as DocumentId, caseId: '25-1229' as CaseId, title: 'Motion for Summary Reversal', type: 'Motion',
        content: 'MOTION by Justin Jeffrey Saadein-Morales to GRANT Summary Reversal; EXERCISE its supervisory authority...',
        uploadDate: '2025-03-28', lastModified: '2025-03-28', tags: ['Motion', 'Summary Reversal', 'Local'],
        versions: [], status: 'Filed', 
        // FIX: Cast string to branded type UserId
        authorId: 'usr-admin-justin' as UserId
    },
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: '1001758998' as DocumentId, caseId: '25-1229' as CaseId, title: 'Emergency Motion for Injunctive Relief', type: 'Motion',
        content: 'Emergency MOTION by Justin Jeffrey Saadein-Morales to expedite decision, for injunctive relief pending appeal...',
        uploadDate: '2025-04-18', lastModified: '2025-04-18', tags: ['Emergency', 'Injunction', 'Local'],
        versions: [], status: 'Filed', 
        // FIX: Cast string to branded type UserId
        authorId: 'usr-admin-justin' as UserId
    },
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: '1001779538' as DocumentId, caseId: '25-1229' as CaseId, title: 'Motion to Affirm Decision', type: 'Motion',
        content: 'MOTION by Westridge Swim & Racquet Club, Inc. to affirm decision on appeal.',
        uploadDate: '2025-05-30', lastModified: '2025-05-30', tags: ['Affirmation', 'Defense', 'Local'],
        versions: [], status: 'Filed', 
        // FIX: Cast string to branded type UserId
        authorId: 'external' as UserId
    },
    {
        // FIX: Cast string to branded type DocumentId and CaseId
        id: '1001850048' as DocumentId, caseId: '25-1229' as CaseId, title: 'Judgment Order - Dismissed', type: 'Order',
        content: 'JUDGMENT ORDER filed. Decision: Dismissed. Originating case number: 1:24-cv-01442-LMB-IDD.',
        uploadDate: '2025-09-29', lastModified: '2025-09-29', tags: ['Order', 'Judgment', 'Dismissal', 'Local'],
        versions: [], status: 'Signed', 
        // FIX: Cast string to branded type UserId
        authorId: 'court' as UserId
    }
];