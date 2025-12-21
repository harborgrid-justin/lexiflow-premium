
// config/prefetchConfig.ts
import { queryKeys } from '../utils/queryKeys';
import { DataService } from '../services/data/dataService';
import { PATHS } from './paths.config';

export const PREFETCH_MAP: Record<string, { key: any; fn: () => Promise<any> }> = {
    [PATHS.CASES]: { key: queryKeys.cases.all(), fn: () => DataService.cases.getAll() },
    [PATHS.DOCKET]: { key: queryKeys.docket.all(), fn: () => DataService.docket.getAll() },
    [PATHS.DOCUMENTS]: { key: queryKeys.documents.all(), fn: () => DataService.documents.getAll() },
    [PATHS.WORKFLOWS]: { key: queryKeys.tasks.all(), fn: () => DataService.tasks.getAll() },
    [PATHS.BILLING]: { key: queryKeys.billing.timeEntries(), fn: () => DataService.billing.getTimeEntries() },
    [PATHS.EVIDENCE]: { key: queryKeys.evidence.all(), fn: () => DataService.evidence.getAll() },
    [PATHS.CRM]: { key: queryKeys.clients.all(), fn: () => DataService.clients.getAll() },
};

