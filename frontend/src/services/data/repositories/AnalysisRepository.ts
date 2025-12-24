/**
 * Analysis Repository
 * Enterprise-grade repository for legal analysis management with backend API integration
 */

import { BriefAnalysisSession, JudgeProfile } from '../../../types';
import { delay } from '@/utils/async';
import { Repository } from '../../core/Repository';
import { STORES, db } from '../db';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';

export const ANALYSIS_QUERY_KEYS = {
    all: () => ['analysis'] as const,
    byId: (id: string) => ['analysis', id] as const,
    judges: () => ['analysis', 'judges'] as const,
    counsel: () => ['analysis', 'counsel'] as const,
    predictions: () => ['analysis', 'predictions'] as const,
} as const;

export class AnalysisRepository extends Repository<BriefAnalysisSession> {
    private useBackend: boolean;

    constructor() {
        super(STORES.ANALYSIS);
        this.useBackend = isBackendApiEnabled();
        console.log(`[AnalysisRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error(`[AnalysisRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async getAll(): Promise<BriefAnalysisSession[]> {
        return await super.getAll();
    }

    override async getById(id: string): Promise<BriefAnalysisSession | undefined> {
        this.validateId(id, 'getById');
        return await super.getById(id);
    }

    override async add(item: BriefAnalysisSession): Promise<BriefAnalysisSession> {
        if (!item || typeof item !== 'object') {
            throw new Error('[AnalysisRepository.add] Invalid analysis session data');
        }
        await super.add(item);
        return item;
    }

    override async update(id: string, updates: Partial<BriefAnalysisSession>): Promise<BriefAnalysisSession> {
        this.validateId(id, 'update');
        return await super.update(id, updates);
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        await super.delete(id);
    }
    
    async getJudgeProfiles(): Promise<JudgeProfile[]> {
        try {
            await delay(100);
            return await db.getAll<JudgeProfile>(STORES.JUDGES);
        } catch (error) {
            console.error('[AnalysisRepository.getJudgeProfiles] Error:', error);
            return [];
        }
    }
    
    async getCounselProfiles(): Promise<any[]> {
        try {
            await delay(100);
            // Return empty array - this would typically fetch from a COUNSEL_PROFILES store
            return [];
        } catch (error) {
            console.error('[AnalysisRepository.getCounselProfiles] Error:', error);
            return [];
        }
    }
    
    async getPredictionData(): Promise<any[]> {
        try {
            await delay(100);
            // Return empty array - this would typically fetch from a PREDICTIONS store
            return [];
        } catch (error) {
            console.error('[AnalysisRepository.getPredictionData] Error:', error);
            return [];
        }
    }

    async search(query: string): Promise<BriefAnalysisSession[]> {
        if (!query) return [];
        const sessions = await this.getAll();
        const lowerQuery = query.toLowerCase();
        return sessions.filter(s =>
            s.title?.toLowerCase().includes(lowerQuery) ||
            s.caseId?.toLowerCase().includes(lowerQuery)
        );
    }
}


