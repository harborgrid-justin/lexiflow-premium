import { PleadingTemplate } from "../../types/pleadingTypes";

export const PLEADING_TEMPLATES: PleadingTemplate[] = [
    {
        id: 'tpl-complaint', name: 'Civil Complaint', category: 'Complaint',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'INTRODUCTION' },
            { id: 'sec-3', type: 'Paragraph', content: 'Plaintiff brings this action against Defendant for...' },
            { id: 'sec-4', type: 'Heading', content: 'JURISDICTION AND VENUE' },
            { id: 'sec-5', type: 'Paragraph', content: 'This Court has jurisdiction because...' },
            { id: 'sec-6', type: 'Heading', content: 'PARTIES' },
            { id: 'sec-7', type: 'Signature', content: '' }
        ]
    },
    {
        id: 'tpl-motion-dismiss', name: 'Motion to Dismiss (12b6)', category: 'Motion',
        defaultSections: [
            { id: 'sec-1', type: 'Caption', content: '' },
            { id: 'sec-2', type: 'Heading', content: 'NOTICE OF MOTION' },
            { id: 'sec-3', type: 'Paragraph', content: 'PLEASE TAKE NOTICE that Defendant will move this Court...' },
            { id: 'sec-4', type: 'Heading', content: 'MEMORANDUM OF POINTS AND AUTHORITIES' },
            { id: 'sec-5', type: 'Signature', content: '' }
        ]
    }
];