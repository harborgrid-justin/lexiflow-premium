export const FINANCIAL_REPORT_TABS = [
    'profitability',
    'realization',
    'wip',
    'forecasting',
    'performance'
] as const;

// Create a map for friendly labels if needed, or just capitalize in UI
export const FINANCIAL_REPORT_TAB_LABELS: Record<string, string> = {
    profitability: 'Profitability',
    realization: 'Realization',
    wip: 'WIP',
    forecasting: 'Forecasting',
    performance: 'Performance'
};

export type FinancialReportTab = typeof FINANCIAL_REPORT_TABS[number];

export const REPORT_PERIODS = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
] as const;

export type ReportPeriod = typeof REPORT_PERIODS[number]['value'];
