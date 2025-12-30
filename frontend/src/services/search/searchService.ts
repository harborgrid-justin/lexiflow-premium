/**
 * Global Search Service - Multi-domain full-text search with Web Worker
 * Enterprise search across cases, clients, tasks, evidence, documents, and more
 * 
 * @module services/search/searchService
 * @description Production-ready global search service providing:
 * - Web Worker-based full-text search (off-thread indexing)
 * - Multi-domain search (10 domains: cases, clients, tasks, evidence, users, documents, docket, motions, clauses, rules)
 * - Automatic data hydration from DataService
 * - Race condition protection via request IDs
 * - Search history persistence (localStorage, max 10 entries)
 * - Graceful degradation (partial domain failures don't break search)
 * - Singleton worker instance (shared across app)
 * - Normalized search results with type, title, subtitle
 * 
 * @architecture
 * - Pattern: Singleton + Web Worker + Observer
 * - Worker: SearchWorker (separate thread for indexing)
 * - Hydration: Parallel fetch via Promise.all with error isolation
 * - Request tracking: Map<requestId, resolver> for async coordination
 * - Storage: localStorage via StorageUtils wrapper
 * 
 * @performance
 * - Indexing: Off-thread via Web Worker (no UI blocking)
 * - Hydration: Parallel domain fetches (10 concurrent requests)
 * - Error isolation: Failed domains don't block successful ones
 * - Cache: Worker maintains index after initial hydration
 * - History: Limited to 10 recent searches
 * 
 * @security
 * - User context: Search respects DataService access controls
 * - XSS prevention: Search terms should be sanitized before display
 * - History: Stored in localStorage (non-sensitive search terms only)
 * - Worker sandbox: Web Worker isolated from main thread
 * 
 * @domains
 * - Cases: title, client, status
 * - Clients: name, industry
 * - Tasks: title, due date, assignee
 * - Evidence: title, type, tags
 * - Users: name, role, office
 * - Documents: title, type, author
 * - Docket: title, sequence number
 * - Motions: title, status, filing date
 * - Clauses: name, category, text
 * - Rules: code, name, type, jurisdiction
 * 
 * @usage
 * ```typescript
 * // Search across all domains
 * const results = await SearchService.search('contract dispute');
 * results.forEach(result => {
 *   console.log(`${result.type}: ${result.title}`);
 *   console.log(`  ${result.subtitle}`);
 * });
 * 
 * // Save search to history
 * SearchService.saveHistory('contract dispute');
 * 
 * // Get recent searches
 * const history = SearchService.getHistory();
 * console.log(`Last 10 searches:`, history);
 * ```
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';
import { SearchWorker } from './searchWorker';

// Utils & Constants
import { StorageUtils } from '@/utils/storage';

// Types
import { Case, Client, WorkflowTask, EvidenceItem, User, LegalDocument, DocketEntry, Motion, Clause, LegalRule } from '@/types';
import { ValidationError } from '@/services/core/errors';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Search result type discriminator
 * Represents the domain of the search result
 */
export type SearchResultType = 'case' | 'document' | 'client' | 'task' | 'evidence' | 'user' | 'docket' | 'motion' | 'clause' | 'rule';

/**
 * Normalized search result
 * Unified structure for all domain types
 */
export interface GlobalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  data: unknown;
  score?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * LocalStorage key for search history
 */
const HISTORY_KEY = 'lexiflow_search_history';

/**
 * Maximum history entries to retain
 */
const MAX_HISTORY_SIZE = 10;

// ============================================================================
// VALIDATION (Private)
// ============================================================================

/**
 * Validate search query
 * @private
 */
function validateQuery(query: string, methodName: string): void {

  if (query.trim().length === 0) {
    throw new ValidationError(`[SearchService.${methodName}] Query cannot be empty`);
  }
}

/**
 * Validate search term for history
 * @private
 */
function validateHistoryTerm(term: string): boolean {
  return true && term.trim().length > 0;
}

// ============================================================================
// SEARCH ENGINE CLASS
// ============================================================================

/**
 * GlobalSearchEngine
 * Manages Web Worker singleton for off-thread search indexing
 */
class GlobalSearchEngine {
    private worker: Worker;
    private requestId = 0;
    private isHydrated = false;
    private hydrationPromise: Promise<void> | null = null;
    private pendingRequests = new Map<number, (results: GlobalSearchResult[]) => void>();

    constructor() {
        this.worker = SearchWorker.create();
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        console.log('[GlobalSearchEngine] Worker initialized');
    }

    /**
     * Handle message from search worker
     * Resolves pending search request
     * @private
     */
    private handleWorkerMessage(e: MessageEvent): void {
        try {
            const { results, requestId } = e.data;
            const resolver = this.pendingRequests.get(requestId);
            if (resolver) {
                resolver(results);
                this.pendingRequests.delete(requestId);
                console.debug(`[GlobalSearchEngine] Request ${requestId} completed (${results.length} results)`);
            }
        } catch (error) {
            console.error('[GlobalSearchEngine.handleWorkerMessage] Error:', error);
        }
    }

    /**
     * Hydrate search index with data from all domains
     * Uses Promise.all with error isolation for graceful degradation
     * @private
     */
    private async hydrate(): Promise<void> {
        if (this.isHydrated) return;
        if (this.hydrationPromise) return this.hydrationPromise;

        this.hydrationPromise = (async () => {
            try {
                console.log('[GlobalSearchEngine] Starting hydration...');
                const startTime = performance.now();

                // Fetch all data domains in parallel with error isolation
                const [cases, clients, tasks, evidence, users, docs, docket, motions, clauses, rules] = await Promise.all([
                    DataService.cases.getAll().catch((err: unknown) => { console.warn('Cases fetch failed:', err); return []; }),
                    DataService.clients.getAll().catch((err: unknown) => { console.warn('Clients fetch failed:', err); return []; }),
                    DataService.tasks.getAll().catch((err: unknown) => { console.warn('Tasks fetch failed:', err); return []; }),
                    DataService.evidence.getAll().catch((err: unknown) => { console.warn('Evidence fetch failed:', err); return []; }),
                    DataService.users.getAll().catch((err: unknown) => { console.warn('Users fetch failed:', err); return []; }),
                    DataService.documents.getAll().catch((err: unknown) => { console.warn('Documents fetch failed:', err); return []; }),
                    DataService.docket.getAll().catch((err: unknown) => { console.warn('Docket fetch failed:', err); return []; }),
                    DataService.motions.getAll().catch((err: unknown) => { console.warn('Motions fetch failed:', err); return []; }),
                    DataService.clauses.getAll().catch((err: unknown) => { console.warn('Clauses fetch failed:', err); return []; }),
                    DataService.rules.getAll().catch((err: unknown) => { console.warn('Rules fetch failed:', err); return []; })
                ]);

                // Normalize data into flat search objects
                const searchItems: GlobalSearchResult[] = [
                    ...cases.map((c: Case) => ({ id: c.id, type: 'case' as const, title: c.title, subtitle: `${c.id} • ${c.client}`, data: c })),
                    ...clients.map((c: Client) => ({ id: c.id, type: 'client' as const, title: c.name, subtitle: `Client • ${c.industry}`, data: c })),
                    ...tasks.map((t: WorkflowTask) => ({ id: t.id, type: 'task' as const, title: t.title, subtitle: `Task • Due: ${t.dueDate}`, data: t })),
                    ...evidence.map((e: EvidenceItem) => ({ id: e.id, type: 'evidence' as const, title: e.title, subtitle: `Evidence • ${e.type}`, data: e })),
                    ...users.map((u: User) => ({ id: u.id, type: 'user' as const, title: u.name, subtitle: `${u.role} • ${u.office}`, data: u })),
                    ...docs.map((d: LegalDocument) => ({ id: d.id, type: 'document' as const, title: d.title, subtitle: `Doc • ${d.type}`, data: d })),
                    ...docket.map((d: DocketEntry) => ({ id: d.id, type: 'docket' as const, title: d.title, subtitle: `Docket #${d.sequenceNumber}`, data: d })),
                    ...motions.map((m: Motion) => ({ id: m.id, type: 'motion' as const, title: m.title, subtitle: `Motion • ${m.status}`, data: m })),
                    ...clauses.map((c: Clause) => ({ id: c.id, type: 'clause' as const, title: c.name, subtitle: `Clause • ${c.category}`, data: c })),
                    ...rules.map((r: LegalRule) => ({ id: r.id, type: 'rule' as const, title: `${r.code} - ${r.name}`, subtitle: `Rule • ${r.type}`, data: r }))
                ];

                // Send to worker for indexing
                this.worker.postMessage({
                    type: 'UPDATE',
                    payload: {
                        items: searchItems,
                        fields: ['title', 'subtitle', 'type'] // Fields to scan
                    }
                });

                const duration = performance.now() - startTime;
                console.log(`[GlobalSearchEngine] Hydration complete: ${searchItems.length} items indexed in ${duration.toFixed(2)}ms`);
                
                this.isHydrated = true;
            } catch (error) {
                console.error('[GlobalSearchEngine.hydrate] Fatal error:', error);
                throw error;
            }
        })();

        return this.hydrationPromise;
    }

    /**
     * Execute search query against indexed data
     * 
     * @param query - Search query string
     * @returns Promise<GlobalSearchResult[]> - Matching results
     * @throws Error if validation fails
     */
    async search(query: string): Promise<GlobalSearchResult[]> {
        validateQuery(query, 'search');
        
        try {
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
                
                console.debug(`[GlobalSearchEngine] Search request ${reqId}: "${query}"`);
            });
        } catch (error) {
            console.error('[GlobalSearchEngine.search] Error:', error);
            throw error;
        }
    }

    /**
     * Get hydration status
     * 
     * @returns boolean - True if index is hydrated
     */
    isReady(): boolean {
        return this.isHydrated;
    }
}

// Singleton search engine instance
const engine = new GlobalSearchEngine();

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * SearchService
 * Public API for global search operations
 */
export const SearchService = {
    /**
     * Search across all domains
     * 
     * @param query - Search query string
     * @returns Promise<GlobalSearchResult[]> - Matching results sorted by relevance
     * @throws Error if query is invalid
     * 
     * @example
     * const results = await SearchService.search('contract');
     */
    search: (query: string): Promise<GlobalSearchResult[]> => {
        return engine.search(query);
    },

    /**
     * Save search term to history
     * Maintains last 10 unique searches
     * 
     * @param term - Search term to save
     * 
     * @example
     * SearchService.saveHistory('contract dispute');
     */
    saveHistory(term: string): void {
        if (!validateHistoryTerm(term)) return;
        
        try {
            const history = StorageUtils.get<string[]>(HISTORY_KEY, []);
            const newHistory = [term, ...history.filter(h => h !== term)].slice(0, MAX_HISTORY_SIZE);
            StorageUtils.set(HISTORY_KEY, newHistory);
            console.debug(`[SearchService] Saved to history: "${term}"`);
        } catch (error) {
            console.error('[SearchService.saveHistory] Error:', error);
        }
    },

    /**
     * Get search history
     * Returns up to 10 most recent searches
     * 
     * @returns string[] - Recent search terms (newest first)
     * 
     * @example
     * const history = SearchService.getHistory();
     */
    getHistory(): string[] {
        try {
            return StorageUtils.get<string[]>(HISTORY_KEY, []);
        } catch (error) {
            console.error('[SearchService.getHistory] Error:', error);
            return [];
        }
    },

        /**
         * Check if search index is ready
         * 
         * @returns boolean - True if hydrated and ready to search
         */
        isReady(): boolean {
            return engine.isReady();
        }
    };
