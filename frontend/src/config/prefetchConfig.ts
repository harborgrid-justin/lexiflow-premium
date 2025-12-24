
// config/prefetchConfig.ts
import { queryKeys } from '../utils/queryKeys';
import { DataService } from '../services/data/dataService';
import { PATHS } from './paths.config';

export const PREFETCH_MAP: Record<string, { key: unknown; fn: () => Promise<unknown> }> = {
    [PATHS.CASES]: { key: queryKeys.cases.all(), fn: () => DataService.cases.getAll() },
    [PATHS.MATTERS_OVERVIEW]: { key: queryKeys.cases.matters.all(), fn: () => DataService.cases.getAll() },
    [PATHS.MATTERS_CALENDAR]: { key: queryKeys.cases.matters.all(), fn: () => DataService.cases.getAll() },
    [PATHS.MATTERS_ANALYTICS]: { key: queryKeys.cases.matters.all(), fn: () => DataService.cases.getAll() },
    [PATHS.MATTERS_INTAKE]: { key: queryKeys.cases.matters.all(), fn: () => DataService.cases.getAll() },
    [PATHS.MATTERS_OPERATIONS]: { key: queryKeys.cases.matters.all(), fn: () => DataService.cases.getAll() },
    [PATHS.MATTERS_INSIGHTS]: { key: queryKeys.cases.matters.all(), fn: () => DataService.cases.getAll() },
    [PATHS.MATTERS_FINANCIALS]: { key: queryKeys.cases.matters.all(), fn: () => DataService.cases.getAll() },
    [PATHS.DOCKET]: { key: queryKeys.docket.all(), fn: () => DataService.docket.getAll() },
    [PATHS.DOCUMENTS]: { key: queryKeys.documents.all(), fn: () => DataService.documents.getAll() },
    [PATHS.WORKFLOWS]: { key: queryKeys.tasks.all(), fn: () => DataService.tasks.getAll() },
    [PATHS.BILLING]: { key: queryKeys.billing.timeEntries(), fn: () => DataService.billing.getTimeEntries() },
    [PATHS.EVIDENCE]: { key: queryKeys.evidence.all(), fn: () => DataService.evidence.getAll() },
    [PATHS.CRM]: { key: queryKeys.clients.all(), fn: () => DataService.clients.getAll() },
};

