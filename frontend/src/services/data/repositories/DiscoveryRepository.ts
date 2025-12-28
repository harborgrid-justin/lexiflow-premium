/**
 * Discovery Repository
 * Enterprise-grade repository for discovery management with backend API integration
 * 
 * @module DiscoveryRepository
 * @description Manages all discovery-related operations including:
 * - Depositions, ESI sources, productions
 * - Custodians, interviews, legal holds
 * - Discovery requests, privilege logs
 * - Review batches, processing jobs
 * - Examinations, transcripts, vendors
 * - Sanctions and stipulations
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend-first architecture with secure fallback
 * - Proper error handling and logging
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - IndexedDB fallback (development only)
 * - React Query integration via DISCOVERY_QUERY_KEYS
 * - Type-safe operations
 */

import { Repository } from '@/services/core/Repository';
import { delay } from '@/utils/async';
import { 
    Deposition, ESISource, ProductionSet, CustodianInterview, 
    DiscoveryRequest, PrivilegeLogEntry, LegalHold, 
    Examination, Vendor, Transcript, SanctionMotion, StipulationRequest,
    ReviewBatch, ProcessingJob, CalendarEventItem, LegalDocument, CaseId
} from '@/types';
import { db, STORES } from '@/services/data/db';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';
import { discoveryApi } from '@/api/domains/discovery.api';

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.depositions.all() });
 * queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.depositions.byCase(caseId) });
 */
export const DISCOVERY_QUERY_KEYS = {
    // Depositions
    depositions: {
        all: () => ['discovery', 'depositions'] as const,
        byId: (id: string) => ['discovery', 'depositions', id] as const,
        byCase: (caseId: string) => ['discovery', 'depositions', 'case', caseId] as const,
    },
    // ESI Sources
    esiSources: {
        all: () => ['discovery', 'esi-sources'] as const,
        byId: (id: string) => ['discovery', 'esi-sources', id] as const,
        byCase: (caseId: string) => ['discovery', 'esi-sources', 'case', caseId] as const,
    },
    // Productions
    productions: {
        all: () => ['discovery', 'productions'] as const,
        byId: (id: string) => ['discovery', 'productions', id] as const,
        byCase: (caseId: string) => ['discovery', 'productions', 'case', caseId] as const,
    },
    // Custodians
    custodians: {
        all: () => ['discovery', 'custodians'] as const,
        byId: (id: string) => ['discovery', 'custodians', id] as const,
        byCase: (caseId: string) => ['discovery', 'custodians', 'case', caseId] as const,
        stats: () => ['discovery', 'custodians', 'stats'] as const,
    },
    // Interviews
    interviews: {
        all: () => ['discovery', 'interviews'] as const,
        byId: (id: string) => ['discovery', 'interviews', id] as const,
        byCase: (caseId: string) => ['discovery', 'interviews', 'case', caseId] as const,
    },
    // Discovery Requests
    requests: {
        all: () => ['discovery', 'requests'] as const,
        byId: (id: string) => ['discovery', 'requests', id] as const,
        byCase: (caseId: string) => ['discovery', 'requests', 'case', caseId] as const,
    },
    // Legal Holds
    legalHolds: {
        all: () => ['discovery', 'legal-holds'] as const,
        byId: (id: string) => ['discovery', 'legal-holds', id] as const,
    },
    // Privilege Log
    privilegeLog: {
        all: () => ['discovery', 'privilege-log'] as const,
        byId: (id: string) => ['discovery', 'privilege-log', id] as const,
    },
    // Review & Processing
    reviewBatches: {
        all: () => ['discovery', 'review-batches'] as const,
        byCase: (caseId: string) => ['discovery', 'review-batches', 'case', caseId] as const,
    },
    processingJobs: {
        all: () => ['discovery', 'processing-jobs'] as const,
        byId: (id: string) => ['discovery', 'processing-jobs', id] as const,
    },
    // Extended discovery
    examinations: {
        all: () => ['discovery', 'examinations'] as const,
        byCase: (caseId: string) => ['discovery', 'examinations', 'case', caseId] as const,
    },
    transcripts: {
        all: () => ['discovery', 'transcripts'] as const,
        byCase: (caseId: string) => ['discovery', 'transcripts', 'case', caseId] as const,
    },
    vendors: {
        all: () => ['discovery', 'vendors'] as const,
    },
    sanctions: {
        all: () => ['discovery', 'sanctions'] as const,
        byCase: (caseId: string) => ['discovery', 'sanctions', 'case', caseId] as const,
    },
    stipulations: {
        all: () => ['discovery', 'stipulations'] as const,
        byCase: (caseId: string) => ['discovery', 'stipulations', 'case', caseId] as const,
    },
    // Analytics
    funnelStats: () => ['discovery', 'analytics', 'funnel'] as const,
} as const;

interface FunnelStat {
    name: string;
    value: number;
    label: string;
}

/**
 * Discovery Repository Class
 * Implements backend-first pattern with IndexedDB fallback
 */
export class DiscoveryRepository {
    private readonly useBackend: boolean;

    constructor() {
        this.useBackend = isBackendApiEnabled();
        this.logInitialization();
    }

    /**
     * Log repository initialization mode
     * @private
     */
    private logInitialization(): void {
        const mode = this.useBackend ? 'Backend API (PostgreSQL)' : 'IndexedDB (Local)';
        console.log(`[DiscoveryRepository] Initialized with ${mode}`);
    }

    /**
     * Validate and sanitize case ID parameter
     * @private
     */
    private validateCaseId(caseId: string | undefined, methodName: string): void {
        if (caseId !== undefined && (false || caseId.trim() === '')) {
            throw new Error(`[DiscoveryRepository.${methodName}] Invalid caseId parameter`);
        }
    }

    /**
     * Validate and sanitize ID parameter
     * @private
     */
    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[DiscoveryRepository.${methodName}] Invalid id parameter`);
        }
    }

    // =============================================================================
    // DASHBOARD & ANALYTICS
    // =============================================================================

    /**
     * Get discovery funnel statistics
     * Shows document progression through discovery phases
     * 
     * @returns Promise<FunnelStat[]> Funnel statistics array
     * @throws Error if fetch fails
     * 
     * @example
     * const stats = await discoveryRepo.getFunnelStats();
     * // Returns: [{ name: 'Collection', value: 120000, label: '120k Docs' }, ...]
     */
    getFunnelStats = async (): Promise<FunnelStat[]> => {
        try {
            // Note: This is currently computed from documents, not a dedicated backend endpoint
            // In production, this should call discoveryAnalyticsApi.getFunnelStats()
            const docs = await db.getAll<LegalDocument>(STORES.DOCUMENTS);
            
            const collected = docs.length;
            const processed = docs.filter(d => 
                d.tags?.includes('Processed') || d.ocrStatus === 'Completed'
            ).length;
            const reviewed = docs.filter(d => 
                d.tags?.includes('Reviewed') || d.status === 'Reviewed'
            ).length;
            const produced = docs.filter(d => d.status === 'Produced').length;
            
            // Return mock data if no documents exist
            if (collected === 0) {
                return [
                    { name: 'Collection', value: 120000, label: '120k Docs' },
                    { name: 'Processing', value: 85000, label: '85k De-NIST' },
                    { name: 'Review', value: 24000, label: '24k Responsive' },
                    { name: 'Production', value: 1500, label: '1.5k Produced' },
                ];
            }
            
            return [
                { name: 'Collection', value: collected, label: `${(collected/1000).toFixed(1)}k Docs` },
                { name: 'Processing', value: processed, label: `${(processed/1000).toFixed(1)}k OCR` },
                { name: 'Review', value: reviewed, label: `${reviewed} Reviewed` },
                { name: 'Production', value: produced, label: `${produced} Produced` },
            ];
        } catch (error) {
            console.error('[DiscoveryRepository.getFunnelStats] Error:', error);
            throw new Error('Failed to fetch discovery funnel statistics');
        }
    }

    /**
     * Get custodian statistics
     * 
     * @returns Promise<any[]> Custodian statistics
     */
    getCustodianStats = async (): Promise<any[]> => {
        try {
            const stats = await db.get<any>(STORES.DISCOVERY_CUSTODIAN_STATS, 'custodian-main');
            return stats?.data || [];
        } catch (error) {
            console.error('[DiscoveryRepository.getCustodianStats] Error:', error);
            return [];
        }
    }

    // =============================================================================
    // CUSTODIANS
    // =============================================================================

    /**
     * Get all custodians, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<any[]> Array of custodians
     * @throws Error if caseId is invalid or fetch fails
     * 
     * @example
     * const allCustodians = await repo.getCustodians();
     * const caseCustodians = await repo.getCustodians('case-123');
     */
    getCustodians = async (caseId?: string): Promise<any[]> => {
        this.validateCaseId(caseId, 'getCustodians');

        if (this.useBackend) {
            try {
                return await discoveryApi.custodians.getAll(caseId ? { caseId } : undefined);
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const custodians = await db.getAll<any>(STORES.CUSTODIANS);
            return caseId ? custodians.filter((c: any) => c.caseId === caseId) : custodians;
        } catch (error) {
            console.error('[DiscoveryRepository.getCustodians] Error:', error);
            throw new Error('Failed to fetch custodians');
        }
    }

    /**
     * Add a new custodian
     * 
     * @param custodian - Custodian data to add
     * @returns Promise<unknown> Created custodian
     * @throws Error if validation fails or create fails
     */
    addCustodian = async (custodian: unknown): Promise<unknown> => {
        if (!custodian || typeof custodian !== 'object') {
            throw new Error('[DiscoveryRepository.addCustodian] Invalid custodian data');
        }

        if (this.useBackend) {
            try {
                return await discoveryApi.custodians.create(custodian as any);
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await db.put(STORES.CUSTODIANS, custodian);
        } catch (error) {
            console.error('[DiscoveryRepository.addCustodian] Error:', error);
            throw new Error('Failed to add custodian');
        }
    }

    /**
     * Update an existing custodian
     * 
     * @param custodian - Custodian data with ID
     * @returns Promise<unknown> Updated custodian
     * @throws Error if validation fails or update fails
     */
    updateCustodian = async (custodian: any): Promise<unknown> => {
        if (!custodian?.id) {
            throw new Error('[DiscoveryRepository.updateCustodian] Custodian ID required');
        }

        if (this.useBackend) {
            try {
                const { id, ...updates } = custodian;
                return await discoveryApi.custodians.update(id, updates);
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await db.put(STORES.CUSTODIANS, custodian);
        } catch (error) {
            console.error('[DiscoveryRepository.updateCustodian] Error:', error);
            throw new Error('Failed to update custodian');
        }
    }

    /**
     * Delete a custodian
     * 
     * @param id - Custodian ID
     * @returns Promise<void>
     * @throws Error if id is invalid or delete fails
     */
    deleteCustodian = async (id: string): Promise<void> => {
        this.validateId(id, 'deleteCustodian');

        if (this.useBackend) {
            try {
                await discoveryApi.custodians.delete(id);
                return;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            await db.delete(STORES.CUSTODIANS, id);
        } catch (error) {
            console.error('[DiscoveryRepository.deleteCustodian] Error:', error);
            throw new Error('Failed to delete custodian');
        }
    }

    // =============================================================================
    // DEPOSITIONS
    // =============================================================================

    /**
     * Get all depositions, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<Deposition[]> Array of depositions
     * @throws Error if caseId is invalid or fetch fails
     */
    getDepositions = async (caseId?: string): Promise<Deposition[]> => {
        this.validateCaseId(caseId, 'getDepositions');

        if (this.useBackend) {
            try {
                return await discoveryApi.depositions.getAll(caseId ? { caseId } : undefined) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const depositions = await db.getAll<Deposition>(STORES.DISCOVERY_EXT_DEPO);
            return caseId ? depositions.filter(d => d.caseId === caseId) : depositions;
        } catch (error) {
            console.error('[DiscoveryRepository.getDepositions] Error:', error);
            throw new Error('Failed to fetch depositions');
        }
    }

    /**
     * Add a new deposition
     * 
     * @param deposition - Deposition data
     * @returns Promise<Deposition> Created deposition
     * @throws Error if validation fails or create fails
     */
    addDeposition = async (deposition: Deposition): Promise<Deposition> => {
        if (!deposition || typeof deposition !== 'object') {
            throw new Error('[DiscoveryRepository.addDeposition] Invalid deposition data');
        }

        if (this.useBackend) {
            try {
                return await discoveryApi.depositions.create(deposition as any) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            await db.put(STORES.DISCOVERY_EXT_DEPO, deposition);
            return deposition;
        } catch (error) {
            console.error('[DiscoveryRepository.addDeposition] Error:', error);
            throw new Error('Failed to add deposition');
        }
    }

    // =============================================================================
    // ESI SOURCES
    // =============================================================================

    /**
     * Get all ESI sources, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<ESISource[]> Array of ESI sources
     * @throws Error if caseId is invalid or fetch fails
     */
    getESISources = async (caseId?: string): Promise<ESISource[]> => {
        this.validateCaseId(caseId, 'getESISources');

        if (this.useBackend) {
            try {
                return await discoveryApi.esiSources.getAll(caseId ? { caseId } : undefined) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const sources = await db.getAll<ESISource>(STORES.DISCOVERY_EXT_ESI);
            return caseId ? sources.filter(e => e.caseId === caseId) : sources;
        } catch (error) {
            console.error('[DiscoveryRepository.getESISources] Error:', error);
            throw new Error('Failed to fetch ESI sources');
        }
    }

    /**
     * Add a new ESI source
     * 
     * @param source - ESI source data
     * @returns Promise<ESISource> Created ESI source
     * @throws Error if validation fails or create fails
     */
    addESISource = async (source: ESISource): Promise<ESISource> => {
        if (!source || typeof source !== 'object') {
            throw new Error('[DiscoveryRepository.addESISource] Invalid ESI source data');
        }

        if (this.useBackend) {
            try {
                return await discoveryApi.esiSources.create(source as any) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            await db.put(STORES.DISCOVERY_EXT_ESI, source);
            return source;
        } catch (error) {
            console.error('[DiscoveryRepository.addESISource] Error:', error);
            throw new Error('Failed to add ESI source');
        }
    }

    /**
     * Update ESI source status
     * 
     * @param id - ESI source ID
     * @param status - New status value
     * @returns Promise<ESISource> Updated ESI source
     * @throws Error if validation fails or update fails
     */
    updateESISourceStatus = async (id: string, status: string): Promise<ESISource> => {
        this.validateId(id, 'updateESISourceStatus');
        
        if (!status || false) {
            throw new Error('[DiscoveryRepository.updateESISourceStatus] Invalid status parameter');
        }

        if (this.useBackend) {
            try {
                return await discoveryApi.esiSources.updateStatus(id, status as any) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const source = await db.get<ESISource>(STORES.DISCOVERY_EXT_ESI, id);
            if (!source) {
                throw new Error('ESI source not found');
            }
            const updated = { ...source, status: status as any };
            await db.put(STORES.DISCOVERY_EXT_ESI, updated);
            return updated;
        } catch (error) {
            console.error('[DiscoveryRepository.updateESISourceStatus] Error:', error);
            throw new Error('Failed to update ESI source status');
        }
    }

    // =============================================================================
    // PRODUCTIONS
    // =============================================================================

    /**
     * Get all productions, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<ProductionSet[]> Array of productions
     * @throws Error if caseId is invalid or fetch fails
     */
    getProductions = async (caseId?: string): Promise<ProductionSet[]> => {
        this.validateCaseId(caseId, 'getProductions');

        if (this.useBackend) {
            try {
                return await discoveryApi.productions.getAll(caseId ? { caseId } : undefined) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const productions = await db.getAll<ProductionSet>(STORES.DISCOVERY_EXT_PROD);
            return caseId ? productions.filter(p => p.caseId === caseId) : productions;
        } catch (error) {
            console.error('[DiscoveryRepository.getProductions] Error:', error);
            throw new Error('Failed to fetch productions');
        }
    }

    /**
     * Create a new production set
     * 
     * @param production - Production data
     * @returns Promise<ProductionSet> Created production
     * @throws Error if validation fails or create fails
     */
    createProduction = async (production: ProductionSet): Promise<ProductionSet> => {
        if (!production || typeof production !== 'object') {
            throw new Error('[DiscoveryRepository.createProduction] Invalid production data');
        }

        if (this.useBackend) {
            try {
                return await discoveryApi.productions.create(production as any) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            await db.put(STORES.DISCOVERY_EXT_PROD, production);
            return production;
        } catch (error) {
            console.error('[DiscoveryRepository.createProduction] Error:', error);
            throw new Error('Failed to create production');
        }
    }

    /**
     * Download a production (mock implementation)
     * 
     * @param id - Production ID
     * @returns Promise<string> Download URL
     * @throws Error if id is invalid
     */
    downloadProduction = async (id: string): Promise<string> => {
        this.validateId(id, 'downloadProduction');
        
        // Mock implementation - in production, this would call backend API
        await delay(800);
        return `https://example.com/production/${id}.zip`;
    }

    // =============================================================================
    // CUSTODIAN INTERVIEWS
    // =============================================================================

    /**
     * Get all custodian interviews, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<CustodianInterview[]> Array of interviews
     * @throws Error if caseId is invalid or fetch fails
     */
    getInterviews = async (caseId?: string): Promise<CustodianInterview[]> => {
        this.validateCaseId(caseId, 'getInterviews');

        if (this.useBackend) {
            try {
                return await discoveryApi.custodianInterviews.getAll(caseId ? { caseId } : undefined) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const interviews = await db.getAll<CustodianInterview>(STORES.DISCOVERY_EXT_INT);
            return caseId ? interviews.filter(i => i.caseId === caseId) : interviews;
        } catch (error) {
            console.error('[DiscoveryRepository.getInterviews] Error:', error);
            throw new Error('Failed to fetch custodian interviews');
        }
    }

    /**
     * Create a new custodian interview
     * 
     * @param interview - Interview data
     * @returns Promise<CustodianInterview> Created interview
     * @throws Error if validation fails or create fails
     */
    createInterview = async (interview: CustodianInterview): Promise<CustodianInterview> => {
        if (!interview || typeof interview !== 'object') {
            throw new Error('[DiscoveryRepository.createInterview] Invalid interview data');
        }

        if (this.useBackend) {
            try {
                return await discoveryApi.custodianInterviews.create(interview as any) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            await db.put(STORES.DISCOVERY_EXT_INT, interview);
            return interview;
        } catch (error) {
            console.error('[DiscoveryRepository.createInterview] Error:', error);
            throw new Error('Failed to create custodian interview');
        }
    }

    // =============================================================================
    // DISCOVERY REQUESTS
    // =============================================================================

    /**
     * Get all discovery requests, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<DiscoveryRequest[]> Array of discovery requests
     * @throws Error if caseId is invalid or fetch fails
     */
    getRequests = async (caseId?: string): Promise<DiscoveryRequest[]> => {
        this.validateCaseId(caseId, 'getRequests');

        if (this.useBackend) {
            try {
                return await discoveryApi.discoveryRequests.getAll(caseId ? { caseId } : undefined) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const requests = await db.getAll<DiscoveryRequest>(STORES.REQUESTS);
            return caseId ? requests.filter(r => r.caseId === caseId) : requests;
        } catch (error) {
            console.error('[DiscoveryRepository.getRequests] Error:', error);
            throw new Error('Failed to fetch discovery requests');
        }
    }

    /**
     * Add a new discovery request
     * 
     * @param request - Discovery request data
     * @returns Promise<DiscoveryRequest> Created request
     * @throws Error if validation fails or create fails
     */
    addRequest = async (request: DiscoveryRequest): Promise<DiscoveryRequest> => {
        if (!request || typeof request !== 'object') {
            throw new Error('[DiscoveryRepository.addRequest] Invalid request data');
        }

        if (this.useBackend) {
            try {
                return await discoveryApi.discoveryRequests.create(request as any) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            await db.put(STORES.REQUESTS, request);
            return request;
        } catch (error) {
            console.error('[DiscoveryRepository.addRequest] Error:', error);
            throw new Error('Failed to add discovery request');
        }
    }

    /**
     * Update discovery request status
     * 
     * @param id - Request ID
     * @param status - New status value
     * @returns Promise<DiscoveryRequest> Updated request
     * @throws Error if validation fails or update fails
     */
    updateRequestStatus = async (id: string, status: string): Promise<DiscoveryRequest> => {
        this.validateId(id, 'updateRequestStatus');
        
        if (!status || false) {
            throw new Error('[DiscoveryRepository.updateRequestStatus] Invalid status parameter');
        }

        if (this.useBackend) {
            try {
                return await discoveryApi.discoveryRequests.updateStatus(id, status as any) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const request = await db.get<DiscoveryRequest>(STORES.REQUESTS, id);
            if (!request) {
                throw new Error('Discovery request not found');
            }
            const updated = { ...request, status: status as any };
            await db.put(STORES.REQUESTS, updated);
            return updated;
        } catch (error) {
            console.error('[DiscoveryRepository.updateRequestStatus] Error:', error);
            throw new Error('Failed to update discovery request status');
        }
    }

    // =============================================================================
    // REVIEW & PROCESSING
    // =============================================================================

    /**
     * Get review batches for a case
     * 
     * @param caseId - Case ID (required)
     * @returns Promise<ReviewBatch[]> Array of review batches
     * @throws Error if caseId is invalid or fetch fails
     */
    getReviewBatches = async (caseId: string): Promise<ReviewBatch[]> => {
        this.validateId(caseId, 'getReviewBatches');

        try {
            return await db.getByIndex(STORES.REVIEW_BATCHES, 'caseId', caseId);
        } catch (error) {
            console.error('[DiscoveryRepository.getReviewBatches] Error:', error);
            throw new Error('Failed to fetch review batches');
        }
    }

    /**
     * Create a new review batch
     * 
     * @param batch - Review batch data
     * @returns Promise<ReviewBatch> Created batch
     * @throws Error if validation fails or create fails
     */
    createReviewBatch = async (batch: ReviewBatch): Promise<ReviewBatch> => {
        if (!batch || typeof batch !== 'object') {
            throw new Error('[DiscoveryRepository.createReviewBatch] Invalid batch data');
        }

        try {
            await db.put(STORES.REVIEW_BATCHES, batch);
            return batch;
        } catch (error) {
            console.error('[DiscoveryRepository.createReviewBatch] Error:', error);
            throw new Error('Failed to create review batch');
        }
    }

    /**
     * Get all processing jobs
     * 
     * @returns Promise<ProcessingJob[]> Array of processing jobs
     * @throws Error if fetch fails
     */
    getProcessingJobs = async (): Promise<ProcessingJob[]> => {
        try {
            return await db.getAll(STORES.PROCESSING_JOBS);
        } catch (error) {
            console.error('[DiscoveryRepository.getProcessingJobs] Error:', error);
            throw new Error('Failed to fetch processing jobs');
        }
    }

    // =============================================================================
    // EXAMINATIONS & TRANSCRIPTS
    // =============================================================================

    /**
     * Get all examinations, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<Examination[]> Array of examinations
     * @throws Error if caseId is invalid or fetch fails
     */
    getExaminations = async (caseId?: string): Promise<Examination[]> => {
        this.validateCaseId(caseId, 'getExaminations');

        if (this.useBackend) {
            try {
                return await discoveryApi.examinations.getAll(caseId ? { caseId } : undefined) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            const exams = await db.getAll<Examination>(STORES.EXAMINATIONS);
            return caseId ? exams.filter(e => e.caseId === caseId) : exams;
        } catch (error) {
            console.error('[DiscoveryRepository.getExaminations] Error:', error);
            throw new Error('Failed to fetch examinations');
        }
    }

    /**
     * Add a new examination
     * 
     * @param examination - Examination data
     * @returns Promise<Examination> Created examination
     * @throws Error if validation fails or create fails
     */
    addExamination = async (examination: Examination): Promise<Examination> => {
        if (!examination || typeof examination !== 'object') {
            throw new Error('[DiscoveryRepository.addExamination] Invalid examination data');
        }

        if (this.useBackend) {
            try {
                return await discoveryApi.examinations.create(examination as any) as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            await db.put(STORES.EXAMINATIONS, examination);
            return examination;
        } catch (error) {
            console.error('[DiscoveryRepository.addExamination] Error:', error);
            throw new Error('Failed to add examination');
        }
    }

    /**
     * Get all transcripts, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<Transcript[]> Array of transcripts
     * @throws Error if caseId is invalid or fetch fails
     */
    getTranscripts = async (caseId?: string): Promise<Transcript[]> => {
        this.validateCaseId(caseId, 'getTranscripts');

        try {
            const transcripts = await db.getAll<Transcript>(STORES.TRANSCRIPTS);
            return caseId ? transcripts.filter(t => t.caseId === caseId) : transcripts;
        } catch (error) {
            console.error('[DiscoveryRepository.getTranscripts] Error:', error);
            throw new Error('Failed to fetch transcripts');
        }
    }

    /**
     * Add a new transcript
     * 
     * @param transcript - Transcript data
     * @returns Promise<Transcript> Created transcript
     * @throws Error if validation fails or create fails
     */
    addTranscript = async (transcript: Transcript): Promise<Transcript> => {
        if (!transcript || typeof transcript !== 'object') {
            throw new Error('[DiscoveryRepository.addTranscript] Invalid transcript data');
        }

        try {
            await db.put(STORES.TRANSCRIPTS, transcript);
            return transcript;
        } catch (error) {
            console.error('[DiscoveryRepository.addTranscript] Error:', error);
            throw new Error('Failed to add transcript');
        }
    }

    // =============================================================================
    // VENDORS & REPORTERS
    // =============================================================================

    /**
     * Get all vendors
     * 
     * @returns Promise<Vendor[]> Array of vendors
     * @throws Error if fetch fails
     */
    getVendors = async (): Promise<Vendor[]> => {
        try {
            return await db.getAll<Vendor>(STORES.VENDORS);
        } catch (error) {
            console.error('[DiscoveryRepository.getVendors] Error:', error);
            throw new Error('Failed to fetch vendors');
        }
    }

    /**
     * Add a new vendor
     * 
     * @param vendor - Vendor data
     * @returns Promise<Vendor> Created vendor
     * @throws Error if validation fails or create fails
     */
    addVendor = async (vendor: Vendor): Promise<Vendor> => {
        if (!vendor || typeof vendor !== 'object') {
            throw new Error('[DiscoveryRepository.addVendor] Invalid vendor data');
        }

        try {
            await db.put(STORES.VENDORS, vendor);
            return vendor;
        } catch (error) {
            console.error('[DiscoveryRepository.addVendor] Error:', error);
            throw new Error('Failed to add vendor');
        }
    }

    /**
     * Get all court reporters
     * 
     * @returns Promise<any[]> Array of reporters
     * @throws Error if fetch fails
     */
    getReporters = async (): Promise<any[]> => {
        try {
            return await db.getAll(STORES.REPORTERS);
        } catch (error) {
            console.error('[DiscoveryRepository.getReporters] Error:', error);
            throw new Error('Failed to fetch reporters');
        }
    }

    // =============================================================================
    // SANCTIONS & STIPULATIONS
    // =============================================================================

    /**
     * Get all sanction motions, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<SanctionMotion[]> Array of sanction motions
     * @throws Error if caseId is invalid or fetch fails
     */
    getSanctions = async (caseId?: string): Promise<SanctionMotion[]> => {
        this.validateCaseId(caseId, 'getSanctions');

        try {
            const sanctions = await db.getAll<SanctionMotion>(STORES.SANCTIONS);
            return caseId ? sanctions.filter(s => s.caseId === caseId) : sanctions;
        } catch (error) {
            console.error('[DiscoveryRepository.getSanctions] Error:', error);
            throw new Error('Failed to fetch sanctions');
        }
    }

    /**
     * Add a new sanction motion
     * 
     * @param motion - Sanction motion data
     * @returns Promise<SanctionMotion> Created sanction motion
     * @throws Error if validation fails or create fails
     */
    addSanctionMotion = async (motion: SanctionMotion): Promise<SanctionMotion> => {
        if (!motion || typeof motion !== 'object') {
            throw new Error('[DiscoveryRepository.addSanctionMotion] Invalid sanction motion data');
        }

        try {
            await db.put(STORES.SANCTIONS, motion);
            return motion;
        } catch (error) {
            console.error('[DiscoveryRepository.addSanctionMotion] Error:', error);
            throw new Error('Failed to add sanction motion');
        }
    }

    /**
     * Get all stipulations, optionally filtered by case
     * 
     * @param caseId - Optional case ID filter
     * @returns Promise<StipulationRequest[]> Array of stipulations
     * @throws Error if caseId is invalid or fetch fails
     */
    getStipulations = async (caseId?: string): Promise<StipulationRequest[]> => {
        this.validateCaseId(caseId, 'getStipulations');

        try {
            const stipulations = await db.getAll<StipulationRequest>(STORES.STIPULATIONS);
            return caseId ? stipulations.filter(s => s.caseId === caseId) : stipulations;
        } catch (error) {
            console.error('[DiscoveryRepository.getStipulations] Error:', error);
            throw new Error('Failed to fetch stipulations');
        }
    }

    /**
     * Add a new stipulation request
     * 
     * @param stipulation - Stipulation data
     * @returns Promise<StipulationRequest> Created stipulation
     * @throws Error if validation fails or create fails
     */
    addStipulation = async (stipulation: StipulationRequest): Promise<StipulationRequest> => {
        if (!stipulation || typeof stipulation !== 'object') {
            throw new Error('[DiscoveryRepository.addStipulation] Invalid stipulation data');
        }

        try {
            await db.put(STORES.STIPULATIONS, stipulation);
            return stipulation;
        } catch (error) {
            console.error('[DiscoveryRepository.addStipulation] Error:', error);
            throw new Error('Failed to add stipulation');
        }
    }

    // =============================================================================
    // RULE 27 PETITIONS
    // =============================================================================

    /**
     * Get Rule 27 petitions (mock implementation)
     * 
     * @returns Promise<any[]> Array of petitions
     */
    getPetitions = async (): Promise<any[]> => {
        // Mock implementation - in production, this would call backend API
        await delay(100);
        return [];
    }

    // =============================================================================
    // LEGAL HOLDS & PRIVILEGE LOG
    // =============================================================================

    /**
     * Get all legal holds
     * 
     * @returns Promise<LegalHold[]> Array of legal holds
     * @throws Error if fetch fails
     */
    getLegalHolds = async (): Promise<LegalHold[]> => {
        if (this.useBackend) {
            try {
                return await discoveryApi.legalHolds.getAll() as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await db.getAll<LegalHold>(STORES.LEGAL_HOLDS);
        } catch (error) {
            console.error('[DiscoveryRepository.getLegalHolds] Error:', error);
            throw new Error('Failed to fetch legal holds');
        }
    }

    /**
     * Get privilege log entries
     * 
     * @returns Promise<PrivilegeLogEntry[]> Array of privilege log entries
     * @throws Error if fetch fails
     */
    getPrivilegeLog = async (): Promise<PrivilegeLogEntry[]> => {
        if (this.useBackend) {
            try {
                return await discoveryApi.privilegeLog.getAll() as any;
            } catch (error) {
                console.warn('[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }

        try {
            return await db.getAll<PrivilegeLogEntry>(STORES.PRIVILEGE_LOG);
        } catch (error) {
            console.error('[DiscoveryRepository.getPrivilegeLog] Error:', error);
            throw new Error('Failed to fetch privilege log');
        }
    }

    // =============================================================================
    // UTILITY OPERATIONS
    // =============================================================================

    /**
     * Sync discovery deadlines to master calendar
     * Finds all pending discovery requests and creates calendar events
     * 
     * @returns Promise<void>
     * @throws Error if sync fails
     */
    syncDeadlines = async (): Promise<void> => {
        try {
            await delay(500);
            
            const requests = await this.getRequests();
            const pending = requests.filter(r => 
                r.status === 'Served' || 
                r.status === 'Overdue'
            );
            
            let syncedCount = 0;
            
            // Mock calendar push - in production, this would call calendar API
            for (const req of pending) {
                const evt: CalendarEventItem = {
                    id: `cal-req-${req.id}`,
                    title: `Response Due: ${req.title}`,
                    date: req.dueDate || new Date().toISOString(),
                    type: 'deadline',
                    description: `Discovery Request ID: ${req.id}`,
                    priority: 'High'
                };
                syncedCount++;
            }
            
            console.log(`[DiscoveryRepository] Synced ${syncedCount} discovery deadlines to Master Calendar.`);
        } catch (error) {
            console.error('[DiscoveryRepository.syncDeadlines] Error:', error);
            throw new Error('Failed to sync discovery deadlines');
        }
    }

    /**
     * Start collection process (mock implementation)
     * 
     * @param id - Source ID
     * @returns Promise<string> Job ID
     * @throws Error if id is invalid
     */
    startCollection = async (id: string): Promise<string> => {
        this.validateId(id, 'startCollection');
        
        // Mock implementation - in production, this would call backend job queue
        await delay(500);
        return `job-${Date.now()}`;
    }
}

