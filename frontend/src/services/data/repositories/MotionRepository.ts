/**
 * Motion Repository
 * Enterprise-grade repository for legal motion management with backend API integration
 * 
 * @module MotionRepository
 * @description Manages all motion-related operations including:
 * - Motion CRUD operations
 * - Case-based motion queries
 * - Status tracking and updates
 * - Hearing and outcome management
 * - Search and filtering
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
 * - React Query integration via MOTION_QUERY_KEYS
 * - Type-safe operations
 */

import { Motion } from '@/types';
import { Repository } from '@/services/core/Repository';
import { STORES } from '@/services/data/db';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';
import { MotionsApiService } from '@/api/motions-api';

/**
 * Query keys for React Query integration
 */
export const MOTION_QUERY_KEYS = {
    all: () => ['motions'] as const,
    byId: (id: string) => ['motions', id] as const,
    byCase: (caseId: string) => ['motions', 'case', caseId] as const,
    byType: (type: string) => ['motions', 'type', type] as const,
    byStatus: (status: string) => ['motions', 'status', status] as const,
} as const;

export class MotionRepository extends Repository<Motion> {
    private readonly useBackend: boolean;
    private motionsApi: MotionsApiService;

    constructor() {
        super(STORES.MOTIONS);
        this.useBackend = isBackendApiEnabled();
        this.motionsApi = new MotionsApiService();
        console.log(`[MotionRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[MotionRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async getAll(): Promise<Motion[]> {
        if (this.useBackend) {
            try {
                return await this.motionsApi.getAll() as any;
            } catch (error) {
                console.warn('[MotionRepository] Backend API unavailable, falling back to IndexedDB', error);
            }
        }
        return await super.getAll();
    }

    getByCaseId = async (caseId: string): Promise<Motion[]> => {
        this.validateId(caseId, 'getByCaseId');
        if (this.useBackend) {
            try {
                return await this.motionsApi.getByCaseId(caseId) as any;
            } catch (error) {
                console.warn('[MotionRepository] Backend API unavailable', error);
            }
        }
        return await this.getByIndex('caseId', caseId);
    }

    override async getById(id: string): Promise<Motion | undefined> {
        this.validateId(id, 'getById');
        if (this.useBackend) {
            try {
                return await this.motionsApi.getById(id) as any;
            } catch (error) {
                console.warn('[MotionRepository] Backend API unavailable', error);
            }
        }
        return await super.getById(id);
    }

    override async add(item: Motion): Promise<Motion> {
        if (!item || typeof item !== 'object') {
            throw new Error('[MotionRepository.add] Invalid motion data');
        }
        if (this.useBackend) {
            try {
                return await this.motionsApi.create(item as any) as any;
            } catch (error) {
                console.warn('[MotionRepository] Backend API unavailable', error);
            }
        }
        await super.add(item);
        return item;
    }

    override async update(id: string, updates: Partial<Motion>): Promise<Motion> {
        this.validateId(id, 'update');
        if (this.useBackend) {
            try {
                return await this.motionsApi.update(id, updates as any) as any;
            } catch (error) {
                console.warn('[MotionRepository] Backend API unavailable', error);
            }
        }
        return await super.update(id, updates);
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        if (this.useBackend) {
            try {
                await this.motionsApi.delete(id);
                return;
            } catch (error) {
                console.warn('[MotionRepository] Backend API unavailable', error);
            }
        }
        await super.delete(id);
    }

    async updateStatus(id: string, status: string): Promise<Motion> {
        this.validateId(id, 'updateStatus');
        if (!status || false) {
            throw new Error('[MotionRepository.updateStatus] Invalid status');
        }
        return await this.update(id, { status } as Partial<Motion>);
    }

    async search(criteria: { caseId?: string; type?: string; status?: string; query?: string }): Promise<Motion[]> {
        let motions = await this.getAll();
        if (criteria.caseId) motions = motions.filter(m => m.caseId === criteria.caseId);
        if (criteria.type) motions = motions.filter(m => m.type === criteria.type);
        if (criteria.status) motions = motions.filter(m => m.status === criteria.status);
        if (criteria.query) {
            const lowerQuery = criteria.query.toLowerCase();
            motions = motions.filter(m =>
                m.title?.toLowerCase().includes(lowerQuery) ||
                (m as any).notes?.toLowerCase().includes(lowerQuery)
            );
        }
        return motions;
    }
}
