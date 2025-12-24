/**
 * Risk Repository
 * Enterprise-grade repository for risk management with backend API integration
 */

import { Risk } from '@/types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';
import { IntegrationOrchestrator } from '@/services/integration/integrationOrchestrator';
import { SystemEventType } from '@/types/integration-types';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';
import { RisksApiService } from '@/api/risks-api';

export const RISK_QUERY_KEYS = {
    all: () => ['risks'] as const,
    byId: (id: string) => ['risks', id] as const,
    byCase: (caseId: string) => ['risks', 'case', caseId] as const,
    byImpact: (impact: string) => ['risks', 'impact', impact] as const,
    byProbability: (probability: string) => ['risks', 'probability', probability] as const,
} as const;

export class RiskRepository extends Repository<Risk> {
    private useBackend: boolean;
    private risksApi: RisksApiService;

    constructor() {
        super(STORES.RISKS);
        this.useBackend = isBackendApiEnabled();
        this.risksApi = new RisksApiService();
        console.log(`[RiskRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error(`[RiskRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async getAll(): Promise<Risk[]> {
        if (this.useBackend) {
            try {
                return await this.risksApi.getAll() as any;
            } catch (error) {
                console.warn('[RiskRepository] Backend API unavailable', error);
            }
        }
        return await super.getAll();
    }

    async getByCaseId(caseId: string): Promise<Risk[]> {
        this.validateId(caseId, 'getByCaseId');
        if (this.useBackend) {
            try {
                return await this.risksApi.getByCaseId(caseId) as any;
            } catch (error) {
                console.warn('[RiskRepository] Backend API unavailable', error);
            }
        }
        return await this.getByIndex('caseId', caseId);
    }

    override async getById(id: string): Promise<Risk | undefined> {
        this.validateId(id, 'getById');
        if (this.useBackend) {
            try {
                return await this.risksApi.getById(id) as any;
            } catch (error) {
                console.warn('[RiskRepository] Backend API unavailable', error);
            }
        }
        return await super.getById(id);
    }

    async add(item: Risk): Promise<Risk> {
        if (!item || typeof item !== 'object') {
            throw new Error('[RiskRepository.add] Invalid risk data');
        }

        let result: Risk;
        if (this.useBackend) {
            try {
                result = await this.risksApi.create(item as any) as any;
            } catch (error) {
                console.warn('[RiskRepository] Backend API unavailable', error);
                await super.add(item);
                result = item;
            }
        } else {
            await super.add(item);
            result = item;
        }

        if (result.impact === 'High' && result.probability === 'High') {
            try {
                await IntegrationOrchestrator.publish(SystemEventType.RISK_ESCALATED, { risk: result });
            } catch (eventError) {
                console.warn('[RiskRepository] Failed to publish escalation event', eventError);
            }
        }
        return result;
    }

    override async update(id: string, updates: Partial<Risk>): Promise<Risk> {
        this.validateId(id, 'update');
        if (this.useBackend) {
            try {
                return await this.risksApi.update(id, updates) as any;
            } catch (error) {
                console.warn('[RiskRepository] Backend API unavailable', error);
            }
        }
        return await super.update(id, updates);
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        if (this.useBackend) {
            try {
                await this.risksApi.delete(id);
                return;
            } catch (error) {
                console.warn('[RiskRepository] Backend API unavailable', error);
            }
        }
        await super.delete(id);
    }

    async getByImpact(impact: string): Promise<Risk[]> {
        const risks = await this.getAll();
        return risks.filter(r => r.impact === impact);
    }

    async getByProbability(probability: string): Promise<Risk[]> {
        const risks = await this.getAll();
        return risks.filter(r => r.probability === probability);
    }

    async search(criteria: { caseId?: string; impact?: string; probability?: string; query?: string }): Promise<Risk[]> {
        let risks = await this.getAll();
        if (criteria.caseId) risks = risks.filter(r => r.caseId === criteria.caseId);
        if (criteria.impact) risks = risks.filter(r => r.impact === criteria.impact);
        if (criteria.probability) risks = risks.filter(r => r.probability === criteria.probability);
        if (criteria.query) {
            const lowerQuery = criteria.query.toLowerCase();
            risks = risks.filter(r =>
                r.title?.toLowerCase().includes(lowerQuery) ||
                r.description?.toLowerCase().includes(lowerQuery)
            );
        }
        return risks;
    }
}
