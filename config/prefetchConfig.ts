
// config/prefetchConfig.ts
import { STORES } from '../services/db';
import { DataService } from '../services/dataService';
import { PATHS } from '../constants/paths';

export const PREFETCH_MAP: Record<string, { key: any; fn: () => Promise<any> }> = {
    [PATHS.CASES]: { key: [STORES.CASES, 'all'], fn: DataService.cases.getAll },
    [PATHS.DOCKET]: { key: [STORES.DOCKET, 'all'], fn: DataService.docket.getAll },
    [PATHS.DOCUMENTS]: { key: [STORES.DOCUMENTS, 'all'], fn: DataService.documents.getAll },
    [PATHS.WORKFLOWS]: { key: [STORES.TASKS, 'all'], fn: DataService.tasks.getAll },
    [PATHS.BILLING]: { key: [STORES.BILLING, 'all'], fn: DataService.billing.getTimeEntries },
    [PATHS.EVIDENCE]: { key: [STORES.EVIDENCE, 'all'], fn: DataService.evidence.getAll },
    [PATHS.CRM]: { key: [STORES.CLIENTS, 'all'], fn: DataService.clients.getAll },
};
