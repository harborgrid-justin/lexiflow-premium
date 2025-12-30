/**
 * Entity Repository
 * Enterprise-grade repository for legal entity management with backend API integration
 */

import { LegalEntity } from '@/types';
import { Repository } from '@/services/core/Repository';
import { ValidationError } from '@/services/core/errors';
import { STORES } from '@/services/data/db';
import { IntegrationEventPublisher } from '@/services/data/integration/IntegrationEventPublisher';
import { SystemEventType } from '@/types/integration-types';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';
import { LegalEntitiesApiService } from '@/api/domains/legal-entities.api';

export const ENTITY_QUERY_KEYS = {
    all: () => ['entities'] as const,
    byId: (id: string) => ['entities', id] as const,
    byType: (type: string) => ['entities', 'type', type] as const,
    relationships: (id: string) => ['entities', id, 'relationships'] as const,
} as const;

export class EntityRepository extends Repository<LegalEntity> {
    private readonly useBackend: boolean;
    private legalEntitiesApi: LegalEntitiesApiService;

    constructor() {
        super(STORES.ENTITIES);
        this.useBackend = isBackendApiEnabled();
        this.legalEntitiesApi = new LegalEntitiesApiService();
        console.log(`[EntityRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[EntityRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async getAll(): Promise<LegalEntity[]> {
        if (this.useBackend) {
            try {
                const entities = await this.legalEntitiesApi.getAll();
                // Transform API format to frontend format
                return entities.map(e => ({
                    ...e,
                    id: e.id as unknown as import('@/types').EntityId,
                    type: this.mapEntityType(e.entityType),
                    roles: [],
                    riskScore: 0,
                    tags: [],
                    status: 'Active'
                } as LegalEntity));
            } catch (error) {
                console.error('[EntityRepository] Backend API unavailable', error);
                return await super.getAll();
            }
        }
        return await super.getAll();
    }

    private mapEntityType(apiType: string): 'Individual' | 'Corporation' | 'Court' | 'Government' | 'Vendor' | 'Law Firm' {
        // Map API entity types to frontend EntityType values
        const typeMap: Record<string, 'Individual' | 'Corporation' | 'Court' | 'Government' | 'Vendor' | 'Law Firm'> = {
            'individual': 'Individual',
            'corporation': 'Corporation',
            'llc': 'Corporation',
            'partnership': 'Law Firm',
            'trust': 'Vendor',
            'estate': 'Vendor',
            'nonprofit': 'Vendor',
            'government': 'Government',
            'foreign_entity': 'Corporation',
            'other': 'Vendor'
        };
        return typeMap[apiType] || 'Vendor';
    }

    override async getById(id: string): Promise<LegalEntity | undefined> {
        this.validateId(id, 'getById');
        if (this.useBackend) {
            try {
                const entity = await this.legalEntitiesApi.getById(id);
                return {
                    ...entity,
                    id: entity.id as unknown as import('@/types').EntityId,
                    type: this.mapEntityType(entity.entityType),
                    roles: [],
                    riskScore: 0,
                    tags: [],
                    status: 'Active'
                } as LegalEntity;
            } catch (error) {
                console.error('[EntityRepository] Backend API unavailable', error);
                return await super.getById(id);
            }
        }
        return await super.getById(id);
    }
    
    async getRelationships(id: string): Promise<unknown[]> {
        this.validateId(id, 'getRelationships');
        if (this.useBackend && id !== 'all') {
            try {
                return await this.legalEntitiesApi.getRelationships(id);
            } catch (error) {
                console.error('[EntityRepository] Backend API unavailable', error);
                return [];
            }
        }
        // Mocked for now, in real app this would query a relationship table
        return [];
    }

    override async add(item: LegalEntity): Promise<LegalEntity> {
        if (!item || typeof item !== 'object') {
            throw new ValidationError('[EntityRepository.add] Invalid entity data');
        }

        const result = await super.add(item);
        
        try {
            await IntegrationEventPublisher.publish(SystemEventType.ENTITY_CREATED, { entity: result });
        } catch (eventError) {
            console.warn('[EntityRepository] Failed to publish entity creation event', eventError);
        }
        
        return result;
    }

    override async update(id: string, updates: Partial<LegalEntity>): Promise<LegalEntity> {
        this.validateId(id, 'update');
        return await super.update(id, updates);
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        await super.delete(id);
    }

    async getByType(type: string): Promise<LegalEntity[]> {
        if (!type) throw new ValidationError('[EntityRepository.getByType] Invalid type');
        const entities = await this.getAll();
        return entities.filter(e => e.type === type);
    }

    async search(query: string): Promise<LegalEntity[]> {
        if (!query) return [];
        const entities = await this.getAll();
        const lowerQuery = query.toLowerCase();
        return entities.filter(e =>
            e.name?.toLowerCase().includes(lowerQuery) ||
            ((e as unknown as Record<string, unknown>).legalName as string | undefined)?.toLowerCase().includes(lowerQuery)
        );
    }
}
