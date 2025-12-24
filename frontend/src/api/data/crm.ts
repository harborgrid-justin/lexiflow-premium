
export const MOCK_LEADS = [
    { id: 'lead-1', client: 'Future Corp', title: 'Major Litigation Matter', value: '$500,000', date: '2024-03-10', stage: 'New Lead' },
    { id: 'lead-2', client: 'Innovate LLC', title: 'Series B Funding Round', value: '$250,000', date: '2024-03-08', stage: 'Conflict Check' },
    { id: 'lead-3', client: 'Global Exports', title: 'M&A Advisory', value: '$1,200,000', date: '2024-03-05', stage: 'Engagement' },
    { id: 'lead-4', client: 'Local Biz', title: 'Real Estate Purchase', value: '$50,000', date: '2024-03-01', stage: 'New Lead' },
];

export const MOCK_CRM_ANALYTICS = {
    id: 'crm-analytics-main',
    growth: [
        { month: 'Jan', clients: 5 }, { month: 'Feb', clients: 8 }, { month: 'Mar', clients: 12 }
    ],
    industry: [
        { name: 'Tech', value: 40, color: '#3b82f6' },
        { name: 'Finance', value: 25, color: '#8b5cf6' },
        { name: 'Healthcare', value: 15, color: '#10b981' }
    ],
    revenue: [
        { name: 'Q1', retained: 400000, new: 120000 },
        { name: 'Q2', retained: 450000, new: 180000 },
    ],
    sources: [
        { name: 'Referral', value: 55 },
        { name: 'Web', value: 25 },
        { name: 'Conference', value: 20 },
    ]
};
