import { CaseStatus } from '@/types';

export const CASE_STATUS_VARIANTS: Record<CaseStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
    [CaseStatus.Settled]: 'success',
    [CaseStatus.Closed]: 'success',
    [CaseStatus.Trial]: 'warning',
    [CaseStatus.Appeal]: 'error',
    [CaseStatus.Discovery]: 'info',
    [CaseStatus.Active]: 'neutral',
    [CaseStatus.Open]: 'neutral',
    [CaseStatus.Pending]: 'neutral',
    [CaseStatus.Archived]: 'neutral',
    [CaseStatus.Stayed]: 'neutral'
};

export const CASE_TYPES = [
    'Litigation',
    'Appeal',
    'M&A',
    'IP'
] as const;

export const ACTIVE_CASE_COLUMNS = [
    { key: 'title', label: 'Matter', width: '35%' },
    { key: 'matterType', label: 'Type', width: '15%' },
    { key: 'client', label: 'Client', width: '20%' },
    { key: 'value', label: 'Value', width: '15%' }
] as const;
