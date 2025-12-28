/**
 * Billing Statistics Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.billing.getStats() instead.
 * This constant is only for seeding and testing purposes.
 */

/**
 * @deprecated MOCK DATA - Use DataService.billing instead
 */
export const MOCK_WIP_DATA = [
    { id: 'wip-1', name: 'TechCorp', wip: 45000, billed: 120000 },
    { id: 'wip-2', name: 'OmniGlobal', wip: 28000, billed: 85000 },
    { id: 'wip-3', name: 'StartUp Inc', wip: 12000, billed: 45000 },
];
  
export const MOCK_REALIZATION_DATA = {
    id: 'realization-main',
    data: [
        { name: 'Billed', value: 85, color: '#10b981' },
        { name: 'Write-off', value: 15, color: '#ef4444' },
    ]
};

export const MOCK_OPERATING_SUMMARY = {
    id: 'op-summary-main',
    balance: 482500.00, 
    expensesMtd: 45100, 
    cashFlowMtd: 80320
};
