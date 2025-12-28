/**
 * Discovery Charts Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.discovery.getChartData() instead.
 * This constant is only for seeding and testing purposes.
 */

/**
 * @deprecated MOCK DATA - Use DataService.discovery instead
 */
export const MOCK_DISCOVERY_FUNNEL = {
    id: 'funnel-main',
    data: [
        { name: 'Collection', value: 120000, label: '120k Docs' },
        { name: 'Processing', value: 85000, label: '85k De-NIST' },
        { name: 'Review', value: 24000, label: '24k Responsive' },
        { name: 'Production', value: 1500, label: '1.5k Produced' },
    ]
};

export const MOCK_DISCOVERY_CUSTODIANS = {
    id: 'custodian-main',
    data: [
        { name: 'J. Doe', docs: 4500 },
        { name: 'J. Smith', docs: 3200 },
        { name: 'HR Dept', docs: 8900 },
        { name: 'IT Admin', docs: 1200 },
    ]
};
