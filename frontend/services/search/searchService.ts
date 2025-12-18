/**
 * @module services/searchService
 * @category Services - Search
 * @description Global search service with Web Worker-based full-text search across all domains (cases,
 * clients, tasks, evidence, users, documents, docket, motions, clauses, rules). Manages singleton
 * worker instance with hydration from DataService, race condition protection via request IDs, and
 * search history persistence in localStorage.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../data/dataService';
import { SearchWorker } from './searchWorker';

// Utils & Constants
import { StorageUtils } from '../../utils/storage';

// Types
import { Case, Client, WorkflowTask, EvidenceItem, User, LegalDocument, DocketEntry, Motion, Clause, LegalRule } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type SearchResultType = 'case' | 'document' | 'client' | 'task' | 'evidence' | 'user' | 'docket' | 'motion' | 'clause' | 'rule';

export interface GlobalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  data: any;
  score?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const HISTORY_KEY = 'lexiflow_search_history';

// ============================================================================
// SEARCH ENGINE CLASS
// ============================================================================
// Singleton worker instance for Global Search
class GlobalSearchEngine {
    private worker: Worker;
    private requestId = 0;
    private isHydrated = false;
    private hydrationPromise: Promise<void> | null = null;
    private pendingRequests = new Map<number, (results: GlobalSearchResult[]) => void>();

    constructor() {
        this.worker = SearchWorker.create();
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
    }

    private handleWorkerMessage(e: MessageEvent) {
        const { results, requestId } = e.data;
        const resolver = this.pendingRequests.get(requestId);
        if (resolver) {
            resolver(results);
            this.pendingRequests.delete(requestId);
        }
    }

    /**
     * Hydrates the worker with data from all domains.
     * Uses Promise.allSettled to ensure partial failures don't brick search.
     */
    private async hydrate() {
        if (this.isHydrated) return;
        if (this.hydrationPromise) return this.hydrationPromise;

        this.hydrationPromise = (async () => {
            try {
                // Fetch all data domains in parallel
                const [cases, clients, tasks, evidence, users, docs, docket, motions, clauses, rules] = await Promise.all([
                    DataService.cases.getAll().catch(() => []),
                    DataService.clients.getAll().catch(() => []),
                    DataService.tasks.getAll().catch(() => []),
                    DataService.evidence.getAll().catch(() => []),
                    DataService.users.getAll().catch(() => []),
                    DataService.documents.getAll().catch(() => []),
                    DataService.docket.getAll().catch(() => []),
                    DataService.motions.getAll().catch(() => []),
                    DataService.clauses.getAll().catch(() => []),
                    DataService.rules.getAll().catch(() => [])
                ]);

                // Normalize data into flat search objects
                const searchItems: GlobalSearchResult[] = [
                    ...cases.map(c => ({ id: c.id, type: 'case' as const, title: c.title, subtitle: `${c.id} • ${c.client}`, data: c })),
                    ...clients.map(c => ({ id: c.id, type: 'client' as const, title: c.name, subtitle: `Client • ${c.industry}`, data: c })),
                    ...tasks.map(t => ({ id: t.id, type: 'task' as const, title: t.title, subtitle: `Task • Due: ${t.dueDate}`, data: t })),
                    ...evidence.map(e => ({ id: e.id, type: 'evidence' as const, title: e.title, subtitle: `Evidence • ${e.type}`, data: e })),
                    ...users.map(u => ({ id: u.id, type: 'user' as const, title: u.name, subtitle: `${u.role} • ${u.office}`, data: u })),
                    ...docs.map(d => ({ id: d.id, type: 'document' as const, title: d.title, subtitle: `Doc • ${d.type}`, data: d })),
                    ...docket.map(d => ({ id: d.id, type: 'docket' as const, title: d.title, subtitle: `Docket #${d.sequenceNumber}`, data: d })),
                    ...motions.map(m => ({ id: m.id, type: 'motion' as const, title: m.title, subtitle: `Motion • ${m.status}`, data: m })),
                    ...clauses.map(c => ({ id: c.id, type: 'clause' as const, title: c.name, subtitle: `Clause • ${c.category}`, data: c })),
                    ...rules.map(r => ({ id: r.id, type: 'rule' as const, title: `${r.code} - ${r.name}`, subtitle: `Rule • ${r.type}`, data: r }))
                ];

                // Send to worker
                this.worker.postMessage({
                    type: 'UPDATE',
                    payload: {
                        items: searchItems,
                        fields: ['title', 'subtitle', 'type'] // Fields to scan
                    }
                });

                this.isHydrated = true;
            } catch (e) {
                console.error("Search hydration failed", e);
            }
        })();

        return this.hydrationPromise;
    }

    async search(query: string): Promise<GlobalSearchResult[]> {
        await this.hydrate(); // Ensure data is loaded

        return new Promise<GlobalSearchResult[]>((resolve) => {
            const reqId = ++this.requestId;
            this.pendingRequests.set(reqId, resolve);
            
            this.worker.postMessage({
                type: 'SEARCH',
                payload: {
                    query,
                    requestId: reqId
                }
            });
        });
    }
}

const engine = new GlobalSearchEngine();

export const SearchService = {
  search: (query: string) => engine.search(query),

  saveHistory(term: string) {
    if (!term.trim()) return;
    const history = StorageUtils.get<string[]>(HISTORY_KEY, []);
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 10);
    StorageUtils.set(HISTORY_KEY, newHistory);
  },

  getHistory(): string[] {
    return StorageUtils.get<string[]>(HISTORY_KEY, []);
  }
};

